import EmberObject from '@ember/object';

export default EmberObject.extend({
  type: 'one2one',
  user: null,
  myId: '',
  db: null,
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
  messages(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/Messages";
    this.db.ref(ref).once('value', (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        mes.id = item.key;
        records.push(mes);
      });
      updateCallback(records);
    })
  }

});
