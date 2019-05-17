import Component from '@ember/component';
import {computed} from '@ember/object';
export default Component.extend({
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
