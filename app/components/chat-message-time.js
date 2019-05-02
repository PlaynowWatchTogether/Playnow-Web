import Component from '@ember/component';
import {computed} from '@ember/object';
import moment from 'moment';
export default Component.extend({
  dateFormat: computed('model', function () {
  	if (this.isToday()){
  		return 'Today';
  	}
  	if (this.isYesterday()){
  		return 'Yesterday';
  	}
    if (new Date().getFullYear() === this.get('model').getFullYear()) {
      return moment(this.get('model')).format('ddd D MMM');
    } else {
      return moment(this.get('model')).format('DD-MM-YYYY');
    }
  }),
  isYesterday(){
  	const m = moment().subtract(1, "days");;
  	return m.isSame(this.get('model'), "day");
  },
  isToday(){
  	const m = moment();
  	return m.isSame(this.get('model'), "day");
  }
});
