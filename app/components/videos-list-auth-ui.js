import Component from '@ember/component';
import { inject as service } from '@ember/service';
import J from 'jquery';
import { addObserver } from '@ember/object/observers';
import { removeObserver } from '@ember/object/observers';
import { debug } from '@ember/debug';
export default Component.extend({
  khanAuth: service(),
  crunchyrollAuth: service(),
  youtubeSearch: service(),
  init(){
    this._super(...arguments);
  },
  didInsertElement(){
    this._super(...arguments);
    addObserver(this.crunchyrollAuth,'creds', this, 'onCrunchyrollAuth');
    addObserver(this.youtubeSearch,'creds', this, 'onYoutubeAuth');
  },
  willDestroyElement(){
    this._super(...arguments);
    removeObserver(this.crunchyrollAuth,'creds', this, 'onCrunchyrollAuth');
    removeObserver(this.youtubeSearch,'creds', this, 'onYoutubeAuth');
  },
  onYoutubeAuth(obj){
    debug('onYoutubeAuth');
    const newValue = !this.get('providers.youtube');
    this.set('providers.youtube', newValue);
    this.get('onProviderChanged')('youtube',newValue);

  },
  onCrunchyrollAuth(obj){
    debug('onCrunchyrollAuth');
    const newValue = !this.get('providers.crunchyroll');
    this.set('providers.crunchyroll', newValue);
    this.get('onProviderChanged')('crunchyroll',newValue);

  },
  actions: {
    loginYoutube(){
      const loggedIn = this.youtubeSearch.get('isLoggedIn');
      if (this.get('isFromSettings')){
        this.get('onProviderClick')('youtube');
      }else{
        if (loggedIn){
          const newValue = !this.get('providers.youtube');
          this.set('providers.youtube', newValue);
          this.get('onProviderChanged')('youtube',newValue);

        }else{
          this.youtubeSearch.login();
        }
      }
    },
    loginKhan(){
      if (this.get('isFromSettings')){
        this.get('onProviderClick')('khan');
      }else{
        const loggedIn = this.khanAuth.get('isLoggedIn');
        if (loggedIn){
          const newValue = !this.get('providers.khan');
          this.set('providers.khan', newValue);
          this.get('onProviderChanged')('khan',newValue);

        }else{
          this.khanAuth.login().then(()=>{
            const newValue = !this.get('providers.khan');
            this.set('providers.khan', newValue);
            this.get('onProviderChanged')('khan',newValue);

          })
        }
      }
    },
    loginCrunchRoll(){
      if (this.get('isFromSettings')){
        this.get('onProviderClick')('crunchyroll');
      }else{
        const loggedIn = this.crunchyrollAuth.get('isLoggedIn');
        if (loggedIn){
          const newValue = !this.get('providers.crunchyroll');
          this.set('providers.crunchyroll', newValue);
          this.get('onProviderChanged')('crunchyroll',newValue);
        }else{
          $('#videosModalCrunchyrollLogin').modal();
        }
      }
    }

  }
});
