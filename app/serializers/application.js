import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  keyForAttribute(attr) {
    if ('LastActiveDate' === attr) {
      return 'Last Active Date';
    }
    return attr;
  }
});
