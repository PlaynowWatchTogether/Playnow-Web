import Service from '@ember/service';
import $ from 'jquery';

const API_KEY = 'key=AIzaSyAC97r5YG4QYJfVwHXusD8YbhWrycChPqM';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
import {debug} from "@ember/debug";

export default Service.extend({
  video(id) {
    return new Promise((resolve) => {
      $.getJSON(VIDEOS_URL + '?' + API_KEY + '&part=id,snippet&id=' + id, null, (data) => {
        debug(data);
        resolve(
          data['items'].firstObject
        );
      })


    })
  },
  search(q, music, page) {
    return new Promise((resolve) => {
      let category = music ? "&videoCategoryId=10" : '';
      let pageQ = page ? '&pageToken=' + page : '';
      $.getJSON(SEARCH_URL + '?' + API_KEY + '&part=id,snippet&type=video&videoEmbeddable=true&maxResults=25&q=' + q + category + pageQ, null, (data) => {
        debug(data);
        resolve({
          nextPage: data['nextPageToken'],
          items: data['items'].map((elem) => {
            return {
              id: elem['id']['videoId'],
              snippet: elem['snippet']
            }
          }),
          pageInfo: data['pageInfo']
        });
      })
    })
  },
  trending(music, page) {
    return new Promise((resolve) => {
      let category = music ? "&videoCategoryId=10" : '';
      let pageQ = page ? '&pageToken=' + page : '';
      $.getJSON(VIDEOS_URL + '?' + API_KEY + '&part=id,snippet&type=video&videoEmbeddable=true&chart=mostPopular&maxResults=25' + category + pageQ, null, (data) => {
        debug(data);
        resolve({
          nextPage: data['nextPageToken'],
          items: data['items'],
          pageInfo: data['pageInfo']
        });
      })
    })
  }
});
