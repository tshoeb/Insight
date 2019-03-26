//import './insight.less';

import optionsTemplate from './options_template.html';
import { InsightVisualizationProvider } from './insight_visualization';

import { CATEGORY } from 'ui/vis/vis_category';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { InsightRequestHandlerProvider } from './insight_request_handler';
import image from './img/eye-solid.svg';
// import { FilterManagerProvider } from 'ui/filter_manager';
// import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';

import './insight_options_controller';
//import './insight.less';

function InsightProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const insightRequestHandler = Private(InsightRequestHandlerProvider).handler;
  //const InsightVisualization = Private(InsightVisualizationProvider);

  return VisFactory.createBaseVisualization({
    name: 'insight',
    title: 'Insight',
    image,
    //icon: 'fa fa-eye',
    description: 'Analyze your data by visualizing top n values of an attribute',
    category: CATEGORY.OTHER,
    visConfig: {
      defaults: {
        // add default parameters
        index: 'choose',
        attributes: [],
        realdata:[],
        filtervals: [],
        shouldvals: [],
        filterbarvals: [],
        fpc: "",
        timefield: "",
        rectorder: "descending",
        tableoption: "yes",
        colorlist: [],
      },
    },
    editorConfig: {
      optionsTemplate: optionsTemplate,
    },
    visualization: InsightVisualizationProvider,
    requestHandler: insightRequestHandler,
    responseHandler: 'none',
    options: { showIndexSelection: true, showFilterBar: true },
  });
}

// register the provider with the visTypes registry
VisTypesRegistryProvider.register(InsightProvider);