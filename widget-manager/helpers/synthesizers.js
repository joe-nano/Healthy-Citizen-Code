/**
 * Synthesizers are very similar to transformers but have different semantics and for that reason extracted to a separate file
 * They are only executed on the server side and set value for a field that is not directly based on user input
 */
const _ = require('lodash');
const generate = require('nanoid/async/generate');

module.exports = () => {
  // excluding "confusing characters": "Il1O08B"
  const alphabet = '2345679ACDEFGHJKMNOPQRSTUVWXYZ';

  const m = {
    id24(path, appModelPart, userContext, next) {
      if (_.get(this, path)) {
        return next();
      }
      return generate(alphabet, 24).then(id => {
        _.set(this, path, id);
        next();
      });
    },
  };
  return m;
};
