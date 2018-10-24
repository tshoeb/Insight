// import { AppStateProvider } from 'ui/state_management/app_state';
// import { uiModules } from 'ui/modules'

// const module = uiModules.get('kibana/vizfilt', ['kibana'], ['elasticsearch']);

export class FilterProcessor {
	constructor(index, filterManager){
		this.index = index;
		this.filterManager = filterManager;
	}

	putfilters(thefilterdata){
		for (var j=0; j < thefilterdata.length; j++){
			this.filterManager.add(thefilterdata[j]['attr'], thefilterdata[j]['key'], "", this.index);
		}
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