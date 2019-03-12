import EmberObject from '@ember/object';

export default EmberObject.extend({
  type: 'one2one',
  user: null,
  myId: '',
  db: null,
  messagesRef: null,
  videoStateRef: null,
  videoWatchersRef: null,
  typingInterval: null,
  convId() {
    if (this.type === 'one2one') {
      return [this.myId, this.user.id].sort((a, b) => {
        return b.localeCompare(a)
      }).join("");
    } else if (this.type === 'room') {
      return this.room.id
    } else {
      return "";
    }
  },
  messageRoot() {
    if (this.type === 'one2one') {
      return 'channels/messages';
    } else if (this.type === 'room') {
      return 'channels/channels';
    }
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
    console.log('updateWatchState ' + JSON.stringify(values));
    this.db.ref(ref).update(values);
  },
  sendVideo(video, mode = 'youtubeVideo') {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoState";
    let values = {};
    values['type'] = 'new';
    values['syncAt'] = new Date().getTime() / 1000.0;
    values['updatedAt'] = new Date().getTime() / 1000.0;
    values['videoId'] = video['id'];
    values['videoType'] = mode;
    values['videoName'] = video['snippet']['title'];
    values['videoThumbnail'] = video['snippet']['thumbnails']['medium']['url'];
    values['senderId'] = this.myId;
    values['seconds'] = 0;
    console.log('sendVideo ' + JSON.stringify(values));
    this.db.ref(ref).update(values);
  },
  videoWatchers(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoWatching";
    this.videoWatchersRef = this.db.ref(ref);
    this.videoWatchersRef.on('value', (snippet) => {
      let records = [];
      snippet.forEach((item) => {
        records.push(item.val());
      });
      updateCallback(records);
    })
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
    console.log('updateWatching ' + JSON.stringify(values));
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
  sendSeen(mesId) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/lastMessageSeen";
    let updated = {};
    updated[this.myId] = mesId

    this.db.ref(ref).update(updated)

  },
  videoState(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoState";
    this.videoStateRef = ref;
    this.db.ref(ref).on('value', (snapshot) => {
      updateCallback(snapshot.val());
    });

  },
  messages(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/Messages";
    this.messagesRef = ref;
    this.db.ref(ref).on('value', (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        mes.id = item.key;
        records.push(mes);
      });
      if (records.length > 0) {
        this.sendSeen(records[records.length - 1].uid);
      }
      updateCallback(records);
    })
  },
  stop() {
    if (this.messagesRef) {
      this.db.ref(this.messagesRef).off('value');
    }
    if (this.videoStateRef) {
      this.db.ref(this.videoStateRef).off('value');

    }
  },
  sendMessage(text, thumbnail) {
    let senderId = this.myId;
    let path = this.messageRoot();
    let convId = this.convId();
    let msgUid = new Date().getTime().toString() + senderId;
    let message = {};
    message['uid'] = msgUid;
    message['date'] = new Date().getTime() / 1000.0;
    message['convoId'] = convId;
    message['senderId'] = senderId;
    message['senderName'] = 'Test sender';
    if (thumbnail) {
      message['type'] = 'photo';
      message['thumbnail'] = thumbnail;
    } else {
      message['type'] = 'text';
    }
    message['userId'] = senderId;
    message['message'] = 'web';
    message['text'] = text;
    let ref = path + "/" + convId + "/Messages/" + msgUid;
    this.db.ref(ref).update(message)
  }

});
