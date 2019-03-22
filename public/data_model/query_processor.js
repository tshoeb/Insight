import { uiModules } from 'ui/modules';
import { timefilter } from 'ui/timefilter';
import { luceneStringToDsl, migrateFilter } from 'ui/courier';

const lucenequeryparser = require('lucene-query-parser');

export class QueryProcessor {

	constructor(index, attributes, colorlist, rectorder, tableoption, timefield, timefunc, realdata, filtervals, shouldvals, es, dashboardContext, filterBar, getAppState, filterManager){
		this.index = index;
		this.attributes= attributes;
		this.colorlist = colorlist;
		this.rectorder = rectorder;
		this.tableoption = tableoption;
		this.timefield = timefield;
		this.timefunc = timefunc;
		this.realdata = realdata;
		this.timefilter = timefilter;
		this.es = es;
		this.dashboardContext = dashboardContext();
		this.filtervals = filtervals;
		this.shouldvals = shouldvals;
		this.filterBar = filterBar;
		this.getAppState = getAppState;
		this.filterManager = filterManager;
	}

	async processAsync() {
	    await this._processAsync();
	    return this;
	}

	async _processAsync(){
		var tempdata = [];
		// var timeattrs = this.timefilter.getBounds();
		// var min = timeattrs.min.valueOf();
		// var max = timeattrs.max.valueOf();
		// var timedata= this.createtimefilter(min, max);
		//console.log(timedata);
		var timedata = this.timefunc.createtimefilter(this.timefield);
		await this.getdata(this.attributes, tempdata, timedata, this.filtervals, this.shouldvals, this.dashboardContext);
		this.realdata = tempdata;
	}

	async getdata(attributes, tempdata, timedata, filtervals, shouldvals, dashboardContext){
		var filterlist = [];
		var shouldlist = [];
		this.filterBarData();
		this.querycourier(dashboardContext);
		var filtervals_json = this.jsoner_filter(filtervals, filterlist);
		var shouldvals_json = this.jsoner_filter(shouldvals, shouldlist);
		for (const current_value of attributes) {
		    var current_attribute = current_value.attr;
		    var current_topn = current_value.topn;

		    var fqdata = [];
		    var exlist = [];
		    
		    if (filtervals.length == 0 && shouldvals.length == 0){
				await this._runes(current_attribute, current_topn, timedata, fqdata, filtervals_json, shouldvals_json, 0)
				exlist = this.jsoner(fqdata, current_attribute);
				await this._runes_others(current_attribute, fqdata, timedata, exlist, filtervals_json, shouldvals_json, 0);
			}

			if (filtervals.length != 0 || shouldvals.length != 0){

				if (filterlist.includes(current_attribute) || shouldlist.includes(current_attribute)){ 
					await this._runes_filter(current_attribute, fqdata, timedata, filtervals_json, shouldvals_json, shouldvals.length > 0 ? 1 : 0);
				} else{
					await this._runes(current_attribute, current_topn, timedata, fqdata, filtervals_json, shouldvals_json, shouldvals.length > 0 ? 1 : 0)
					exlist = this.jsoner(fqdata, current_attribute);
					await this._runes_others(current_attribute, fqdata, timedata, exlist, filtervals_json, shouldvals_json, shouldvals.length > 0 ? 1 : 0);
				}
				
			}

			tempdata.push({
			    key: current_attribute,
			    value: fqdata
			});
		}
	}

	// createtimefilter(min, max){
	// 	var tempdict = {};
	// 	var tempdict1= {};
	// 	tempdict1["gte"] = min;
	// 	tempdict1["lte"] = max;
	// 	tempdict[this.timefield] = tempdict1;
	// 	return tempdict;
	// }

	filterBarData(){
  		var filterbardata = this.filterBar.getFilters();
  		console.log(filterbardata);
  		for (var j=0; j < filterbardata.length; j++){
  			var tempdict = {};
	        tempdict['attr'] = filterbardata[j]['meta']['key'];
	        tempdict['key'] = filterbardata[j]['meta']['value'];
	        this.filtervals.push(tempdict);
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

	querycourier(dashboardContext){
		var fromquerybar = dashboardContext['bool']['must'][0];
		if (fromquerybar['query_string'] != undefined){
			var qd = fromquerybar['query_string']['query'];
			var results = lucenequeryparser.parse(qd);
			this.lcparser(results);
		}
	}

	lcparser(results){
		var tempdict = {}
        tempdict['attr'] = results['left']['field'];
        tempdict['key'] = results['left']['term'];
        if(results['right']){
        	if(results['operator'] == "AND"){
        		this.filtervals.push(tempdict);
        	}
        	if(results['operator'] == "OR"){
        		this.shouldvals.push(tempdict);
        	}
	        if (results['right']['operator'] != undefined){
	        	if(results['right']['operator'] == "AND"){
	        		this.lcparser(results['right']);
	        	}
	        	if(results['right']['operator'] == "OR"){
					this.lcparsershould(results['right']);
	        	}
	        } else{
	        	var tempdict2 = {}
		        tempdict2['attr'] = results['right']['field'];
		        tempdict2['key'] = results['right']['term'];
		        if(results['operator'] == "AND"){
        			this.filtervals.push(tempdict2);
	        	}
	        	if(results['operator'] == "OR"){
	        		this.shouldvals.push(tempdict2);
	        	}
	        }
	    } else {
	    	this.filtervals.push(tempdict);
	    }
	}

	lcparsershould(results){
		var tempdict = {}
        tempdict['attr'] = results['left']['field'];
        tempdict['key'] = results['left']['term'];
        this.shouldvals.push(tempdict);
        if(results['right']){
	        if (results['right']['operator'] != undefined){
	        	this.lcparsershould(results['right']);
	        } else{
	        	var tempdict2 = {}
		        tempdict2['attr'] = results['right']['field'];
		        tempdict2['key'] = results['right']['term'];
		        this.shouldvals.push(tempdict2);
	        }
	    } 
	}


	jsoner_filter(filtervals, filterlist){
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
		return filtervals_json;
	}

	async _runes(attr, topn, timedata, fqdata, filtervals, shouldvals, mnum){
		var datatopass = [];
		var order = this.rectorder;
		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"query": {
		            "bool": {
		            	"minimum_should_match": mnum,
		            	"should": shouldvals,
		            	"must": filtervals,
		                "filter": {
		                    "range": timedata
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

			if (order == "descending"){
				for (var q=resultlist.length-1; q >= 0; q--){
					var tempdict = {};
					tempdict ['key'] = resultlist[q]['key'];
					tempdict['doc_count'] = resultlist[q]['doc_count'];
					fqdata.push(tempdict);
				}
			} else {
				for (var q=0; q < resultlist.length; q++){
					var tempdict = {};
					tempdict ['key'] = resultlist[q]['key'];
					tempdict['doc_count'] = resultlist[q]['doc_count'];
					fqdata.push(tempdict);
				}
			}

		});
	}

	async _runes_others(attr, fqdata, timedata, exlist, filtervals, shouldvals, mnum){
		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"size": 0,
		  		"query": {
		            "bool": {
		            	"minimum_should_match": mnum,
		            	"must_not": exlist,
		            	"should": shouldvals,
		            	"must": filtervals,
		                "filter": {
		                    "range": timedata
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

	async _runes_filter(attr, fqdata, timedata, filtervals, shouldvals, mnum){
		var order = this.rectorder;
		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"size": 0,
		  		"query": {
		            "bool": {
		            	"minimum_should_match": mnum,
		            	"should": shouldvals,
		            	"must": filtervals,
		                "filter": {
		                    "range": timedata
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
			var resultlist= result['aggregations']['attr']['buckets'];

			if (order == "descending"){
				for (var q=resultlist.length-1; q >= 0; q--){
					var tempdict = {};
					tempdict ['key'] = resultlist[q]['key'];
					tempdict['doc_count'] = resultlist[q]['doc_count'];
					fqdata.push(tempdict);
				}
			} else {
				for (var q=0; q < resultlist.length; q++){
					var tempdict = {};
					tempdict ['key'] = resultlist[q]['key'];
					tempdict['doc_count'] = resultlist[q]['doc_count'];
					fqdata.push(tempdict);
				}
			}
		});
	}
}

