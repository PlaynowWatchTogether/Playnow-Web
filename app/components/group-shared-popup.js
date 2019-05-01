import Component from '@ember/component';
import $ from 'jquery';
import {debug} from '@ember/debug'
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend({
	store: service(),
	db: service(),
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
	attachments: computed('lastAttachmentUpdate', function(){
		return this.get('store').peekAll('chat-attachment').filter((elem)=>{
			return elem.get('convId') === this.get('model.chat_id');
		});
	}),
	// title: computed('dataSource', function(){
	// 	const ds = this.get('dataSource');
	// 	if (!ds){
	// 		return '';
	// 	}
	// 	return this.get('store').peekRecord('group', this.get('dataSource').convId()).get('GroupName');
	// }),
	profilePic:computed('dataSource', function(){
		const ds = this.get('dataSource');
		if (!ds){
			return ''; 
		}
		let profilePic =  this.get('store').peekRecord('group', this.get('dataSource').convId()).get('ProfilePic');
		if (!profilePic || profilePic.length === 0) {
	      profilePic = '/assets/monalisa.png'
	    } 
	    return profilePic;
	}),
	actions:{
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
