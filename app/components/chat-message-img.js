import Component from '@ember/component';
import {computed} from '@ember/object';
import {htmlSafe} from '@ember/template'
import $ from 'jquery';
import {run} from '@ember/runloop';
export default Component.extend({
  style: computed('model', function () {
    return htmlSafe(`background-image: url(${this.get('model')}); background-position: center;background-size: cover;`);
  }),
  getMeta(url, callback) {
    var img = new Image();
    img.src = url;
    img.onload = function() { callback(this.width, this.height); }
  },
  didInsertElement(){
    this._super(...arguments);
    const self = this;
    let maxWidth = 200;
    if (this.get('maxWidthSelector')){
      maxWidth = $(this.element).closest(this.get('maxWidthSelector')).width();
    }
    this.getMeta(this.get('model'), (width, height)=>{
      run(()=>{
        const aspect = height/width;
        const targetWidth = maxWidth;
        let targetHeight = targetWidth*aspect;
        if (targetHeight>targetWidth){
          targetHeight = targetWidth;
        }
        $(self.element).addClass('loaded');
        $(self.element).find('.img-fluid').css({
          'height':targetHeight,
          'width': targetWidth
        });
      });

    })
  }
});
