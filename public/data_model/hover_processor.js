export class HoverProcessor {
	constructor(visData){
		this.index = visData['index'];
		// this.timefilter = visData['timefilter'];
		// this.timefield =  visData['timefield'];
		this.es = visData['es'];
		this.ogdata = visData['realdata'];
		this.timefield = visData['timefield'];
		this.timefunc = visData['timefunc'];
	}

	async getrelations(attr_name, attr_val){
		//var timeattrs = this.timefilter.getBounds();
		// var min = timeattrs.min.valueOf();
		// var max = timeattrs.max.valueOf();
		var timedata= this.timefunc.createtimefilter(this.timefield);
		var data = {};
		for (var j=0; j < this.ogdata.length; j++){
		    var arrayItem = this.ogdata[j]
		    var c_attr_name = arrayItem['key'];
		    if (c_attr_name != attr_name){
			    var refinedata0 = arrayItem['value'];
			    var currentbar = {};
			    for (var p=0; p < refinedata0.length; p++){
			    	var dataItem = refinedata0[p];
			        var c_attr_val =  dataItem['key'];
			        var filterlist = [];
			        if(String(attr_val).includes('others') == false && String(attr_val).includes('_') == false){
				        if (String(c_attr_val).includes('others') == false && String(c_attr_val).includes('_') == false){
					        var exlist = this.jsoner(attr_name, attr_val, c_attr_name, c_attr_val);
					        var doc_count = "";
					        await this._runes_relation(c_attr_name, exlist, timedata, filterlist).then(function(result) {
							    doc_count = result;
							});
					        var og_doc_count = dataItem['doc_count'];
					        currentbar[String(c_attr_val)] = doc_count/parseFloat(og_doc_count);
					    }
					    if (String(c_attr_val).includes('others') == true){
					    	filterlist = this.jsoner_others(c_attr_name);
					    	var exlist = this.jsoner(attr_name, attr_val, "none", c_attr_val);
					        var doc_count = "";
					        await this._runes_relation(c_attr_name, exlist, timedata, filterlist).then(function(result) {
							    doc_count = result;
							});
					        var og_doc_count = dataItem['doc_count'];
					        currentbar[String(c_attr_val)] = (doc_count/parseFloat(og_doc_count));
					    }
					}
					if(String(attr_val).includes('others') == true){
						if (String(c_attr_val).includes('others') == false && String(c_attr_val).includes('_') == false){
					        var exlist = this.jsoner(c_attr_name, c_attr_val, "none", "none");
					        filterlist = this.jsoner_others(attr_name);
					        var doc_count = "";
					        await this._runes_relation(c_attr_name, exlist, timedata, filterlist).then(function(result) {
							    doc_count = result;
							});
					        var og_doc_count = dataItem['doc_count'];
					        currentbar[String(c_attr_val)] = doc_count/parseFloat(og_doc_count);
					    }
					    if (String(c_attr_val).includes('others') == true){
					    	//console.log("yellow");
					    	var filterlist1 = this.jsoner_others(c_attr_name);
					    	var filterlist2 = this.jsoner_others(attr_name);
					    	filterlist = filterlist1.concat(filterlist2)
					    	var exlist = [];
					        var doc_count = "";
					        await this._runes_relation(c_attr_name, exlist, timedata, filterlist).then(function(result) {
							    doc_count = result;
							});
					        var og_doc_count = dataItem['doc_count'];
					        currentbar[String(c_attr_val)] = (doc_count/parseFloat(og_doc_count));
					    }
					}
				}
				data[c_attr_name] = currentbar;
		    }
	    }
    	return data;
	}

	// createtimefilter(min, max){
	// 	var tempdict = {};
	// 	var tempdict1= {};
	// 	tempdict1["gte"] = min;
	// 	tempdict1["lte"] = max;
	// 	tempdict[this.timefield] = tempdict1;
	// 	return tempdict;
	// }

	jsoner(attr_name, attr_val, c_attr_name, c_attr_val){
		var exlist = [];

		var tempdict = {};
		tempdict[attr_name] = attr_val;
		var tempquery = {};
		tempquery["match"] = tempdict;
		exlist.push(tempquery);

		if(c_attr_name != "none"){
			var tempdict2 = {};
			tempdict2[c_attr_name] = c_attr_val;
			var tempquery2 = {};
			tempquery2["match"] = tempdict2;
			exlist.push(tempquery2);
		}

		return exlist;
	}

	jsoner_others(c_attr_name){
		var filterlist = [];
		for (var a=0; a < this.ogdata.length; a++){
			if (c_attr_name == this.ogdata[a]['key']){
				var ogattrarray = this.ogdata[a]['value'];
			}
		}

		for (var g=0; g < ogattrarray.length; g++){
			if (String(ogattrarray[g]['key']).includes('others') == false){
				//console.log(ogattrarray[g]['key']);
				var tempdict = {};
				tempdict[c_attr_name] = ogattrarray[g]['key'];
				var tempquery = {};
				tempquery["match"] = tempdict;
				filterlist.push(tempquery);
			}
		}

		return filterlist;
	}

	async _runes_relation(c_attr_name, exlist, timedata, filterlist){
		var datatogive = "";

		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"size": 0,
		  		"query": {
		            "bool": {
		            	"must": exlist,
		            	"must_not": filterlist,
		                "filter": {
		                    "range": timedata
		                }
		            }
		        },
		  		"aggs" : {
			        "attr" : {
			            "terms" : {
			                "field" : c_attr_name,
			                "size" : 2147483647
			            }
			        }
			    }
		  	}
		}).then(function(result) {
			datatogive = result['hits']['total'];
		});
		return datatogive;
	}
}