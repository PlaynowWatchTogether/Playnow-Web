import Service from '@ember/service';
import $ from 'jquery';
import { storageFor } from 'ember-local-storage';
import {Promise} from 'rsvp';
import { computed } from '@ember/object';

export default Service.extend({
  USER_URL: 'https://www.khanacademy.org/api/v1/user',
  init(){
    this._super(...arguments);
    this.set('creds', this._storedCreds());
    this.wholeData = [];
  },
  _storeCreds(creds){
    window.localStorage.setItem("storage:videos-auth-khan",JSON.stringify(creds));
  },
  _storedCreds(){
    return JSON.parse(window.localStorage.getItem("storage:videos-auth-khan"))||{};
  },
  isLoggedIn: computed('creds', function(){
    const creds = this._storedCreds();
    return typeof creds['auth_token'] !== 'undefined';
  }),
  init(){
    this._super(...arguments);
    this.oauth = OAuth({
      consumer: { key: 'FN4zQLgdagJGntD3', secret: 'YKsA7hWDzxYzLKFM'},
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
      }//,
      // last_ampersand: false
    });
  },
  logout(){
    this.set('creds',null);
    this._storeCreds({});
  },
  login(){
    return new Promise((resolve, reject)=>{
      const request_data={url:'https://www.khanacademy.org/api/auth2/request_token', method: 'POST',data:{oauth_callback: `${location.origin}/auth`}};
      $.ajax({
        url: 'https://www.khanacademy.org/api/auth2/request_token',
        type: 'POST',
        data: this.oauth.authorize(request_data)
      }).done((data)=> {
        const newwindow=window.open(`https://www.khanacademy.org/api/auth2/authorize?${data}`,'Khan auth','width=560,height=600,toolbar=0,menubar=0,location=0');
        if (newwindow){
          if (window.focus) {newwindow.focus()}
          var timer = setInterval(()=> {
              if(newwindow.closed) {
                  clearInterval(timer);
                  this.set('creds', this._storedCreds());
                  if (this.get('isLoggedIn')){
                    resolve();
                  }else{
                    reject('Failed to login');
                  }
              }
          }, 1000);
        }else{
          reject('Failed to login');
        }
      });
    });

  },

  getApiCall(url){
    return new Promise((resolve, reject)=>{
      if (this.get('isLoggedIn')){
        const creds = this._storedCreds();
        const request = {
          url: url,
          method: 'GET'
        }
        $.ajax({
          url: url,
          type: 'GET',
          data: this.oauth.authorize(request,{key: creds['auth_token'],secret:creds['oauth_token_secret']})
        }).done((data)=>{
          resolve(data);
        })
      }else{
        reject('not logged in');
      }
    });

  },
  getCallback(params){
    const data = {
      oauth_verifier:params['oauth_verifier'],
      oauth_consumer_key:'FN4zQLgdagJGntD3'
    }
    // params['oauth_consumer_key']='FN4zQLgdagJGntD3';
    // params['oauth_version']='2.0';
    const url = `https://www.khanacademy.org/api/auth2/access_token`;
    const request = {
      url: url,
      method: 'POST',
      data: data
    }
    // var response = `oauth_token_secret=${params['oauth_token_secret']}&oauth_verifier=${params['oauth_verifier']}&oauth_token=${params['oauth_token']}`;
    // var request_data={url:'https://www.khanacademy.org/api/auth2/access_token?oauth_consumer_key=FN4zQLgdagJGntD3&oauth_version=1.0&'+response, method: 'GET'};
    $.ajax({
      url: url,
      type: 'POST',
      data: this.oauth.authorize(request,{key:params['oauth_token'],secret:params['oauth_token_secret']})
    }).done((data) =>{
      const pairs = data.slice(1).split('&');
      const result = {};
      pairs.forEach((p)=>{
        const pair = p.split('=');
        result[pair[0]] = pair[1];
      });
      this._storeCreds(result);
      window.close();
    });
  },
  query(q, reset){
    return new Promise((resolve, reject)=>{
      if (!this.get('isLoggedIn')){
          resolve([]);
      }else{
          if (reset){
            this.set('khanOffset',0);
            this.wholeData=[];
          }
          const offset = this.get('khanOffset')||0;
          const limit = 10;
          if (this.wholeData.length > 0){
            this.set('khanOffset',offset+10);
            resolve(this.wholeData.slice(offset,limit));
          }else{
            this.getApiCall('https://www.khanacademy.org/api/v1/user/videos').then((data)=>{
              this.wholeData.pushObjects($.map(data, (elem)=> { return {kind:'khan#media',data: elem} }));
              this.set('khanOffset',offset+10);
              resolve(this.wholeData.slice(offset,limit));
            });
          }
      }
    });
  }
});
