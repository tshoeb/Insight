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

	constructor(index, attributes, realdata, filtervals, timefilter, es, dashboardContext){
		this.index = index;
		this.attributes= attributes;
		this.realdata = realdata;
		//this.checker=checker;
		this.timefilter = timefilter;
		this.es = es;
		this.dashboardContext = dashboardContext;
		this.filtervals = filtervals;
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
		await this.getdata(this.attributes, tempdata, min, max, this.filtervals);
		this.realdata = tempdata;
	}

	async getdata(attributes, tempdata, min, max, filtervals){
		//var temp = [];
		for (const current_value of attributes) {
		    var current_attribute = current_value.attr;
		    var current_topn = current_value.topn;

		    var fqdata = [];
		    var exlist = [];
		    var filtervals_json = this.jsoner_filter(filtervals);

			//fqdata = this._runes(current_attribute, current_topn, min, max);
			await this._runes(current_attribute, current_topn, min, max, filtervals_json).then(function(result) {
			    fqdata = result;
			});
			// console.log("i am fqdata");
			// console.log(fqdata);
			exlist = this.jsoner(fqdata, current_attribute);
			// console.log("i am exlist");
			// console.log(exlist);
			await this._runes_others(current_attribute, fqdata, min, max, exlist, filtervals_json);//, tempdata);

			if (filtervals.length != 0){
				await this._runes_filter(current_attribute, fqdata, min, max, filtervals_json, tempdata);
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

	jsoner_filter(filtervals){
		var filtervals_json = [];
		for (var j=0; j < filtervals.length; j++){
			var bucketitem = filtervals[j];
			var attr_nm = bucketitem['attr'];
			var attr_key = bucketitem['key'];
			var tempdict = {};
			tempdict[attr_nm] = attr_key;
			var tempquery = {};
			tempquery["match"] = tempdict;
			filtervals_json.push(tempquery);
		}
		return filtervals_json;
	}

	async _runes(attr, topn, min, max, filtervals){
		var datatopass = [];
		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"query": {
		            "bool": {
		            	"must_not": filtervals,
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

	async _runes_others(attr, fqdata, min, max, exlist, filtervals){//, tempdata){
		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"size": 0,
		  		"query": {
		            "bool": {
		            	"must_not": exlist,
		            	//"must_not": filtervals,//[
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

			// tempdata.push({
			//     key: attr,
			//     value: fqdata
			// });
		});
	}

	async _runes_filter(attr, fqdata, min, max, filtervals, tempdata){
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
				tempdict ['key'] = "_" + resultlist[q]['key'];
				tempdict['doc_count'] = resultlist[q]['doc_count'];
				fqdata.push(tempdict);
			}
		});
	}
}

