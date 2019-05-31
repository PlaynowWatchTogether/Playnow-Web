import EmberObject from '@ember/object';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
import J from 'jquery';

export default EmberObject.extend({
  init(){
    this._super(...arguments);

  },
  createConnection(){
    return new Promise((resolve,reject)=>{
      this.connection = new RTCMultiConnection();
          // its mandatory in v3
      this.connection.enableScalableBroadcast = true;

      // each relaying-user should serve only 1 users
      this.connection.maxRelayLimitPerUser = 1;

      // we don't need to keep room-opened
      // scalable-broadcast.js will handle stuff itself.
      this.connection.autoCloseEntireSession = true;

      // by default, socket.io server is assumed to be deployed on your own URL
      this.connection.socketURL = 'https://stream.tunebrains.com/';

      // comment-out below line if you do not have your own socket.io server
      // connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

      this.connection.socketMessageEvent = 'scalable-media-broadcast-demo';
      this.connection.connectSocket((socket)=> {
        socket.on('join-broadcaster', function(hintsToJoinBroadcast) {
         debug('join-broadcaster', hintsToJoinBroadcast);

         connection.session = hintsToJoinBroadcast.typeOfStreams;
         connection.sdpConstraints.mandatory = {
             OfferToReceiveVideo: !!connection.session.video,
             OfferToReceiveAudio: !!connection.session.audio
         };
         connection.broadcastId = hintsToJoinBroadcast.broadcastId;
         connection.join(hintsToJoinBroadcast.userid);
        });
        socket.on('rejoin-broadcast', (broadcastId)=> {
            debug('rejoin-broadcast', broadcastId);

            this.connection.attachStreams = [];
            socket.emit('check-broadcast-presence', broadcastId, (isBroadcastExists)=> {
                if (!isBroadcastExists) {
                    // the first person (i.e. real-broadcaster) MUST set his user-id
                    this.connection.userid = broadcastId;
                }

                socket.emit('join-broadcast', {
                    broadcastId: broadcastId,
                    userid: this.connection.userid,
                    typeOfStreams: this.connection.session
                });
            });
        });
        socket.on('broadcast-stopped', (broadcastId) =>{
            // alert('Broadcast has been stopped.');
            // location.reload();
            debug('broadcast-stopped', broadcastId);
        });
        socket.on('start-broadcasting', (typeOfStreams) =>{
            debug('start-broadcasting', typeOfStreams);

            // host i.e. sender should always use this!
            this.connection.sdpConstraints.mandatory = {
                OfferToReceiveVideo: false,
                OfferToReceiveAudio: false
            };
            this.connection.session = typeOfStreams;

            // "open" method here will capture media-stream
            // we can skip this function always; it is totally optional here.
            // we can use "connection.getUserMediaHandler" instead
            this.connection.open(this.connection.userid);
        });
        resolve();
      });

      this.connection.onstream = (event)=> {
        if (this.connection.isInitiator && event.type !== 'local') {
            return;
        }
        this.connection.isUpperUserLeft = false;
        this.videoPreview.srcObject = event.stream;
        this.videoPreview.play();

        this.videoPreview.userid = event.userid;

        if (event.type === 'local') {
            this.videoPreview.muted = true;
        }

        if (this.connection.isInitiator == false && event.type === 'remote') {
            // he is merely relaying the media
            this.connection.dontCaptureUserMedia = true;
            this.connection.attachStreams = [event.stream];
            this.connection.sdpConstraints.mandatory = {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false
            };

            this.connection.getSocket(function(socket) {
                socket.emit('can-relay-broadcast');

                if (this.connection.DetectRTC.browser.name === 'Chrome') {
                    this.connection.getAllParticipants().forEach(function(p) {
                        if (p + '' != event.userid + '') {
                            var peer = connection.peers[p].peer;
                            peer.getLocalStreams().forEach(function(localStream) {
                                peer.removeStream(localStream);
                            });
                            event.stream.getTracks().forEach(function(track) {
                                peer.addTrack(track, event.stream);
                            });
                            this.connection.dontAttachStream = true;
                            this.connection.renegotiate(p);
                            this.connection.dontAttachStream = false;
                        }
                    });
                }

                if (this.connection.DetectRTC.browser.name === 'Firefox') {
                    // Firefox is NOT supporting removeStream method
                    // that's why using alternative hack.
                    // NOTE: Firefox seems unable to replace-tracks of the remote-media-stream
                    // need to ask all deeper nodes to rejoin
                    this.connection.getAllParticipants().forEach(function(p) {
                        if (p + '' != event.userid + '') {
                            connection.replaceTrack(event.stream, p);
                        }
                    });
                }

                // Firefox seems UN_ABLE to record remote MediaStream
                // WebAudio solution merely records audio
                // so recording is skipped for Firefox.
                if (this.connection.DetectRTC.browser.name === 'Chrome') {
                    repeatedlyRecordStream(event.stream);
                }
            });
        }

      // to keep room-id in cache
        localStorage.setItem(this.connection.socketMessageEvent, this.connection.sessionid);
      };
      this.connection.onstreamended = () =>{

      };
      this.connection.onleave = (event)=> {
        if (event.userid !== this.videoPreview.userid) return;

        this.connection.getSocket(function(socket) {
            socket.emit('can-not-relay-broadcast');
            this.connection.isUpperUserLeft = true;
        });
      };
    })
  },
  createLocalVideo(parent){
    var video = $('<video loop id="localVideo"/>');
    video.appendTo($(parent));
    return video[0];
  },
  stopStream(videoElem, streamId){
    // if (this.webRTCAdaptor){
      // this.webRTCAdaptor.stop(streamId);
      // this.webRTCAdaptor = null;
    // }
  },
  _startStreaming(videoElem, streamId, model,userId){
    this.connection.getSocket((socket)=> {
        socket.emit('check-broadcast-presence', streamId, (isBroadcastExists)=> {
            if (!isBroadcastExists) {
                // the first person (i.e. real-broadcaster) MUST set his user-id
                this.connection.userid = userId;
            }

            console.log('check-broadcast-presence', streamId, isBroadcastExists);

            socket.emit('join-broadcast', {
                broadcastId: streamId,
                userid: this.connection.userid,
                typeOfStreams: this.connection.session
            });
        });
    });
  },
  startStreaming(videoElem, streamId, model,userId){
    if (!this.connection){
      if (!model.mic && !model.video){
        return;
      }
      this.createConnection().then(()=>{
        this.videoPreview = this.createLocalVideo(videoElem);
        this.connection.extra.broadcastId = streamId;
        this.connection.session = {
            audio: model.mic,
            video: model.video,
            oneway: true
        };
        this._startStreaming(videoElem, streamId, model, userId);

      });
    }else{
      if (model.mic || model.video){        
        this.connection.session = {
            audio: model.mic,
            video: model.video,
            oneway: true
        };
        this._startStreaming(videoElem, streamId, model, userId);
      }else{

      }
    }

  }
})
