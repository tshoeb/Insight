// import { AppStateProvider } from 'ui/state_management/app_state';
import { uiModules } from 'ui/modules'
const module = uiModules.get('kibana/vizfilt', ['kibana'], ['elasticsearch']);

// const module = uiModules.get('kibana/vizfilt', ['kibana'], ['elasticsearch']);

export class FilterProcessor {
	constructor(index, filterManager){
		this.index = index;
		console.log("initialized");
		this.filterManager = filterManager;
	}

	putfilters(thefilterdata){

		// console.log("putfilters function called");

		// var checkit = module.controller('filterbaradding', (Private, thefilterdata) => {
		// 	console.log("in the controller");
		// 	const filterManager = Private(FilterManagerProvider);
		// 	for (var j=0; j < thefilterdata.length; j++){
		// 		filterManager.add(thefilterdata[j]['attr'], thefilterdata[j]['key'], "is", this.index);
		// 	}
		// });

		// console.log(checkit);
		// console.log(thefilterdata);
		for (var j=0; j < thefilterdata.length; j++){
			this.filterManager.add(thefilterdata[j]['attr'], thefilterdata[j]['key'], "is", this.index);
		}
		console.log("i am done");
		// this.gettinit = module.service('client', function (Private){
		// 	const appState = Private(AppStateProvider);
		// 	var appStatus = appState.getAppState();
		// 	console.log("##########")
		// 	console.log(appStatus.query);
		// 	return appStatus.query;
		// });
		// console.log("##########")
		// console.log(this.gettinit);
	}
}