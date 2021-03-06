const path = require('path');
const gulp = require('gulp');
const wiredep = require('wiredep').stream;
const gulpInject = require('gulp-inject');

gulpInject.transform.html.js = function (path) {
  return '<script type="application/javascript" src="'+path+'"></script>';
};

const conf = require('../config');

const injectOptions = {
  ignorePath: [conf.paths.tmp],
  addRootSlash: false,
};

function scriptsStream() {
  return gulp.src([
    //  file is strictly hardcoded, because of specific SmartAdmin app structure
    path.join(conf.paths.tmp, 'api_config.js'),
    path.join(conf.paths.tmp, 'sw-manager.js'),
    path.join(conf.paths.tmp, conf.paths.serverModules),
    path.join(conf.paths.tmp, conf.paths.defaultServerModules),
    path.join(conf.paths.tmp, conf.paths.serverScripts),
    path.join(conf.paths.src, 'app-core.config.js'),
    path.join(conf.paths.src, 'adp-render.lib.js'),
    path.join(conf.paths.src, 'app.ls.js'),
    path.join(conf.paths.src, 'app.db.js'),
    path.join(conf.paths.src, 'main.js'),
    // moving module definition to the top
    path.join(conf.paths.src, '/**/*.module.js'),
    path.join(conf.paths.src, '/**/module.js'),
    path.join(conf.paths.src, '/**/*.provider.js'),
    path.join(conf.paths.tmp, 'templateCacheHtml.js'),
    path.join(conf.paths.src, '/**/!(service-worker).js')
  ], { read: false });
}

gulp.task('inject', inject);

function inject() {
  let source = path.join(conf.paths.src, conf.paths.index);

  return gulp.src(source)
    .pipe(gulpInject(scriptsStream(), injectOptions))
    .pipe(wiredep(Object.assign({}, conf.wiredep)))
    .pipe(gulp.dest(conf.paths.tmp));
}
