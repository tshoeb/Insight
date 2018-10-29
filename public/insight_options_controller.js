import { uiModules } from 'ui/modules';
//import * as filterActions from 'ui/doc_table/actions/filter';


const module = uiModules.get('kibana/insight', ['kibana'], ['elasticsearch']);

module.service('client', function (esFactory) {
  return esFactory({
    host: 'localhost:9200',
    apiVersion: 'master',
    log: 'trace'
  });
});

module.controller('InsightOptionsController', ($scope, client, esFactory, Private) => {
	var indexlist = [];
	$scope.attr = "";
	$scope.topn = 0;
	$scope.compdata = [];
	$scope.selected = false;
	var tempdict = {};
	tempdict['topn'] = 10;
	if($scope.vis.params.attributes.length != 0){
		$scope.choices = $scope.vis.params.attributes;
	} else{
		$scope.choices = [];
		$scope.choices.push(tempdict);
	}
	

	$scope.vis.params.index = $scope.vis.indexPattern.title;
	client.indices.getMapping({
		index: $scope.vis.params.index
	}).then(function (body) {
		for (var key in body) {
			if(key != '.kibana'){
				console.log(key);
				var termdic = (body[key]['mappings']['requests']['properties'])
				$scope.termlist = Object.keys(termdic);
			}
		}
		$scope.selected = true;
	});

	$scope.addNewChoice = function() {
		console.log("what is happenin??");
	    var newItemNo = $scope.choices.length+1;
	    var tempdict = {};
	    tempdict['topn'] = 10;
	    $scope.choices.push(tempdict);
	 };

	$scope.removeChoice = function(incoming) {
	    $scope.choices.splice(incoming,1);
	};

	$scope.complete = function() {
		$scope.vis.params.attributes = $scope.choices;
	};

	$scope.clearfilter = function(){
		$scope.vis.params.filtervals = [];
		$scope.complete();
	};

});