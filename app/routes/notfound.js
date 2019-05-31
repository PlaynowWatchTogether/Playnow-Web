import Route from '@ember/routing/route';

export default Route.extend({
	beforeModel(){
		window.location="/404.html";
	}
});
