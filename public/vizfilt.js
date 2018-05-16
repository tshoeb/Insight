import './vizfilt.less';

import optionsTemplate from './options_template.html';
import { VisController } from './vis_controller';

import { CATEGORY } from 'ui/vis/vis_category';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';

function VizfiltProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);

  return VisFactory.createBaseVisualization({
    name: 'vizfilt',
    title: 'Vizfilt',
    icon: 'fa fa-bar-chart',
    description: 'test vuis',
    category: CATEGORY.OTHER,
    visualization: VisController,
    visConfig: {
      defaults: {
        // add default parameters
        fontSize: '30'
      },
    },
    editorConfig: {
      optionsTemplate: optionsTemplate,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Y-axis metric',
          mustBeFirst: 'true',
          max: 1,
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        }, {
          group: 'buckets',
          name: 'attrib',
          icon: 'fa fa-bar-chart',
          title: 'X-Axis Attribute',
          min: 0,
          max: 100,
          aggFilter: ['terms']
        }
      ]),
    }
  });
}

// register the provider with the visTypes registry
VisTypesRegistryProvider.register(VizfiltProvider);