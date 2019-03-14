import DS from 'ember-data';
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
  _getCollectionRef(typeClass, id) {
    if (typeClass.modelName === 'friends') {
      let user = this.firebaseApp.auth().currentUser;
      return this._ref.child('Users/' + user.uid + "/Friends")
    }
    if (typeClass.modelName === 'user') {
      if (id) {
        return this._ref.child('Users/' + id)
      } else {
        return this._ref.child('Users/')

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
