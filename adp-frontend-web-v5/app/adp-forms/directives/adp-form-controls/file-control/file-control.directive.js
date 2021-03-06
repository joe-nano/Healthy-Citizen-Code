(function () {
  'use strict';

  angular
    .module('app.adpForms')
    .directive('fileControl', fileControl);

  function fileControl(AdpValidationUtils) {
    return {
      restrict: 'E',
      scope: {
        field: '=',
        adpFormData: '=',
        uiProps: '=',
        validationParams: '='
      },
      templateUrl: 'app/adp-forms/directives/adp-form-controls/file-control/file-control.html',
      require: '^^form',
      link: function (scope, el, attrs, formCtrl) {
        scope.form = formCtrl;
        scope.fakeModel = null;

        if (scope.field.type.indexOf('[]') > -1) {
          scope.field['arguments'] = scope.field['arguments'] || {};
          scope.field['arguments'].multiple = true;
        }

        if (_.isUndefined(scope.adpFormData[scope.field.fieldName])) {
          scope.adpFormData[scope.field.fieldName] = [];
        }

        scope.isRequired = AdpValidationUtils.isRequired(scope.validationParams.formParams);
      }
    }
  }
})();
