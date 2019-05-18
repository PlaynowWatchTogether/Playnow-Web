import DS from 'ember-data';
import {computed} from '@ember/object';
const {attr} = DS;
import ProxyMixin from '../mixins/proxy-mixin';
export default DS.Model.extend(ProxyMixin,{
  rawData: attr('string'),
  type: attr('string'),
  pic: attr('string'),
  latestMessageDate: attr('number'),
  lastMessage: attr('string'),
  content: computed('rawData',function(){
    return JSON.parse(this.get('rawData'));
  }),
  filterTitle: computed('content', function(){
    if (this.get('type') === 'friend') {
      return this.get('content.firstName') + ' ' + this.get('content.lastName');
    } else {
      return this.get('content.GroupName');
    }
  }),
  profilePic: computed('content', function(){
    return this.get('content.ProfilePic') || this.get('content.profilePic');
  }),
  groupPics: computed('pic', function(){
    return (this.get('pic')||'');
  }),
  displayName: computed('content', function () {
    if (this.get('type') === 'friend') {
      let username = this.get('content.Username');
      let firstName = this.get('content.firstName');
      let lastName = this.get('content.lastName');

      if (!username) {
        return [firstName, lastName].join(" ");
      }

      if (username.includes('@')) {
        return username.split('@')[0];
      }

      return username;
    }else{
      return this.get('content.GroupName');
    }
  }),
  isFriend: computed('content', function () {
    return this.type === 'friend'
  })
});
