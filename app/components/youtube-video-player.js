import Component from '@ember/component';
import EmberObject, {computed} from '@ember/object';
import {Subject, BehaviorSubject, from} from 'rxjs';

export default Component.extend({
  init() {
    this._super(arguments);
    this.addObserver('player', this, 'playerObserver');
    this.addObserver('model', this, 'modelObserver');
    this.addObserver('video', this, 'videoObserver');
    this.addObserver('playerAction', this, 'actionObserver');
    this.playerSubj = new BehaviorSubject(0);
    this.secondsToPlay = 0.0;
    this.isPrebuffering = true;
  },
  didInsertElement() {
    this._super(...arguments);
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubePlayerAPIReady = this.onYouTubePlayerAPIReady;
    window.playerObj = this
  },
  actionObserver(obj) {
    let player = obj.get('player');
    let action = obj.get('playerAction');

    obj.playerSubj.subscribe({
      next: (val) => {
        if (val === 1) {
          if (action === 1) {
            player.playVideo();
          } else if (action === 2) {
            player.pauseVideo();

          }
        }
      }
    });

  },
  playerObserver(obj) {
    let pl = obj.get('player');
    pl.addEventListener('onStateChange', this.playerStateChanged);
    pl.addEventListener('onReady', this.playerReady);
    console.log('playerChanged');
  },
  playerReady(event) {
    window.playerObj.playerSubj.next(1);
  },
  playerStateChanged(event) {
    console.log('playerStateChanged ' + event.data);
    if (event.data === -1) {//unstarted
    } else if (event.data === 0) {//ended

    } else if (event.data === 1) {//playing
      if (window.playerObj.isPrebuffering) {
        window.playerObj.isPrebuffering = false;
        event.target.pauseVideo();
        event.target.seekTo(window.playerObj.secondsToPlay);
        window.playerObj.videoLoadedAction();
      } else {

      }
    } else if (event.data === 2) {//paused

    } else if (event.data === 3) {//buffering

    } else if (event.data === 5) {//queued
      window.playerObj.isPrebuffering = true;
      if (window.playerObj.secondsToPlay === 0.0 || window.playerObj.secondsToPlay === 0) {
        event.target.playVideo()
      } else {
        event.target.seekTo(window.playerObj.secondsToPlay);
        event.target.playVideo();
      }
    }

  },
  modelObserver(obj) {
    console.log('model');
  },
  videoObserver(obj) {
    let v = obj.get('video');
    let player = obj.get('player');
    obj.playerSubj.subscribe({
      next: (val) => {
        if (val === 1) {
          obj.secondsToPlay = v.seconds;
          player.cueVideoById(v.video['videoId'], v.seconds);
          Ember.$('#ytplayer').show();
          console.log('video');
        }
      }
    });
  },
  onYouTubePlayerAPIReady() {
    window.globalPlayer = new YT.Player('ytplayer', {
      height: '360',
      width: '640'
    });
    window.playerObj.set('player', window.globalPlayer);
  }
});
