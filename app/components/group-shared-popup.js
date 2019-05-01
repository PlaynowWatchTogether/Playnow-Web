import Component from '@ember/component';
import $ from 'jquery';
import {debug} from '@ember/debug'
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import FileUploadHelper from '../mixins/file-upload-helper';
export default Component.extend(FileUploadHelper, {
	store: service(),
	db: service(),
	firebaseApp: service(),
	init(){
		this._super(...arguments);
		this.set('composeChips', []);
		this.addObserver('model', this, 'modelObserver');
		this.addObserver('dataSource', this, 'dsObserver');
		this.configureDataSource();
		this.set('isDisabled',true);
	},
	isAdmin:computed('model', function(){
		const chatId = this.get('model.chat_id');
		const groupId = chatId.split("@")[1];
		return this.get('db').myId() === groupId;
	}),
	dsObserver(obj){
		obj.configureDataSource();
	},
	configureDataSource(){
		const ds = this.get('dataSource');
		if (!ds){
			return;
		}
		ds.chatAttachments(this.get('store'), (update)=>{
			debug('got update');
			this.set('lastAttachmentUpdate', new Date().getTime());
		});
		ds.members((members)=>{
			this.set('members',members);
		});
		this.get('db').listenGroup(this.get('model.chat_id'), (group)=>{
			this.set('title', group.GroupName);
			let profilePic =group.ProfilePic;

			if (!profilePic || profilePic.length===0){
				profilePic = '/assets/monalisa.png';
			} 
			this.set('profilePic', profilePic);
			this.set('title', group.GroupName);
		})
	},
	modelObserver(obj) {
		debug('model changed in group-shared-popup');
	},
	didInsertElement(){
		this._super(...arguments);
		$(this.get('actionSelector')).on('click', ()=>{
			$(this.element).find('#groupSharedPopup').modal('show');
		});
	},
	attachments: computed('lastAttachmentUpdate','model', function(){
		return this.get('store').peekAll('chat-attachment').filter((elem)=>{
			return elem.get('convId') === this.get('model.chat_id');
		});
	}),	
	actions:{
		uploadGroupProfileImage(file){
			
			const myID = this.get('db').myId();
	        let metadata = {
	          cacheControl: 'public,max-age=86400'
	        };
	        let ref = this.firebaseApp.storage().ref('Media/Files/' + myID + "/" + this.generateUUID() + '.png');

	        ref.put(file.blob, metadata).then((snapshot) => {
	          snapshot.ref.getDownloadURL().then((downloadURL) => {	            
	            this.get('db').updateGroupPic(this.get('model.chat_id'),downloadURL);	            
	          });
	        });
		    
		},
		updateGroupName(){
			const newName = this.get('editableTitle');
			if (newName.length === 0){
				return;
			}
			const db = this.get('db');
			db.updateGroupName(this.get('model.chat_id'), newName).then(()=>{
				this.set('isDisabled',true);				
				this.notifyPropertyChange('title');
			});
		},
		toggleDisabled(){
			this.toggleProperty('isDisabled');
			this.set('editableTitle', this.get('title'));
		},
		addParticipants(){
			if (this.get('composeChips').length===0){
				return;
			}
			const chips = this.get('composeChips');
			const db = this.get('db');
			db.group(this.get('model.chat_id')).then((data)=>{
				db.addGroupMembers(data["id"],data["GroupName"],chips).then(()=>{
					this.set('composeChips',[]);		
				});
			});
			
			
		},
		onChipAdd(data) {
	      let exists = this.get('composeChips').filter((elem) => {
	        return elem['id'] === data['id'];
	      });
	      if (exists.length === 0) {
	        this.get('composeChips').pushObject(data);
	        this.notifyPropertyChange('composeChips');
	      }
	    },
	    onChipClick() {
	      let chips = this.get('composeChips');
	      chips.removeObject(chips.lastObject);
	      this.notifyPropertyChange('composeChips');
	    },
	}
});
