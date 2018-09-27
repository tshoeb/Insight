import { AppStateProvider } from 'ui/state_management/app_state';
import { uiModules } from 'ui/modules'

const module = uiModules.get('kibana/vizfilt', ['kibana'], ['elasticsearch']);

export class FilterProcessor {
	constructor(){
		this.gettinit = "";
	}

	getfilters(){
		this.gettinit = module.service('client', function (Private){
			const appState = Private(AppStateProvider);
			var appStatus = appState.getAppState();
			console.log("##########")
			console.log(appStatus.query);
			return appStatus.query;
		});
		// console.log("##########")
		// console.log(this.gettinit);
	}
}