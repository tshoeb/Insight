import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/vizfilt', ['kibana'], ['elasticsearch']);

module.service('client', function (esFactory) {
  return esFactory({
    host: 'localhost:9200',
    apiVersion: 'master',
    log: 'trace'
  });
});

module.controller('VizfiltOptionsController', ($scope, client, esFactory) => {
	var indexlist = [];

	client.cat.indices({
		h: ['index']
	}).then(function (body) {
		var index = body.split("\n");
		var i;
		for (i = 0; i < index.length; i++) { 
		    if(index[i] != '.kibana' && index[i] != ''){
		    	indexlist.push(index[i]);
		    }
		}
		// console.log(indexlist);
		$scope.idlist = indexlist;
	});

	client.indices.getMapping({
		index: indexlist
	}).then(function (body) {
		for (var key in body) {
			if(key != '.kibana'){
				console.log(key);
				console.log(body[key]['mappings']['requests']['properties']);
			}
		}
	});
});