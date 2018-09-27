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
	$scope.attr = "";
	$scope.topn = 0;
	$scope.compdata = [];
	$scope.selected = false;
	$scope.choices = [{}];

	$scope.addNewChoice = function() {
		console.log("what is happenin??");
	    var newItemNo = $scope.choices.length+1;
	    $scope.choices.push({});
	 };

	$scope.removeChoice = function(incoming) {
		// console.log(incoming);
	 //    var lastItem = $scope.choices.length-1;
	    $scope.choices.splice(incoming,1);
	};

	$scope.complete = function() {
		console.log("what is happenin???");
		$scope.vis.params.attributes = $scope.choices;
	};

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

	// $scope.bindem = function(){
	// 	console.log($scope.attr);
	// 	$scope.compdata.push({
	// 	    key:   $scope.attr,
	// 	    value: $scope.topn
	// 	});
	// 	console.log("it is working");
	// 	console.log($scope.compdata);
	// };

	$scope.makeselection = function(){
		client.indices.getMapping({
		index: indexlist
		}).then(function (body) {
			for (var key in body) {
				if(key != '.kibana'){
					console.log(key);
					var termdic = (body[key]['mappings']['requests']['properties'])
					$scope.termlist = Object.keys(termdic);
				}
			}
		});
		$scope.selected = true;
		//console.log("it is working too");
	};

	$scope.clearfilter = function(){
		$scope.vis.params.filtervals = [];
	};

});