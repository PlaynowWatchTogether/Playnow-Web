import EmberObject from '@ember/object';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
import ChatPlaylistHandler from '../mixins/chat-playlist-handler';

export default EmberObject.extend(ChatPlaylistHandler, {
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
  reset(id){
    const myID = this.db.myId();
    const ref = this.feedRef(this.feedId).child(`videoWatching/${myID}`);
    ref.remove();    
  },
  open(convId){
    const myID = this.db.myId();
    const ref = this.feedRef(convId).child(`videoWatching/${myID}`);
    ref.onDisconnect().remove();
    return ref.update({
        userId:myID,
        state: 'closed',
        updatedAt: new Date().getTime()
      });
  },
  updateGroupPic(convId, pic){
    const myID = this.db.myId();
    const updates = {
      ProfilePic: pic
    }
    return this.feedRef(convId).update(updates);
  },
  updateGroup(convId, name, description){
    const myID = this.db.myId();
    const updates = {
      GroupName: name,
      GroupDescription: description
    }
    return this.feedRef(convId).update(updates);
  },
  createGroup(details, groupLocation){
    return new Promise((resolve, reject)=>{
      const payload = details;
      const myID = this.db.myId();
      this.db.profile(myID).then((profile)=>{
        payload["creatorName"] = `${profile['FirstName']} ${profile['LastName']}`;
        payload["creatorId"] = profile["id"];
        payload["creatorAvatar"] = profile["ProfilePic"]||'';
        payload[`Admins/${myID}/id`] = myID;
        const id = this.generateFeedId();
        this.feedRef(id).update(payload).then(()=>{
          const ref = this.feedRef(id);
          const geoFire = new window.geofire.GeoFire(ref);
          geoFire.set("GroupLocation", [groupLocation.lat, groupLocation.lng]);
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
    let ref = this.feedRef(convId).child(`Playlist`);
    return this.addPlaylistItemInternal(senderId,ref, video);
  },
  removePlaylistItem(convId, video){
    let ref = this.feedRef(convId).child(`Playlist`);
    return this.removePlaylistItemInternal(ref,video);
  },
  createEvent(convId, event){
    let senderId = this.db.myId();
    const msgUid = new Date().getTime().toString() + senderId;
    let message = event;
    message['creatorId'] = senderId;
    message['id'] = msgUid;
    message['serverDate'] = this.firebaseApp.firebase_.database.ServerValue.TIMESTAMP;
    let ref = this.feedRef(convId).child(`Events/${msgUid}`);
    return ref.update(message);
  },
  deleteEvent(convId, eventId){
    let ref = this.feedRef(convId).child(`Events/${eventId}`);
    return ref.remove();
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
  },
  leaveEvent(convId, eventId){
    let senderId = this.db.myId();
    let ref = this.feedRef(convId).child(`Events/${eventId}/Members/${senderId}`);
    return ref.remove();
  },
  addUserAdmin(convId,user){
    let senderId = this.db.myId();
    const id = user.id;
    let ref = this.feedRef(convId);

    let name = user['FirstName'] + ' ' + user['LastName'];
    let email = user.Email;
    let username = name;
    if (email && email.includes('@')) {
      username = email.split("@")[0]
    }
    let updates = {};
    updates[`Followers/${id}/Email`] = email;
    updates[`Followers/${id}/Name`] = username;
    updates[`Followers/${id}/Username`] = name;
    if (user['ProfilePic']) {
      updates[`Followers/${id}/ProfilePic`] =user['ProfilePic'];
    }
    updates[`Admins/${id}/id`] = id;
    return ref.update(updates);
  },
  removeUserAdmin(convId,member){
    const ref = this.feedRef(convId).child(`Admins/${member.id}`);
    return ref.remove();
  }
});
