export class FilterProcessor {
	constructor(index, filterManager){
		this.index = index;
		this.filterManager = filterManager;
	}

	putfilters(thefilterdata){
		for (var j=0; j < thefilterdata.length; j++){
			this.filterManager.add(thefilterdata[j]['attr'], thefilterdata[j]['key'], "is", this.index);
		}
	}
}