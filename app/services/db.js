import Service from '@ember/service';
import {inject as service} from '@ember/service';

export default Service.extend({
  firebaseApp: service(),
  store: service(),
  friends(resolve, reject) {
    this.firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        let ref = this.firebaseApp.database().ref('Users/' + user.uid + "/Friends");
        ref.on('value', (data) => {
          let records = [];
          data.forEach((item) => {
            let payload = item.val();
            var normalizedData = this.store.normalize('friends', payload);
            normalizedData.data.id = item.key;
            records.push(this.store.push(normalizedData))

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
  updateProfile(firstName, lastName, bd) {
    let uid = this.firebaseApp.auth().currentUser.uid
    let ref = this.firebaseApp.database().ref("Users/" + uid);
    let updates = {};
    updates['BirthDate'] = bd;
    updates['FirstName'] = firstName;
    updates['LastName'] = lastName;
    ref.update(updates)
  },
  updateProfilePic(pic) {
    let uid = this.firebaseApp.auth().currentUser.uid
    let ref = this.firebaseApp.database().ref("Users/" + uid);
    let updates = {};
    updates['ProfilePic'] = pic;
    ref.update(updates)
  },
  profile(user) {
    return new Promise((resolve, reject) => {
      let ref = this.firebaseApp.database().ref("Users/" + user);
      ref.once('value').then((snapshot) => {
        let payload = snapshot.val();
        payload['id'] = snapshot.key;
        resolve(payload);
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
    }, (error) => {

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
      // let myName = profile['FirstName'] + " " + profile['LastName'];
      Promise.all([
        myFollower.remove(),
        otherFollower.remove(),
        myFriend.update(myValues),
        otherFriend.update(otherValues)
      ]).then((data) => {
        console.log('Request confirmed ' + data);
      }).catch((error) => {
        console.log('Request confirm failed ' + error);

      });

    })

  },
  cancelRequest(model) {
    let myId = this.firebaseApp.auth().currentUser.uid;
    let myFollower = this.firebaseApp.database().ref("Users/" + myId + "/Followers/" + model['id']);
    myFollower.remove().then(() => {
      console.log('Request cancelled ');
    }).catch((error) => {
      console.log('Request cancel failed ' + error);
    });
  },
  rooms() {
    return new Promise((resolve, reject) => {
      let ref = this.firebaseApp.database().ref("channels/channels");
      ref.on('value', (data) => {
        let records = [];
        data.forEach((item) => {
          let payload = item.val();
          var normalizedData = this.store.normalize('room', payload);
          normalizedData.data.id = item.key;
          records.push(this.store.push(normalizedData))
        });
        resolve(records);
      }, (error) => {
        reject(error);
      })
    });
  },
  followUser(user) {

    this.profile(this.firebaseApp.auth().currentUser.uid).then((profile) => {
      let name = profile['FirstName'] + ' ' + profile['LastName'];
      let email = this.firebaseApp.auth().currentUser.email;
      let username = name;
      if (email && email.includes('@')) {
        username = email.split("@")[0]
      }
      let ref = this.firebaseApp.database().ref("Users/" + user['id'] + '/Followers/' + this.firebaseApp.auth().currentUser.uid);
      let updates = {};
      updates['Email'] = email;
      updates['Name'] = name;
      updates['Username'] = name;
      if (profile['ProfilePic']) {
        updates['ProfilePic'] = profile['ProfilePic'];
      }
      ref.update(updates);

    })
  }
});
