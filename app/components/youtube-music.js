import Component from '@ember/component';
import {computed} from '@ember/object'
import SearchVideoResult from '../custom-objects/search-video-result';

export default Component.extend({
  songTitle: computed('model', function () {
    let m = this.get('model');
    let title = m['snippet']['title'];
    let data = [];
    if (title.includes(' | ')) {
      data = title.split(' | ')
    } else if (title.includes(' - ')) {
      data = title.split(' - ')
    } else {
      data.push(title);
      data.push(title);
    }
    return data[1];
  }),
  songArtist: computed('model', function () {
    let m = this.get('model');
    let title = m['snippet']['title'];
    let data = [];
    if (title.includes(' | ')) {
      data = title.split(' | ')
    } else if (title.includes(' - ')) {
      data = title.split(' - ')

    } else {
      data.push('Unknown');
    }
    return data[0];
  }),
  videoThumbnail: computed('model', function () {
    let m = this.get('model');
    return m['snippet']['thumbnails']['medium']['url']
  }),
  click() {
    this.clickAction(SearchVideoResult.create({data: this.get('model')}));
  }
});
