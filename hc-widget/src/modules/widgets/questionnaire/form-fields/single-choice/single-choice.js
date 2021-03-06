import fieldTemplate from './single-choice.view.hbs';

const singleChoiceField = {
  fieldTemplate,

  value() {
    let fields = this.el.querySelectorAll('[type="radio"]:checked');
    let data = [];

    for (let i = 0; i < fields.length; i++) {
      data.push(fields[i].value);
    }

    return data.length > 0 ? data : null;
  },

  setValue(value) {
    this._setMultiValue(value);
  },

  readOnly() {
    let fields = this.el.querySelectorAll('[type="radio"]:checked');
    this.readonly = true;

    for (let i = 0; i < fields.length; i++) {
      fields[i].readOnly = true;
    }
  }
};

export default singleChoiceField;