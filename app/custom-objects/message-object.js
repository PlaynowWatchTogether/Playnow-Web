import ObjectProxy from '@ember/object/proxy';

export default ObjectProxy.extend({

  isEqual(other) {
    return this.ssn == other.ssn;
  }
});
