import Component from '@ember/component';
import {Subject, BehaviorSubject, interval} from 'rxjs';
import {debounce} from 'rxjs/operators';
import {timer} from 'rxjs';
import {debug} from "@ember/debug";

import $ from 'jquery';
import { get } from '@ember/object';
import {run} from '@ember/runloop';
import VideoJSProxy from '../custom-objects/video-js-player-proxy';
import { computed } from '@ember/object';

export default Component.extend({
  classNameBindings: ['isLoading:loading'],
  init() {
    this._super(arguments);
    this.addObserver('player', this, 'playerObserver');
    this.addObserver('model', this, 'modelObserver');
    this.addObserver('video', this, 'videoObserver');
    this.addObserver('playerAction', this, 'actionObserver');
    this.addObserver('slidingProgress', this, 'onSlidingProgress');
    this.addObserver('videoPlayerState', this, 'onVideoPlayerStateChanged');
    this.playerSubj = new BehaviorSubject(0);
    this.secondsToPlay = 0.0;
    this.isPrebuffering = true;
    this.controlHideSubject = new Subject();
    this.controlHideSubject.pipe(debounce(() => interval(3000))).subscribe({
      next: () => {
        if (!$('body').hasClass('fullscreen-video')){
          $('#youtubeHolder .controlsOverlay').hide();
        }
      }
    });
    const source = timer(1000, 1000);

    source.subscribe(() => {
      if (window.globalPlayer) {
        if (window.globalPlayer.getDuration) {
          if (window.globalPlayer.getDuration() !== 0) {
            $('#youtubeHolder .controlsOverlay .slider').attr('max', window.globalPlayer.getDuration());
            $('.youtube-music-holder .slider').attr('max', window.globalPlayer.getDuration());
          }
        }
        if (window.globalPlayer.getCurrentTime) {
          if (this.get('slidingProgress') === 0 || !this.get('slidingProgress')) {
            $('#youtubeHolder .controlsOverlay .slider').val(window.globalPlayer.getCurrentTime());
            $('.youtube-music-holder .slider').val(window.globalPlayer.getCurrentTime());
          }
        }
      }
    });

  },
  willDestroyElement() {
    $('#youtubeHolder').hide();
    $('#youtubePlaceHolder').hide();
    $('#youtubeHolder .overlay').hide();
    videojs.removeHook('setup', this.setupVideoJS);
    let player = this.get('player');
    this.playerSubj.subscribe({
      next: () => {
        if (player.destroy){
          player.destroy();
        }
      }
    });
  },
  handleResize(){
    let holder = $('#youtubeHolder');
    let height = 9 * holder.width() / 16;
    holder.height(height);

    $('#youtubeHolder .overlay').height(height);
    $('#youtubeHolder .controlsOverlay').height(height);
    $('#youtubeHolder #ytplayer').height(height);
    $('.watchers-holder').height(height);
  },
  didInsertElement() {
    this._super(...arguments);
    // var tag = document.createElement('script');
    // tag.src = "https://www.youtube.com/player_api";
    // var firstScriptTag = document.getElementsByTagName('script')[0];
    // firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // window.onYouTubePlayerAPIReady = this.onYouTubePlayerAPIReady;
    window.playerObj = this;
    $(document).on('mousemove','#youtubeHolder', () => {
      run(() => {
        if (!$('body').hasClass('fullscreen-video')){
          $('#youtubeHolder .controlsOverlay').show();
          this.controlHideSubject.next(1);
        }
        $('.feed-content-wrapper').addClass('mouse-on');
      });
    });
    $(document).on('mouseenter', (event) => {
      run(() => {
        debug(`mouse enter ${event.target.id}`);
        $('.feed-content-wrapper').addClass('mouse-on');
      });
    });
    $(document).on('mouseleave', (event) => {
      run(() => {
        debug(`mouse leave ${event.target.id}`);
        // if ($('body').hasClass('fullscreen-video')){
          $('.feed-content-wrapper').removeClass('mouse-on');
        // }
      });
    });
    this.setupVideoJS =  (player)=> {
      window.playerObj.set('player', player);
      window.playerObj.playerReady();
    };
    videojs.hook('setup',this.setupVideoJS);
    let holder = $('#youtubeHolder');
    $(window).on('resize', ()=> {
      run(()=>{
        this.handleResize();
      });

    });
    let height = 9 * holder.width() / 16;
    holder.height(height);
    $('#youtubeHolder .overlay').height(height);
    $('#youtubeHolder .controlsOverlay').height(height);
    $('.watchers-holder').height(height);
    if (this.get('video.video.videoType') === 'youtube#video' || this.get('video.video.videoType') === 'youtube#music'){
      debug('Create yt player width ' + $('#youtubeHolder').width());
      window.globalPlayer = new YT.Player('ytplayer', {
        height: height,
        width: holder.width(),
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
    }else{
      if (
        this.get('video.video.videoType') === 'khan#media' ||
        this.get('video.video.videoType') === 'crunchyroll#media'
      ){
        var video = $('<video />', {
            id: 'video'
        });
        video.appendTo($('#ytplayer'));
      }
      $('#youtubeHolder #ytplayer #video').height(height);
      $('#youtubeHolder #ytplayer #video').width(holder.width());
      const player = videojs($('#video')[0], {autoplay: false, controls: false,fill:true});
      window.globalPlayer = VideoJSProxy.create({player: player});
      player.on('loadstart', ()=>{
        debug('VIDEOJS - loadstart');

      });
      player.on('waiting',()=>{
        debug('VIDEOJS - loadstart');
      });
      player.on('loadeddata', ()=>{
        debug('VIDEOJS - loadeddata');
        window.playerObj.playerStateChanged({data: 5});
      });
      player.on('playing',()=>{
        debug('VIDEOJS - playing');
        window.playerObj.playerStateChanged({data: 1});
      });
      player.on('pause',()=>{
        debug('VIDEOJS - paused');
        window.playerObj.playerStateChanged({data: 2});
      });
      player.on('ended', ()=>{
        debug('VIDEOJS - ended');
        window.playerObj.playerStateChanged({data: 0});
      });
      player.on('play', ()=>{
        debug('VIDEOJS - play');
      });
      player.on('stalled', ()=>{
        debug('VIDEOJS - stalled');
      })

      this.set('player', player);
      this.get('onPlayerUpdate')();
    }
    $('#youtubePlaceHolder').hide();
    this.actionObserver(this);
    this.videoObserver(this);
  },
  onVideoPlayerStateChanged(obj){
    const newState = obj.get('videoPlayerState');
    if (newState === 1){
      $('.youtube-music-holder').hide();
      $('#youtubeHolder').show();
      // $('#youtubePlaceHolder').show();
      $('#youtubeHolder .overlay').show();
      window.playerObj.get('onPlayerShow')();
    }else{
      $('#youtubeHolder').hide();
      $('.youtube-music-holder').show();
    }

  },
  sendPlayedPlay(){
    let player = this.get('player');
    if (player.playVideo){
      player.playVideo();
    }else if (player.play){
      player.play();
    }
  },
  sendPlayedPause(){
    let player = this.get('player');
    if (player.pauseVideo){
      player.pauseVideo();
    }else if (player.pause){
      player.pause();
    }
  },
  sendPlayerSeek(seconds){
    let player = this.get('player');
    window.playerObj.secondsToPlay = seconds;
    window.playerObj.isPrebuffering=true;
    if (player.seekTo){
      player.seekTo(seconds);
      player.playVideo();
      // window.playerObj.playerStateChanged({data: 5});
    } else if (player.currentTime){
      const sendPlay = player.paused()
      player.currentTime(seconds);

      if (sendPlay){
        // window.playerObj.playerStateChanged({data: 5});
        player.play();
      }

    }
  },
  sendPlayerSeekTo(seconds){
    let player = this.get('player');
    if (player.seekTo){
      player.seekTo(seconds);
    } else if (player.currentTime){
      player.currentTime(seconds);
    }
  },
  onSlidingProgress(obj) {
    obj.controlHideSubject.next(2)
  },
  actionObserver(obj) {

    let player = obj.get('player');
    let action = obj.get('playerAction');

    obj.playerSubj.subscribe({
      next: (val) => {
        run(() => {
          if (val === 1) {
            if (action === 1) {
              window.playerObj.isPlaying = true;
              obj.sendPlayedPlay();
            } else if (action === 2) {
              obj.sendPlayedPause();
            } else if (action === 3) {
              window.playerObj.isPlaying = true;
              obj.sendPlayedPlay();
            } else if (action === 4) {
              obj.sendPlayedPause();
            } else if (action === 10) {
              // player.stopVideo()
            } else if (action === 5) {
              obj.sendPlayerSeek(this.get('playerSeconds'));
            } else if (action === 1000){
              obj.handleResize();
            } else {
              return;
            }
            this.set('playerAction', 0);
            window.playerObj.get('playerState')({
              state: window.playerObj.lastState,
              buffering: window.playerObj.isPrebuffering,
              playing: window.playerObj.isPlaying
            });
          }
        });

      }
    });

  },
  playerObserver(obj) {
    let pl = obj.get('player');
    if (pl.addEventListener){
      pl.addEventListener('onStateChange', this.playerStateChanged);
      pl.addEventListener('onReady', this.playerReady);
    }
    debug('playerChanged');
  },
  playerReady() {
    window.playerObj.get('onPlayerUpdate')();
    window.playerObj.playerSubj.next(1);
  },
  videoJSPlayerStateChanged(){

  },
  playerStateChanged(event) {
    debug('playerStateChanged ' + event.data);
    window.playerObj.lastState = event.data;
    window.playerObj.get('playerState')({
      state: event.data,
      buffering: window.playerObj.isPrebuffering,
      playing: window.playerObj.isPlaying
    });

    if (event.data === -1) {//unstarted
      // $('#youtubeHolder .controlsOverlay .play').hide();
      // $('#youtubeHolder .controlsOverlay .pause').hide();
    } else if (event.data === 0) {//ended
      window.playerObj.get('onVideoEnd')();
    } else if (event.data === 1) {//playing
      if (window.playerObj.isPrebuffering) {
        window.playerObj.isPrebuffering = false;
        window.playerObj.sendPlayedPause();
        window.playerObj.sendPlayerSeekTo(window.playerObj.secondsToPlay);
        window.playerObj.videoLoadedAction();
        return;
      } else {
        // $('#youtubeHolder .controlsOverlay .play').hide();
        // $('#youtubeHolder .controlsOverlay .pause').show();
        // $('.youtube-music-holder .controls .play-btn').hide();
        // $('.youtube-music-holder .controls .pause-btn').show();
      }
    } else if (event.data === 2) {//paused
      // $('#youtubeHolder .controlsOverlay .play').show();
      // $('#youtubeHolder .controlsOverlay .pause').hide();
      // $('.youtube-music-holder .controls .play-btn').show();
      // $('.youtube-music-holder .controls .pause-btn').hide();
    } else if (event.data === 3) {//buffering
      // $('#youtubeHolder .controlsOverlay .play').hide();
      // $('#youtubeHolder .controlsOverlay .pause').hide();
      // $('.youtube-music-holder .controls .play-btn').hide();
      // $('.youtube-music-holder .controls .pause-btn').hide();
    } else if (event.data === 5) {//queued
      // $('#youtubeHolder .controlsOverlay .play').hide();
      // $('#youtubeHolder .controlsOverlay .pause').hide();

      // $('.youtube-music-holder .controls .play-btn').hide();
      // $('.youtube-music-holder .controls .pause-btn').hide();
      window.playerObj.isPrebuffering = true;
      if (window.playerObj.secondsToPlay === 0.0 || window.playerObj.secondsToPlay === 0) {
        window.playerObj.sendPlayedPlay();
      } else {
        window.playerObj.sendPlayerSeekTo(window.playerObj.secondsToPlay);
        window.playerObj.sendPlayedPlay();
      }
    }
    $('#youtubeHolder .controlsOverlay').attr('play-state', event.data);
    $('.youtube-music-holder').attr('play-state', event.data);
  },
  modelObserver() {
    debug('model');
  },
  queueVideoToPlayer(player,video,seconds){
    if (get(video,'videoType') === 'youtube#video' || get(video,'videoType') === 'youtube#music'){
      player.cueVideoById(video['videoId'], seconds);
    }else if (get(video,'videoType') === 'crunchyroll#media'){
      player.src([
        {
          type: 'application/x-mpegURL',
          src: get(video,'videoUrl')
        }
      ]);
      player.ready(()=>{
        debug('on ready');
      });
    }else{

      player.src([
        {
          type: 'video/mp4',
          src: get(video,'videoUrl')
        }
      ]);
      player.ready(()=>{
        debug('on ready');
      });
    }
  },
  getVideoState:computed(function(){
    const v = this.get('video');
    const category = v.video.videoType;
    if (category === "youtube#music"){
        return 0;
    }
    return 1;
  }),
  videoObserver(obj) {
    let v = obj.get('video');
    if (!v.video)
      return;
    let player = obj.get('player');
    window.playerObj.isPlaying = false;
    obj.playerSubj.subscribe({
      next: (val) => {
        if (val === 1) {
          obj.secondsToPlay = v.seconds;
          obj.queueVideoToPlayer(player,v.video,v.seconds);
          if (obj.get('getVideoState') === 1){
            $('.youtube-music-holder').hide();
            $('#youtubeHolder').show();
            // $('#youtubePlaceHolder').show();
            $('#youtubeHolder .overlay').show();
          }else{
            $('#youtubeHolder').hide();
            $('.youtube-music-holder').show();
          }
          window.playerObj.get('onPlayerShow')();

          debug('video');
        }
      }
    });
    let name = v.video['videoName'];
    let thumbnail = v.video['videoThumbnail'];
    if (name) {
      $('#youtubeHolder .controlsHolder .video-title').text(name);
      $('.youtube-music-holder .details .song-name').text(this.songTitle(name));
      $('.youtube-music-holder .details .song-artist').text(this.songArtist(name));
    }
    if (thumbnail) {
      $('.youtube-music-holder .thumbnail').attr('src', thumbnail);
    }
  },
  songTitle(title) {
    let data = [];
    if (title.includes(' | ')) {
      data = title.split(' | ')
    } else if (title.includes(' - ')) {
      data = title.split(' - ')
    } else {
      data.push(title);
      data.push(title);
    }
    return data[1];
  },
  songArtist(title) {
    let data = [];
    if (title.includes(' | ')) {
      data = title.split(' | ')
    } else if (title.includes(' - ')) {
      data = title.split(' - ')

    } else {
      data.push('Unknown');
    }
    return data[0];
  }
});
