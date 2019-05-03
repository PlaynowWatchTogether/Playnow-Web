import Mixin from '@ember/object/mixin';
import $ from 'jquery';
import { set } from '@ember/object';
import { debug } from '@ember/debug';
import UUIDGenerator from './uuid-generator';
export default Mixin.create(UUIDGenerator, {
  init(){
    this._super(...arguments);
    this.uploads = [];
  },
  resetUploads(){
    this.set('uploads',[]);
  },
  actions:{
    onRemoveUpload(upload){
      this.get('uploads').removeObject(upload);
    },
    uploadImageToChatAction(file){
      this.uploadImageToChat(file);
    }
  },
  uploadImageToChat(file) {
    let upload = {file: file, state: 0};
    this.get('uploads').addObject(upload);
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
          setTimeout(function () {
           $('.newMessageHolder .ember-content-editable').focus();
          }, 1000);
      });
    });
  }
});
