import ObjectProxy from '@ember/object/proxy';
import ArrayProxy from '@ember/array/proxy';
import {computed} from '@ember/object';
import moment from 'moment';
import { get } from '@ember/object';
export default ArrayProxy.extend({
  limit: 10,
  init(){
      this._super(...arguments);
      this.set('isLoading', true);
  },
  items: computed('content','limit', function(){
    if (this.get('limit')==-1){
      return this.get('content');
    }else{
      return this.get('content').slice(0,this.get('limit'));
    }
  }),
  reload(){
    this.set('isLoading', true);
    setTimeout(()=>{
      this.setObjects(this.get('cache'));
      this.set('isLoading',false);

    },200);
  },
  beforeReload(){
    this.set('cache',this.toArray());
    this.setObjects([]);
  },
  load(reset){
    if (reset){
      this.setObjects([]);
      this.set('isLoading', true);
    }
    this.loadHandler().then((items)=>{
      if (items){
        this.setObjects(items);
      }
      this.notifyPropertyChange('items');
      this.set('isLoading', false);
    });
  },
  loadMore(){
    this.incrementProperty('limit',10);
  },
  reset(){
    this.setObjects([]);
    this.set('limit',10);
  }

});
