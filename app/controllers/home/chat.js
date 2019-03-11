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
    let one_day = 1000 * 60 * 60 * 24;
    ds.messages((messages) => {
      let uiMessages = [];
      let lastDate = new Date(0);
      messages.forEach(function (mes, index) {
        let displaySender = index < messages.length - 1 ? messages[index + 1].senderId !== mes.senderId : true;
        let mesDate = new Date(mes.date * 1000);
        let diff = lastDate.getTime() - mesDate.getTime();
        if (Math.abs(diff) > one_day) {
          uiMessages.push({isDate: true, date: mesDate});
        }
        uiMessages.push({isMessage: true, message: mes, displaySender: displaySender});
        lastDate = mesDate
      });
      obj.set('messages', uiMessages)
      Ember.$('.messagesHolder').animate({scrollTop: Ember.$('.messagesHolder')[0].scrollHeight})
    });
  },
  reset() {
    let ds = this.get('dataSource');
    if (ds) {
      ds.stop()
    }
  },
  actions: {
    sendMessage() {

    }
  }
});
