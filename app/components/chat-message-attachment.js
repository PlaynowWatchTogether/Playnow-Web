import Component from '@ember/component';
import {computed} from '@ember/object';
export default Component.extend({
  isPhoto: computed('model', function () {
    let model = this.get('model');
    let type = model['type'];    
    return type.startsWith('image/');
  }),
  isVideo: computed('model', function () {
    let model = this.get('model');
    let type = model['type'];    
    return type.startsWith('video/');
  }),
  attachmentName: computed('model', function(){
    let model = this.get('model');
    return model.name;
  }),
  attachmentUrl: computed('model', function(){
    let model = this.get('model');
    return model.url;
  })
});
