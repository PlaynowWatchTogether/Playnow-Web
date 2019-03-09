import DS from 'ember-data';
import {inject as service} from '@ember/service';

export default DS.Adapter.extend({
  firebaseApp: service(),
  _getCollectionRef(typeClass, id) {
    if (typeClass.modelName === 'friends') {
      let user = this.firebaseApp.auth().currentUser;
      return this._ref.child('Users/' + user.uid + "/Friends")
    }
    return this._super(arguments)
  },
});
