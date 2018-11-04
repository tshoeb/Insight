export class TimeProcessor {
	constructor(timefilter, timefield){
		this.timefilter = timefilter;
		//this.timefield = timefield;
	}

	createtimefilter(timefield){
		var timeattrs = this.timefilter.getBounds();
		var min = timeattrs.min.valueOf();
		var max = timeattrs.max.valueOf();

		var tempdict = {};
		var tempdict1= {};
		tempdict1["gte"] = min;
		tempdict1["lte"] = max;
		tempdict[timefield] = tempdict1;
		return tempdict;
	}

}