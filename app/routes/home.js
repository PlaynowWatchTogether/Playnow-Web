import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import MessageDataSource from "../custom-objects/message-data-source";
import {hash} from 'rsvp';
import $ from 'jquery';

export default Route.extend({
  db: service(),
  firebaseApp: service(),
  auth: service(),
  gcmManager: service(),
  init() {
    this._super(...arguments);
    this.groupListeners = [];
  },
  beforeModel() {
    this._super(...arguments);
    return new Promise((resolve) => {
      this.firebaseApp.auth().onAuthStateChanged((user) => {
        this.set('user', user);
        if (user) {
          resolve()
        } else {
          this.transitionTo('welcome')
        }
      })

    });
  },
  model() {
    return hash({
      profile: this.store.find('user', this.get('user').uid)
    });
  },
  handleGroupMessages(groups) {
    this.groupListeners.forEach((mds) => {
      mds.stop();
    });
    this.groupListeners.clear();
    groups.forEach((friend) => {
      let mds = MessageDataSource.create({
        type: 'group',
        gcmManager: this.gcmManager,
        group: friend,
        myId: this.firebaseApp.auth().currentUser.uid,
        db: this.firebaseApp.database(),
        auth: this.auth
      });
      mds.membersOnce().then((members) => {
        let pics = members.slice(0, 3).map((elem) => {
          return elem['ProfilePic'];
        });
        let normalizedData = this.store.normalize('group', {id: friend.id, groupPics: pics.concat(',')});
        this.store.push(normalizedData);
      });

      mds.messages((groupMessages) => {
        let sorted = groupMessages.sort(function (a, b) {
          return b['date'] - a['date'];
        });

        let notEmpty = sorted.filter((elem) => {
          return elem['text'] && elem['text'].length > 0
        });

        let last = notEmpty.firstObject;
        if (last) {

          let normalizedData = this.store.normalize('group', {id: friend.id, lastMessage: last.text});
          this.store.push(normalizedData);
        }
      });
      this.groupListeners.push(mds);
    })

  },
  activate() {
    this._super(...arguments);
    let ctrl = this.controllerFor('home');
    ctrl.set('friends', this.store.peekAll('friends'));
    ctrl.set('groups', this.store.peekAll('group'));
    ctrl.set('loading', true);
    this.get('db').friends((friends) => {

      friends.forEach((friend) => {
        let normalizedData = this.store.normalize('friends', friend);
        this.store.push(normalizedData);

        let mds = MessageDataSource.create({
          gcmManager: this.gcmManager,
          type: 'one2one',
          user: friend,
          myId: this.firebaseApp.auth().currentUser.uid,
          db: this.firebaseApp.database(),
          auth: this.auth
        });
        mds.messagesOnce((messages) => {

          let sorted = messages.sort(function (a, b) {
            return b['date'] - a['date'];
          });
          let notEmpty = sorted.filter((elem) => {
            return elem['text'] && elem['text'].length > 0
          });

          let last = notEmpty.firstObject;
          if (last) {

            let normalizedData = this.store.normalize('friends', {id: friend.id, lastMessage: last.text});
            this.store.push(normalizedData);
          }
        })


      });
      ctrl.set('loading', false);

    }, () => {

    });
    this.get('db').groups((friends) => {

      friends.forEach((friend) => {
        friend['videoType'] = friend['videoType'] || '';
        let normalizedData = this.store.normalize('group', friend);
        this.store.push(normalizedData);
      });
      this.handleGroupMessages(friends);
      ctrl.set('loading', false);
    }, () => {

    });
    $('body').addClass('home');
  },
  deactivate() {
    this._super(...arguments);
    $('body').removeClass('home');
  }
});
