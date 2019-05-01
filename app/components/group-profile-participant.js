import Component from '@ember/component';
import {computed} from '@ember/object';
export default Component.extend({
	profilePic:computed('model', function(){
		
		let profilePic =  this.get('model.ProfilePic');
		if (!profilePic || profilePic.length === 0) {
	      profilePic = '/assets/monalisa.png'
	    } 
	    return profilePic;
	}),
});
