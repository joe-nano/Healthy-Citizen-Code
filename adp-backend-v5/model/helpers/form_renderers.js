/**
 * FormRenderers are used to render data in forms only and only used on the frontend
 *
 * Each renderer receives this fixed set of parameters:
 * data - the cell data
 * type - type of rendering: filter, display, sort, undefined, etc
 * row - the entire record the data need to be rendered for
 * meta - metainformation in datatables format: https://datatables.net/reference/option/columns.render
 */

module.exports = () => {
  const m = {
    asIs(data) {
      return data;
    },
    starMaskfunction() {
      return '********';
    },
  };
  return m;
};
