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
      };
      this.connection.onleave = (event)=>{
        debug('onleave');
      };
      this.connection.onstream = (event)=> {
        debug(`onstream ${event.type}`);

        // this.videoPreview.volume = 0;

        if(event.type === 'local') {
          this.videoPreview.muted = true;
          this.videoPreview.volume = 0;
          try {
              this.videoPreview.setAttributeNode(document.createAttribute('muted'));
          } catch (e) {
              this.videoPreview.setAttribute('muted', true);
          }
          if (this.streamPublished){
            this.streamPublished(streamId);
          }
        }else{
          this.videoPreview.muted = false
        }
        this.videoPreview.srcObject = event.stream;
        this.videoPreview.play();
        $(videoElem).removeClass('loading');
      };
      this.connection.onstreamended = (event)=> {
        debug('onstreamended');
        if (this.streamRemoved){
          this.streamRemoved(streamId);
          $('#localVideo').remove();
        }
        this._handleClose(videoElem,streamId);
      };

      resolve();
    })
  },
  createLocalVideo(parent){
    var video = $('<video muted id="localVideo"/>');
    video.appendTo($(parent));
    return video[0];
  },
  stopStream(videoElem, streamId){

    // if (this.webRTCAdaptor){
      // this.webRTCAdaptor.stop(streamId);
      // this.webRTCAdaptor = null;
    // }
  },
  _handleMute(streamId,model){
    const localStream = this.connection.attachStreams[0];
    localStream.getVideoTracks().forEach((track)=>{
      track.enabled = model.video;
    });
    localStream.getAudioTracks().forEach((track)=>{
      track.enabled = model.mic;
    })
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
        this.videoPreview = this.createLocalVideo(videoElem);
        this.connection.session = {
            audio: true,
            video: true,
            oneway: true
        };
        this.connection.open(streamId, () =>{
          this._handleMute(streamId, model);
        });

      });
    }else{
      if (model.mic || model.video){
        this._handleMute(streamId, model);
      }else{
        $(videoElem).removeClass('loading');
        this._handleClose(videoElem,streamId);
        $('#localVideo').remove();
      }
    }
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
      this.videoPreview = $(`${videoElem} video`)[0];
      this.connection.join(streamId);
    });
  }
})
