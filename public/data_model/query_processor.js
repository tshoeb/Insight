import { Utils } from './utils';
import { uiModules } from 'ui/modules';
import { timefilter } from 'ui/timefilter';
import { luceneStringToDsl, migrateFilter } from 'ui/courier';
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

const lucenequeryparser = require('lucene-query-parser');

export class QueryProcessor {

	constructor(index, attributes, realdata, filtervals, timefilter, es, dashboardContext, getAppState){
		this.index = index;
		this.attributes= attributes;
		this.realdata = realdata;
		//this.checker=checker;
		this.timefilter = timefilter;
		this.es = es;
		this.dashboardContext = dashboardContext();
		this.filtervals = filtervals;
		this.getAppState = getAppState;
		//this.queryBarQuery = queryBarQuery;
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
		//console.log(this.dashboardContext());

		const appState = this.getAppState();
		// if (this.filtervals.length != 0){
		// 	appState.query = this.filtervals[0]['attr']+":"+this.filtervals[0]['key'];
		// }
		//var queryBarQuery = appState.query;
		// const query = luceneStringToDsl(queryBarQuery.query);
		// console.log("^^^^^^^^^^");
		// console.log(query);
		await this.getdata(this.attributes, tempdata, min, max, this.filtervals, this.dashboardContext);
		this.realdata = tempdata;
	}

	async getdata(attributes, tempdata, min, max, filtervals, dashboardContext){
		//var temp = [];
		var filterlist = [];
		var filtervals_json = this.jsoner_filter(filtervals, filterlist, dashboardContext);
		for (const current_value of attributes) {
		    var current_attribute = current_value.attr;
		    var current_topn = current_value.topn;

		    var fqdata = [];
		    var exlist = [];
		    
		    if (filtervals.length == 0){
				await this._runes(current_attribute, current_topn, min, max, fqdata, filtervals_json)
				exlist = this.jsoner(fqdata, current_attribute);
				await this._runes_others(current_attribute, fqdata, min, max, exlist, filtervals_json);
			}

			if (filtervals.length != 0){

				if (filterlist.includes(current_attribute)){ 
					await this._runes_filter(current_attribute, fqdata, min, max, filtervals_json);
				} else{
					await this._runes(current_attribute, current_topn, min, max, fqdata, filtervals_json)
					exlist = this.jsoner(fqdata, current_attribute);
					await this._runes_others(current_attribute, fqdata, min, max, exlist, filtervals_json);
				}
				
			}

			tempdata.push({
			    key: current_attribute,
			    value: fqdata
			});
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

	jsoner_filter(filtervals, filterlist, dashboardContext){
		var fromquerybar = dashboardContext['bool']['must'][0];
		if (fromquerybar['query_string'] != undefined){
			filtervals=[];
			var qd = fromquerybar['query_string']['query'];
			var results = lucenequeryparser.parse(qd);
			var tempdict = {}
	        tempdict['attr'] = results['left']['field'];
	        tempdict['key'] = results['left']['term'];
	        filtervals.push(tempdict);
	        if(results['right']){
	        	var tempdict2 = {}
		        tempdict2['attr'] = results['right']['field'];
		        tempdict2['key'] = results['right']['term'];
		        filtervals.push(tempdict2);
	        }
		}
		var filtervals_json_text = "";
		var filtervals_json = [];
		for (var j=0; j < filtervals.length; j++){
			var bucketitem = filtervals[j];
			var attr_nm = bucketitem['attr'];
			filterlist.push(attr_nm);
			var attr_key = bucketitem['key'];
			var tempdict = {};
			tempdict[attr_nm] = attr_key;
			var tempquery = {};
			tempquery["match"] = tempdict;
			filtervals_json.push(tempquery);
		}
		// if(filtervals_json.length > 1){
		// 	filtervals_json_text = "["+JSON.stringify(filtervals_json[0]) + ",\n" + JSON.stringify(filtervals_json[1])+"]";
		// 	console.log(filtervals_json_text);
		// 	return filtervals_json_text;
		// }
		// else{
		// 	return filtervals_json;
		// }
		//console.log(filtervals_json);
		console.log(filtervals_json);
		return filtervals_json;
	}

	async _runes(attr, topn, min, max, fqdata, filtervals){
		var datatopass = [];
		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"query": {
		            "bool": {
		            	"must": filtervals,
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
			var resultlist= result['aggregations']['attr']['buckets'];
			
			for (var q=0; q < resultlist.length; q++){
				var tempdict = {};
				//tempdict ['key'] = "_" + resultlist[q]['key'];
				tempdict ['key'] = resultlist[q]['key'];
				tempdict['doc_count'] = resultlist[q]['doc_count'];
				fqdata.push(tempdict);
			}
		});
	}

	async _runes_others(attr, fqdata, min, max, exlist, filtervals){//, tempdata){
		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"size": 0,
		  		"query": {
		            "bool": {
		            	"must_not": exlist,
		            	"must": filtervals,
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
			var tempotherdict = {};
			tempotherdict["key"] = attr+"_others";
			tempotherdict["doc_count"] = result['hits']['total'];
			fqdata.push(tempotherdict);
		});
	}

	async _runes_filter(attr, fqdata, min, max, filtervals){
		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"size": 0,
		  		"query": {
		            "bool": {
		            	"must": filtervals,//[
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
			var resultlist= result['aggregations']['attr']['buckets'];
			
			for (var q=0; q < resultlist.length; q++){
				var tempdict = {};
				//tempdict ['key'] = "_" + resultlist[q]['key'];
				tempdict ['key'] = resultlist[q]['key'];
				tempdict['doc_count'] = resultlist[q]['doc_count'];
				fqdata.push(tempdict);
			}
		});
	}
}

