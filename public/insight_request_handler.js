import { QueryProcessor } from './data_model/query_processor';
import { FilterProcessor } from './data_model/filter_processor';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { FilterManagerProvider } from 'ui/filter_manager';

export function InsightRequestHandlerProvider(Private, es, timefilter, serviceSettings, getAppState) {

  const dashboardContext = Private(dashboardContextProvider);
  const filterManager = Private(FilterManagerProvider);
  const filterBar = Private(FilterBarQueryFilterProvider);

  return {

    name: 'insight',

    handler(vis) {
      vis.params.realdata=[];
      vis.params.filtervals=[];
      vis.params.shouldvals=[];

      const fp = new FilterProcessor(vis.params.index, filterManager);
      vis.params.fpc = fp;
      const qp = new QueryProcessor(vis.params.index, vis.params.attributes, vis.params.realdata, vis.params.filtervals, vis.params.shouldvals, timefilter, es, dashboardContext, filterBar, getAppState, filterManager);
      return qp.processAsync();
    }

  };
}