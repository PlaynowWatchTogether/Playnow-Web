import Component from '@ember/component';
// import $ from 'jquery';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend({
    didInsertElement(){
      this._super(...arguments);
      $(this.element).find('.start.date').datepicker();
      $(this.element).find('.start.time').timepicker({'step': 10});
      $(this.element).find('.end.time').timepicker({'step': 10});
      $(this.element).find('.create-event-date-time').datepair();
    }
});
