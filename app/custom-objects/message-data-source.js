import EmberObject from '@ember/object';
import {inject as service} from '@ember/service';

export default EmberObject.extend({
  gcmManager: service(),
  type: 'one2one',
  user: null,
  myId: '',
  db: null,
  messagesRef: null,
  membersRef: null,
  lastSeenRef: null,
  typingRef: null,
  videoStateRef: null,
  videoWatchersRef: null,
  typingInterval: null,
  init() {
    this.listeners = {};
  },
  convId() {
    if (this.type === 'one2one') {
      return [this.myId, this.user.id].sort((a, b) => {
        return b.localeCompare(a)
      }).join("");
    } else if (this.type === 'room') {
      return this.room.id;
    } else if (this.type === 'group') {
      return this.group['id'];
    } else {
      return "";
    }
  },
  messageRoot() {
    if (this.type === 'one2one') {
      return 'channels/messages';
    } else if (this.type === 'room') {
      return 'channels/channels';
    } else if (this.type === 'group') {
      return 'channels/Groups';
    }
  },

  updateWatchState(state, seconds, syncAt = null) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoState";
    let values = {};
    values['updatedAt'] = new Date().getTime() / 1000.0;
    values['syncAt'] = syncAt == null ? new Date().getTime() / 1000.0 : syncAt / 1000;
    values['type'] = state;
    values['seconds'] = seconds;
    console.log('updateWatchState ' + JSON.stringify(values));
    this.db.ref(ref).update(values);
  },
  sendVideo(video, mode = 'youtubeVideo') {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoState";
    let values = {};
    values['type'] = 'new';
    values['syncAt'] = new Date().getTime() / 1000.0;
    values['updatedAt'] = new Date().getTime() / 1000.0;
    values['videoId'] = video['id'];
    values['videoType'] = mode;
    values['videoName'] = video['snippet']['title'];
    values['videoThumbnail'] = video['snippet']['thumbnails']['medium']['url'];
    values['senderId'] = this.myId;
    values['seconds'] = 0;
    console.log('sendVideo ' + JSON.stringify(values));
    this.db.ref(ref).update(values);
  },
  videoWatchers(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoWatching";
    this.videoWatchersRef = this.db.ref(ref);
    let valueListener = (snippet) => {
      let records = [];
      snippet.forEach((item) => {
        records.push(item.val());
      });
      updateCallback(records);
    };
    this.listeners[ref] = valueListener;
    this.videoWatchersRef.on('value', valueListener)
  },
  updateWatching(videoId, state) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoWatching/" + this.myId;
    let values = {};
    values['videoId'] = videoId;
    values['userId'] = this.myId;
    values['updatedAt'] = new Date().getTime() / 1000.0;
    values['state'] = state;
    console.log('updateWatching ' + JSON.stringify(values));
    this.db.ref(ref).onDisconnect().remove();
    this.db.ref(ref).update(values);
  },
  sendTyping(typing) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/typingIndicator";
    let updated = {};
    updated[this.myId] = typing;
    let dbRef = this.db.ref(ref);
    dbRef.onDisconnect().remove();
    dbRef.update(updated);
  },
  typing(mes) {
    if (this.typingInterval) {
      clearTimeout(this.typingInterval);
    }
    this.sendTyping(mes.length !== 0);
    this.typingInterval = setTimeout(() => {
      this.sendTyping(false)
    }, 5000)
  },
  lastMessageSeen(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/lastMessageSeen";
    this.lastSeenRef = ref;
    let valueListener = (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        let id = item.key;
        records.push({messageId: mes, userId: id});
      });
      updateCallback(records);
    };
    this.listeners[ref] = valueListener;
    this.db.ref(ref).on('value', valueListener)
  },
  typingIndicator(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/typingIndicator";
    this.typingRef = ref;
    let valueListener = (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        let id = item.key;
        records.push({messageId: mes, userId: id});
      });
      updateCallback(records);
    };
    this.listeners[ref] = valueListener;
    this.db.ref(ref).on('value', valueListener)
  },
  sendSeen(mesId) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/lastMessageSeen";
    let updated = {};
    updated[this.myId] = mesId;

    this.db.ref(ref).update(updated)

  },
  videoState(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/videoState";
    this.videoStateRef = ref;
    let valueListener = (snapshot) => {
      updateCallback(snapshot.val());
    };
    this.listeners[ref] = valueListener;
    this.db.ref(ref).on('value', valueListener);

  },
  messagesOnce(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/Messages";
    this.db.ref(ref).once('value', (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        mes.id = item.key;
        records.push(mes);
      });
      updateCallback(records);
    })
  },
  messages(updateCallback) {
    let convId = this.convId();
    let path = this.messageRoot();
    let ref = path + "/" + convId + "/Messages";
    this.messagesRef = ref;
    let valueListener = (snapshot) => {
      let records = [];
      snapshot.forEach((item) => {
        let mes = item.val();
        mes.id = item.key;
        records.push(mes);
      });
      updateCallback(records);
    };
    this.listeners[ref] = valueListener;
    this.db.ref(ref).on('value', valueListener)
  },
  profile(user) {
    return new Promise((resolve, reject) => {
      let ref = this.db.ref("Users/" + user);
      ref.once('value').then((snapshot) => {
        let payload = snapshot.val();
        payload['id'] = snapshot.key;
        resolve(payload);
      }).catch((error) => {
        reject(error);
      })
    });
  },
  membersOnce() {
    if (this.type === 'one2one') {
      return new Promise((resolve, reject) => {
        this.profile(this.get('user.id')).then((profile) => {
          resolve([profile]);
        }).catch((error) => {
          reject(error);
        })
      });
    } else {
      return new Promise((resolve, reject) => {
        let convId = this.convId();
        let path = this.messageRoot();
        let ref = path + "/" + convId + "/Members";
        this.membersRef = ref;
        this.db.ref(ref).once('value', (snapshot) => {
          let records = [];
          snapshot.forEach((item) => {
            let mes = item.val();
            mes.id = item.key;
            records.push(mes);
          });
          resolve(records);
        }, (error) => {
          reject(error);
        })
      });
    }
  },
  members(updateCallback) {
    if (this.type === 'one2one') {
      this.profile(this.get('user.id')).then((profile) => {
        updateCallback([profile]);
      });
    } else {
      let convId = this.convId();
      let path = this.messageRoot();
      let ref = path + "/" + convId + "/Members";
      this.membersRef = ref;
      let valueListener = (snapshot) => {
        let records = [];
        snapshot.forEach((item) => {
          let mes = item.val();
          mes.id = item.key;
          records.push(mes);
        });
        updateCallback(records);
      };
      this.listeners[ref] = valueListener;
      this.db.ref(ref).on('value', valueListener)
    }
  },
  stop() {
    for (let listener in this.listeners) {
      let value = this.listeners[listener];
      this.db.ref(listener).off('value', value);
      console.log('remove listener for ' + value);

    }
  },
  sendMessage(text, thumbnail) {
    let senderId = this.myId;
    let path = this.messageRoot();
    let convId = this.convId();
    let msgUid = new Date().getTime().toString() + senderId;
    let message = {};
    message['uid'] = msgUid;
    message['date'] = new Date().getTime() / 1000.0;
    message['convoId'] = convId;
    message['senderId'] = senderId;
    message['senderName'] = 'Test sender';
    if (thumbnail) {
      message['type'] = 'photo';
      message['thumbnail'] = thumbnail;
    } else {
      message['type'] = 'text';
    }
    message['userId'] = senderId;
    message['message'] = 'web';
    message['text'] = text;
    let ref = path + "/" + convId + "/Messages/" + msgUid;
    this.db.ref(ref).update(message).then(() => {
      if (this.gcmManager) {
        this.profile(this.myId).then((myProfile) => {
          this.membersOnce().then((members) => {
            members.forEach((member) => {
              this.gcmManager.sendMessage(member.id, message, myProfile['FirstName'] + " sent a message", {});
            });
          });
        });
      }
    })
  }

});
