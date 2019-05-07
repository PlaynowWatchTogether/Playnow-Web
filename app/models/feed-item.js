import DS from 'ember-data';
import {computed} from '@ember/object';
const {attr} = DS;
export default DS.Model.extend({
  rawData:attr('string'),
  lastUpdate: attr('string'),
  obj: computed('rawData', function(){
    return JSON.parse(this.get('rawData'));
  })
  // GroupName: attr('string'),
  // GroupAccess: attr('number'),
  // GroupDescription: attr('string'),
  // GroupLocation: attr('string'),
  // creatorAvatar: attr('string'),
  // creatorName: attr('string'),
  // creatorId: attr('string'),
  // groupPics: attr('string'),
  // lastMessageDate: attr('string'),
  // views: attr('string'),
  // ProfilePic: attr('string'),
  // lastUpdate: attr('number'),
  // Followers: attr('string'),
  // Admins: attr('string'),
  // FollowRequests: attr('string'),
  // Playlist: attr('string'),
  // videoWatchingContent: attr('string'),
  // viewsNumber: computed('FollowersObject', function(){
  //   return Object.keys(this.get('FollowersObject')).length;
  // }),
  // FollowersObject: computed('Followers', function(){
  //   return JSON.parse(this.get('Followers'));
  // }),
  // FollowRequestsObject:computed('FollowRequests', function(){
  //   return JSON.parse(this.get('FollowRequests'));
  // }),
  // AdminsObject:computed('Admins', function(){
  //   return JSON.parse(this.get('Admins'));
  // }),
  // isFollowing(id){
  //     return Object.keys(this.get('FollowersObject')).includes(id);
  // },
  // videoWatching: computed('videoWatchingContent', function(){
  //   return JSON.parse(this.get('videoWatchingContent')) || {};
  // })
});
