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
  updateGroup(convId, name, description){
    const myID = this.db.myId();
    const updates = {
      GroupName: name,
      GroupDescription: description
    }
    return this.feedRef(convId).update(updates);
  },
  createGroup(details){
    return new Promise((resolve, reject)=>{
      const payload = details;
      const myID = this.db.myId();
      this.db.profile(myID).then((profile)=>{
        payload["creatorName"] = `${profile['FirstName']} ${profile['LastName']}`;
        payload["creatorId"] = profile["id"];
        payload["creatorAvatar"] = profile["ProfilePic"];
        payload[`Admins/${myID}/id`] = myID;
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
  addEventLike(convId, eventId){
    let senderId = this.db.myId();
    let ref = this.feedRef(convId).child(`Events/${eventId}/Likes/${senderId}`);
    return ref.set(1);
  },
  addLike(convId, mesId){
    let senderId = this.db.myId();
    let ref = this.feedRef(convId).child(`Messages/${mesId}/Likes/${senderId}`);
    return ref.set(1);
  },
  removeEventLike(convId, mesId){
    let senderId = this.db.myId();
    let ref = this.feedRef(convId).child(`Events/${mesId}/Likes/${senderId}`);
    return ref.remove();
  },
  removeLike(convId, mesId){
    let senderId = this.db.myId();
    let ref = this.feedRef(convId).child(`Messages/${mesId}/Likes/${senderId}`);
    return ref.remove();
  },
  addEventCommentLike(convId, mesId,commentId){
    let senderId = this.db.myId();
    let ref = this.feedRef(convId).child(`Events/${mesId}/Messages/${commentId}/Likes/${senderId}`);
    return ref.set(1);
  },
  addCommentLike(convId, mesId,commentId){
    let senderId = this.db.myId();
    let ref = this.feedRef(convId).child(`Messages/${mesId}/Comments/${commentId}/Likes/${senderId}`);
    return ref.set(1);
  },
  removeEventCommentLike(convId, mesId,commentId){
    let senderId = this.db.myId();
    let ref = this.feedRef(convId).child(`Events/${mesId}/Messages/${commentId}/Likes/${senderId}`);
    return ref.remove();
  },
  removeCommentLike(convId, mesId,commentId){
    let senderId = this.db.myId();
    let ref = this.feedRef(convId).child(`Messages/${mesId}/Comments/${commentId}/Likes/${senderId}`);
    return ref.remove();
  },
  postEventComment(convId, mesId, text){
    let senderId = this.db.myId();
    let msgUid = new Date().getTime().toString() + senderId;
    let message = {};
    message['uid'] = msgUid;
    message['date'] = new Date().getTime() / 1000;
    message['serverDate'] = this.firebaseApp.firebase_.database.ServerValue.TIMESTAMP;
    message['convoId'] = convId;
    message['senderId'] = senderId;
    message['senderName'] = this.auth.current.get('userName');
    message['type'] = 'comment';
    message['userId'] = senderId;
    message['message'] = 'web';
    message['text'] = text;
    let ref = this.feedRef(convId).child(`Events/${mesId}/Messages/${msgUid}`);
    ref.update(message).then(() => {
      debug('Message posted');
    }).catch((error)=>{
      debug('failed to post message');
    });
  },
  postComment(convId, mesId, text){
    let senderId = this.db.myId();
    let msgUid = new Date().getTime().toString() + senderId;
    let message = {};
    message['uid'] = msgUid;
    message['date'] = new Date().getTime() / 1000;
    message['serverDate'] = this.firebaseApp.firebase_.database.ServerValue.TIMESTAMP;
    message['convoId'] = convId;
    message['senderId'] = senderId;
    message['senderName'] = this.auth.current.get('userName');
    message['type'] = 'comment';
    message['userId'] = senderId;
    message['message'] = 'web';
    message['text'] = text;
    let ref = this.feedRef(convId).child(`Messages/${mesId}/Comments/${msgUid}`);
    ref.update(message).then(() => {
      debug('Message posted');
    }).catch((error)=>{
      debug('failed to post message');
    });
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
  },
  addPlaylistItem(convId, video){
    const senderId = this.db.myId();
    const itemID = new Date().getTime().toString() + senderId;
    const item = video;
    item['playlistId'] = itemID;
    let ref = this.feedRef(convId).child(`Playlist/${itemID}`);
    return ref.set(item);
  },
  removePlaylistItem(convId, video){
    const itemID = video['playlistId'];
    let ref = this.feedRef(convId).child(`Playlist/${itemID}`);
    return ref.remove();
  },
  createEvent(convId, event){
    let senderId = this.db.myId();
    const msgUid = new Date().getTime().toString() + senderId;
    let message = event;
    let ref = this.feedRef(convId).child(`Events/${msgUid}`);
    return ref.update(message);
  },
  joinEvent(convId, eventId){
    let senderId = this.db.myId();
    return new Promise((resolve,reject)=>{
      this.db.profile(senderId).then((profile)=>{
        let ref = this.feedRef(convId).child(`Events/${eventId}/Members/${senderId}`);
        return ref.set({id: senderId, Username: profile.Email.split('@')[0]});  
      }).catch((error)=>{
        reject(error);
      });

    })



  }
});
