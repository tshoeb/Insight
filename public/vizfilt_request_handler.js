import { QueryProcessor } from './data_model/query_processor';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
/*import { SearchCache } from './data_model/search_cache';
import { TimeCache } from './data_model/time_cache';*/

export function VizfiltRequestHandlerProvider(Private, es, timefilter, serviceSettings) {

  const dashboardContext = Private(dashboardContextProvider);
  /*const searchCache = new SearchCache(es, { max: 10, maxAge: 4 * 1000 });
  const timeCache = new TimeCache(timefilter, 3 * 1000);*/

  // console.log(es)

  return {

    name: 'vizfilt',

    handler(vis) {
      //console.log("i am the request hander")
      //console.log(vis.params.attributes)
      vis.params.realdata=[];
      vis.params.checker=false;
      const qp = new QueryProcessor(vis.params.index, vis.params.attributes, vis.params.realdata, vis.params.checker, es);//, vis.params.top_n, vis.params.order)
      return qp.processAsync();
    }

  };
}