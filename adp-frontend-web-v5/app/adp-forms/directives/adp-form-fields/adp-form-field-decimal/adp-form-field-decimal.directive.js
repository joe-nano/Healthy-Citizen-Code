(function () {
  'use strict';

  angular
    .module('app.adpForms')
    .directive('adpFormFieldDecimal', adpFormFieldDecimal);

  function adpFormFieldDecimal() {
    return {
      restrict: 'E',
      scope: {
        adpField: '=',
        adpFormData: '=',
        adpFieldUiProps: '=',
        validationParams: '='
      },
      templateUrl: 'app/adp-forms/directives/adp-form-fields/adp-form-field-decimal/adp-form-field-decimal.html',
    }
  }
})();
