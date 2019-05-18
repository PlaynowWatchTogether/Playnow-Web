import Component from '@ember/component';
import {computed} from '@ember/object';
export default Component.extend({
  classNameBindings:['isActive:active'],
  isActive: computed('currentPosition','index',function(){
    return this.get('currentPosition') === this.get('index');
  }),
  isPhoto: computed(function () {
    let model = this.get('model');
    let type = model['type'];
    return type.startsWith('image/');
  }),
  isVideo: computed(function () {
    let model = this.get('model');
    let type = model['type'];
    return type.startsWith('video/');
  }),
  attachmentName: computed(function(){
    let model = this.get('model');
    return model.name;
  }),
  attachmentUrl: computed('model.url',function(){
    let model = this.get('model');
    return model.url;
  })
});
