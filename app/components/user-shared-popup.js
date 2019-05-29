import Component from '@ember/component';
import {debug} from '@ember/debug';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import MessageDataSource from '../custom-objects/message-data-source';
import UserFeedPager from '../custom-objects/user-feed-pager';
import UUIDGenerator from '../mixins/uuid-generator';
import {get,set} from '@ember/object';
export default Component.extend(UUIDGenerator,{
  db: service(),
  firebaseApp: service(),
  auth: service(),
  store: service(),
  crunchyrollAuth: service(),
  khanAuth: service(),
  youtubeSearch: service(),
  videoProviders: computed('providers',function(){
    return {
      khan: this.khanAuth.get('isLoggedIn'),
      youtube: this.youtubeSearch.get('isLoggedIn'),
      crunchyroll: this.crunchyrollAuth.get('isLoggedIn')
    }
  }),
  didInsertElement(){
    this._super(...arguments);
    $('#userSharedPopup').on('show.bs.modal', ()=>{
      const data = this.get('db').get('shared-profile');
      this.set('model', data);
      const ds =  MessageDataSource.create({
        type: 'one2one',
        user: data,
        myId: this.firebaseApp.auth().currentUser.uid,
        db: this.firebaseApp.database(),
        fb: this.firebaseApp,
        auth: this.auth
      });
      this.set('convId',ds.convId());
      ds.chatAttachments(this.get('store'), (update)=>{
  			if ( !(this.get('isDestroyed') || this.get('isDestroying')) ) {

  				this.set('lastAttachmentUpdate', new Date().getTime());
  			}
  		});
      this.set('groupOwner',UserFeedPager.create({
        content: [],
        limit: -1,
        loadHandler: ()=>{
          return new Promise((resolve)=>{
            setTimeout(()=>{
              resolve(this.myFeeds());
            },1000);

          });
        }
      }));
      this.get('groupOwner').load(true);
    })
  },
  myFeeds(){
    if (!this.get('model'))
      return [];
    return this.store.peekAll('feed-item').filter((elem) => {
      return elem.get('creatorId') === this.get('model.id');
    });
  },
  username: computed('model', function(){
    if (!this.get('model'))
      return '';
    let username = this.get('model.Email')||'';

    if (username.includes('@')) {
      return username.split('@')[0];
    }
    return username;
  }),
  friends: computed('model', function(){
    if (!this.get('model'))
      return 0;
    return Object.keys(this.get('model.Friends')||{}).length;
  }),
  groups: computed('model', function(){
    if (!this.get('model'))
      return 0;
    return Object.keys(this.get('model.Groups')||{}).length
  }),
  displayName: computed('model', function(){
    if (!this.get('model'))
      return '';
    const firstName = this.get('model.FirstName');
    const lastName = this.get('model.LastName');
    return [firstName, lastName].join(" ");
  }),
  isMine: computed('model', function(){
    if (!this.get('model')){
      return false;
    }
    return this.get('db').myId() === this.get('model.id');
  }),
  attachments: computed('lastAttachmentUpdate','model', function(){
    if (!this.get('model')){
      return [];
    }
    return this.get('store').peekAll('chat-attachment').filter((elem)=>{
      return this.get('convId') === elem.get('convId');
    });
  }),
  actions:{
    uploadImage(file){
      let metadata = {
        cacheControl: 'public,max-age=86400'
      };
      let ref = this.firebaseApp.storage().ref('Media/ProfilePic/' + this.get('firebaseApp').auth().currentUser.uid + "/" + this.generateUUID() + '.png');
      this.set('isLoadingPhoto',true)
      ref.put(file.blob, metadata).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          set(this.get('model'),'ProfilePic', downloadURL);
          this.get('db').updateProfilePic(downloadURL);
          debug('File available at', downloadURL);
          this.set('isLoadingPhoto',false)
        });
      });
    },
    onProviderChanged(provider){
      this.notifyPropertyChange('providers');
    },
    unlinkPlatform(){
      const platform = this.get('platform');
      if (platform.isYoutube){
        this.youtubeSearch.logout();
      }else if (platform.isKhan){
        this.khanAuth.logout();
      }else {
        this.crunchyrollAuth.logout();
      }
      $('#userUnlinkPopup').modal('hide');
      this.notifyPropertyChange('providers');
    },
    onProviderClick(provider){
      if (provider === 'youtube'){
        if (this.youtubeSearch.get('isLoggedIn')){
          this.set('platform',{
            title: 'Youtube',
            isYoutube: true
          });
          $('#userUnlinkPopup').modal();
          // this.youtubeSearch.logout();
        }else{
          this.youtubeSearch.login();
        }
      }
      if (provider === 'khan'){
        if (this.khanAuth.get('isLoggedIn')){
          this.set('platform',{
            title: 'Khan',
            isKhan: true
          });
          $('#userUnlinkPopup').modal();
          // this.khanAuth.logout();
        }else{
          this.khanAuth.login().then(()=>{
            this.notifyPropertyChange('providers');
          });
        }
      }
      if (provider === 'crunchyroll'){
        if (this.crunchyrollAuth.get('isLoggedIn')){
          this.set('platform',{
            title: 'Crunchyroll',
          });
          $('#userUnlinkPopup').modal();
          // this.crunchyrollAuth.logout();
        }else{
          $('#videosModalCrunchyrollLogin').modal();
        }
      }
      this.notifyPropertyChange('providers');
    }
  }

});
