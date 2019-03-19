import Controller from '@ember/controller';
import MessageDataSource from '../../custom-objects/message-data-source'
import VideoStateHandler from '../../custom-objects/video-state-handler'
import {inject as service} from '@ember/service';
import EmberObject, {computed} from '@ember/object';
import {run} from '@ember/runloop';
export default Controller.extend({
  firebaseApp: service(),
  youtubeSearch: service(),
  db: service(),
  init() {
    this._super(...arguments);
    this.chatModel = {};
    this.messageText = '';
    this.videoStateHandler = VideoStateHandler.create({
      delegate: {
        loadVideo: (video, seconds) => {
          this.set('hasPlayer', true);
          this.set('playerAction', 0);
          this.set('playerVideo', {video: video, seconds: seconds});
        },
        updateState: (state, seconds = 0, syncAt = null) => {
          let ds = this.get('dataSource');
          ds.updateWatchState(state, seconds, syncAt);
        },
        playVideo: () => {
          this.set('playerAction', 1);
        },
        updateWatching: (videoId, state) => {
          let ds = this.get('dataSource');
          ds.updateWatching(videoId, state);
        },
        slideVideo: () => {
          this.set('playerAction', 2);
          let ds = this.get('dataSource');
          ds.updateWatchState('slide', window.globalPlayer.getCurrentTime());
        },
        play: () => {
          this.set('playerAction', 3);
        },
        pause: () => {
          this.set('playerAction', 4);
        }
      }
    });
    this.addObserver('model', this, 'modelObserver');
    this.addObserver('dataSource', this, 'dataSourceObserver');
    this.addObserver('messageText', this, 'messageTextObserver');
    this.addObserver('searchMode', this, 'searchModeObserver');
    this.set('searchMode', 'video');
    this.set('searchQuery', '');
    this.set('searchQueryVideo', '');
    this.set('searchQueryMusic', '');
    this.searchModeObserver(this);
    this.set('playerState', {});

    this.queryYoutubeVideos(true);
    this.queryYoutubeMusic(true);
  },
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
    console.log(JSON.stringify(this.get('playerState')));
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
      let q = this.get('searchQuery');
      let page = this.get('youtubeMusicItemsPage');
      if (reset) {
        this.set('youtubeMusicItems', []);
      }
      if (q.length === 0) {
        this.get('youtubeSearch').trending(true, page).then((data) => {
          this.set('youtubeMusicItemsPage', data.nextPage);
          if (reset) {
            this.set('youtubeMusicItems', data.items);
          } else {
            this.get('youtubeMusicItems').pushObjects(data.items);
          }
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
          resolve();
        });
      }

    });
  },
  queryYoutubeVideos(reset) {
    return new Promise((resolve) => {
      let q = this.get('searchQueryVideo');
      let page = this.get('youtubeVideoItemsPage');
      if (reset) {
        this.set('youtubeVideoItems', []);
      }
      if (q.length === 0) {
        this.get('youtubeSearch').trending(false, page).then((data) => {
          this.set('youtubeVideoItemsPage', data.nextPage);
          if (reset) {
            this.set('youtubeVideoItems', data.items);
          } else {
            this.get('youtubeVideoItems').pushObjects(data.items);
          }
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
          resolve();
        });
      }

    });
  },
  messageTextObserver: (obj) => {
    console.log('typing ' + obj.get('messageText'));
    let ds = obj.get('dataSource');
    ds.typing(obj.get('messageText'));
  },
  modelObserver: (obj) => {
    let type = obj.get('model').type;
    let convId = obj.get('model').chat_id;
    obj.videoStateHandler.myId = obj.firebaseApp.auth().currentUser.uid;

    if ('one2one' === type) {
      obj.store.find('user', convId).then((friend) => {
        obj.set('dataSource', MessageDataSource.create({
          type: 'one2one',
          user: friend,
          myId: obj.firebaseApp.auth().currentUser.uid,
          db: obj.firebaseApp.database()
        }));
        obj.set('chatModel', {
          hasProfilePic: true,
          title: friend.get('FirstName'),
          user: friend
        });
        obj.videoStateHandler.isMaster = obj.get('dataSource').convId() === obj.firebaseApp.auth().currentUser.uid;
        obj.videoStateHandler.syncMode = 'room' === type ? 'sliding' : 'awaiting';
      });
    } else if ('room' === type) {
      obj.store.find('room', convId).then((room) => {
        obj.set('dataSource', MessageDataSource.create({
          type: 'room',
          room: room,
          myId: obj.firebaseApp.auth().currentUser.uid,
          db: obj.firebaseApp.database()
        }));
        obj.set('chatModel', {
          hasProfilePic: false,
          title: '@' + room.get('creatorName') + "' room",
          room: room
        });
        obj.videoStateHandler.isMaster = obj.get('dataSource').convId() === obj.firebaseApp.auth().currentUser.uid;
        obj.videoStateHandler.syncMode = 'room' === type ? 'sliding' : 'awaiting';

      });
    }

  },
  dataSourceObserver: (obj) => {
    let ds = obj.get('dataSource');
    let one_day = 1000 * 60 * 60 * 24;
    ds.videoWatchers((watchers) => {
      if (watchers) {
        obj.videoStateHandler.updateWatchers(watchers, 0);
        let watcherProfiles = [];
        watchers.forEach((elem) => {
          watcherProfiles.push(obj.db.profile(elem['userId']))
        });
        Promise.all(watcherProfiles).then((profiles) => {
          obj.set('watchers', profiles);
        })
      }
    });
    ds.videoState((vs) => {
      if (vs)
        obj.videoStateHandler.handleVideoState(vs);
    });
    ds.messages((messages) => {
      let uiMessages = [];
      let lastDate = new Date(0);
      let sorted = messages.sort(function (a, b) {
        return a['date'] - b['date'];
      });
      sorted.forEach(function (mes, index) {
        let displaySender = index < messages.length - 1 ? messages[index + 1].senderId !== mes.senderId : true;
        let mesDate = new Date(mes.date * 1000);
        let diff = lastDate.getTime() - mesDate.getTime();
        if (Math.abs(diff) > one_day) {
          uiMessages.push({isDate: true, date: mesDate});
        }
        uiMessages.push({isMessage: true, message: mes, displaySender: displaySender});
        lastDate = mesDate
      });
      obj.set('messages', uiMessages);
      $('.messagesHolder').animate({scrollTop: $('.messagesHolder')[0].scrollHeight})
    });
    $('#youtubeHolder').on('click', '.controlsOverlay .pause', () => {
      run(function () {

        let vsh = obj.get('videoStateHandler');
        let ds = obj.get('dataSource');
        if (vsh.isMaster || vsh.syncMode === 'awaiting') {
          ds.updateWatchState('pause', window.globalPlayer.getCurrentTime());
        }
      });
    });
    $('#youtubeHolder').on('click', ' .controlsOverlay .play', () => {
      run(function () {

        let vsh = obj.get('videoStateHandler');
        let ds = obj.get('dataSource');
        if (vsh.isMaster || vsh.syncMode === 'awaiting') {
          ds.updateWatchState('slide', window.globalPlayer.getCurrentTime());
        }
      });
    });
    $('#youtubeHolder').on('click', ' .controlsOverlay .close', () => {
      run(function () {
        let vsh = obj.get('videoStateHandler');
        obj.set('hasPlayer', false);
        vsh.closeVideo();
        let ds = obj.get('dataSource');
        if (ds) {
          obj.set('playerAction', 10);
          ds.updateWatching('', 'closed');
          // ds.stop()
        }
      });
    });

    $('#youtubeHolder').on('change', '.controlsOverlay .slider', () => {
      run(function () {
        console.log('slider changed');
        let vsh = obj.get('videoStateHandler');
        let ds = obj.get('dataSource');
        if (vsh.isMaster || vsh.syncMode === 'awaiting') {
          ds.updateWatchState('slide', parseFloat($('#youtubeHolder .controlsOverlay .slider').val()));
        }
        obj.set('slidingProgress', 0);

      });
    })
    $('#youtubeHolder').on('input', '.controlsOverlay .slider', () => {
      run(function () {

        obj.set('slidingProgress', new Date().getTime());
      });
    })
  },
  reset() {
    let ds = this.get('dataSource');
    if (ds) {
      this.set('playerAction', 10);
      ds.updateWatching('', 'closed');
      ds.stop()
    }
    this.set('hasPlayer', false);
    let vsh = this.get('videoStateHandler');
    if (vsh) {
      vsh.closeVideo();
    }
    this.set('searchQuery', '');
    this.set('messages', []);
  },
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
  searchModeObserver: (obj) => {
    // let music = obj.get('searchMode') === 'music';
    // obj.set('searchQuery', music ? obj.get('searchQueryMusic') : obj.get('searchQueryVideo'));
    // let q = obj.get('searchQuery');
    // obj.set('youtubeItems', []);
    // if (q.length === 0) {
    //   obj.get('youtubeSearch').trending(music).then((data) => {
    //     obj.set('youtubeItems', data.items);
    //   });
    // } else {
    //   obj.get('youtubeSearch').search(q, music).then((data) => {
    //     obj.set('youtubeItems', data.items);
    //   });
    // }
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
  actions: {

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
      file.readAsDataURL().then((url) => {
        let ref = this.firebaseApp.storage().ref('Media/Photos/' + this.get('firebaseApp').auth().currentUser.uid + "/" + this.generateUUID() + '.png');

        ref.putString(url, 'data_url').then((snapshot) => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            let ds = this.get('dataSource');
            ds.sendMessage('', downloadURL);

            console.log('File available at', downloadURL);
          });
        });
      });
    },
    sendMessage() {
      if (this.get('messageText').length !== 0) {
        let ds = this.get('dataSource');
        ds.sendMessage(this.get('messageText'));
        this.set('messageText', '');
      }
    },
    videoPick(video) {
      this.set('playerModel', video);
      let ds = this.get('dataSource');
      ds.sendVideo(video)
    },
    musicPick(video) {
      this.set('playerModel', video);
      let ds = this.get('dataSource');
      ds.sendVideo(video, 'youtubeMusic')
    },
    pickVideosSearch() {
      if (this.get('searchMode') !== 'video') {
        this.set('searchMode', 'video');
        this.set('searchQueryMusic', this.get('searchQuery'));
        this.set('searchQuery', this.get('searchQueryVideo'))
      }
    },
    pickSongsSearch() {
      if (this.get('searchMode') !== 'music') {
        this.set('searchMode', 'music');
        this.set('searchQueryVideo', this.get('searchQuery'));
        this.set('searchQuery', this.get('searchQueryMusic'))
      }
    },
    triggerSearch() {
      if (this.get('searchMode') === 'video') {
        this.set('searchQueryVideo', this.get('searchQuery'));
        this.set('youtubeVideoItemsPage', null);
        this.queryYoutubeVideos(true);
      } else {
        this.set('searchQueryMusic', this.get('searchQuery'));
        this.set('youtubeMusicItemsPage', null);
        this.queryYoutubeMusic(true);
      }

    }
  }
});
