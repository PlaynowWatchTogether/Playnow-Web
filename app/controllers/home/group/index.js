import Controller from '@ember/controller';
import FileUploadHelper from '../../../mixins/file-upload-helper';
import {inject as service} from '@ember/service';
import {debug} from '@ember/debug';
import FeedGroupSource from '../../../custom-objects/feed-group-source';

export default Controller.extend(FileUploadHelper, {
	firebaseApp: service(),
	db: service(),
	init(){
		this._super(...arguments);
		this.reset();
		this.groupSource = FeedGroupSource.create({
			db:this.get('db'),
			firebaseApp: this.get('firebaseApp')});
	},
	reset(){
		this.set('errors',{});
		this.set('channelName','');
		this.set('channelDescription','');
		this.set('channelLocation',null);
		this.set('profilePic',null);
	},
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
		},
		channelLocationChanged(location){
			this.set('channelLocation',{
				lat:location.geometry.location.lat(),
				lng:location.geometry.location.lng()
			});
		},
		createFeed(){
			this.set('errors',{});
			const name = this.get('channelName');
			if (!name || name.length === 0){
				this.set('errors.name','Should not be blank')
				return;
			}
			const desc = this.get('channelDescription');
			if (!desc || desc.length === 0){
				this.set('errors.description','Should not be blank')
				return;
			}
			if (!this.get('channelLocation')){
				this.set('errors.location','Should not be blank')
				return;
			}
			this.groupSource.createGroup({
				ProfilePic: this.get('profilePic')||'',
				GroupName: name,
				GroupDescription: desc,
				GroupAccess: this.get('isPublic')?1:0
			},this.get('channelLocation')).then((channel)=>{
				this.transitionToRoute('home.group.show',{group_id: channel.id});
			}).catch((error)=>{
				this.set('errors.create','Failed to create group');
			});
		}
	}
});
