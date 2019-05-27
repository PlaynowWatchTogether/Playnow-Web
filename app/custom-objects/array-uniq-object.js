import EmberObject from '@ember/object';
import ArrayProxy from '@ember/array/proxy';
import ObjectProxy from '@ember/object/proxy';
import {computed} from '@ember/object';
import {get} from '@ember/object';
import { debug } from '@ember/debug';
import { addObserver } from '@ember/object/observers';
import { removeObserver } from '@ember/object/observers';

export default ArrayProxy.extend({
  init(){
    this._super(...arguments);
    addObserver(this.on,`${this.key}.@each.${this.uniqKey}`,this,'contentChanged');
    this.set('content',[]);
    this.handleContent();
  },
  exists(elem,array){
    let k = null;
    array.forEach((e)=>{
      if (get(e,this.uniqKey) === get(elem,this.uniqKey)){
        k = e;
      }
    });
    return k;
  },
  handleContent(){
    const elems = Object.values(this.on.get(this.key)||{}).filter((elem)=>{
      if (this.filterElements){
        return this.filterElements(elem);
      }else{
        return true;
      }
    });
    const current = this.get('content');
    //check for new elements;
    elems.forEach((remote)=>{
      const local = this.exists(remote,current);
      if (!local){
        current.pushObject(ObjectProxy.create({content: remote}));
      }else{
        local.set('content', remote);
      }
    });
    current.forEach((local)=>{
      const remote = this.exists(local,elems);
      if (!remote){
        current.removeObject(local);
      }
    });
    this.notifyPropertyChange('content');    
  },
  contentChanged(obj){
    this.handleContent();
  }
});
