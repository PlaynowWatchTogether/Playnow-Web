import Service from '@ember/service';

const API_KEY = 'key=AIzaSyAC97r5YG4QYJfVwHXusD8YbhWrycChPqM';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

export default Service.extend({
  video(id) {
    return new Promise((resolve, reject) => {
      $.getJSON(VIDEOS_URL + '?' + API_KEY + '&part=id,snippet&id=' + id, null, (data) => {
        console.log(data);
        resolve(
          data['items'].firstObject
        );
      })


    })
  },
  search(q, music, page) {
    return new Promise((resolve, reject) => {
      let category = music ? "&videoCategoryId=10" : '';
      let pageQ = page ? '&pageToken=' + page : '';
      $.getJSON(SEARCH_URL + '?' + API_KEY + '&part=id,snippet&type=video&videoEmbeddable=true&maxResults=25&q=' + q + category + pageQ, null, (data) => {
        console.log(data);
        resolve({
          nextPage: data['nextPageToken'],
          items: data['items'],
          pageInfo: data['pageInfo']
        });
      })
    })
  },
  trending(music, page) {
    return new Promise((resolve, reject) => {
      let category = music ? "&videoCategoryId=10" : '';
      let pageQ = page ? '&pageToken=' + page : '';
      $.getJSON(VIDEOS_URL + '?' + API_KEY + '&part=id,snippet&type=video&videoEmbeddable=true&chart=mostPopular&maxResults=25' + category + pageQ, null, (data) => {
        console.log(data);
        resolve({
          nextPage: data['nextPageToken'],
          items: data['items'],
          pageInfo: data['pageInfo']
        });
      })
    })
  }
});
