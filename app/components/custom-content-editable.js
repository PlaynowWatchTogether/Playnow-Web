import Component from '@ember/component';

export default Component.extend({
  classNames: ['ember-content-editable'],
  classNameBindings: ['clearPlaceholderOnFocus:clear-on-focus'],
  attributeBindings: ['contenteditable', 'placeholder', 'spellcheck', 'tabindex', 'disabled'],
  disabled: false,
  spellcheck: null,
  allowNewlines: true,
  autofocus: false,
  clearPlaceholderOnFocus: false,

  init() {
    this._super(...arguments);

    this.set('keyWhitelist', [8, // backspace
      27, // escape
      37, // left arrow
      38, // up arrow
      39, // right arrow
      40 // down arrow
    ]);
    this._pasteHandler = Ember.run.bind(this, this.pasteHandler);
  },
  setEndOfContenteditable() {
    var range, selection;
    if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
      range = document.createRange();//Create a range (a range is a like the selection but invisible)
      range.selectNodeContents(this.element);//Select the entire contents of the element with the range
      range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
      selection = window.getSelection();//get the selection object (allows you to change selection)
      selection.removeAllRanges();//remove any selections already made
      selection.addRange(range);//make the range you have just created the visible selection
    } else if (document.selection)//IE 8 and lower
    {
      range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
      range.moveToElementText(this.element);//Select the entire contents of the element with the range
      range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
      range.select();//Select the range (make it the visible selection
    }
  },
  didInsertElement() {
    this._super(...arguments);

    this.updateDom();
    this._mutationObserver = new MutationObserver(Ember.run.bind(this, this.domChanged));

    this._mutationObserver.observe(this.element, {
      attributes: false,
      childList: true,
      characterData: true,
      subtree: true
    });

    if (this.get('autofocus')) {
      this.element.focus();
    }

    this.element.addEventListener('paste', this._pasteHandler);
  },

  willDestroyElement() {
    this._super(...arguments);

    this.element.removeEventListener('paste', this._pasteHandler);

    this._mutationObserver.disconnect();
  },

  domChanged() {
    const text = this.element.innerText;
    this.setProperties({
      value: text,
      _internalValue: text
    });
    this.setEndOfContenteditable();
  },

  didReceiveAttrs() {
    this._super(...arguments);

    this.set('contenteditable', !this.get('disabled'));
  },

  didUpdateAttrs() {
    this._super(...arguments); // if update has been initiated by a change of the dom (user entered something) we don't do anything because
    // - value has already been updated by domChanged
    // - the rendered text already shows the current value


    if (this.get('value') != this.get('_internalValue')) {
      this.updateDom();
    }
  },

  updateDom() {
    const value = this.get('value');

    if (value === undefined || value === null) {
      this.element.innerText = '';
    } else {
      this.element.innerText = value;
    }
    this.setEndOfContenteditable();
  },

  keyUp(event) {
    this.get('key-up')(event);
  },

  keyPress(event) {
    // Firefox seems to call this method on backspace and cursor keyboard events, whereas chrome does not.
    // Therefore we keep a whitelist of keyCodes that we allow in case it is necessary.
    const newLength = this.element.innerText.length - this.getSelectionLength();

    if (this.get('maxlength') && newLength >= this.get('maxlength') && !this.get('keyWhitelist').includes(event.keyCode)) {
      event.preventDefault();
      this.get('length-exceeded')(this.element.innerText.length + 1);
      return false;
    }

    this.get('key-press')(event);
  },

  keyDown(event) {
    if (event.keyCode === 27) {
      this.get('escape-press')(event);
    } else if (event.keyCode === 13) {
      if (!event.ctrlKey) {

        this.get('enter')(event);
        event.preventDefault();
        return false;
      } else {
        this.get('insert-newline')(event);
        this.element.innerText += '\n\n';
        event.preventDefault();
        return false;
      }
    }

    this.get('key-down')(event);
  },

  getSelectionLength() {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      return range.endOffset - range.startOffset;
    }

    return 0;
  },
  getCaretPosition() {
    var caretPos = 0,
      sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        if (range.commonAncestorContainer.parentNode === this.element) {
          caretPos = range.endOffset;
        }
      }
    } else if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      if (range.parentElement() === this.element) {
        var tempEl = document.createElement("span");
        this.element.insertBefore(tempEl, this.element.firstChild);
        var tempRange = range.duplicate();
        tempRange.moveToElementText(tempEl);
        tempRange.setEndPoint("EndToEnd", range);
        caretPos = tempRange.text.length;
      }
    }
    return caretPos;
  },
  pasteHandler(event) {
    event.preventDefault(); // replace any html formatted text with its plain text equivalent

    let text = '';

    if (event.clipboardData) {
      text = event.clipboardData.getData('text/plain');
    } else if (window.clipboardData) {
      text = window.clipboardData.getData('Text');
    } // check max length


    if (this.get('maxlength')) {
      // a selection will be replaced. substract the length of the selection from the total length
      const selectionLength = this.getSelectionLength();
      const afterPasteLength = text.length + this.element.innerText.length - selectionLength;

      if (afterPasteLength > this.get('maxlength')) {
        this.get('length-exceeded')(afterPasteLength);
        return false;
      }
    }

    this.get('paste')(this.getCaretPosition(), text);
  },

  enter() {
  },

  'escape-press'() {
  },

  'key-up'() {
  },

  'key-press'() {
  },

  'key-down'() {
  },

  'length-exceeded'() {
  },

  'insert-newline'() {
  },

  paste() {
  }

}).reopenClass({
  positionalParams: ['value']
});
