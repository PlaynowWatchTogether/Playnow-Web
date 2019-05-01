import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
export default Service.extend({
  firebaseApp: service(),
  store: service(),
  gcmManager: service(),
  init() {
    this._super(...arguments);
    this.messaging = this.get('firebaseApp').messaging();
    this.listeners = {};
  },
  friends(resolve, reject) {
    this.firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        let ref = this.firebaseApp.database().ref('Users/' + user.uid + "/Friends");
        ref.on('value', (data) => {
          let records = [];
          data.forEach((item) => {
            let payload = item.val();
            payload.id = item.key;
            records.push(payload)
          });
          resolve(records)
        }, (error) => {
          reject(error);
        });
      } else {
        resolve([]);
      }
    });
  },
  realGroup(id){
    let myId = this.firebaseApp.auth().currentUser.uid;
    return new Promise((resolve)=>{
      let ref = this.firebaseApp.database().ref(`/channels/Groups/${id}`);
      ref.once('value', (data)=>{
        const payload = data.val();
        payload["id"] = data.key;
        resolve(payload);
      });
    });
    
  },
  listenGroup(id, updateCallback){
    let myId = this.firebaseApp.auth().currentUser.uid;
    
    let ref = this.firebaseApp.database().ref(`/Users/${myId}/Groups/${id}`);
    const listener = (data)=>{
      const payload = data.val();
      payload["id"] = data.key;
      updateCallback(payload);
    };
    ref.on('value', listener);    
    return [ref,listener];
  },
  offListenGroup(ret){  
    ret[0].off('value', ret[1]);    
  },
  group(id){
    let myId = this.firebaseApp.auth().currentUser.uid;
    return new Promise((resolve)=>{
      let ref = this.firebaseApp.database().ref(`/Users/${myId}/Groups/${id}`);
      ref.once('value', (data)=>{
        const payload = data.val();
        payload["id"] = data.key;
        resolve(payload);
      });
    });
    
  },
  groups(resolve, reject) {
    this.firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        let ref = this.firebaseApp.database().ref('Users/' + user.uid + "/Groups");
        ref.on('value', (data) => {
          let records = [];
          data.forEach((item) => {
            let payload = item.val();
            payload.id = item.key;
            records.push(payload)
          });
          resolve(records)
        }, (error) => {
          reject(error);
        });
      } else {
        resolve([]);
      }
    });
  },
  updateProfile(firstName, lastName, bd, email) {
    let uid = this.firebaseApp.auth().currentUser.uid;
    let ref = this.firebaseApp.database().ref("Users/" + uid);
    let updates = {};
    updates['BirthDate'] = bd;
    updates['FirstName'] = firstName;
    updates['LastName'] = lastName;
    ref.update(updates);
    this.firebaseApp.auth().currentUser.updateEmail(email).then(function () {
      let uid = this.firebaseApp.auth().currentUser.uid;
      let ref = this.firebaseApp.database().ref("Users/" + uid);
      let updates = {};
      updates['ActualEmail'] = email;
      ref.update(updates);
    }).catch(function (error) {


    });


  },
  updateProfilePic(pic) {
    let uid = this.firebaseApp.auth().currentUser.uid;
    let ref = this.firebaseApp.database().ref("Users/" + uid);
    let updates = {};
    updates['ProfilePic'] = pic;
    ref.update(updates)
  },
  profileObserver(user, updateCallback) {

    let ref = this.firebaseApp.database().ref("Users/" + user);
    let clb = (snapshot) => {
      let payload = snapshot.val();
      payload['id'] = snapshot.key;
      updateCallback(payload);
    };
    ref.on('value', clb)
  },
  offProfileObserver(user, clb) {
    let ref = this.firebaseApp.database().ref("Users/" + user);
    ref.off('value', clb)
  },
  profile(user) {
    return new Promise((resolve, reject) => {
      let ref = this.firebaseApp.database().ref("Users/" + user);
      ref.once('value').then((snapshot) => {
        let payload = snapshot.val();
        if (payload) {
          payload['id'] = snapshot.key;
          resolve(payload);
        } else {
          resolve({id: user});
        }
      }).catch((error) => {
        reject(error);
      })
    });
  },
  followers(uid, resolve) {
    let ref = this.firebaseApp.database().ref('Users/' + uid + "/Followers");
    ref.on('value', (data) => {
      let records = [];
      data.forEach((item) => {
        let payload = item.val();
        payload['id'] = item.key;
        records.push(payload)

      });
      resolve(records)
    }, () => {

    });
  },
  confirmRequest(model) {
    let myId = this.firebaseApp.auth().currentUser.uid;
    let myFollower = this.firebaseApp.database().ref("Users/" + myId + "/Followers/" + model['id']);
    let otherFollower = this.firebaseApp.database().ref("Users/" + model['id'] + "/FollowedUsers/" + myId);
    let myFriend = this.firebaseApp.database().ref("Users/" + myId + "/Friends/" + model['id']);
    let otherFriend = this.firebaseApp.database().ref("Users/" + model['id'] + "/Friends/" + myId);
    let myValues = {};
    let otherValues = {};
    myValues['Username'] = model['Username'];
    otherValues['Username'] = this.firebaseApp.auth().currentUser.email;
    this.profile(myId).then((profile) => {
      Promise.all([
        myFollower.remove(),
        otherFollower.remove(),
        myFriend.update(myValues),
        otherFriend.update(otherValues)
      ]).then((data) => {
        this.get('gcmManager').sendMessage(model['id'], null, profile['FirstName'] + ' added you back!');
        debug('Request confirmed ' + data);
      }).catch((error) => {
        debug('Request confirm failed ' + error);

      });

    })

  },
  cancelRequest(model) {
    let myId = this.firebaseApp.auth().currentUser.uid;
    let myFollower = this.firebaseApp.database().ref("Users/" + myId + "/Followers/" + model['id']);
    myFollower.remove().then(() => {
      debug('Request cancelled ');
    }).catch((error) => {
      debug('Request cancel failed ' + error);
    });
  },
  roomsOnce() {
    return new Promise((resolve, reject) => {
      let ref = this.firebaseApp.database().ref("channels/channels");
      ref.once('value', (data) => {
        let records = [];
        data.forEach((item) => {
          let payload = item.val();
          payload.id = item.key;
          records.push(payload);
        });
        resolve(records);
      }, (error) => {
        reject(error);
      })
    });
  },
  roomsOff() {
    let ref = this.firebaseApp.database().ref("channels/channels");
    ref.off('value', this.listeners["channels/channels"]);
  },
  rooms(updateCallback) {

    let ref = this.firebaseApp.database().ref("channels/channels");

    let clb = (data) => {
      let records = [];
      data.forEach((item) => {
        let payload = item.val();
        payload.id = item.key;
        records.push(payload);

      });
      updateCallback(records);
    };
    this.listeners["channels/channels"] = clb;
    ref.on('value', clb);

  },
  tokens(user) {
    return new Promise((resolve, reject) => {
      let ref = this.firebaseApp.database().ref("Tokens/" + user);
      ref.once('value', (snapshot) => {
        let tokens = [];
        snapshot.forEach((data) => {
          let payload = data.val();
          if (typeof payload === 'object') {
            payload.id = data.key;
            tokens.push(payload);
          }
        });
        resolve(tokens);
      }, (error) => {
        reject(error);
      })
    });
  },
  updateBadge(user, token, value) {
    let ref = this.firebaseApp.database().ref("Tokens/" + user + "/" + token);
    ref.child('badge_count').set(value + '').then(() => {
      debug('badge for ' + user + 'updated to ' + value);
    })
  },
  followUser(user) {

    this.profile(this.firebaseApp.auth().currentUser.uid).then((profile) => {
      let name = profile['FirstName'] + ' ' + profile['LastName'];
      let email = this.firebaseApp.auth().currentUser.email;
      let username = name;
      if (email && email.includes('@')) {
        username = email.split("@")[0]
      }
      let id = '';
      if (typeof user === 'object') {
        id = user['id'];
      } else {
        id = user
      }
      let ref = this.firebaseApp.database().ref("Users/" + id + '/Followers/' + this.firebaseApp.auth().currentUser.uid);
      let updates = {};
      updates['Email'] = email;
      updates['Name'] = username;
      updates['Username'] = name;
      if (profile['ProfilePic']) {
        updates['ProfilePic'] = profile['ProfilePic'];
      }
      ref.update(updates).then(() => {
        this.profile(this.myId()).then((myProfile) => {
          this.get('gcmManager').sendMessage(id, null, myProfile['FirstName'] + ' added you as friend!');
        });
      });

    })
  },
  myId() {
    return this.firebaseApp.auth().currentUser.uid
  },
  updateGroupPic(id, groupPic){
    return new Promise((resolve,reject)=>{
      const ref = this.firebaseApp.database().ref();
      const update = {};
      this.realGroup(id).then((group)=>{
        Object.keys(group.Members).forEach((memberKey) => {                    
          update["/Users/" + memberKey + "/Groups/" + id + "/ProfilePic"] = groupPic;
        });
        ref.update(update).then(()=>{
          resolve();
        }).catch((error)=>{
          reject(error);
        });
      });

    });
  },
  updateGroupName(id,groupName){
    return new Promise((resolve,reject)=>{
      const ref = this.firebaseApp.database().ref();
      const update = {};
      this.realGroup(id).then((group)=>{
        Object.keys(group.Members).forEach((memberKey) => {                    
          update["/Users/" + memberKey + "/Groups/" + id + "/GroupName"] = groupName;
        });
        ref.update(update).then(()=>{
          resolve();
        }).catch((error)=>{
          reject(error);
        });
      });

    });
    

  },
  addGroupMembers(group,groupName, members){
    
    const ref = this.firebaseApp.database().ref();
    const update = {};
    members.forEach((member)=>{
      update[`/channels/Groups/${group}/Members/${member["id"]}/Name`] = member['firstName'] + ' ' + member['lastName'];  
      update[`/Users/${member["id"]}/Groups/${group}/GroupName`] = groupName
    });    
    return ref.update(update);
    
  },
  createGroup(name, members) {
    return this.profile(this.myId()).then((profile) => {
      let refName = name + "@" + this.myId();
      let update = {};
      members.forEach((member) => {
        update["/channels/Groups/" + refName + "/Members/" + member["id"] + "/Name"] = member['firstName'] + ' ' + member['lastName'];
        update["/Users/" + member['id'] + "/Groups/" + refName + "/GroupName"] = name;
      });
      update["/channels/Groups/" + refName + "/Members/" + this.myId() + "/Name"] = profile['firstName'] + ' ' + profile['lastName'];
      update["/Users/" + this.myId() + "/Groups/" + refName + "/GroupName"] = name;
      let ref = this.firebaseApp.database().ref();
      return ref.update(update);

    });


  },
  handleOnline() {
    let uid = this.firebaseApp.auth().currentUser.uid;
    let ref = this.firebaseApp.database().ref("Users/" + uid + "/Last Active Date");
    ref.set("online");
    ref.onDisconnect().set(new Date().getTime() / 1000.0);
  },
  messagePermissionsGranted() {
    this.get('messaging').getToken().then((currentToken) => {
      if (currentToken) {
        debug('Token received ' + currentToken);
        let id = this.myId();
        let ref = this.get('firebaseApp').database().ref("/Tokens/" + id);
        ref.once('value', (tokens) => {
          let tokensValues = [];
          tokens.forEach((elem) => {
            tokensValues.push(elem.child("token_id").val());
          });
          let exists = tokensValues.includes(currentToken);
          if (!exists) {
            let newTokenRef = ref.push();
            newTokenRef.child("token_id").set(currentToken);

          }
        })
      } else {
        // Show permission request.
        debug('No Instance ID token available. Request permission to generate one.');

      }
    }).catch(function (err) {
      debug(err);
    });
  },
  createPublicRoom(video) {
    return new Promise((resolve, reject) => {
      let ref = this.firebaseApp.database().ref("channels/channels/" + this.myId());
      this.profile(this.myId()).then((profile) => {
        let updates = {};
        let username = profile['Email'].split('@').firstObject;
        updates['creatorName'] = username || '';
        updates['creatorAvatar'] = profile.ProfilePic || '';
        ref.update(updates).then(() => {
          resolve(video);
        }).catch((error) => {
          reject(error);
        })

      })
    })
  }
});
