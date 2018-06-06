import { Utils } from './utils';
import { uiModules } from 'ui/modules';

export class QueryProcessor {

	constructor(index, attributes){
		this.index = index;
		this.attributes= attributes;
	}

	async processAsync() {
	    try {
	      await this._processAsync();
	    } catch (err) {
	      // if we reject current promise, it will use the standard Kibana error handling
	      this.error = Utils.formatErrorToStr(err);
	    }
	    return this;
	  }

	async _processAsync(){
		var arrayLength = this.attributes.length;
		for (var i = 0; i < arrayLength; i++) {
		    var current_value = this.attributes[i];
		    var current_attribute = current_value.attr;
		    var current_topn = current_value.topn;
		}
		var test = uiModules.get('kibana')
		.run(function (es) {
		  es.search({
		  	index: this.index,
		  	body: {
		  		aggs : {
			        attr : {
			            terms : {
			                field : current_attribute,
			                size : current_value
			            }
			        }
			    }
		  	}
		  }).then(function (body){
		  	console.log(body);
		  });
		  // .catch(err => {
		  //   console.log('error pinging servers');
		  // });
		});
		console.log(test);
	}
}

