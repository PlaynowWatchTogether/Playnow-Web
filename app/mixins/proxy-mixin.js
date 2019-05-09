import Mixin from '@ember/object/mixin';
import Ember from 'ember';
import { get } from '@ember/object';
import { set } from '@ember/object';
import { addObserver } from '@ember/object/observers';
import { removeObserver } from '@ember/object/observers';
import { computed } from '@ember/object';
import { defineProperty } from '@ember/object';
import { observer } from '@ember/object';
import { assert as emberAssert} from '@ember/debug';
import { notifyPropertyChange } from '@ember/object';
// const {
//   get,
//   set,
//   meta,
//   addObserver,
//   removeObserver,
//   addBeforeObserver,
//   removeBeforeObserver,
//   propertyWillChange,
//   propertyDidChange,
//   computed,
//   defineProperty,
//   observer,
//   fmt
// } = Ember;

const contentPropertyWillChange = function(content, contentKey) {
  const key = contentKey.slice(8);
  if (key in this) { return; }
  return Ember.propertyWillChange(this, key);
};

const contentPropertyDidChange = function(content, contentKey) {
  const key = contentKey.slice(8);
  if (key in this) { return; }
  return notifyPropertyChange(this, key);
};

export default Mixin.create({
  content: null,
  _contentDidChange: observer("content", function() {
    return Ember.assert("Can't set ObjectProxy's content to itself",
      get(this, "content") !== this);
  }),
  isTruthy: computed.bool("content"),
  // _debugContainerKey: null,
  willWatchProperty(key) {
    const contentKey = `content.${key}`;
    // Ember.addBeforeObserver(this, contentKey, null, contentPropertyWillChange);
    return addObserver(this, contentKey, null, contentPropertyDidChange);
  },

  didUnwatchProperty(key) {
    const contentKey = `content.${key}`;
    // Ember.removeBeforeObserver(this, contentKey, null, contentPropertyWillChange);
    return removeObserver(this, contentKey, null, contentPropertyDidChange);
  },

  unknownProperty(key) {
    const content = get(this, "content");
    if (content) { return get(content, key); }
  },

  setUnknownProperty(key, value) {
    const m = Ember.meta(this);
    if (m.proto === this) {
      defineProperty(this, key, null, value);
      return value;
    }
    const content = get(this, "content");
    Ember.assert(`Cannot delegate set('${key}', ${value}) to the 'content' property of object proxy ${this}: its 'content' is undefined.`,
      content);
    return set(content, key, value);
  }
});
