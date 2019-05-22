import Service from '@ember/service';
import $ from 'jquery';

const API_KEY = 'key=AIzaSyAC97r5YG4QYJfVwHXusD8YbhWrycChPqM';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
import { computed } from '@ember/object';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
import { storageFor } from 'ember-local-storage';
export default Service.extend({
  storage: storageFor('videos-auth'),
  init(){
    this._super(...arguments);
    this.set('creds', this._storedCreds());
    gapi.load('client:auth2', this._initClient);
    window.youtubeService = this;

  },
  initComplete(){
    this.GoogleAuth = gapi.auth2.getAuthInstance();
    this.GoogleAuth.isSignedIn.listen(this._updateSigninStatus);
    if (this.GoogleAuth.isSignedIn.get()){
      this._storeCreds({id: this.GoogleAuth.currentUser.get().getId()})
    }else{
      this._storeCreds(null)
    }
  },
  signInStatusUpdated(){
    if (this.GoogleAuth.isSignedIn.get()){
      this._storeCreds({id: this.GoogleAuth.currentUser.get().getId()});
    }else{
      this._storeCreds(null);
    }
  },
  _updateSigninStatus(){
    window.youtubeService.signInStatusUpdated();
  },
  _initClient(){
    gapi.client.init({
        'apiKey': 'AIzaSyAC97r5YG4QYJfVwHXusD8YbhWrycChPqM',
        'clientId': '491254045283-1r5el6pld31hbq0o57ajrbsbpjuka3vq.apps.googleusercontent.com',
        'scope': 'https://www.googleapis.com/auth/youtube.readonly',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    }).then(() =>{
        window.youtubeService.initComplete();
    });
  },
  _storeCreds(creds){
    window.localStorage.setItem("storage:videos-auth-youtube",JSON.stringify(creds));
    this.set('creds', this._storedCreds());
  },
  _storedCreds(){
    return JSON.parse(window.localStorage.getItem("storage:videos-auth-youtube"))||{};
  },
  isLoggedIn: computed('creds', function(){
    return this.GoogleAuth!=null && this.GoogleAuth.isSignedIn.get();
  }),
  login(){
    this.GoogleAuth.signIn();
  },
  video(id) {
    return new Promise((resolve,reject) => {
      $.getJSON(VIDEOS_URL + '?' + API_KEY + '&part=id,snippet,statistics&id=' + id, null, (data) => {
        resolve(
          data['items'].firstObject
        );
      })
    })
  },
  related(videoId) {
    return new Promise((resolve, reject) => {
      $.getJSON(SEARCH_URL + '?' + API_KEY + '&part=id,snippet&type=video&videoEmbeddable=true&maxResults=10&relatedToVideoId=' + videoId, null, (data) => {
        let items = data['items'];
        // let index = Math.floor(Math.random() * items.length)
        let elem = items[0];
        let video = {
          id: elem['id']['videoId'],
          snippet: elem['snippet'],
          kind: 'youtube#video'
        };
        resolve(video);
      })
    })
  },
  search(q, music, page) {
    return new Promise((resolve) => {
      let category = music ? "&videoCategoryId=10" : '';
      let kind = music ? 'youtube#music': 'youtube#video';
      let pageQ = page ? '&pageToken=' + page : '';
      $.getJSON(SEARCH_URL + '?' + API_KEY + '&part=id,snippet&type=video&videoEmbeddable=true&maxResults=10&q=' + q + category + pageQ, null, (data) => {
        resolve({
          nextPage: data['nextPageToken'],
          items: data['items'].map((elem) => {
            return {
              id: elem['id']['videoId'],
              snippet: elem['snippet'],
              kind: kind
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
      let kind = music ? 'youtube#music': 'youtube#video';
      $.getJSON(VIDEOS_URL + '?' + API_KEY + '&part=id,snippet,statistics&type=video&videoEmbeddable=true&chart=mostPopular&maxResults=10' + category + pageQ, null, (data) => {
        resolve({
          nextPage: data['nextPageToken'],
          items: data['items'].map((elem)=>{
            elem['kind']=kind;
            return elem;
          }),
          pageInfo: data['pageInfo']
        });
      })
    })
  }
});
