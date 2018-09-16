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
		//var temp = [];
		for (const current_value of attributes) {
		    var current_attribute = current_value.attr;
		    var current_topn = current_value.topn;

		    var fqdata = [];
		    var exlist = [];

			//fqdata = this._runes(current_attribute, current_topn, min, max);
			await this._runes(current_attribute, current_topn, min, max).then(function(result) {
			    fqdata = result;
			});
			// console.log("i am fqdata");
			// console.log(fqdata);
			exlist = this.jsoner(fqdata, current_attribute);
			// console.log("i am exlist");
			// console.log(exlist);
			await this._runes_others(current_attribute, fqdata, min, max, exlist, tempdata);
		}
	}

	jsoner(fqdata, current_attribute){
		var exlist = [];
		for (var j=0; j < fqdata.length; j++){
			var bucketitem = fqdata[j];
			var attr_key = bucketitem['key'];
			var tempdict = {};
			tempdict[current_attribute] = attr_key;
			var tempquery = {};
			tempquery["match"] = tempdict;
			exlist.push(tempquery);
		}
		return exlist;
	}

	async _runes(attr,topn, min, max){
		var datatopass = [];
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
			//console.log("Data Pusher")
			//fqdata = result['aggregations']['attr']['buckets'];
			datatopass = result['aggregations']['attr']['buckets'];
			//console.log("fq-inner");
			//console.log(fqdata);
			// tempdata.push({
			//     key: attr,
			//     value: result['aggregations']['attr']['buckets']
			// });
		});
		return datatopass;
	}

	async _runes_others(attr, fqdata, min, max, exlist, tempdata){
		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"size": 0,
		  		"query": {
		            "bool": {
		            	"must_not": exlist,//[
				          //{ "match": { "src_port" : "37182" }},
				          //{ "match": { "src_port" : "45406" }}
				        //],
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
			                "size" : 2147483647
			            }
			        }
			    }
		  	}
		}).then(function(result) {
			//console.log("Other Data Pusher")
			var tempotherdict = {};
			tempotherdict["key"] = attr+"_others";
			tempotherdict["doc_count"] = result['hits']['total'];
			fqdata.push(tempotherdict);

			tempdata.push({
			    key: attr,
			    value: fqdata
			});
		});
	}
}

