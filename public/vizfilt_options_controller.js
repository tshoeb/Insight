import { uiModules } from 'ui/modules';
import { FilterManagerProvider } from 'ui/filter_manager';
import * as filterActions from 'ui/doc_table/actions/filter';
import 'ui/query_bar';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { StateProvider } from 'ui/state_management/state';


const module = uiModules.get('kibana/vizfilt', ['kibana'], ['elasticsearch']);

module.service('client', function (esFactory) {
  return esFactory({
    host: 'localhost:9200',
    apiVersion: 'master',
    log: 'trace'
  });
});

module.controller('VizfiltOptionsController', ($scope, client, esFactory, Private) => {
	const filterManager = Private(FilterManagerProvider);
	const queryFilter = Private(FilterBarQueryFilterProvider);
	const State = Private(StateProvider);

	var indexlist = [];
	$scope.attr = "";
	$scope.topn = 0;
	$scope.compdata = [];
	$scope.selected = false;
	$scope.choices = [{}];

	//console.log($scope);
	$scope.vis.params.index = $scope.vis.indexPattern.title;
	client.indices.getMapping({
		index: $scope.vis.params.index//indexlist
	}).then(function (body) {
		for (var key in body) {
			if(key != '.kibana'){
				console.log(key);
				//$scope.indexPattern = key;
				var termdic = (body[key]['mappings']['requests']['properties'])
				$scope.termlist = Object.keys(termdic);
			}
		}
		$scope.selected = true;
	});


	//$scope.indexPattern.popularizeField("ttl", 1);
    //filterActions.addFilter("ttl", 234, "AND", "1d1efb80-2b83-11e8-8eff-dba1c3546b2b", $scope.state, filterManager);

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

	// client.cat.indices({
	// 	h: ['index']
	// }).then(function (body) {
	// 	var index = body.split("\n");
	// 	var i;
	// 	for (i = 0; i < index.length; i++) { 
	// 	    if(index[i] != '.kibana' && index[i] != ''){
	// 	    	indexlist.push(index[i]);
	// 	    }
	// 	}
	// 	// console.log(indexlist);
	// 	//$scope.idlist = indexlist;
	// });

	// $scope.bindem = function(){
	// 	console.log($scope.attr);
	// 	$scope.compdata.push({
	// 	    key:   $scope.attr,
	// 	    value: $scope.topn
	// 	});
	// 	console.log("it is working");
	// 	console.log($scope.compdata);
	// };

	// $scope.makeselection = function(){
	// 	client.indices.getMapping({
	// 	index: $scope.index//indexlist
	// 	}).then(function (body) {
	// 		for (var key in body) {
	// 			if(key != '.kibana'){
	// 				console.log(key);
	// 				//$scope.indexPattern = key;
	// 				var termdic = (body[key]['mappings']['requests']['properties'])
	// 				$scope.termlist = Object.keys(termdic);
	// 			}
	// 		}
	// 	});
	// 	$scope.selected = true;
	// 	//console.log("it is working too");
	// };

	$scope.clearfilter = function(){
		$scope.vis.params.filtervals = [];
		$scope.complete();
	};

	// $scope.filterQuery = function (field, values, operation) {
	//     //$scope.indexPattern.popularizeField(field, 1);
	//     filterActions.addFilter(field, values, operation, $scope.index, $scope.state, filterManager);
	// };

	// $scope.$watch(getAppState, function (appState){
	// 	$scope.state = appState;
	// 	console.log("hiiiiiii");
	// 	console.log($scope.state);
	// }, true);

});