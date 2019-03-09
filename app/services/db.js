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
  }
});
