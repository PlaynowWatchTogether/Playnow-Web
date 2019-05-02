import Controller from '@ember/controller';
import FileUploadHelper from '../../mixins/file-upload-helper';
import {inject as service} from '@ember/service';
import {debug} from '@ember/debug';

export default Controller.extend(FileUploadHelper, {
	firebaseApp: service(),
	actions:{
		uploadGroupImage(file){
			let ref = this.firebaseApp.storage().ref('Media/Files/' + this.get('firebaseApp').auth().currentUser.uid + "/" + this.generateUUID() + file.name);
			const uploadTask = ref.put(file.blob);
			uploadTask.on('state_changed', (snapshot)=>{
				
			}, (error)=>{
				
			}, ()=>{
				uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {            
				    // ds.sendMessage('', downloadURL, null, true);
				    //ds.sendAttachment(file, downloadURL, id);
				    debug(`File available at ${downloadURL}`);
				    this.set('profilePic', downloadURL);
				});
			});
		}
	}
});
