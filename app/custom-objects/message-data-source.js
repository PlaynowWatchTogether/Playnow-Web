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
    this.sendTyping(true);
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
  }

});
