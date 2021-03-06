;(function () {
  'use strict';

  angular
    .module('app.adpCommon')
    .factory('AdpLookupHelpers', AdpLookupHelpers);

  function AdpLookupHelpers() {
    function lookupItemTemplate(data, args) {
      var container = $('<div class="adp-lookup-drop-down-item">');
      container.append(createLabel(data, args));

      return container;
    }

    function createLabel(lookupData, args) {
      return $('<div class="adp-lookup-item-label">').append(formatLabel(lookupData, args));
    }

    function formatLabel(lookupData, args) {
      var params = {
        lookup: lookupData,
        fieldData: lookupData,
        formData: args.row,
        fieldSchema: args.modelSchema,
      };

      return getLabelRenderer(params);
    }

    // TODO: replace with unified args
    function getLabelRenderer(params) {
      var renderName = params.fieldSchema.lookupLabelRender;
      var renderFn = appModelHelpers.LookupLabelRenderers[renderName];

      if (renderFn) {
        return renderFn(params);
      }

      if (renderName) {
        return labelExpression(renderName, params);
      }

      return params.lookup.label;
    }

    function labelExpression(expression, params) {
      var fn = new Function('lookup, fieldData, formData, fieldSchema', 'return ' + expression);

      try {
        return fn(params.lookup, params.fieldData, params.formData, params.fieldSchema);
      } catch (e) {
        console.log('Error executing lookup label expression', e);
        return params.lookup.label;
      }
    }

    function tablesList(schema) {
      return schema.lookup && schema.lookup.table ? _.keys(schema.lookup.table) : [];
    }

    return {
      formatLabel: formatLabel,
      lookupItemTemplate: lookupItemTemplate,
      tablesList: tablesList,
    }
  }
})();
