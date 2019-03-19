import Component from '@ember/component';
import EmberObject, {computed} from '@ember/object';
import {Subject, BehaviorSubject, from, interval} from 'rxjs';
import {debounce} from 'rxjs/operators';
import {timer} from 'rxjs';

export default Component.extend({
  classNameBindings: ['isLoading:loading'],
  init() {
    this._super(arguments);
    this.addObserver('player', this, 'playerObserver');
    this.addObserver('model', this, 'modelObserver');
    this.addObserver('video', this, 'videoObserver');
    this.addObserver('playerAction', this, 'actionObserver');
    this.addObserver('slidingProgress', this, 'onSlidingProgress');
    this.playerSubj = new BehaviorSubject(0);
    this.secondsToPlay = 0.0;
    this.isPrebuffering = true;
    this.controlHideSubject = new Subject();
    this.controlHideSubject.pipe(debounce(() => interval(2000))).subscribe({
      next: (newState) => {
        $('#youtubeHolder .controlsOverlay').hide();
      }
    });
    const source = timer(1000, 1000);

    const subscribe = source.subscribe(val => {
      if (window.globalPlayer) {
        if (window.globalPlayer.getDuration) {
          if (window.globalPlayer.getDuration() !== 0) {
            $('#youtubeHolder .controlsOverlay .slider').attr('max', window.globalPlayer.getDuration());
          }
        }
        if (window.globalPlayer.getCurrentTime) {
          if (this.get('slidingProgress') === 0) {
            $('#youtubeHolder .controlsOverlay .slider').val(window.globalPlayer.getCurrentTime());
          }
        }
      }
    });

  },
  willDestroyElement() {
    $('#youtubeHolder').hide();
    $('#youtubePlaceHolder').hide();
    $('#youtubeHolder .overlay').hide();
    let player = this.get('player');
    this.playerSubj.subscribe({
      next: (val) => {
        player.destroy();
      }
    });
  },
  didInsertElement() {
    this._super(...arguments);
    // var tag = document.createElement('script');
    // tag.src = "https://www.youtube.com/player_api";
    // var firstScriptTag = document.getElementsByTagName('script')[0];
    // firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // window.onYouTubePlayerAPIReady = this.onYouTubePlayerAPIReady;
    window.playerObj = this;
    $('#youtubeHolder .overlay').on('click', () => {
      $('#youtubeHolder .controlsOverlay').show();
      this.controlHideSubject.next(1);
    });


    window.globalPlayer = new YT.Player('ytplayer', {
      height: '360',
      width: '640',
      playerVars: {
        controls: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        fs: 0,
        enablejsapi: 1,
        disablekb: 1,
        cc_load_policy: 0,
        showinfo: 0
      }
    });
    this.set('player', window.globalPlayer);
    this.actionObserver(this);
    this.videoObserver(this);
  },
  onSlidingProgress(obj) {
    obj.controlHideSubject.next(2)
  },
  actionObserver(obj) {
    let player = obj.get('player');
    let action = obj.get('playerAction');

    obj.playerSubj.subscribe({
      next: (val) => {
        if (val === 1) {
          if (action === 1) {
            window.playerObj.isPlaying = true;
            player.playVideo();
          } else if (action === 2) {
            player.pauseVideo();
          } else if (action === 3) {
            window.playerObj.isPlaying = true;
            player.playVideo();
          } else if (action === 4) {
            player.pauseVideo();
          } else if (action === 10) {
            // player.stopVideo()
          } else {
            return;
          }
          this.set('playerAction', 0);
          window.playerObj.playerState({
            state: window.playerObj.lastState,
            buffering: window.playerObj.isPrebuffering,
            playing: window.playerObj.isPlaying
          });
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
    window.playerObj.lastState = event.data;
    window.playerObj.playerState({
      state: event.data,
      buffering: window.playerObj.isPrebuffering,
      playing: window.playerObj.isPlaying
    });
    if (event.data === -1) {//unstarted
      $('#youtubeHolder .controlsOverlay .play').hide();
      $('#youtubeHolder .controlsOverlay .pause').hide();
    } else if (event.data === 0) {//ended

    } else if (event.data === 1) {//playing
      if (window.playerObj.isPrebuffering) {
        window.playerObj.isPrebuffering = false;
        event.target.pauseVideo();
        event.target.seekTo(window.playerObj.secondsToPlay);
        window.playerObj.videoLoadedAction();
      } else {
        $('#youtubeHolder .controlsOverlay .play').hide();
        $('#youtubeHolder .controlsOverlay .pause').show();
      }
    } else if (event.data === 2) {//paused
      $('#youtubeHolder .controlsOverlay .play').show();
      $('#youtubeHolder .controlsOverlay .pause').hide();
    } else if (event.data === 3) {//buffering
      $('#youtubeHolder .controlsOverlay .play').hide();
      $('#youtubeHolder .controlsOverlay .pause').hide();
    } else if (event.data === 5) {//queued
      $('#youtubeHolder .controlsOverlay .play').hide();
      $('#youtubeHolder .controlsOverlay .pause').hide();
      window.playerObj.isPrebuffering = true;
      if (window.playerObj.secondsToPlay === 0.0 || window.playerObj.secondsToPlay === 0) {
        event.target.playVideo();
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
    window.playerObj.isPlaying = false;
    obj.playerSubj.subscribe({
      next: (val) => {
        if (val === 1) {
          obj.secondsToPlay = v.seconds;
          player.cueVideoById(v.video['videoId'], v.seconds);
          $('#youtubeHolder').show();
          $('#youtubePlaceHolder').show();
          $('#youtubeHolder .overlay').show();

          console.log('video');
        }
      }
    });
    $('#youtubeHolder .controlsHolder .video-title').text(v.video['videoName'])
  }
});
