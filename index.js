export default kibana => new kibana.Plugin({
  id: 'insight',
  require: ['elasticsearch'],

  uiExports: {
    visTypes: ['plugins/insight/insight'],
    styleSheetPaths: `${__dirname}/public/insight.scss`,
  },

});