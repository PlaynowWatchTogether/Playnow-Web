import DS from 'ember-data';
import {underscore} from '@ember/string';

export default DS.JSONSerializer.extend({
  keyForAttribute(attr) {
    if ('LastActiveDate' === attr) {
      return 'Last Active Date';
    }
    return attr;
  }
});
