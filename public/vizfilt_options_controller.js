import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/vizfilt', ['kibana']);

module.service('client', function (esFactory) {
  return esFactory({
    host: 'localhost:9200',
    apiVersion: 'master',
    log: 'trace'
  });
});

module.controller('VizfiltOptionsController', ($scope, client, esFactory) => {
	client.cat.indices({
		h: ['index', 'docs.count']
	}).then(function (body) {
		console.log(body);
	});
});