import EmberObject from '@ember/object';
import {inject as service} from '@ember/service';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
import VideoStateHandlerMixin from '../mixins/video-state-handler-mixin';
import ChatPlaylistHandler from '../mixins/chat-playlist-handler';

export default EmberObject.extend(VideoStateHandlerMixin, ChatPlaylistHandler, {
  gcmManager: service(),
  type: 'one2one',
  user: null,
  myId: '',
  db: null,
  messagesRef: null,
  membersRef: null,
  lastSeenRef: null,
  typingRef: null,
  videoStateRef: null,
  videoWatchersRef: null,
  typingInterval: null,
  auth: null,
  init() {
    this.listeners = {};
  },
  convId() {
    if (this.type === 'one2one') {
      return [this.myId, this.user.id].sort((a, b) => {
        return b.localeCompare(a)
      }).join("");
    } else if (this.type === 'room') {
      return this.room.id;
    } else if (this.type === 'group') {
      return this.group['id'];
    } else if (this.type === 'feed') {
      return this.feed['id'];
    } else {
      return "";
    }
  },
  messageRoot() {
    if (this.type === 'one2one') {
      return 'channels/messages';
    } else if (this.type === 'room') {
      return 'channels/channels';
    } else if (this.type === 'group') {
      return 'channels/Groups';
    } else if (this.type === 'feed') {
      return 'channels/live';
    }
  },
  sendVideoEnd(video) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoEnd";
    let values = {}
    values['videoId'] = video['id'];
    values['videoName'] = video['snippet']['title'];
    values['videoThumbnail'] = video['snippet']['thumbnails']['high']['url'];

    this.db.ref(ref).update(values);
  },
  updateWatchState(state, seconds, syncAt = null) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoState";
    let values = {};
    values['updatedAt'] = new Date().getTime() / 1000.0;
    values['syncAt'] = syncAt == null ? new Date().getTime() / 1000.0 : syncAt / 1000;
    values['type'] = state;
    values['seconds'] = seconds;
    debug('updateWatchState ' + JSON.stringify(values));
    this.db.ref(ref).update(values).catch(() => {
      debug(`Failed to update videoState on path ${ref} to ${JSON.stringify(values)}`);
    });
  },
  sendVideoMessage(video,mode = 'youtubeVideo'){
    let senderId = this.myId;
    let path = this.messageRoot();
    let convId = this.convId();
    let message = {};
    const msgUid = this.generateMessageId();
    message['uid'] = msgUid;
    message['date'] = new Date().getTime() / 1000;
    message['serverDate'] = this.fb.firebase_.database.ServerValue.TIMESTAMP;
    message['convoId'] = convId;
    message['senderId'] = senderId;
    message['senderName'] = this.auth.current.get('userName');
    message['type'] = 'ShareVideo';
    message['userId'] = senderId;
    message['message'] = 'web';
    message['text'] = '';
    message['video']={
      mode: mode,
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle
    };
    let ref = path + "/" + convId + "/Messages/" + msgUid;
    this.db.ref(ref).update(message).then(() => {

    });
  },
  sendVideo(video, mode = 'youtubeVideo') {
    this.sendVideoInternal(this.db,this.myId,this.convId(),this.messageRoot(),video,mode)
  },
  videoWatchers(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoWatching";
    this.videoWatchersRef = this.db.ref(ref);
    let valueListener = (snippet) => {
      let records = [];
      snippet.forEach((item) => {
        records.push(item.val());
      });
      updateCallback(records);
    };
    this.listeners[ref] = valueListener;
    this.videoWatchersRef.on('value', valueListener)
  },
  removeWatching() {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoWatching/" + this.myId;
    this.db.ref(ref).remove().then(() => {

    });
  },
  updateWatching(videoId, state) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoWatching/" + this.myId;
    let values = {};
    values['videoId'] = videoId;
    values['userId'] = this.myId;
    values['updatedAt'] = new Date().getTime() / 1000.0;
    values['state'] = state;
    debug('updateWatching ' + JSON.stringify(values));
    this.db.ref(ref).onDisconnect().remove();
    this.db.ref(ref).update(values);
  },
  sendTyping(typing) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/typingIndicator";
    let updated = {};
    updated[this.myId] = typing;
    let dbRef = this.db.ref(ref);
    dbRef.onDisconnect().remove();
    dbRef.update(updated);
  },
  typing(mes) {
    if (this.typingInterval) {
      clearTimeout(this.typingInterval);
    }
    this.sendTyping(mes.length !== 0);
    this.typingInterval = setTimeout(() => {
      this.sendTyping(false)
    }, 5000)
  },
  lastMessageSeen(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/lastMessageSeen";
    this.lastSeenRef = ref;
    let valueListener = (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        let id = item.key;
        records.push({messageId: mes, userId: id});
      });
      updateCallback(records);
    };
    this.listeners[ref] = valueListener;
    this.db.ref(ref).on('value', valueListener)
  },
  typingIndicator(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/typingIndicator";
    this.typingRef = ref;
    let valueListener = (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        let id = item.key;
        records.push({messageId: mes, userId: id});
      });
      updateCallback(records);
    };
    this.listeners[ref] = valueListener;
    this.db.ref(ref).on('value', valueListener)
  },
  sendSeen(mesId) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/lastMessageSeen";
    let updated = {};
    updated[this.myId] = mesId;

    this.db.ref(ref).update(updated)

  },
  videoState(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoState";
    this.videoStateRef = ref;
    let valueListener = (snapshot) => {
      updateCallback(snapshot.val());
    };
    this.listeners[ref] = valueListener;
    this.db.ref(ref).on('value', valueListener);

  },
  messagesOnce(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/Messages";
    this.db.ref(ref).once('value', (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        if (typeof mes === 'object') {
          mes.id = item.key;
          if (mes['serverDate']) {
            mes['date'] = mes['serverDate']
          } else {
            if (mes['date'] % 1 !== 0) {
              mes['date'] = mes['date'] * 1000;
            }
          }
          records.push(mes);
        }
      });
      updateCallback(records);
    })
  },
  messages(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/Messages";
    this.messagesRef = ref;
    let valueListener = (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        if (typeof mes === 'object') {
          mes.id = item.key;
          if (mes['serverDate']) {
            mes['date'] = mes['serverDate']
          } else {
            if (mes['date'] % 1 !== 0) {
              mes['date'] = mes['date'] * 1000;
            }
          }
          records.push(mes);
        }
      });
      updateCallback(records);
    };
    this.listeners[ref] = valueListener;
    this.db.ref(ref).on('value', valueListener)
  },
  profile(user) {
    return new Promise((resolve, reject) => {
      let ref = this.db.ref("Users/" + user);
      ref.once('value').then((snapshot) => {
        let payload = snapshot.val();
        payload['id'] = snapshot.key;
        resolve(payload);
      }).catch((error) => {
        reject(error);
      })
    });
  },
  membersOnce() {
    if (this.type === 'one2one') {
      return new Promise((resolve, reject) => {
        this.profile(this.get('user.id')).then((profile) => {
          resolve([profile]);
        }).catch((error) => {
          reject(error);
        })
      });
    } else {
      return new Promise((resolve, reject) => {
        let convId = this.convId();
        let path = this.messageRoot();
        let ref = path + "/" + convId + "/Members";
        this.membersRef = ref;
        this.db.ref(ref).once('value', (snapshot) => {
          let records = [];
          debug('Got values for ref' + ref);
          snapshot.forEach((item) => {
            let mes = item.val();
            debug('Got member item for ref' + ref);
            if (typeof mes === 'object') {
              mes.id = item.key;
              records.push(mes);
            }
          });
          resolve(records);
        }, (error) => {
          reject(error);
        })
      });
    }
  },
  off(returnRes){
    this.db.ref(returnRes[0]).off('value', returnRes[1]);
  },
  chatAttachments(store, updateCallback){
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/Attachments";

    let valueListener = (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let id= item.key;
        item.forEach((attachment)=>{
          let atId = attachment.key;
          const payload = attachment.val();
          payload.id = `${id}_${atId}`;
          payload.convId = convId;
          let normalizedData = store.normalize('chat-attachment', payload);
          store.push(normalizedData);
        })

      });
      updateCallback(records);
    };
    this.listeners[ref] = valueListener;
    this.db.ref(ref).on('value', valueListener)
    return [ref,valueListener];
  },

  members(updateCallback) {
    if (this.type === 'one2one') {
      this.profile(this.get('user.id')).then((profile) => {
        updateCallback([profile]);
      });
    } else {
      let convId = this.convId();
      let path = this.messageRoot();
      let ref = path + "/" + convId + "/Members";
      this.membersRef = ref;
      let valueListener = (snapshot) => {
        let records = [];
        snapshot.forEach((item) => {
          let mes = item.val();
          if (typeof mes === 'object') {

            mes.id = item.key;
            records.push(mes);
          }
        });
        updateCallback(records);
      };
      this.listeners[ref] = valueListener;
      this.db.ref(ref).on('value', valueListener)
    }
  },
  stop() {
    for (let listener in this.listeners) {
      let value = this.listeners[listener];
      this.db.ref(listener).off('value', value);
      debug('remove listener for ' + value);

    }
  },
  generateMessageId(){
    let senderId = this.myId;
    let msgUid = new Date().getTime().toString() + senderId;
    return msgUid;
  },

  sendAttachment(file, url, msgUid){
    let senderId = this.myId;
    let path = this.messageRoot();
    let convId = this.convId();
    let message = {};
    message['uid'] = msgUid;
    message['date'] = new Date().getTime() / 1000;
    message['serverDate'] = this.fb.firebase_.database.ServerValue.TIMESTAMP;
    message['convoId'] = convId;
    message['senderId'] = senderId;
    message['senderName'] = this.auth.current.get('userName');
    message['type'] = 'attachment';
    message['userId'] = senderId;
    message['message'] = 'web';
    message['text'] = '';
    message['attachment']={
      name: file.name,
      size: file.size,
      type: file.type,
      url: url
    };
    let ref = path + "/" + convId + "/Messages/" + msgUid;
    this.db.ref(ref).update(message).then(() => {
      if (this.gcmManager && this.type !== 'room') {
        this.profile(this.myId).then((myProfile) => {
          this.membersOnce().then((members) => {
            members.forEach((member) => {
              this.gcmManager.sendMessage(member.id, message, myProfile['FirstName'] + " sent a message", {});
            });
          });
        });
      }
    });
  },
  sendMessage(text, attachments=[], inReplyTo = null, video=null) {
    let senderId = this.myId;
    let path = this.messageRoot();
    let convId = this.convId();
    let msgUid = new Date().getTime().toString() + senderId;
    let message = {};
    message['uid'] = msgUid;
    message['date'] = new Date().getTime() / 1000;
    message['serverDate'] = this.fb.firebase_.database.ServerValue.TIMESTAMP;
    message['convoId'] = convId;
    message['senderId'] = senderId;
    message['senderName'] = this.auth.current.get('userName');
    message['type'] = 'text';
    if (video) {
      message['type'] = 'VideoRequest';
      message['video'] = video;
      message['isMusic'] = video.isMusic;
    }
    message['attachments']=[];
    attachments.forEach((attachment)=>{
      if (attachment.state === 2){
        message['attachments'].push({
          name: attachment.file.name,
          size: attachment.file.size,
          type: attachment.file.type,
          url: attachment.url
        });
      }
    });
    if (inReplyTo){
      message['inReplyTo'] = inReplyTo;
    }
    message['userId'] = senderId;
    message['message'] = 'web';
    message['text'] = text;
    let ref = path + "/" + convId + "/Messages/" + msgUid;
    this.db.ref(ref).update(message).then(() => {
      if (this.gcmManager && (this.type !== 'room' && this.type !== 'feed')) {
        this.profile(this.myId).then((myProfile) => {
          this.membersOnce().then((members) => {
            members.forEach((member) => {
              this.gcmManager.sendMessage(member.id, message, myProfile['FirstName'] + " sent a message", {});
            });
          });
        });
      }
    });
  },
  loadPlaylist(callback){
    const senderId = this.myId;
    const convId = this.convId();
    const path = this.messageRoot();
    let ref = null;
    if (this.type === 'one2one'){
      ref = `${path}/${convId}/Playlist/${senderId}`
    }
    if (this.type === 'group'){
      ref = `${path}/${convId}/Playlist/`
    }
    if (ref){
      this.db.ref(ref).on('value', (data)=>{
        callback(data.val()||{});
      })
    }
  },
  addPlaylistItem(video){
    const senderId = this.myId;
    const convId = this.convId();
    const path = this.messageRoot();
    let ref = null;
    if (this.type === 'one2one'){
      ref = `${path}/${convId}/Playlist/${senderId}`
    }
    if (this.type === 'group'){
      ref = `${path}/${convId}/Playlist`
    }
    if (ref){
      return this.addPlaylistItemInternal(senderId,this.db.ref(ref), video);
    }
  },
  removePlaylistItem(video){
    const convId = this.convId();
    const path = this.messageRoot();
    const senderId = this.myId;
    let ref = null;
    if (this.type === 'one2one'){

      ref = `${path}/${convId}/Playlist/${senderId}`
    }
    if (this.type === 'group'){
      ref = `${path}/${convId}/Playlist`
    }
    return this.removePlaylistItemInternal(this.db.ref(ref),video);
  },

});
