import Component from '@ember/component';
import J from 'jquery';
import {run} from '@ember/runloop';
export default Component.extend({
  didInsertElement() {
    this._super(...arguments);
    $(window).on('resize', ()=>{
      run(()=>{
        this.handleSize();  
      });

    });
    this.handleSize();
    $(document).on( 'shown.bs.tab', 'a[data-toggle="tab"]', (e)=> { // on tab selection event
      run(()=>{
        this.handleSize();
      });
    });
  },
  didRender(){
    this._super(...arguments);
    this.handleSize();
  },
  handleSize(){
    const minus = (this.get('minusSelector')||'').split(';');
    let height = $(this.get('parentSelector')).height();
    let parent = $(this.element).closest(this.get('parentSelector'));

    const parentOffset = parent && parent.offset() ? parent.offset().top : 0;
    const windowHeight = $(window).height();
    const maxParentHeight = windowHeight-parentOffset;
    height = maxParentHeight;
    minus.forEach((elem)=>{
      if (!isNaN($(elem).height())){
        height-=$(elem).height();
      }

    });
    $(this.element).css('height', height);
  }
});
