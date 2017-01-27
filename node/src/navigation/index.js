const log = require('@financial-times/n-logger').default;

const NavigationModelV1 = require('./navigationModelV1');
const NavigationModelV2 = require('./navigationModelV2');

let navigationModelV1;
let navigationModelV2;

module.exports = {
	init: options => {
		console.log('init', options);
		navigationModelV1 = new NavigationModelV1(options);
		navigationModelV2 = new NavigationModelV2(options);

		return Promise.all([navigationModelV1.init(), navigationModelV2.init()]);
	},
	middleware : (req, res, next) => {
		if(res.locals.flags.origamiNavigation){
			log.info({event:'NAVIGATION_DATA', source:'Origami'});
			return navigationModelV2.middleware(req, res, next);
		}else{
			log.info({event:'NAVIGATION_DATA', source:'Next'});
			return navigationModelV1.middleware(req, res, next);
		}
	}
}
