import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';
import DS from 'ember-data';


import UserProfileView from './user-profile-view';

export default UserProfileView.extend({
  db:service(),
  init(){
    this._super(...arguments);
    this.addObserver('model', this,'modelObserver');
  },
  modelObserver(obj){
      obj.handleInsert();
  },
  handleInsert(){
    if (this.ret){
      this.get('db').profileFieldListenOff(this.ret)
    }
    if (!this.get('model')){
      return;
    }
    if (this.get('listen')){
      this.ret = this.get('db').profileFieldListen(this.get('model'),'ProfilePic', (val)=>{
        this.set('postSenderPic',val);
      });

    }else{
      this.get('db').profileField(this.get('model'),'ProfilePic').then((val)=>{
        this.set('postSenderPic',val);
      });
    }
  },
  didInsertElement(){
    this._super(...arguments);
    this.handleInsert();
  },
  willDestroyElement(){
    if (this.ret){
      this.get('db').profileFieldListenOff(this.ret)
    }
    this._super(...arguments);

  }
});
