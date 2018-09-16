export class HoverProcessor {
	constructor(visData){
		// this.attr_name = attr_name;
		// this.attr_val= attr_val;
		// this.xData= xData;
		// this.visData=visData;
		this.index = visData['index'];
		this.timefilter = visData['timefilter'];
		this.es = visData['es'];
		this.ogdata = visData['realdata'];
		// this.dashboardContext = dashboardContext;
	}

	async getrelations(attr_name, attr_val){
		var timeattrs = this.timefilter.getBounds();
		var min = timeattrs.min.valueOf();
		var max = timeattrs.max.valueOf();
		var data = {};
		for (var j=0; j < this.ogdata.length; j++){
		    var arrayItem = this.ogdata[j]
		    var c_attr_name = arrayItem['key'];//attrs[j]['attr'];
		    if (c_attr_name != attr_name){
		    	console.log("i do come here");
			    var refinedata0 = arrayItem['value'];
			    var currentbar = {};
			    //var currentbar = {'attribute': c_attr_name};
			    for (var p=0; p < refinedata0.length; p++){
			    	var dataItem = refinedata0[p];
			    //refinedata0.forEach(async function (dataItem){
			        var c_attr_val =  dataItem['key'];
			        if (String(c_attr_val).includes('others') == false){
				        var exlist = this.jsoner(attr_name, attr_val, c_attr_name, c_attr_val);
				        //console.log(exlist);
				        var doc_count = "";
				        await this._runes_relation(c_attr_name, exlist, min, max).then(function(result) {
						    doc_count = result;
						});
				        var og_doc_count = dataItem['doc_count'];
				        //xData.push(dataItem['key']);
				        // var currentbar = {'attribute': attr};
				        currentbar[String(c_attr_val)] = doc_count/parseFloat(og_doc_count);
				        //data.push(currentbar);
				    }
			    //});
				}
				data[c_attr_name] = currentbar;
		    	//data.push(currentbar);
		    }
	    }
	    console.log(data);
    	return data;
	}

	jsoner(attr_name, attr_val, c_attr_name, c_attr_val){
		var exlist = [];

		var tempdict = {};
		tempdict[attr_name] = attr_val;
		var tempquery = {};
		tempquery["match"] = tempdict;
		exlist.push(tempquery);

		var tempdict2 = {};
		tempdict2[c_attr_name] = c_attr_val;
		var tempquery2 = {};
		tempquery2["match"] = tempdict2;
		exlist.push(tempquery2);

		return exlist;
	}

	async _runes_relation(c_attr_name, exlist, min, max){
		var datatogive = "";

		var temp = await this.es.search({
			"index": this.index,
		  	"body": {
		  		"size": 0,
		  		"query": {
		            "bool": {
		            	"must": exlist,
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