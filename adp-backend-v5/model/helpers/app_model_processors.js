const _ = require('lodash');
const { CallStackError } = require('../../lib/errors');

/**
 * Entire module will be passed to ejs as data to process app model schemes
 * @returns {{}}
 */
module.exports = () => {
  const m = {};
  const MAX_RECURSIVE_CALLS_NUMBER = 15;

  function getMacrosParams(macrosArgs, defaultParams = {}) {
    if (_.isPlainObject(macrosArgs[0])) {
      return _.merge({}, defaultParams, macrosArgs[0]);
    }

    const params = {};
    _.entries(defaultParams).forEach(([paramKey, paramVal], index) => {
      params[paramKey] = macrosArgs[index] || paramVal;
    });
    return params;
  }

  // More about M function: https://confluence.conceptant.com/pages/viewpage.action?pageId=8945882
  m.M = function(...args) {
    const macrosName = args[0];
    if (!macrosName) {
      throw new Error(`Macros name must be defined as first parameter.`);
    }
    const macros = this.macroses[macrosName];
    if (!macros) {
      throw new Error(`Unknown macros ${macrosName}`);
    }

    const macrosArgs = args.slice(1);
    const macrosParams = getMacrosParams(macrosArgs, macros.parameters);
    if (this.numberOfCalls > MAX_RECURSIVE_CALLS_NUMBER) {
      throw new CallStackError(
        `The maximum number of recursive calls (${MAX_RECURSIVE_CALLS_NUMBER}) has been reached.`
      );
    }
    this.numberOfCalls = (this.numberOfCalls || 0) + 1;

    return macros.func.call(this, macrosParams);
  };

  return m;
};
