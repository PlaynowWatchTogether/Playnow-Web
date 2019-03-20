import Component from '@ember/component';
import {computed} from '@ember/object';
import moment from 'moment'

export default Component.extend({

  init() {
    this._super(...arguments);

    this.addObserver('model', this, 'modelObserver');
    this.modelObserver(this);
  },
  modelObserver(obj) {
    let value = this.get('value');
    if (value) {
      obj.set('pickedMonth', moment(value).month() + 1);
      obj.set('pickedDate', moment(value).date());
      obj.set('pickedYear', moment(value).year());
    }
    obj.set('selectedDate', obj.get('model') || moment().format("MM-DD-YYYY"));
  },
  disabledClass: computed('disabled', function () {
    return this.get('disabled') ? 'disabled' : '';
  }),
  currentMonth: computed('pickedMonth', function () {
    let model = this.get('pickedMonth');
    if (model) {
      return moment().month(model - 1).format("MMM")
    }
    return ' '
  }),
  currentDate: computed('pickedDate', function () {
    let model = this.get('pickedDate');
    if (model) {
      return moment().date(model).format("D")
    }
    return ' '
  }),
  currentYear: computed('pickedYear', function () {
    let model = this.get('pickedYear');
    if (model) {
      return moment().year(model).format("YYYY")
    }
    return ' '
  }),
  monthDropdown: computed('pickedDate', function () {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((elem, index) => {
      return {id: index + 1, title: elem}
    })
  }),
  dateDropdown: computed('pickedDate', function () {
    let start = moment(this.get('selectedDate')).daysInMonth();
    let i = 0;
    let records = [];
    while (i < start) {
      records.push(i + 1);
      i += 1;
    }
    return records.map((elem, index) => {
      return {id: index + 1, title: elem}
    })
  }),
  yearDropdown: computed('pickedDate', function () {
    let end = moment().year();
    let i = end;
    let records = [];
    while (i >= 1900) {
      records.push({title: i, id: i});
      i -= 1;
    }
    return records
  }),
  getFullDate() {
    let month = this.get('pickedMonth');
    let date = this.get('pickedDate');
    let year = this.get('pickedYear');
    if (month && date && year) {
      return moment().year(year).date(date).month(month - 1);
    } else {
      return moment()
    }
  },
  actions: {
    onMonthPick(month) {
      this.set('pickedMonth', month);
      this.get('onDateSet')(this.getFullDate());
    },
    onDayPick(day) {
      this.set('pickedDate', day);
      this.get('onDateSet')(this.getFullDate());
    },
    onYearPick(day) {
      this.set('pickedYear', day);
      this.get('onDateSet')(this.getFullDate());
    }
  }
});
