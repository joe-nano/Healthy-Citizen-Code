;(function () {
  'use strict';

  angular
    .module('app.adpForms')
    .directive('adpForm', adpForm);

  function adpForm(
    AdpNotificationService,
    AdpFormService,
    AdpFormDataUtils,
    AdpQueryParams,
    $timeout,
    $q,
    $location
  ) {
    return {
      restrict: 'E',
      scope: {
        adpFields: '=',
        adpData: '=',
        adpSubmit: '=',
        adpFormParams: '=?',
        disableFullscreen: '=',
        schema: '='
      },
      transclude: {
        'header': '?formHeader',
        'body': '?formBody',
        'footer': 'formFooter'
      },
      templateUrl: 'app/adp-forms/directives/adp-form/adp-form.html',
      link: function (scope, element) {
        var visibilityMap = {};
        scope.visibilityMap = visibilityMap;
        function init() {
          scope.formData = scope.adpData || {};
          scope.adpFormParams = scope.adpFormParams || {};

          scope.typeMap = AdpFormService.getTypeMap();
          scope.type = AdpFormService.getType(scope.adpFormParams);
          // refactor: rename to render schema
          scope.fields = AdpFormService.getFormFields(scope.adpFields, scope.type);
          scope.errorCount = 0;

          scope.loading = false;
          scope.isFullscreen = false;
          scope.uploaderCnt = 0;

          bindEvents();

          AdpQueryParams.setDataFromQueryParams(scope.formData, scope.schema, $location.search());

          var formParams = {
            path: null,
            row: scope.formData,
            modelSchema: scope.schema,
            action: scope.adpFormParams && scope.adpFormParams.actionType,
            visibilityMap: visibilityMap,
            requiredMap: {},
          };

          _.each(scope.fields.groups, function (group, name) {
            visibilityMap[name] = true;
          });

          // DEPRECATED: will be replaced with formParams
          // validationParams fields naming is wrong, use formParams instead
          // modelSchema - grouped fields
          // schema - original ungrouped schema
          scope.validationParams = {
            field: scope.adpField,
            fields: scope.adpFields,
            formData: scope.adpFormData,
            modelSchema: scope.adpFields,
            schema: scope.schema,
            $action: scope.adpFormParams && scope.adpFormParams.actionType,

            formParams: formParams
          };

          $timeout(function () {
            bindFormEvents();

            AdpFormService.evaluateRequiredStatus(scope.validationParams.formParams, scope.form);

            // initial run to setup fields visibility
            AdpFormService.evaluateShow({
              formData: scope.formData,
              schema: scope.schema,
              groups: scope.fields.groups,
              visibilityMap: visibilityMap,
              actionType: scope.adpFormParams.actionType
            });
          });
        }
        init();

        // there are two functions to bind events:
        // the second one is for avoiding error for form when nested form are not rendered
        // the first one keep order of event triggered by child directives
        function bindEvents() {
          scope.$on('adpFileUploaderInit', function () {
            scope.uploaderCnt++;
          });
          scope.submit = submit;
        }

        function bindFormEvents() {
          scope.$watch('[loading]', updateDisabledState);
          scope.$watch(
            function () { return angular.toJson(scope.form); },
            onFormUpdate
          )
        }

        function submit() {
          if (scope.form.$invalid) {
            scrollToError();
            return;
          }
          scope.loading = true;

          handleUploaders(scope.formData)
            .then(function () {
              var formData = AdpFormDataUtils.cleanFormData(scope.formData, scope.schema);

              return scope.adpSubmit(formData);
            })
            .catch(function (error) {
              if (error.name === 'UploadError') {
                AdpNotificationService.notifyError(error.message);
              }

              console.log('Catch error in form', error);
            })
            .finally(function () {
              scope.loading = false;
            });
        }

        function handleUploaders(formData) {
          if (scope.uploaderCnt === 0) {
            return $q.when(scope.formData);
          }

          var uploadersFinished = 0;

          return $q(function (resolve, reject) {
            var removeEndListenerFn = scope.$on('adpFileUploadComplete', onUploadComplete);
            var removeErrorListenerFn = scope.$on('adpFileUploadError', onUploadError);
            scope.$broadcast('adpFileUploadStart');

            function onUploadComplete() {
              uploadersFinished++;

              if (uploadersFinished >= scope.uploaderCnt) {
                removeListeners();
                resolve(formData);
              }
            }

            function onUploadError(_e, response) {
              removeListeners();
              reject({message: response.message, name: 'UploadError'});
            }

            function removeListeners() {
              removeEndListenerFn();
              removeErrorListenerFn();
            }
          });
        }

        function updateDisabledState(values) {
          if (!element || !element.find('[type="submit"]').length) return;
          var loading = values[1];

          element.find('[type="submit"]')
            .prop('disabled', loading);
        }

        function onFormUpdate(newVal, oldVal) {
          if (newVal === oldVal) {
            return;
          }

          AdpFormService.forceValidation(scope.form);

          AdpFormService.evaluateShow({
            formData: scope.formData,
            schema: scope.schema,
            groups: scope.fields.groups,
            visibilityMap: visibilityMap,
            actionType: scope.adpFormParams.actionType
          });

          AdpFormService.evaluateRequiredStatus(scope.validationParams.formParams, scope.form);

          if (scope.form.$submitted) {
            scope.errorCount = AdpFormService.countErrors(scope.form);
          }
        }

        // refactor: form move to service
        function scrollToError() {
          var $errorNode = $('.ng-invalid').closest('adp-form-field-container');
          var $ngForm = $('.ng-invalid').closest('ng-form');
          var $scrollTarget;

          $scrollTarget = $ngForm.length > 0 ? $ngForm : $errorNode;

          var $scrollContainer = $('[uib-modal-window="modal-window"]');
          var scrollPos;

          if (_.isEmpty($scrollContainer)) {
            scrollPos = $scrollTarget.offset().top;
            $scrollContainer = $('html, body');
          } else {
            scrollPos = $scrollTarget.offset().top - $scrollContainer.offset().top + $scrollContainer.scrollTop()
          }

          $($scrollContainer).animate({
            scrollTop: scrollPos
          }, 300);
        }
      }
    }
  }
})();
