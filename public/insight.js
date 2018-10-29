import './insight.less';

import optionsTemplate from './options_template.html';
import { VisController } from './vis_controller';

import { CATEGORY } from 'ui/vis/vis_category';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import { VizfiltRequestHandlerProvider } from './insight_request_handler';
// import { FilterManagerProvider } from 'ui/filter_manager';
// import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';

import './insight_options_controller';
import './insight.less';
import './data_model/filter_processor';

function InsightProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const insightRequestHandler = Private(InsightRequestHandlerProvider).handler;
  // const filterManager = Private(FilterManagerProvider);
  // const queryFilter = Private(FilterBarQueryFilterProvider);

  return VisFactory.createBaseVisualization({
    name: 'insight',
    title: 'Insight',
    icon: 'fa fa-eye',
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
      },
    },
    editorConfig: {
      optionsTemplate: optionsTemplate,
    },
    visualization: VisController,
    requestHandler: insightRequestHandler,
    responseHandler: 'none',
    options: { showIndexSelection: true, showFilterBar: true },
  });
}

// register the provider with the visTypes registry
VisTypesRegistryProvider.register(InsightProvider);