import Mixin from '@ember/object/mixin';
import {inject as service} from '@ember/service';
import MessageDataSource from "../custom-objects/message-data-source";
import {hash} from 'rsvp';
import J from 'jquery';
import {Promise} from 'rsvp';

export default Mixin.create({
  db: service(),
  init(){
    this._super(...arguments);
    this.syncValue = {
      friends: false,
      groups: false
    }
  },
  sendSyncFinished(syncFinished){
    if (this.syncValue.friends && this.syncValue.groups){
      syncFinished();
      this.get('db').set('usersUpdated',new Date());
    }
  },
  syncFriends(syncFinished){
    new Promise((resolve)=>{
      const myId = this.get('db').myId();
      this.get('db').friends((friends) => {

        friends.forEach((friend) => {
          const friendPayload = {
            id: friend.id,
            latestMessageDate: friend.latestMessageDate||0,
            type: 'friend',
            pic: friend.ProfilePic,
            rawData: JSON.stringify(friend)
          }
          let normalizedData = this.store.normalize('home-friend', friendPayload);
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
              let name = last.senderName;
              if (last.senderId === myId){
                name = 'You';
              }
              let normalizedData = this.store.normalize('home-friend', {id: friend.id, lastMessage: `${name}: ${last.text}`});
              this.store.push(normalizedData);
            }
          })


        });
        resolve();
      }, () => {

      });
    }).then(()=>{
      this.syncValue.friends=true;
      this.sendSyncFinished(syncFinished);
    })

    new Promise((resolve)=>{
      this.get('db').groups((friends) => {

        friends.forEach((friend) => {
          const friendPayload = {
            id: friend.id,
            latestMessageDate: friend.latestMessageDate||0,
            type: 'group',
            rawData: JSON.stringify(friend)
          }
          let normalizedData = this.store.normalize('home-friend', friendPayload);
          this.store.push(normalizedData);
          this.handleGroupMessages(friend);
        });
        resolve();
      }, () => {

      });
    }).then(()=>{
      this.syncValue.groups=true;
      this.sendSyncFinished(syncFinished);
    })
  },
  handleGroupMessages(group) {
    new Promise((resolve)=>{
      const myId = this.get('db').myId();
      let mds = MessageDataSource.create({
        type: 'group',
        gcmManager: this.gcmManager,
        group: group,
        myId: this.firebaseApp.auth().currentUser.uid,
        db: this.firebaseApp.database(),
        auth: this.auth
      });
      mds.membersOnce().then((members) => {
        let pics = members.slice(0, 3).map((elem) => {
          return elem['ProfilePic'];
        });
        let normalizedData = this.store.normalize('home-friend', {id: group.id, pic: pics.concat(',')});
        this.store.push(normalizedData);
      });

      mds.messagesOnce((groupMessages) => {
        let sorted = groupMessages.sort(function (a, b) {
          return b['date'] - a['date'];
        });

        let notEmpty = sorted.filter((elem) => {
          return elem['text'] && elem['text'].length > 0
        });

        let last = notEmpty.firstObject;
        if (last) {
          let name = last.senderName;
          if (last.senderId === myId){
            name = 'You';
          }
          let normalizedData = this.store.normalize('home-friend', {id: group.id, lastMessage: `${name} ${last.text}`});
          this.store.push(normalizedData);
        }
      });
    })

  },

});
