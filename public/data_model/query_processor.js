import { Utils } from './utils';

export class QueryProcessor {

	constructor(index, attribute, topn, order){
		this.index = index;
		this.attribute = attribute;
		this.topn = topn;
		this.order = order;
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
		var a =1;
	}
}

