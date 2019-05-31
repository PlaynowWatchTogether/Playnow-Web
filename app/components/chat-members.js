import Component from '@ember/component';
import J from 'jquery';
import { computed } from '@ember/object';
import {debug} from '@ember/debug';
import {run} from '@ember/runloop';
export default Component.extend({
  classNameBindings: ['fullscreen:fullscreen','isPlayerLoading:loading'],
  init(){
    this._super(...arguments);
    this.set('large',{});
    this.addObserver('isPlayerLoading',this, 'onPlayerLoading');
  },
  onPlayerLoading(obj){
    debug(`onPlayerLoading ${this.get('isPlayerLoading')}`);
    run(()=>{
      const sideBar = $('.messages-side-bar');
      const messageHolder = $('.messages-holder-full');
      const localStream=$('.local-stream .member');
      let height = 9 * messageHolder.width() / 16;

      if (this.get('isPlayerLoading')){
        sideBar.addClass('loading');
        sideBar.css({
          'margin-left':0,
          'width':messageHolder.width(),
          'height':height,
          'top':100
        });
      }else{
        sideBar.removeClass('loading');
        sideBar.css({
          'margin-left':'',
          'width':'',
          'height':'',
          'top':''
        });
      }
    });
  },
  isPlayerLoading: computed('playerLoading','fulscreen', function(){
    const loading = this.get('playerLoading');
    const full = this.get('fullscreen');
    return loading && !full;
  }),
  didInsertElement(){
    this._super(...arguments);
    $(this.element).on('click','.member', (event)=>{
      run(()=>{
        this.toggleProperty(`large.${$(event.target).attr('id')}`);
        this.set('lastUpdate',new Date());  
      })

    });
  }
});
