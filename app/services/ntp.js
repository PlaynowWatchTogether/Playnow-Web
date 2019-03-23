import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {debug} from "@ember/debug";

export default Service.extend({
  firebaseApp: service(),
  init() {

    this._super(...arguments);
    this.offset = 0;
    var offsetRef = this.firebaseApp.database().ref(".info/serverTimeOffset");
    offsetRef.on("value", (snap) => {
      this.offset = snap.val();
      // this.estimatedServerTimeMs = new Date().getTime() + this.offset;
      debug('server time updated ' + this.offset);
    });
  },
  estimatedServerTimeMs() {
    return new Date().getTime() + this.offset;
  }
});
