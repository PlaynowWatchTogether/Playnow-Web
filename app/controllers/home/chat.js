import Controller from '@ember/controller';
import MessageDataSource from '../../custom-objects/message-data-source'
import {inject as service} from '@ember/service';

export default Controller.extend({
  firebaseApp: service(),
  init() {
    this._super(...arguments);
    this.chatModel = {};
    this.addObserver('model', this, 'modelObserver');
    this.addObserver('dataSource', this, 'dataSourceObserver');
    this.messageText = '';
  },
  modelObserver: (obj) => {
    let type = obj.get('model').type;
    let convId = obj.get('model').chat_id;
    if ('one2one' === type) {

      obj.store.find('user', convId).then((friend) => {
        obj.set('dataSource', MessageDataSource.create({
          type: 'one2one',
          user: friend,
          myId: obj.firebaseApp.auth().currentUser.uid,
          db: obj.firebaseApp.database()
        }));
        obj.set('chatModel', {
          hasProfilePic: true,
          title: friend.get('FirstName'),
          user: friend
        });
      });
    }
  },
  dataSourceObserver: (obj) => {
    let ds = obj.get('dataSource');
    ds.messages((messages) => {
      obj.set('messages', messages)
    });
  },
  actions: {
    sendMessage() {

    }
  }
});
