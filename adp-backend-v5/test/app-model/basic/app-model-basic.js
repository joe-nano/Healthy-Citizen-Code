const glob = require("glob");
const fs = require('fs');
const _ = require("lodash");
const should = require('should');
const assert = require('assert');
const reqlib = require('app-root-path').require;

describe('App Model Routes', () => {
  before(function () {
    const dotenv = require('dotenv').load({path: './.env'});
    this.appLib = reqlib('/lib/app')();
    return this.appLib.setup();
  });

  after(function () {
    return this.appLib.shutdown();
  });

  it('Generates core models', function (done) {
    this.appLib.db.readyState.should.equal(1);
    assert(_.indexOf(this.appLib.db.modelNames(), 'users') >= 0);
    assert(_.keys(_.get(this.appLib.appModel, 'metaschema').length > 0));
    assert(_.keys(_.get(this.appLib.appModel, 'interface').length > 0));
    assert(_.keys(_.get(this.appLib.appModel, 'interface.mainMenu').length > 0));
    done();
  });
});
