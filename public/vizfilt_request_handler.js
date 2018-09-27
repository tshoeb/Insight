import { QueryProcessor } from './data_model/query_processor';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
//import { AppStateProvider } from 'ui/state_management/app_state';
import 'ui/state_management/app_state';
//import { SearchCache } from './data_model/search_cache';
// import { TimeCache } from './data_model/time_cache';

export function VizfiltRequestHandlerProvider(Private, es, timefilter, serviceSettings, getAppState) {

  const dashboardContext = Private(dashboardContextProvider);
  //console.log(getAppState);
  
  //const filterBar = Private(FilterBarQueryFilterProvider);
  //const searchCache = new SearchCache(es, { max: 10, maxAge: 4 * 1000 });
  //const timeCache = new TimeCache(timefilter, 3 * 1000);
  //console.log(serviceSettings);

  return {

    name: 'vizfilt',

    handler(vis) {
      //console.log("i am the request hander")
      //console.log(vis.params.attributes)
      vis.params.realdata=[];
      //vis.params.checker=false;
      const qp = new QueryProcessor(vis.params.index, vis.params.attributes, vis.params.realdata, vis.params.filtervals, timefilter, es, dashboardContext, getAppState);//, vis.params.top_n, vis.params.order)
      return qp.processAsync();
    }

  };
}