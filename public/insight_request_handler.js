import { QueryProcessor } from './data_model/query_processor';
import { FilterProcessor } from './data_model/filter_processor';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { FilterManagerProvider } from 'ui/filter_manager';
//import { timefilter } from 'ui/timefilter';

export function InsightRequestHandlerProvider(Private, es, timefilter, serviceSettings, getAppState) {

  const dashboardContext = Private(dashboardContextProvider);
  const filterManager = Private(FilterManagerProvider);
  const filterBar = Private(FilterBarQueryFilterProvider);

  var timeattrs = timefilter.getBounds();
  var min = timeattrs.min.valueOf();
  var max = timeattrs.max.valueOf();

  return {

    name: 'insight',

    handler(vis) {
      vis.params.realdata=[];
      vis.params.filtervals=[];
      vis.params.shouldvals=[];

      var timedata= {};
      var tempdict1= {};
      tempdict1["gte"] = min;//1288812464000;//min;
      tempdict1["lte"] = max;//1541273265000;//max;
      timedata[vis.params.timefield] = tempdict1;

      const fp = new FilterProcessor(vis.params.index, filterManager);
      vis.params.fpc = fp;
      const qp = new QueryProcessor(vis.params.index, vis.params.attributes, timedata, vis.params.realdata, vis.params.filtervals, vis.params.shouldvals, es, dashboardContext, filterBar, getAppState, filterManager);
      return qp.processAsync();
    }

  };
}