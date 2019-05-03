import EmberObject from '@ember/object';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
export default EmberObject.extend({
  init(){
    this._super(...arguments);
    this.listeners=[];
  },
  rootRef(){
    return this.firebaseApp.database().ref('channels/feed');
  },
  feedRef(id){
    return this.rootRef().child(id);
  },
  generateFeedId(){
    const myID = this.db.myId();
    return `${new Date().getTime()}@${myID}`;
  },
  reset(){

  },
  createGroup(details){
    return new Promise((resolve, reject)=>{
      const payload = details;
      const myID = this.db.myId();
      this.db.profile(myID).then((profile)=>{
        payload["creatorName"] = `${profile['FirstName']} ${profile['LastName']}`;
        payload["creatorId"] = profile["id"];
        payload["creatorAvatar"] = profile["ProfilePic"];
        const id = this.generateFeedId();
        this.feedRef(id).set(payload).then(()=>{
          payload.id = id;
          resolve(payload);
        }).catch((error)=>{
          reject(error);
        });
      });

    });
  },
  listen(id, updateCallback){
    let myId = this.db.myId();

    let ref = this.feedRef(id);
    const listener = (data)=>{
      const payload = data.val();
      payload["id"] = data.key;
      updateCallback(payload);
    };
    ref.on('value', listener);
    const ret = {ref:ref,listener:listener};
    this.listeners.push(ret);
    return ret;
  },
  messages(convId,updateCallback) {
    const ref = this.feedRef(convId).child('Messages');
    const valueListener = (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        if (typeof mes === 'object') {
          mes.id = item.key;
          mes['date'] = mes['serverDate'];
          records.push(mes);
        }
      });
      updateCallback(records);
    };

    ref.on('value', valueListener)

    const ret = {ref:ref,listener:valueListener};
    this.listeners.push(ret);
    return ret;
  },
  sendPost(convId,text, uploads){
    let senderId = this.db.myId();
    let msgUid = new Date().getTime().toString() + senderId;
    let message = {};
    message['uid'] = msgUid;
    message['date'] = new Date().getTime() / 1000;
    message['serverDate'] = this.firebaseApp.firebase_.database.ServerValue.TIMESTAMP;
    message['convoId'] = convId;
    message['senderId'] = senderId;
    message['senderName'] = this.auth.current.get('userName');
    message['type'] = 'post';
    message['attachments']=[];
    uploads.forEach((attachment)=>{
      if (attachment.state === 2){
        message['attachments'].push({
          name: attachment.file.name,
          size: attachment.file.size,
          type: attachment.file.type,
          url: attachment.url
        });
      }
    });
    message['userId'] = senderId;
    message['message'] = 'web';
    message['text'] = text;
    let ref = this.feedRef(convId).child(`Messages/${msgUid}`);
    ref.update(message).then(() => {
      debug('Message posted');
    }).catch((error)=>{
      debug('failed to post message');
    });
  }

});
