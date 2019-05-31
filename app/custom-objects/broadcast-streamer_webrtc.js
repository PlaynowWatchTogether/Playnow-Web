import EmberObject from '@ember/object';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
import J from 'jquery';

export default EmberObject.extend({
  init(){
    this._super(...arguments);
    this.webRTCAdaptor = null;
  },
  createLocalVideo(parent){
    var video = $('<video autoplay muted id="localVideo"/>');
    video.appendTo($(parent));
  },
  playStream(videoElem, streamId){
    var pc_config = null;

  	var sdpConstraints = {
  		OfferToReceiveAudio : true,
  		OfferToReceiveVideo : true

  	};
  	var mediaConstraints = {
  		video : true,
  		audio : true
  	};

  	this.webRTCAdaptor = new WebRTCAdaptor({
  		websocket_url : "wss://stream.tunebrains.com/WebRTCApp/websocket",
  		mediaConstraints : mediaConstraints,
  		peerconnection_config : pc_config,
  		sdp_constraints : sdpConstraints,
  		remoteVideoId : videoElem,
  		isPlayMode: true,
  		callback : (info)=> {
  			if (info == "initialized") {
  				debug("initialized");
  			  this.webRTCAdaptor.play(streamId);
  			} else if (info == "play_started") {
  				//play_started
  				debug("play started");

  			} else if (info == "play_finished") {
  				// play finishedthe stream
  				debug("play finished");

  			}
  		},
  		callbackError : (error)=> {
  			debug("error callback: " + error);
  		}
  	});
  },
  stopStream(videoElem, streamId){
    if (this.webRTCAdaptor){
      this.webRTCAdaptor.stop(streamId);
      this.webRTCAdaptor = null;
    }
  },
  startStreaming(videoElem, streamId, model){
    if (!this.webRTCAdaptor){
      if (!model.mic && !model.video){
        return;
      }
      this.createLocalVideo(videoElem);
      var pc_config = null;

      var sdpConstraints = {
          OfferToReceiveAudio : false,
          OfferToReceiveVideo : false

      };
      var mediaConstraints = {
          audio : true,
          video: {width: {exact: 320}, height: {exact: 240}}
      };
      this.webRTCAdaptor = new WebRTCAdaptor({
          websocket_url : "wss://stream.tunebrains.com/WebRTCApp/websocket",
          mediaConstraints : mediaConstraints,
          peerconnection_config : pc_config,
          sdp_constraints : sdpConstraints,
          localVideoId : 'localVideo',
          callback : (info) =>{
              if (info == "initialized") {
                  debug("initialized");
                  if (!model.video){
                    this.webRTCAdaptor.turnOffLocalCamera()
                  }else{
                    this.webRTCAdaptor.turnOnLocalCamera()
                  }
                  if (!model.mic){
                    this.webRTCAdaptor.muteLocalMic();
                  }else{
                    this.webRTCAdaptor.unmuteLocalMic();
                  }
                  this.webRTCAdaptor.publish(streamId);
              } else if (info == "publish_started") {
                  //stream is being published
                  debug("publish started");
                  this.streamPublished(streamId);
                  $('#localVideo').addClass('streaming');
              } else if (info == "publish_finished"){
                  //stream is finished
                  $('#localVideo').removeClass('streaming');
                  this.streamRemoved(streamId);
                  $('#localVideo').remove();
                  debug("publish finished");
              } else if (info == "screen_share_extension_available") {
                                  //screen share extension is avaiable
                  debug("screen share extension available");
              } else if (info == "screen_share_stopped") {
                                   //"Stop Sharing" is clicked in chrome screen share dialog
                  debug("screen share stopped");
              }
          },
          callbackError : (error) =>{
              //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
              if (this.webRTCAdaptor){
                this.webRTCAdaptor.stop(streamId);
                this.webRTCAdaptor = null;
              }
              this.streamRemoved(streamId);
              // $('#localVideo').remove();
              debug("error callback: " + error);
          }
      });
    }else{
      if (model.mic || model.video){
        if (!model.video){
          this.webRTCAdaptor.turnOffLocalCamera()
        }else{
          this.webRTCAdaptor.turnOnLocalCamera()
        }
        if (!model.mic){
          this.webRTCAdaptor.muteLocalMic();
        }else{
          this.webRTCAdaptor.unmuteLocalMic();
        }
        this.streamPublished(streamId);
      }else{
        //stop streaming
        if (this.webRTCAdaptor){
          this.webRTCAdaptor.stop(streamId);
          this.webRTCAdaptor = null;
        }
        // $('#localVideo').remove();
      }
    }

  }
})
