import { Utils } from './utils';
import { uiModules } from 'ui/modules';
import { timefilter } from 'ui/timefilter';
// import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';

// const module = uiModules.get('kibana/vizfilt', ['kibana'], ['elasticsearch']);
// const queryfilter = FilterBarQueryFilterProvider;
// console.log(queryfilter);
// var currentfilter = queryfilter.getFilters();

// module.service('client', function (esFactory) {
//   return esFactory({
//     host: 'localhost:9200',
//     apiVersion: 'master',
//     log: 'trace'
//   });
// });

// console.log(module.service('client'))

export class QueryProcessor {

	constructor(index, attributes, realdata, checker, timefilter, es, dashboardContext){
		this.index = index;
		this.attributes= attributes;
		this.realdata = realdata;
		this.checker=checker;
		this.timefilter = timefilter;
		this.es = es;
		this.dashboardContext = dashboardContext;
	}

	async processAsync() {
	    // try {
	    //   await this._processAsync();
	    // } catch (err) {
	    //   // if we reject current promise, it will use the standard Kibana error handling
	    //   this.error = Utils.formatErrorToStr(err);
	    // }
	    await this._processAsync();
	    return this;
	}

	async _processAsync(){
		var tempdata = [];
		var timeattrs = this.timefilter.getBounds();
		var min = timeattrs.min.valueOf();
		var max = timeattrs.max.valueOf();
		console.log(this.dashboardContext());
		await this.getdata(this.attributes, tempdata, min, max);
		this.realdata = tempdata;
	}

	async getdata(attributes, tempdata, min, max){
		var temp = [];
		for (const current_value of attributes) {
		    var current_attribute = current_value.attr;
		    var current_topn = current_value.topn;

			await this._runes(current_attribute, current_topn, tempdata, min, max);
		}
	}

	async _runes(attr,topn, tempdata, min, max){
		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"query": {
		            "bool": {
		                "filter": {
		                    "range": {
		                        "epoch": {
		                            "gte": min,
		                            "lte": max
		                        }
		                    }
		                }
		            }
		        },
		  		"aggs" : {
			        "attr" : {
			            "terms" : {
			                "field" : attr,
			                "size" : topn,
			                "order" : { "_count" : "desc" }
			            }
			        }
			    }
		  	}
		}).then(function(result) {
			console.log("Data Pusher")
			tempdata.push({
			    key: attr,
			    value: result['aggregations']['attr']['buckets']
			});
		});
	}
}

