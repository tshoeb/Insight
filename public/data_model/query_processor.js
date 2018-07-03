import { Utils } from './utils';
import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/vizfilt', ['kibana'], ['elasticsearch']);

// module.service('client', function (esFactory) {
//   return esFactory({
//     host: 'localhost:9200',
//     apiVersion: 'master',
//     log: 'trace'
//   });
// });

// console.log(module.service('client'))

export class QueryProcessor {

	constructor(index, attributes, es){
		this.index = index;
		this.attributes= attributes;
		this.realdata = [];
		this.es = es;
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
		this._getdata();
	}

	_getdata(){
		var arrayLength = this.attributes.length;
		var temp = [];
		for (var i = 0; i < arrayLength; i++) {
		    var current_value = this.attributes[i];
		    var current_attribute = current_value.attr;
		    var current_topn = current_value.topn;
		    //console.log("yo. yo start with " + i)

		  //   uiModules.get('kibana', 'elasticsearch')
				// .run(function (es) {
				// 	console.log("yo. yo start elasting ")
				  this.es.search({
				  	"index": this.index,
				  	"body": {
				  		"aggs" : {
					        "attr" : {
					            "terms" : {
					                "field" : current_attribute,
					                "size" : current_topn
					            }
					        }
					    }
				  	}
				  })
				  .then(function (body){
				  	console.log("working");
				  	//console.log(body['aggregations']['attr']['buckets']);
				  	temp.push({
					    key: current_attribute,
					    value: body['aggregations']['attr']['buckets']
					});
				  });
				  // .catch(err => {
				  //   console.log('error pinging servers');
				  // });
				// });
		}
		this.realdata = temp;
	}
}

