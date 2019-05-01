import DS from 'ember-data';
import {computed} from '@ember/object';
const {attr} = DS;

export default DS.Model.extend({
	convId: attr('string'),
	url: attr('string'),
	date: attr('number'),
	type: attr('string'),
	size: attr('number'),
	name: attr('string')	
});
