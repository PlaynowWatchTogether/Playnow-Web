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
  rooms(resolve, reject) {
    this.firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
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
      } else {
        resolve([])
      }
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
