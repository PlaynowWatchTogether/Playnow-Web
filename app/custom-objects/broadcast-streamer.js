import EmberObject from '@ember/object';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
import $ from 'jquery';

export default EmberObject.extend({
  init(){
    this._super(...arguments);
    this.oldAudio = false;
    this.oldVideo = false;
  },
  createConnection(videoElem,streamId){
    return new Promise((resolve,reject)=>{
      this.connection = new RTCMultiConnection();
          // its mandatory in v3
      // this.connection.enableScalableBroadcast = true;

      // by default, socket.io server is assumed to be deployed on your own URL
      this.connection.socketURL = 'https://stream.tunebrains.com/';

      // comment-out below line if you do not have your own socket.io server
      // connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
      this.connection.socketMessageEvent = 'video-broadcast-demo';
      this.connection.sdpConstraints.mandatory = {
          OfferToReceiveAudio: false,
          OfferToReceiveVideo: false
      };
      this.connection.processSdp = function(sdp) {
          return sdp; // return unchanged SDP
      };
      this.connection.onbeforeunload = (event)=>{
        debug('onbeforeunload');
      };
      this.connection.onclose = (event)=>{
        debug('onclose');
        $(event.mediaElement).remove();
      };
      this.connection.onleave = (event)=>{
        debug('onleave');
      };
      this.connection.onstream = (event)=> {
        debug(`onstream ${event.type}`);

        // this.videoPreview.volume = 0;

        if(event.type === 'local') {
          this.videoPreview = event.mediaElement;
          event.mediaElement.removeAttribute('controls');
          $(event.mediaElement).appendTo($(videoElem));
          this.videoPreview.muted = true;
          this.videoPreview.volume = 0;
          try {
              this.videoPreview.setAttributeNode(document.createAttribute('muted'));
          } catch (e) {
              this.videoPreview.setAttribute('muted', true);
          }

        }else{
          event.mediaElement.removeAttribute('controls');
          this.videoPreview = event.mediaElement;
          $(event.mediaElement).appendTo($(videoElem));
        }
        this.videoPreview.srcObject = event.stream;
        this.videoPreview.play();
        $(videoElem).removeClass('loading');
      };
      this.connection.onstreamended = (event)=> {
        debug(`onstreamended ${event.type}`);
        $(event.mediaElement).remove();
      };

      resolve();
    })
  },
  createLocalVideo(parent){
    var video = $('<audio muted id="localVideo"/>');
    video.appendTo($(parent));
    return video[0];
  },
  stopStream(videoElem, streamId){
    if (this.connection){
      this.connection.getAllParticipants().forEach((pid)=> {
           this.connection.disconnectWith(pid);
      });

       // stop all local cameras
      this.connection.attachStreams.forEach((localStream)=> {
        localStream.stop();
      });

       // close socket.io connection
      this.connection.closeSocket();
      this.connection = null;
    }
    // if (this.webRTCAdaptor){
      // this.webRTCAdaptor.stop(streamId);
      // this.webRTCAdaptor = null;
    // }
  },
  _handleMute(streamId,model){
    // const localStream = this.connection.attachStreams[0];
    // localStream.getVideoTracks().forEach((track)=>{
    //   track.enabled = model.video;
    // });
    // localStream.getAudioTracks().forEach((track)=>{
    //   track.enabled = model.mic;
    // })
    if (this.streamPublished){
      this.streamPublished(streamId);
    }
  },
  _handleClose(videoElem,streamId){
    if (this.connection){
      this.connection.getAllParticipants().forEach((pid)=> {
           this.connection.disconnectWith(pid);
      });

       // stop all local cameras
      this.connection.attachStreams.forEach((localStream)=> {
        localStream.stop();
      });

       // close socket.io connection
      this.connection.closeSocket();
      this.connection = null;
    }
    if (this.streamPublished){
      this.streamPublished(streamId);
    }
  },
  startStreaming(videoElem, streamId, model,userId){
    if (!this.connection){
      if (!model.mic && !model.video){
        return;
      }
      $(videoElem).addClass('loading');
      this.createConnection(videoElem,streamId).then(()=>{
        this.connection.mediaConstraints = {
          audio: model.mic,
          video: model.video,
        };
        this.connection.session = {
            audio: model.mic,
            video: model.video,
            oneway: true
        };
        this.connection.open(streamId, () =>{
          debug('connection.opened');
          debug('streamPublished');
          if (this.streamPublished){
            this.streamPublished(streamId);
          }
          // this._handleMute(streamId, model);
        });

      });
    }else{
      if (model.mic || model.video){
        if (model.video && !this.isStreamingVideo()){
            this.connection.sdpConstraints.mandatory = {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: true
            };
            this.connection.session = {
                audio: false,
                video: true
            };
            this.connection.mediaConstraints = {
                audio: false,
                video: true
            };
            this.connection.addStream({video:true, oneway:true});
        }
        if (model.mic && !this.isStreamingMic()){
            this.connection.sdpConstraints.mandatory = {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: false
            };
            this.connection.session = {
                audio: true,
                video: false
            };
            this.connection.mediaConstraints = {
                audio: true,
                video: false
            };
            this.connection.addStream({audio:true, oneway:true});
        }
        if (!model.video && this.isStreamingVideo()){
          const video = this.videoStream();
          video.stop();
        }
        if (!model.mic && this.isStreamingMic()){
          const mic = this.micStream();
          mic.stop();
        }
        this._handleMute(streamId, model);
      }else{
        $(videoElem).removeClass('loading');
        this._handleClose(videoElem,streamId);
        $(videoElem).find('video,audio').remove();
      }
    }
  },
  videoStream(){
    let ret = null;
    this.connection.attachStreams.forEach((stream)=>{
      if (stream.getVideoTracks().length){
        ret = stream;
      }
    });
    return ret;
  },
  micStream(){
    let ret = null;
    this.connection.attachStreams.forEach((stream)=>{
      if (stream.getAudioTracks().length){
        ret = stream;
      }
    });
    return ret;
  },
  isStreamingVideo(){
    let ret = false;
    this.connection.attachStreams.forEach((stream)=>{
      ret|=stream.getVideoTracks().length > 0;
    });
    return ret;
  },
  isStreamingMic(){
    let ret = false;
    this.connection.attachStreams.forEach((stream)=>{
      ret|=stream.getAudioTracks().length > 0;
    });
    return ret;
  },
  playStream(videoElem,streamId){
    $(videoElem).addClass('loading');
    this.createConnection(videoElem,streamId).then(()=>{
      this.connection.sdpConstraints.mandatory = {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
      };
      this.connection.session = {
          audio: true,
          video: true,
          oneway: true
      };
      this.connection.join(streamId);
    });
  }
})
