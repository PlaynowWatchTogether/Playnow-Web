import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({

	classNames: 'chat-upload-item',
	classNameBindings:['isNew:new','isLoading:loading','isCompleted:completed','isError:error'],
	humanFileSize(bytes, si) {
	    var thresh = si ? 1000 : 1024;
	    if(Math.abs(bytes) < thresh) {
	        return bytes + ' B';
	    }
	    var units = si
	        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
	        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
	    var u = -1;
	    do {
	        bytes /= thresh;
	        ++u;
	    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
	    return bytes.toFixed(1)+' '+units[u];
	},
	isNew: computed('model.state', function(){
		return this.get('model.state') === 0;
	}),
	isLoading: computed('model.state', function(){
		return this.get('model.state') === 1;
	}),
	isCompleted: computed('model.state', function(){
		return this.get('model.state') === 2;
	}),
	isError: computed('model.state', function(){
		return this.get('model.state') === 3;
	}),
	uploadProgress: computed('model.progress', function(){
		return this.get('model.progress');
	}),
	fileName: computed('model.file', function(){
		return this.get('model.file').name;
	}),
	fileSize: computed('model.file', function(){
		const size = this.get('model.file').size;
		return this.humanFileSize(size,false);
	}),
	actions:{
		removeItem(){
			this.get('onRemove')(this.get('model'));		
		}
	}
});
