import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/insight', ['kibana'], ['elasticsearch']);

module.service('client', function (esFactory) {
  return esFactory({
    //host: 'localhost:9200',
    apiVersion: 'master',
    log: 'trace'
  });
});

module.controller('InsightOptionsController', ($scope, client, esFactory, Private) => {
	$scope.vis.params.timefield = $scope.vis.indexPattern.timeFieldName;
	var indexlist = [];
	$scope.attr = "";
	$scope.topn = 0;
	$scope.compdata = [];
	$scope.termlist = [];
	$scope.timelist = [];
	$scope.selected = false;
	$scope.orderlist = ["descending", "ascending"];
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
				//console.log(key);
				var tempword = body[key]['mappings'];
				var termdic = (body[key]['mappings'][Object.keys(tempword)[0]]['properties'])
				for (var key2 in termdic) {
					var checkfields = Object.keys(termdic[key2]);
					if(checkfields.includes("fields")){
						var checkkeyword = Object.keys(termdic[key2]['fields']);
						if(checkkeyword.includes("keyword")){
							$scope.termlist.push(key2+".keyword");
						}
					} else{
						$scope.termlist.push(key2);
					}
				}
				for (var key3 in termdic) {
					var checktime = Object.keys(termdic[key3]);
					if(checktime.includes("type")){
						if(termdic[key3]['type'] == "date"){
							$scope.timelist.push(key3);
						}
					}
				}
				//$scope.termlist = Object.keys(termdic);
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
		$('[data-test-subj=querySubmitButton]').click();
		// console.log(testSubjSelector)
		// testSubjSelector.click('querySubmitButton');
	};

	$scope.clearfilter = function(){
		$scope.vis.params.filtervals = [];
		$scope.complete();
	};

});