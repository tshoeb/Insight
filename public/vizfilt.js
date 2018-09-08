import './vizfilt.less';

import optionsTemplate from './options_template.html';
import { VisController } from './vis_controller';

import { CATEGORY } from 'ui/vis/vis_category';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import { VizfiltRequestHandlerProvider } from './vizfilt_request_handler';

import './vizfilt_options_controller';
import './vizfilt.less';

function VizfiltProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const vizfiltRequestHandler = Private(VizfiltRequestHandlerProvider).handler;

  return VisFactory.createBaseVisualization({
    name: 'vizfilt',
    title: 'Vizfilt',
    icon: 'fa fa-bar-chart',
    description: 'Analyze your data by visualizing top n values of an attribute',
    category: CATEGORY.OTHER,
    visConfig: {
      defaults: {
        // add default parameters
        index: 'choose',
        attributes: [],
        realdata:[],
        checker: false,
      },
    },
    editorConfig: {
      optionsTemplate: optionsTemplate,
    },
    visualization: VisController,
    requestHandler: vizfiltRequestHandler,
    responseHandler: 'none',
    options: { showIndexSelection: false },
  });
}

// register the provider with the visTypes registry
VisTypesRegistryProvider.register(VizfiltProvider);