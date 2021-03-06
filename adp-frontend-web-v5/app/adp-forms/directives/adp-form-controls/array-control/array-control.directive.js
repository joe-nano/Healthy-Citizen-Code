;(function () {
  'use strict';

  angular
    .module('app.adpForms')
    .directive('arrayControl', arrayControl);

  function arrayControl(
    AdpValidationUtils,
    AdpFieldsService,
    AdpFormService,
    visibilityUtils,
    Guid
  ) {
    return {
      restrict: 'E',
      scope: {
        field: '=',
        adpFormData: '=',
        uiProps: '=',
        validationParams: '='
      },
      templateUrl: 'app/adp-forms/directives/adp-form-controls/array-control/array-control.html',
      require: '^^form',
      link: function (scope, element, attrs, formCtrl) {
        scope.fields = AdpFieldsService.getFormFields(scope.field.fields).notGrouped;
        scope.visibilityStatus = [];
        scope.form = formCtrl;
        scope.rootForm = AdpFormService.getRootForm(scope.form);
        scope.errorCount = [];

        var formParams = scope.validationParams.formParams;

        // DEPRECATED: will be replaced with formParams
        // validationParams fields naming is wrong, use formParams instead
        // modelSchema - grouped fields
        // schema - original ungrouped schema
        scope.nextValidationParams = {
          field: scope.field,
          fields: scope.fields,
          formData: scope.adpFormData,
          modelSchema: scope.adpFields,
          schema: scope.validationParams.schema.fields[scope.field.fieldName],
          $action: scope.validationParams.$action,

          formParams: formParams
        };

        setKeysToAssociativeArray();
        setIdsToData();
        setDefaultDisplay();

        scope.display = function(index) {
          var arrayItemPath = formParams.path + '[' + index + ']';
          return formParams.visibilityMap[arrayItemPath];
        };

        function setDisplay(index, value) {
          var arrayItemPath = formParams.path + '[' + index + ']';
          formParams.visibilityMap[arrayItemPath] = value;
        }

        scope.getData = getData;
        scope.isEmpty = isEmpty;
        scope.addArrayItem = addArrayItem;
        scope.remove = remove;
        scope.isRemoveDisabled = isRemoveDisabled;
        scope.getPath = getPath;
        scope.showMoveToTop = showMoveToTop;
        scope.moveToTop = moveToTop;

        scope.guid = Guid.create;

        scope.onStop = function(event) {
          swapVisibilityStatus(event.newIndex, event.oldIndex);
        }

        scope.onSorted = function updateOrder(event) {
          reorder(event.newIndex, event.oldIndex);
          scope.$apply();
        };

        scope.hasVisibleItems = function () {
          return visibilityUtils.arrayHasVisibleChild(getData(), scope.validationParams);
        };

        scope.getHeader = function (index) {
          var params = {
            fieldData: getData(),
            formData: scope.adpFormData,
            fieldSchema: scope.field,
            index: index
          };

          return AdpFieldsService.getHeaderRenderer(params);
        };

        scope.getFields = getFields;
        scope.toggle = function (event, index) {
          event.preventDefault();
          event.stopPropagation();

          scope.visibilityStatus[index] = !scope.visibilityStatus[index];
        };

        if (scope.isEmpty()) {
          setData([]);
          addArrayItem();
        }

        scope.$watch(
          function () { return angular.toJson(scope.form); },
          function () {
            if (scope.rootForm.$submitted) {
              scope.errorCount = getData().map(function (_v, i) {
                var formToCount = scope.form[scope.field.fieldName + i];
                var counter = AdpFormService.countErrors(formToCount);

                return counter;
              });
            }
          });

        function setDefaultDisplay() {
          var data = getData();

          _.each(data, function (_v, i) {
            setDisplay(i, true)
          });
        }

        function getData() {
          return scope.adpFormData[scope.field.fieldName];
        }

        function setData(value) {
          return scope.adpFormData[scope.field.fieldName] = value;
        }

        function isEmpty() {
          var data = getData();
          return _.isNil(data) || _.isEmpty(data);
        }

        function addArrayItem() {
          var fieldData = getData();
          fieldData.push({
            _id: Guid.create(),
          });

          var lastIndex = _.findLastIndex(fieldData);
          setDisplay(lastIndex, true);
        }

        function remove(event, index) {
          event.preventDefault();

          var fieldData = getData();
          fieldData.splice(index, 1);
          scope.visibilityStatus.splice(index, 1);
        }

        function getFields() {
          return scope.fields;
        }

        function isRemoveDisabled() {
          // kind of hack: checking if first element is required
          var requiredMap = formParams.requiredMap;
          var path = formParams.path + '[0]';
          var isFirstRequired = requiredMap[path];
          var hasOneItem = getData().length === 1;

          return isFirstRequired && hasOneItem;
        }

        function getPath() {
          return formParams.path;
        }

        function setKeysToAssociativeArray() {
          if (scope.field.type === 'AssociativeArray') {
            scope.adpFormData[scope.field.fieldName] = _.map(scope.adpFormData[scope.field.fieldName], function (item, key) {
              var newItem = _.clone(item);
              newItem.$key = key;
              return newItem;
            });
          }
        }

        function setIdsToData() {
          if (_.isArray(scope.adpFormData[scope.field.fieldName])) {
            scope.adpFormData[scope.field.fieldName] = _.map(scope.adpFormData[scope.field.fieldName], function (item) {
              item._id = Guid.create();
              return item;
            })
          }
        }

        function swapVisibilityStatus(newIndex, oldIndex) {
          var lhs = scope.visibilityStatus[oldIndex];
          var rhs = scope.visibilityStatus[newIndex];
          if (lhs === rhs) {
            return;
          }

          swap(scope.visibilityStatus, oldIndex, newIndex);
        }

        function reorder(newIndex, oldIndex) {
          var list = getData();
          swap(list, newIndex, oldIndex);
          setData(list);
        }

        function swap(list, newIndex, oldIndex) {
          var tmp = list[oldIndex];
          list[oldIndex] = list[newIndex];
          list[newIndex] = tmp;
        }

        function showMoveToTop(index) {
          if (index === 0) {
            return false;
          }

          return getData().length > 1;
        }

        function moveToTop(event, index) {
          event.preventDefault();

          reorder(0, index);
          swapVisibilityStatus(0, index);
          scope.$apply();
        }
      }
    }
  }
})();
