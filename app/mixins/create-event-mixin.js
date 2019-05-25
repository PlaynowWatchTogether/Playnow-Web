import Mixin from '@ember/object/mixin';
import { debug } from '@ember/debug';
import { computed } from '@ember/object';
import { set } from '@ember/object';
import moment from 'moment';
export default Mixin.create({
  init(){
    this._super(...arguments);
    this.resetNewEvent();
  },
  newEventSeats: computed('newEvent.seats.available', function(){
    return this.get('newEvent.seats.available');
  }),
  createEventShowed(){
    this.set('creatingEvent', true);
  },
  resetNewEvent(){
    this.set('creatingEvent',false);
    this.set('newEventErrors',{});
    this.set('newEventUploads',null);
    this.set('newEvent', {
      title:'',
      description:'',
      date:{

      },
      seats:{
        available: -1
      }
    });
  },
  actions:{
    onSeatsPick(seats){
      this.set('newEvent.seats.available',parseInt(seats));
    },
    cancelCreateEvent(){
      this.resetNewEvent();
    },
    removeEventPic(upload){
      this.set('newEventUploads',null);
    },
    uploadEventPic(file){
      let upload = {file: file, state: 0};
      this.set('newEventUploads',upload);
      let ref = this.firebaseApp.storage().ref('Media/Files/' + this.get('firebaseApp').auth().currentUser.uid + "/" + this.generateUUID() + file.name);
      const uploadTask = ref.put(file.blob);
      uploadTask.on('state_changed', (snapshot)=>{
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        set(upload, 'state',1);
        set(upload, 'progress',progress);
        set(upload, 'transferred',snapshot.bytesTransferred);
        set(upload, 'total',snapshot.totalBytes);
        debug(`Upload progress changed ${progress}`);
      }, (error)=>{
        set(upload, 'state',3);
        set(upload, 'error',error);
      }, ()=>{
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            // ds.sendMessage('', downloadURL, null, true);
            //ds.sendAttachment(file, downloadURL, id);
            debug(`File available at ${downloadURL}`);
            set(upload, 'url',downloadURL);
            set(upload, 'state',2);
        });
      });
    },
    createEvent(){
      this.set('newEventErrors',{});
      const model = this.get('newEvent');
      debug(JSON.stringify(model));
      if (!model.title || model.title.length === 0){
        this.set('newEventErrors.title','Should not be empty');
        return;
      }
      if (!model.description || model.description.length === 0){
        this.set('newEventErrors.description','Should not be empty');
        return;
      }
      if (!model.date || !model.date.date || !model.date.timeStart || !model.date.timeEnd){
        this.set('newEventErrors.date','Should be set');
        return;
      }
      const upload = this.get('newEventUploads');
      const url = this.get('newEventUploads.url');
      if (upload && !url){
        return;
      }
      if (url){
        model.ProfilePic = url;
      }

      this.dataSource.createEvent(this.dataSource.feedId, model).then(()=>{
        this.resetNewEvent();
      });
    }
  }
});
