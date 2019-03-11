import EmberObject from '@ember/object';

export default EmberObject.extend({
  type: 'one2one',
  user: null,
  myId: '',
  db: null,
  messagesRef: null,
  typingInterval: null,
  convId() {
    if (this.type === 'one2one') {
      return [this.myId, this.user.id].sort((a, b) => {
        return b.localeCompare(a)
      }).join("");
    } else {
      return "";
    }
  },
  messageRoot() {
    if (this.type === 'one2one') {
      return 'channels/messages';
    }
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
    } else {
      message['type'] = 'text';
    }
    message['thumbnail'] = thumbnail;
    message['userId'] = senderId;
    message['message'] = 'web';
    message['text'] = text;
    let ref = path + "/" + convId + "/Messages/" + msgUid;
    this.db.ref(ref).update(message)
  }

});
