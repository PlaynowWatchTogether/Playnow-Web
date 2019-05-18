import Component from '@ember/component';
import {computed} from '@ember/object';
import {htmlSafe} from '@ember/template'
import $ from 'jquery';
import {run} from '@ember/runloop';
export default Component.extend({
  getMeta(url, callback) {
    var img = new Image();
    img.src = url;
    img.onload = function() { callback(this.width, this.height); }
  },
  calcSize(width, height){
    let maxWidth = 200;
    let maxHeight = -1;
    if (this.get('maxWidthSelector')){
      maxWidth = $(this.element).closest(this.get('maxWidthSelector')).width();
      maxHeight = $(this.element).closest(this.get('maxWidthSelector')).height();
    }
    const aspect = height/width;
    let targetWidth = maxWidth;
    let margin=0;
    let targetHeight = targetWidth*aspect;
    if (targetHeight>targetWidth){
      targetHeight = targetWidth;
    }
    if (maxHeight!=-1){
      if (targetHeight<maxHeight){
        targetHeight = maxHeight;
        targetWidth = targetHeight/aspect;
        margin=-(Math.abs(targetWidth-maxWidth))/2;
      }
    }
    $(this.element).addClass('loaded');
    $(this.element).find('.img-fluid').css({
      'background-position': 'center',
      'background-size': 'cover',
      'background-image': `url("${this.get('model')}")`,
      'height':targetHeight,
      'width': targetWidth,
      'margin-left':margin
    });
  },
  didInsertElement(){
    this._super(...arguments);
    const self = this;
    this.calcSize(160,90);
    this.getMeta(this.get('model'), (width, height)=>{
      run(()=>{
        self.calcSize(width, height)
      });

    })
  }
});
