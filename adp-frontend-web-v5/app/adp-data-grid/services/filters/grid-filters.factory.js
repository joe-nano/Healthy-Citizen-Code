;(function () {
  'use strict';

  angular
    .module('app.adpDataGrid')
    .factory('GridFiltersFactory', GridFiltersFactory);

  /** @ngInject */
  function GridFiltersFactory(
    GridFilterHelpers,
    AdpSchemaService,
    NumberEditor,
    DateFilter,
    ListEditorFactory,
    StringEditor,
    BooleanFilter,
    ImperialUnitSingleEditor,
    ImperialUnitMultipleEditor,
    LookupEditor
  ) {
    var filtersMap = {
      list: ListEditorFactory.multiple,
      dynamicList: ListEditorFactory.multiple,
      string: StringEditor,
      number: NumberEditor,
      decimal128: NumberEditor,
      date: DateFilter,
      time: DateFilter,
      dateTime: DateFilter,
      boolean: BooleanFilter,
      imperialWeight: ImperialUnitSingleEditor,
      imperialWeightWithOz: ImperialUnitMultipleEditor,
      imperialHeight: ImperialUnitMultipleEditor,
      lookupObjectId: LookupEditor.multiple,
    };

    function create(options) {
      var filterRenderer = resolveFilterRenderer(options);
      if (!filterRenderer) {
        return;
      }
      return createFilter(filterRenderer, options);
    }

    function createFilter(filterByType, options) {
      var newFilterComponent = filterByType();
      assertFilterHasRequiredFields(newFilterComponent, options);
      newFilterComponent.create(options);

      postCreateActions(newFilterComponent);

      return newFilterComponent;
    }

    var shouldImplement = ['create', 'getElement', 'reset'];
    function assertFilterHasRequiredFields(filterComponent) {
      if (hasNotImplementedMethods(filterComponent)) {
        throw new Error(assertionMessage(options.args.modelSchema.fieldName));
      }
    }

    function assertionMessage(fieldName) {
      return [
        'Filter component must implement required methods: "',
        shouldImplement.join(', '),
        '" for field',
        fieldName
      ].join(' ');
    }

    function hasNotImplementedMethods(filterComponent) {
      var filterCondition = function (methodName) {
        return !_.isFunction(filterComponent[methodName]);
      };

      var notImplemented = shouldImplement.filter(filterCondition);

      return notImplemented.length > 0;
    }

    function postCreateActions(filterComponent) {
      GridFilterHelpers.saveFilterInstanceToDom(filterComponent);
      addUniqueClassToFilter(filterComponent);
    }

    function addUniqueClassToFilter(component) {
      var element = component.getElement();
      var classToAdd = GridFilterHelpers.filterClass();
      $(element).addClass(classToAdd);
    }

    function resolveFilterRenderer(options) {
      var field = options.args.modelSchema;
      var filterRenderer = GridFilterHelpers.getFilterRenderer(field);

      if (!filterRenderer) {
        return;
      }

      return filtersMap[filterRenderer.value];
    }

    return {
      create: create,
    }
  }
})();
