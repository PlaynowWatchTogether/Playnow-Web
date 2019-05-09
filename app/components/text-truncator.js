import Component from '@ember/component';
import $ from 'jquery';
import { run } from '@ember/runloop';
import { bind } from '@ember/runloop';
export default Component.extend({
  handleSize(){
    new window.Dotdotdot($(this.element)[0],{height: this.get('height')});
  },
  didInsertElement(){
    this._super(...arguments);
    this.handleSize();
    const self = this;
    $(document).on( `shown.bs.tab.${this.elementId}`, 'a[data-toggle="tab"]',{obj: this}, (e)=>{
      self.handleSize();
    });
  },
  willDestroyElement() {
    $(document).off( `shown.bs.tab.${this.elementId}`);
    this._super(...arguments);
  },
  didRender(){
    this._super(...arguments);
    this.handleSize();
  }
});
