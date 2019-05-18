import Component from '@ember/component';
import {computed} from '@ember/object';
import {htmlSafe} from '@ember/template'
import $ from 'jquery';
import {run} from '@ember/runloop';
export default Component.extend({
  attributeBindings: ['style'],
  style: computed('model', function () {
    return htmlSafe(`background-image: url("${this.get('model')}")`);
  }),
  didInsertElement: function didInsertElement() {
    this._super.apply(this, arguments);

    $(window).on(`resize.${this.elementId}`, this.handleSize.bind(this));
    $(document).on( `shown.bs.tab.${this.elementId}`, 'a[data-toggle="tab"]', (e)=> { // on tab selection event
      run(()=>{
        this.handleSize();
      });
    });
  },
  willDestroyElement(){
    this._super(...arguments);
    $(window).off(`resize.${this.elementId}`);
    $(document).off( `shown.bs.tab.${this.elementId}`);
  },
  didRender: function didRender() {
    this._super(...arguments);
    this.handleSize();
  },
  handleSize: function handleSize() {
    var parentWidth = $(this.element).parent().width();
    if (this.get('useSelfWidth')){
      parentWidth = $(this.element).width();
    }
    $(this.element).css('height', parentWidth * (9 / 16));
  }
});
