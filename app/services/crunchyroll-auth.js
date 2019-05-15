import Service from '@ember/service';
import $ from 'jquery';
import { storageFor } from 'ember-local-storage';
// import {Promise} from 'rsvp';
import { computed } from '@ember/object';
import { debug } from '@ember/debug';
import RX from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { inject as service } from "@ember/service";
import moment from 'moment';
import { sort } from '@ember/object/computed';
export default Service.extend({
  storage: storageFor('videos-auth'),
  store: service(),
  init(){
    this._super(...arguments);
    this.set('creds', this._storedCreds());
  },
  _storeCreds(creds){
    this.set('storage.crunchyroll',creds);
    this.set('creds', this._storedCreds());
  },
  _storedCreds(){
    return this.get('storage.crunchyroll');
  },
  isLoggedIn: computed('creds', function(){
    return typeof this._storedCreds() !== 'undefined'
  }),
  _rcpRequest(method, type, data, headers){
    return new Promise((resolve, reject)=>{
      $.ajax({
        url: `http://www.crunchyroll.com/xml?req=${method}`,
        type: type,
        data: data
      }).done((data)=>{
        resolve(data);
      })
    });
  },
  _internalRequest(method, type, data){
    return new Promise((resolve, reject)=>{
      $.ajax({
        url: `https://api.crunchyroll.com/${method}.0.json`,
        type: type,
        data: data
      }).done((data)=>{
        resolve(data);
      })
    });

  },
  queryStream(data){
    const creds = this._storedCreds();
    const session = creds.session_id;
    return Promise.all($.map(data, (elem)=>{
      return this._internalRequest('list_media','POST',{
        series_id: elem.series_id,
        session_id:session,
        fields: 'media.series_id,media.media_id,media.name,media.description,media.url,media.stream_data,media.screenshot_image,media.created'
      })
    }));
  },
  localStoredData: computed(function(){
    return this.store.peekAll('crunchyroll-video');
  }),
  userSort: ['createdAt:desc'],
  localSortedData: sort('localStoredData','userSort'),

  loadLocalData(q,offset,limit, globalResolve,reject){
    new Promise((r,rj)=>{
      r(this.filteredData(q).slice(offset,limit).map((elem)=> { return {kind:'crunchyroll#media',data: JSON.parse(elem.get('rawData'))} }));
    }).then((d)=>{
      globalResolve(d);
    })
  },
  filteredData(q){
    if (!q || q.length === 0){
      return this.store.peekAll('crunchyroll-video');
    }else{
      return this.get('localSortedData').filter((elem)=>{
        return elem.get('title').toLowerCase().includes(q.toLowerCase());
      });
    }
  },
  query(q, reset){
    return new Promise((resolve, reject)=>{
        if (!this.get('isLoggedIn')){
          resolve([]);
        }else{
          if (reset){
            this.set('crunchyrollLimit',null);
            this.set('crunchyrollOffset',null);
          }
          const creds = this._storedCreds();
          let limit = this.get('crunchyrollLimit')||10;
          let offset = this.get('crunchyrollOffset')||0;

          const seriesOffset = this.get('crunchyrollSeriesOffset')
          if (offset+limit > this.filteredData(q).length){
            this._internalRequest('list_series','POST',{session_id: creds.session_id, 'media_type':'anime', limit: 10, offset:seriesOffset }).then((data)=>{
              this.set('crunchyrollSeriesOffset',seriesOffset+10);
              this.queryStream(data.data).then((streams)=>{
                new Promise((r)=>{
                  const wholeData = $.map(streams, (elem)=>elem.data).reduce(function(a, b){
                    return a.concat(b);
                  }, []);
                  wholeData.forEach((crunchItem)=>{
                    let normalizedData = this.store.normalize('crunchyroll-video', {
                      id: `${crunchItem.series_id}-${crunchItem.media_id}`,
                      title: crunchItem.name,
                      rawData: JSON.stringify(crunchItem),
                      createdAt: moment(crunchItem.created).unix()
                    });
                    this.store.push(normalizedData);
                  });
                  // this.wholeData.pushObjects($.map(wholeData, (elem)=> { return {kind:'crunchyroll#media',data: elem} }));
                  r();
                }).then(()=>{
                  this.loadLocalData(q,offset,limit,resolve,reject);
                });

              }).catch((error)=>{
                debug(error);
                resolve([]);
              })
            }).catch((error)=>{
              debug(error);
              resolve([]);
            });;
          }else{
            this.loadLocalData(q,offset,limit,resolve,reject)
          }
          this.set('crunchyrollOffset',offset+10);
          this.set('crunchyrollLimit',limit+10);

          // .then(this.queryStream).then((streams)=>{
            // resolve(streams);
          // }).catch((error)=>{
            // debug(error);
          // })

        }
    });

  },
  login(username, password){
    return new Promise((resolve, reject)=>{
      this._internalRequest('start_session', 'POST', {
        device_id: 'iKW3Jj6RMLrbQvtzUPn8X90SwVHEgeFI',
        device_type: 'com.crunchyroll.crunchyroid',
        access_token: 'Scwg9PRRZ19iVwD'
      }).then((data)=>{
        debug(data);
        this._internalRequest('login', 'POST', {
          session_id: data.data.session_id,
          account: username,
          password: password
        }).then((ret)=>{
          if (ret.error){
            reject();
          }else{
            this._storeCreds({session_id: data.data.session_id});
            resolve();
          }
        })
      });
    });
  }
});
