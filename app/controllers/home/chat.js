import Controller from '@ember/controller';
import MessageDataSource from '../../custom-objects/message-data-source'
import VideoStateHandler from '../../custom-objects/video-state-handler'
import {inject as service} from '@ember/service';
import EmberObject, {computed} from '@ember/object';

export default Controller.extend({
  firebaseApp: service(),
  youtubeSearch: service(),
  init() {
    this._super(...arguments);
    this.chatModel = {};
    this.messageText = '';
    this.videoStateHandler = VideoStateHandler.create({
      delegate: {
        loadVideo: (video, seconds) => {
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
    this.set('searchQueryVideo', '');
    this.set('searchQueryMusic', '');
    this.searchModeObserver(this);

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
      if (watchers)
        obj.videoStateHandler.updateWatchers(watchers, 0);
    });
    ds.videoState((vs) => {
      if (vs)
        obj.videoStateHandler.handleVideoState(vs);
      //this.set('playerVideoState',vs);
    });
    ds.messages((messages) => {
      let uiMessages = [];
      let lastDate = new Date(0);
      messages.forEach(function (mes, index) {
        let displaySender = index < messages.length - 1 ? messages[index + 1].senderId !== mes.senderId : true;
        let mesDate = new Date(mes.date * 1000);
        let diff = lastDate.getTime() - mesDate.getTime();
        if (Math.abs(diff) > one_day) {
          uiMessages.push({isDate: true, date: mesDate});
        }
        uiMessages.push({isMessage: true, message: mes, displaySender: displaySender});
        lastDate = mesDate
      });
      obj.set('messages', uiMessages)
      $('.messagesHolder').animate({scrollTop: $('.messagesHolder')[0].scrollHeight})
    });
    $('#youtubeHolder .controlsOverlay .pause').on('click', () => {
      let ds = obj.get('dataSource');
      ds.updateWatchState('pause', window.globalPlayer.getCurrentTime());
    });
    $('#youtubeHolder .controlsOverlay .play').on('click', () => {
      let ds = obj.get('dataSource');
      ds.updateWatchState('slide', window.globalPlayer.getCurrentTime());
    });

    $('#youtubeHolder .controlsOverlay .slider').on('change', () => {
      console.log('slider changed');
    })
  },
  reset() {
    let ds = this.get('dataSource');
    if (ds) {
      ds.stop()
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
    let music = obj.get('searchMode') === 'music';
    obj.set('searchQuery', music ? obj.get('searchQueryMusic') : obj.get('searchQueryVideo'));
    let q = obj.get('searchQuery');
    obj.set('youtubeItems', []);
    if (q.length === 0) {
      obj.get('youtubeSearch').trending(music).then((data) => {
        obj.set('youtubeItems', data.items);
      });
    } else {
      obj.get('youtubeSearch').search(q, music).then((data) => {
        obj.set('youtubeItems', data.items);
      });
    }
  },
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
    videoLoaded() {
      let ds = this.get('videoStateHandler');
      ds.handleNextState('loaded');
    },
    uploadImage(file) {
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
      this.set('searchMode', 'video');
    },
    pickSongsSearch() {
      this.set('searchMode', 'music');
    },
    triggerSearch() {
      let music = this.get('searchMode') === 'music';
      let q = this.get('searchQuery');
      this.set('youtubeItems', []);
      if (q.length === 0) {
        this.get('youtubeSearch').trending(music).then((data) => {
          this.set('youtubeItems', data.items);
        });
      } else {
        this.get('youtubeSearch').search(q, music).then((data) => {
          this.set('youtubeItems', data.items);
        });
      }
    }
  }
});
