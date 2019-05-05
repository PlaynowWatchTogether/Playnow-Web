import Mixin from '@ember/object/mixin';
import {computed} from '@ember/object';
import moment from 'moment';
export default Mixin.create({
  videoThumbnail: computed('model', function () {
    let m = this.get('model');
    return m['snippet']['thumbnails']['medium']['url']
  }),
  videoTitle: computed('model', function () {
    let m = this.get('model');
    return m['snippet']['title'];
  }),
  channelTitle: computed('model', function () {
    let m = this.get('model');
    return m['snippet']['channelTitle'];
  }),
  channelDesc: computed('model', function () {
    let m = this.get('model');
    return moment(m['snippet']['publishedAt']).fromNow()
  }),
  viewsCount: computed('model', function () {
    let m = this.get('model');
    let stats = m['statistics'];
    if (stats) {
      return `${this.nFormat(m['statistics']['viewCount'])} views.`
    } else {
      return ''
    }
  }),
  nFormat(num, digits) {
    var si = [
      {value: 1, symbol: ""},
      {value: 1E3, symbol: "K"},
      {value: 1E6, symbol: "M"},
      {value: 1E9, symbol: "B"},
      {value: 1E12, symbol: "T"},
      {value: 1E15, symbol: "P"},
      {value: 1E18, symbol: "E"}
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
  }
});
