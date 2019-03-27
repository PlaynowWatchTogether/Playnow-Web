import {inject as service} from '@ember/service';
import FirestoreAdapter from 'emberfire/adapters/firebase';

export default FirestoreAdapter.extend({
  firebaseApp: service(),
  auth: service(),
  db: service(),
  // findRecord(store, typeClass, id) {
  //   if (typeClass.modelName === 'user'){
  //       return new Promise((resolve,reject)=>{
  //         this.db.profile(id).then((data)=>{
  //           resolve(this.mapUser(data));
  //         }, (error)=>{
  //           reject(error);
  //         })
  //       })
  //   }
  //   return undefined;
  // },
  // mapUser(payload){
  //   payload['LastActiveDate'] = payload['Last Active Date'];
  //   return payload
  // }
  recordWasPushed(store, modelName, record) {
    return true;
  },
  _getCollectionRef(typeClass, id) {
    if (typeClass.modelName === 'friends') {
      let user = this.firebaseApp.auth().currentUser;
      return this._ref.child('Users/' + user.uid + "/Friends/" + id)
    }
    if (typeClass.modelName === 'one2one-message') {
      if (id) {
        return this._ref.child('channels/messages/' + id)
      }
    }
    if (typeClass.modelName === 'user') {
      if (id) {
        return this._ref.child('Users/' + id)
      } else {
        return this._ref.child('Users/')

      }
    }
    if (typeClass.modelName === 'group') {
      if (id) {
        let user = this.firebaseApp.auth().currentUser.uid;

        return this._ref.child('Users/' + user + '/Groups/' + id)
      } else {
        return this._ref.child('channels/Groups/')
      }
    }
    if (typeClass.modelName === 'room') {
      if (id) {
        return this._ref.child('channels/channels/' + id)
      } else {
        return this._ref.child('channels/channels/')
      }
    }
    return this._super(arguments)
  }
});
