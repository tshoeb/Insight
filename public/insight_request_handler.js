import { QueryProcessor } from './data_model/query_processor';
import { FilterProcessor } from './data_model/filter_processor';
import { TimeProcessor } from './data_model/time_processor';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { FilterManagerProvider } from 'ui/filter_manager';
import { timefilter } from 'ui/timefilter';

export function InsightRequestHandlerProvider(Private, es, serviceSettings, getAppState) {

  const dashboardContext = Private(dashboardContextProvider);
  const filterManager = Private(FilterManagerProvider);
  const filterBar = Private(FilterBarQueryFilterProvider);
  const timefunc = new TimeProcessor(timefilter)

  return {

    name: 'insight',

    handler(vis) {
      vis.params.realdata=[];
      vis.params.filtervals=[];
      vis.params.shouldvals=[];

      //const timefunc = new TimeProcessor(timefilter, vis.params.timefield);
      const fp = new FilterProcessor(vis.params.index, filterManager);
      vis.params.fpc = fp;
      const qp = new QueryProcessor(vis.params.index, vis.params.attributes, vis.params.rectorder, vis.params.timefield, timefunc, vis.params.realdata, vis.params.filtervals, vis.params.shouldvals, es, dashboardContext, filterBar, getAppState, filterManager);
      return qp.processAsync();
    }

  };
}