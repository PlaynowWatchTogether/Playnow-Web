import Controller from '@ember/controller';
import MessageDataSource from '../../custom-objects/message-data-source';
import VideoStateHandler from '../../custom-objects/video-state-handler';
import PicturedObject from '../../custom-objects/pictured-object';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {run} from '@ember/runloop';
import {debug} from "@ember/debug";
import $ from 'jquery';
import ArrayProxy from '@ember/array/proxy';
import ObjectProxy from '@ember/object/proxy';
import MessageObject from '../../custom-objects/message-object';
import {Promise} from 'rsvp';
export default Controller.extend({
  firebaseApp: service(),
  youtubeSearch: service(),
  db: service(),
  auth: service(),
  ntp: service(),
  gcmManager: service(),
  queryParams: ['id'],
  id: null,
  init() {
    this._super(...arguments);
    this.chatModel = {};
    this.messageText = '';
    this.composeChips = [];
    this.limit = 100;
    this.messages = ArrayProxy.create({content: []});
    this.videoStateHandler = VideoStateHandler.create({
      ntp: this.get('ntp'),
      delegate: {
        loadVideo: (video, seconds) => {
          run(() => {
            this.set('hasPlayer', true);
            this.set('playerAction', 0);
            this.set('playerVideo', {video: video, seconds: seconds});
          });
        },
        updateState: (state, seconds = 0, syncAt = null) => {
          run(() => {
            let ds = this.get('dataSource');
            ds.updateWatchState(state, seconds, syncAt);
          });
        },
        playVideo: () => {
          run(() => {
            this.set('playerAction', 1);
          });
        },
        updateWatching: (videoId, state) => {
          run(() => {
            let ds = this.get('dataSource');
            ds.updateWatching(videoId, state);
          });
        },
        seekVideo: (seconds) => {
          run(() => {
            this.set('playerSeconds', seconds);
            this.set('playerAction', 5);
          });
        },
        slideVideo: () => {
          run(() => {
            this.set('playerAction', 2);
            let ds = this.get('dataSource');
            ds.updateWatchState('slide', window.globalPlayer.getCurrentTime());
          });
        },
        play: () => {
          run(() => {
            this.set('playerAction', 3);
          });
        },
        pause: () => {
          run(() => {
            this.set('playerAction', 4);
          });
        }
      }
    });
    this.addObserver('model', this, 'modelObserver');
    this.addObserver('dataSource', this, 'dataSourceObserver');
    this.addObserver('messageText', this, 'messageTextObserver');
    this.addObserver('searchMode', this, 'searchModeObserver');
    this.searchModeObserver(this);
    this.set('playerState', {});
    this.set('searchMode', 'video');

    this.queryYoutubeVideos(true);
    this.queryYoutubeMusic(true);
  },

  isCompose: computed('model', function () {
    return this.get('model.chat_id') === 'compose'
  }),
  loadingVideoClass: computed('isLoadingVideo', function () {
    return this.get('isLoadingVideo') ? 'active' : '';
  }),
  loadingMusicClass: computed('isLoadingMusic', function () {
    return this.get('isLoadingMusic') ? 'active' : '';
  }),
  isRoom: computed('model', function () {
    return this.get('model.type') === 'room'
  }),
  playerLoadingClass: computed('playerState', function () {
    let l = this.get('playerState');
    if (l) {
      if (l.buffering)
        return 'active';
      if (!l.playing)
        return 'active'
    }
    return ''
  }),
  loadingOverlayClass: computed('playerState', function () {
    debug(JSON.stringify(this.get('playerState')));
    return 'loading'
  }),
  watchersClass: computed('playerState', function () {
    let l = this.get('playerState');
    if (l) {
      if (l.buffering)
        return 'loading';
      if (!l.playing)
        return 'loading'
    }
    return ''
  }),
  queryYoutubeMusic(reset) {
    return new Promise((resolve) => {
      let q = this.get('searchQueryMusic');
      let page = this.get('youtubeMusicItemsPage');
      if (reset) {
        this.set('isLoadingMusic', true);
      }
      if (reset) {
        this.set('youtubeMusicItems', []);
      }
      if (!q || q.length === 0) {
        this.get('youtubeSearch').trending(true, page).then((data) => {
          this.set('youtubeMusicItemsPage', data.nextPage);
          if (reset) {
            this.set('youtubeMusicItems', data.items);
          } else {
            this.get('youtubeMusicItems').pushObjects(data.items);
          }
          this.set('isLoadingMusic', false);
          resolve();
        });
      } else {
        this.get('youtubeSearch').search(q, true, page).then((data) => {
          this.set('youtubeMusicItemsPage', data.nextPage);
          if (reset) {
            this.set('youtubeMusicItems', data.items);
          } else {
            this.get('youtubeMusicItems').pushObjects(data.items);
          }
          this.set('isLoadingMusic', false);
          resolve();
        });
      }

    });
  },
  queryYoutubeVideos(reset) {
    return new Promise((resolve) => {
      if (reset) {
        this.set('isLoadingVideo', true);
      }
      let q = this.get('searchQueryVideo');
      let page = this.get('youtubeVideoItemsPage');
      if (reset) {
        this.set('youtubeVideoItems', []);
      }
      if (!q || q.length === 0) {
        this.get('youtubeSearch').trending(false, page).then((data) => {
          this.set('youtubeVideoItemsPage', data.nextPage);
          if (reset) {
            this.set('youtubeVideoItems', data.items);
          } else {
            this.get('youtubeVideoItems').pushObjects(data.items);
          }
          this.set('isLoadingVideo', false);
          resolve();
        });
      } else {
        this.get('youtubeSearch').search(q, false, page).then((data) => {
          this.set('youtubeVideoItemsPage', data.nextPage);
          if (reset) {
            this.set('youtubeVideoItems', data.items);
          } else {
            this.get('youtubeVideoItems').pushObjects(data.items);
          }
          this.set('isLoadingVideo', false);
          resolve();
        });
      }

    });
  },
  messageTextObserver: (obj) => {
    debug('typing ' + obj.get('messageText'));
    let ds = obj.get('dataSource');
    if (ds) {
      ds.typing(obj.get('messageText'));
    }
  },
  modelObserver: (obj) => {
    let type = obj.get('model').type;
    let convId = obj.get('model').chat_id;
    obj.videoStateHandler.myId = obj.firebaseApp.auth().currentUser.uid;

    if ('compose' === convId) {
      obj.set('chatModel', {
        hasProfilePic: false,
        title: 'Compose message'
      });
      return;
    }
    if ('one2one' === type) {
      obj.store.find('friends', convId).then((friend) => {
        obj.set('dataSource', MessageDataSource.create({
          gcmManager: obj.gcmManager,
          type: 'one2one',
          user: friend,
          myId: obj.firebaseApp.auth().currentUser.uid,
          db: obj.firebaseApp.database(),
          fb: obj.firebaseApp,
          auth: obj.auth
        }));
        obj.set('chatModel', {
          hasProfilePic: true,
          title: friend.get('displayName'),
          user: friend
        });
        obj.videoStateHandler.isMaster = obj.get('dataSource').convId() === obj.firebaseApp.auth().currentUser.uid;
        obj.videoStateHandler.syncMode = 'room' === type ? 'sliding' : 'awaiting';
      });
    } else if ('room' === type) {
      obj.store.find('room', convId).then((room) => {
        obj.set('dataSource', MessageDataSource.create({
          type: 'room',
          gcmManager: obj.gcmManager,
          room: room,
          myId: obj.firebaseApp.auth().currentUser.uid,
          db: obj.firebaseApp.database(),
          fb: obj.firebaseApp,
          auth: obj.auth
        }));
        obj.set('chatModel', {
          hasProfilePic: false,
          title: '@' + room.get('creatorName') + "' room",
          room: room
        });
        obj.videoStateHandler.isMaster = obj.get('dataSource').convId() === obj.firebaseApp.auth().currentUser.uid;
        obj.videoStateHandler.syncMode = 'room' === type ? 'sliding' : 'awaiting';

      });
    } else if ('group' === type) {
      obj.store.find('group', convId).then((group) => {
        obj.set('dataSource', MessageDataSource.create({
          type: 'group',
          gcmManager: obj.gcmManager,
          group: group,
          myId: obj.firebaseApp.auth().currentUser.uid,
          db: obj.firebaseApp.database(),
          fb: obj.firebaseApp,
          auth: obj.auth
        }));
        obj.set('chatModel', {
          hasProfilePic: false,
          title: group.get('GroupName'),
          group: group
        });
        obj.videoStateHandler.isMaster = obj.get('dataSource').convId() === obj.firebaseApp.auth().currentUser.uid;
        obj.videoStateHandler.syncMode = 'room' === type ? 'sliding' : 'awaiting';

      });
    } else {
      obj.set('chatModel', {});
    }

  },
  sliderClass: computed('videoStateHandler', 'dataSource', function () {
    let vsh = this.get('videoStateHandler');
    let ds = this.get('dataSource');
    if (vsh && ds) {
      if (vsh.isMaster || vsh.syncMode === 'awaiting') {
        return '';
      } else {
        return 'not-responsive'
      }
    } else {
      return 'not-responsive'
    }
  }),
  dataSourceObserver: (obj) => {
    let ds = obj.get('dataSource');
    ds.updateWatching('', 'closed');
    let one_day = 1000 * 60 * 60 * 24;
    ds.videoWatchers((watchers) => {
      if (watchers) {
        obj.videoStateHandler.updateWatchers(watchers, 0);
        let watcherProfiles = [];
        watchers.forEach((elem) => {
          if (elem['state'] === 'playing') {
            watcherProfiles.push(obj.db.profile(elem['userId']))
          }
        });
        Promise.all(watcherProfiles).then((profiles) => {
          obj.set('watchers', profiles);
        })
      }
    });
    ds.videoState((vs) => {
      if (vs) {
        run(() => {
          obj.videoStateHandler.handleVideoState(vs);
        });
      }
    });
    ds.lastMessageSeen((lastSeen) => {
      if (ds.type === 'one2one') {
        obj.set('lastSeenMessage', lastSeen);
      }
    });
    ds.members((members) => {
      obj.set('members', members);
    });
    ds.typingIndicator((indicator) => {
      let myId = obj.get('db').myId();
      let filtered = indicator.filter((elem) => {
        return elem.userId !== myId;
      });
      obj.set('typingIndicator', filtered);
    });
    obj.set('isLoadingMessages', true);
    if (obj.get('messageToSend') && obj.get('dataSource')) {
      obj.get('dataSource').sendMessage(obj.get('messageToSend'));
      obj.set('messageToSend', null);
    }

    ds.messages((messages) => {
      let uiMessages = [];
      let lastDate = new Date(0);
      let sorted = messages.sort(function (a, b) {
        return a['date'] - b['date'];
      });
      sorted.forEach((message) => {
        debug('Got message ' + message.id + " text: " + message['text'] + " with ts: " + message['date']);
      });
      if (sorted.length > 0) {
        let lastRecord = null;
        sorted.forEach((elem) => {
          lastRecord = elem;
        });
        if (lastRecord) {
          ds.sendSeen(lastRecord.uid);
        }
      }
      sorted.forEach(function (mes, index) {
        let displaySender = index < messages.length - 1 ? messages[index + 1].senderId !== mes.senderId : true;
        let mesDate = new Date(mes.date);
        let diff = lastDate.getTime() - mesDate.getTime();
        if (Math.abs(diff) > one_day) {
          let dateContent = {isDate: true, date: mesDate.setHours(0, 0, 0, 0), id: '' + mesDate.getTime()};
          let normalizedData = obj.store.normalize('thread-message', {
            id: '' + mesDate.getTime(),
            convoId: ds.convId(),
            content: JSON.stringify({isDate: true, date: mesDate.getTime()})
          });

          obj.store.push(normalizedData);
          uiMessages.push(MessageObject.create({content: dateContent}));
        }
        let mesCntent = {
          isMessage: true,
          message: mes,
          displaySender: displaySender,
          id: mes['id']
        };
        let normalizedData = obj.store.normalize('thread-message', {
          id: mes['id'],
          convoId: ds.convId(),
          content: JSON.stringify(mesCntent)
        });

        obj.store.push(normalizedData);

        uiMessages.push(MessageObject.create({
          content: mesCntent
        }));
        lastDate = mesDate
      });
      obj.set('blockAutoscroll', false);
      obj.set('isLoadingMessages', false);
      obj.messages.setObjects(uiMessages);

      // obj.notifyPropertyChange('messages');
      // obj.set('messages', uiMessages);
    });

    let pauseAction = () => {
      run(function () {
        let vsh = obj.get('videoStateHandler');
        let ds = obj.get('dataSource');
        if (vsh.isMaster || vsh.syncMode === 'awaiting') {
          ds.updateWatchState('pause', window.globalPlayer.getCurrentTime());
        }
      });
    };
    let playAction = () => {
      run(function () {

        let vsh = obj.get('videoStateHandler');
        let ds = obj.get('dataSource');
        if (vsh.isMaster || vsh.syncMode === 'awaiting') {
          ds.updateWatchState('slide', window.globalPlayer.getCurrentTime());
        }
      });
    };
    let closeAction = () => {
      run(function () {
        obj.closeVideo()
      });
    };
    let body = $('body');
    body.on('click', '#youtubeHolder .pause-control', () => {
      let state = $('#youtubeHolder .controlsOverlay').attr('play-state');
      if (state === '1') {
        pauseAction();
      } else if (state === '2') {
        playAction();
      }
    });
    body.on('click', '.youtube-music-holder .controls .play-btn', playAction);
    body.on('click', '.youtube-music-holder .controls .pause-btn', pauseAction);
    body.on('click', '.youtube-music-holder .controls .close-btn', closeAction);
    // let holder = $('#youtubeHolder');
    body.on('click', '#youtubeHolder .controlsOverlay .control .pause', pauseAction);
    body.on('click', '#youtubeHolder .controlsOverlay .control .play', playAction);
    body.on('click', '#youtubeHolder .controlsOverlay .close', closeAction);

    let slideChange = (event) => {
      run(function () {
        debug('slider changed');
        let vsh = obj.get('videoStateHandler');
        let ds = obj.get('dataSource');
        if (vsh.isMaster || vsh.syncMode === 'awaiting') {
          ds.updateWatchState('slide', parseFloat($(event.target).val()));
        }
        obj.set('slidingProgress', 0);

      });
    };
    let slideInput = () => {
      run(function () {

        obj.set('slidingProgress', new Date().getTime());
      });
    };

    body.on('change', '.youtube-music-holder  .slider', slideChange);
    body.on('input', '.youtube-music-holder  .slider', slideInput);
    body.on('change', '.controlsOverlay .slider', slideChange);
    body.on('input', '.controlsOverlay .slider', slideInput);
    if (obj.get('id')) {
      obj.get('youtubeSearch').video(obj.get('id')).then((video) => {
        obj.shareVideo(video);
      });
      debug('got video in path ' + obj.get('id'));
    }
  },
  isMaster: computed('dataSource', function () {
    let ds = this.get('dataSource');
    let type = this.get('model').type;
    if (ds) {
      return ds.convId() === this.firebaseApp.auth().currentUser.uid || type !== 'room';
    } else
      return false;
  }),
  convId: computed('dataSource', function () {
    let ds = this.get('dataSource');
    if (ds) {
      return ds.convId();
    } else {
      return '';
    }
  }),
  reset() {
    this.set('id', null);
    this.set('youtubeVideoItemsPage', null);
    this.set('youtubeMusicItemsPage', null);
    this.set('messageText', '');
    this.set('limit', 100);
    this.set('playerVideo', {});
    this.set('composeChips', []);
    this.set('chatModel', {});

    this.set('searchMode', 'video');
    this.set('searchQueryVideo', '');
    this.set('searchQueryMusic', '');
    this.set('isLoadingMessages', false);
    this.queryYoutubeVideos(true);
    this.queryYoutubeMusic(true);

    let ds = this.get('dataSource');
    if (ds) {
      this.set('playerAction', 10);
      ds.removeWatching();
      ds.stop()
    }
    this.set('hasPlayer', false);
    let vsh = this.get('videoStateHandler');
    if (vsh) {
      vsh.closeVideo();
    }

    this.messages.setObjects([]);
  },
  filteredMessages: computed('messages.@each.id', 'limit', function () {
    let messages = (this.get('messages') || []);
    let length = messages.length;
    let limit = this.get('limit');
    return this.store.peekAll('thread-message').filter((elem) => {
      return elem.get('convoId') === this.get('dataSource').convId();
    }).slice(Math.max(0, length - limit), length + 1);
  }),
  hasMoreMessages: computed('messages.@each.id', 'limit', function () {
    let messages = (this.get('messages') || []);
    let length = messages.length;
    return this.get('limit') <= length;
  }),
  totalMessages: computed('messages', function () {
    return (this.get('messages') || []).length;
  }),
  generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },
  searchModeObserver: () => {

  },
  closeVideo() {
    let vsh = this.get('videoStateHandler');
    this.set('hasPlayer', false);
    vsh.closeVideo();
    this.set('playerVideo', {});
    let ds = this.get('dataSource');
    if (ds) {
      this.set('playerAction', 10);
      ds.updateWatching('', 'closed');
    }
  },
  modeClass: computed('model', function () {
    return this.get('model').type;
  }),
  videoTabClass: computed('searchMode', function () {
    return this.get('searchMode') === 'video' ? 'active' : '';
  }),
  songsTabClass: computed('searchMode', function () {
    return this.get('searchMode') === 'music' ? 'active' : '';
  }),
  isMusicResult: computed('searchMode', function () {
    return this.get('searchMode') === 'music'
  }),
  myID: computed('model', function () {
    return this.get('db').myId();
  }),
  membersProfiles: computed('watchers', function () {
    let members = this.get('watchers');
    if (members) {
      return members.map((elem, index) => {
        elem.className = 'z' + (members.length - index);
        return PicturedObject.create({content: elem})
      });
    } else {
      return []
    }
  }),
  membersClass: computed('hasPlayer', function () {
    return this.get('hasPlayer') ? 'hidden' : '';
  }),
  videoClass: computed('playerVideo', function () {
    let video = this.get('playerVideo');
    if (video && video.video) {
      return video.video.videoType;
    } else {
      return '';
    }
  }),
  typingIndicatorProfiles: computed('typingIndicator', 'members', function () {
    let members = this.get('members');
    let indicators = this.get('typingIndicator');
    if (members && indicators) {
      let typing = [];
      indicators.forEach((indicator) => {
        if (indicator.messageId) {
          let member = members.find((member) => {
            return member.id === indicator.userId;
          });
          if (member) {
            typing.push(PicturedObject.create({content: member}));
          }

        }
      });
      return typing;
    } else {
      return [];
    }
  }),
  createGroup() {
    return new Promise((resolve, reject) => {
      let db = this.get('db');
      let groupName = '';
      db.profile(db.myId()).then((profile) => {

        let memberNames = [profile['FirstName']].concat(this.get('composeChips').sort((a, b) => {
          a['id'].localeCompare(b['id'])
        }).map((member) => {
          return member['firstName'];
        }));
        groupName = memberNames.join(", ");
        let refName = groupName + "@" + db.myId();
        db.createGroup(groupName, this.get('composeChips')).then(() => {
          this.transitionToRoute('home.chat', refName, 'group');
          resolve(refName)
        }).catch((error) => {
          reject(error);
        });
      });

    });
  },
  composeMessage() {
    let chips = this.get('composeChips');
    if (chips.length === 1) {
      let f = chips.firstObject;
      this.transitionToRoute('home.chat', f['id'], 'one2one');
      this.set('messageToSend', this.get('messageText'));
      this.set('messageText', '')

    } else {
      this.set('messageToSend', this.get('messageText'));
      this.set('messageText', '')
      this.createGroup().then(() => {

      });
    }
  },
  performSendMessage() {
    if (this.get('messageText').length === 0) {
      return;
    }
    if (this.get('isCompose')) {
      if (this.get('composeChips').length === 0) {
        this.set('composeError', 'Add friends to group');
        setTimeout(() => {
          this.set('composeError', '');
        }, 2000);
      } else {

        this.composeMessage();
      }
      return;
    }
    let ds = this.get('dataSource');
    ds.sendMessage(this.get('messageText'));
    this.set('messageText', '');
  },
  shareVideo(video) {
    let ds = this.get('dataSource');
    if (this.get('isMaster')) {
      this.set('playerModel', video);
      ds.sendVideo(video)
    } else {
      ds.sendMessage('', '', {
        id: video['id'],
        title: video['snippet']['title'],
        channelTitle: video['snippet']['channelTitle'],
        imageURL: video['snippet']['thumbnails']['high']['url'],
        isMusic: video['categoryId'] === '10',
        videoType: video['categoryId'] === '10' ? 'youtubeMusic' : 'youtubeVideo'
      })
    }
  },
  canAutoplay: computed('playerVideo', 'videoStateHandler', function () {
    let vsh = this.get('videoStateHandler');
    if (!vsh)
      return false;
    let master = vsh.isMaster;
    let senderId = this.get('playerVideo.video.senderId');
    if (!senderId)
      return false;

    return (master || senderId === this.db.myId());
  }),
  actions: {
    loadMore() {
      this.set('blockAutoscroll', true);
      this.set('limit', this.get('limit') + 100);
    },
    onVideoEnd() {
      if ($('#autoplay-checkbox')[0] && $('#autoplay-checkbox')[0].checked) {
        let vsh = this.get('videoStateHandler');
        let master = vsh.isMaster;
        let senderId = this.get('playerVideo.video.senderId');
        if (this.get('playerVideo.video.videoType') === 'youtubeVideo' && (master || senderId === this.db.myId())) {
          this.youtubeSearch.related(this.get('playerVideo.video.videoId')).then((video) => {
            this.shareVideo(video);
          });
        } else {
          this.closeVideo();
        }
      } else {
        let ds = this.get('dataSource');
        if (ds) {
          this.youtubeSearch.related(this.get('playerVideo.video.videoId')).then((video) => {
            ds.sendVideoEnd(video)
          });


        }
        this.closeVideo();
      }
    },
    playerStateAction(state) {
      run(() => {
        this.set('playerState', state);
      });
    },
    scrolledHalfYoutubeVideo() {
      if (this.get('searchMode') === 'video') {
        this.set('loadingVideo', true);
        this.queryYoutubeVideos(false).then(() => {
          this.set('loadingVideo', false);
        });
      }
    },
    scrolledHalfYoutubeMusic() {
      if (this.get('searchMode') === 'music') {
        this.set('loadingMusic', true);
        this.queryYoutubeMusic(false).then(() => {
          this.set('loadingMusic', false);
        });
      }
    },
    videoLoaded() {
      let ds = this.get('videoStateHandler');
      ds.handleNextState('loaded');
    },
    uploadImageToChat(file) {
      if (this.get('isCompose')) {
        if (this.get('composeChips').length === 0) {
          this.set('composeError', 'Add friends to group');
          setTimeout(() => {
            this.set('composeError', '');
          }, 2000);
        }
        return;
      }
      if (file.type.includes('video/')) {
        let ref = this.firebaseApp.storage().ref('Media/Videos/' + this.get('firebaseApp').auth().currentUser.uid + "/" + this.generateUUID() + file.name);
        ref.put(file.blob).then((snapshot) => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            let ds = this.get('dataSource');
            ds.sendMessage('', downloadURL, null, true);

            debug('File available at', downloadURL);
          });
        });
      } else if (file.type.includes('image/')) {
        file.readAsDataURL().then((url) => {

          let ref = this.firebaseApp.storage().ref('Media/Photos/' + this.get('firebaseApp').auth().currentUser.uid + "/" + this.generateUUID() + '.png');

          ref.putString(url, 'data_url').then((snapshot) => {
            snapshot.ref.getDownloadURL().then((downloadURL) => {
              let ds = this.get('dataSource');
              ds.sendMessage('', downloadURL);

              debug('File available at', downloadURL);
            });
          });
        });
      }
    },
    sendMessage() {
      this.performSendMessage();
    },
    videoPick(video) {
      if (this.get('isCompose')) {
        if (this.get('composeChips').length === 0) {
          this.set('composeError', 'Add friends to group');
          setTimeout(() => {
            this.set('composeError', '');
          }, 2000);
        } else {
          this.composeMessage();
        }
        return;
      }
      this.shareVideo(video);
    },
    musicPick(video) {
      if (this.get('isCompose')) {
        if (this.get('composeChips').length === 0) {
          this.set('composeError', 'Add friends to group');
          setTimeout(() => {
            this.set('composeError', '');
          }, 2000);
        } else {
          this.composeMessage();
        }
        return;
      }
      this.set('playerModel', video);
      let ds = this.get('dataSource');
      ds.sendVideo(video, 'youtubeMusic')
    },
    pickVideosSearch() {
      if (this.get('searchMode') !== 'video') {
        this.set('searchMode', 'video');
      }
    },
    pickSongsSearch() {
      if (this.get('searchMode') !== 'music') {
        this.set('searchMode', 'music');
      }
    },
    triggerSearch() {
      if (this.get('searchMode') === 'video') {
        this.set('youtubeVideoItemsPage', null);
        this.queryYoutubeVideos(true);
      } else {
        this.set('youtubeMusicItemsPage', null);
        this.queryYoutubeMusic(true);
      }
    },
    onChipAdd(data) {
      let exists = this.get('composeChips').filter((elem) => {
        return elem['id'] === data['id'];
      });
      if (exists.length === 0) {
        this.get('composeChips').pushObject(data);
        this.notifyPropertyChange('composeChips');
      }
    },
    onChipClick() {
      let chips = this.get('composeChips');
      chips.removeObject(chips.lastObject);
      this.notifyPropertyChange('composeChips');
    },
    onMessageEnterPress() {
      this.performSendMessage();
    },
    onPhotoSelect(photo) {

    },
    onTextPaste(index, text) {
      let m = this.get('messageText');
      let output = [m.slice(0, index), text, m.slice(index)].join('');
      this.set("messageText", output);
    },
    onMessageClick(message) {
      if (message['type'] === 'VideoRequest') {
        if (this.get('isMaster')) {
          this.get('youtubeSearch').video(message['video']['id']).then((video) => {
            this.shareVideo(video);
          });
        }
      }
      if (message['type'] === 'Video') {
        // this.set('videoPlayerUrl', message['media']);
        // $('#videoPreviewModal').modal();
      }
    },
    videoPlayerReady(player, component) {
      this.playerComponent = component;
      this.playerPlayer = player;
    }
  }
});
