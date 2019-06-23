let gulp = require('gulp');
let sourcemaps = require('gulp-sourcemaps');
let sass = require('gulp-sass');
// let terser = require('gulp-terser');
let rollup = require('rollup');
let rollupAppConfig = require('./rollup.config.app.js');
let rollupTestConfig = require('./rollup.config.test.js');
let workboxBuild = require('workbox-build');

gulp.task('assets:core', () => {
  return gulp.src([
      'app/assets/**/*'
    ])
    .pipe(gulp.dest('public'));
});
gulp.task('assets:server', () => {
  return gulp.src([
      'app/server/**/*'
    ])
    .pipe(gulp.dest('public/server'));
});
gulp.task('assets:js', () => {
  return gulp.src([
      'node_modules/mithril/mithril.min.js',
      'node_modules/underscore/underscore-min.js',
      'node_modules/tiny-emitter/dist/tinyemitter.min.js',
      'node_modules/socket.io-client/dist/socket.io.slim.js'
    ])
    .pipe(gulp.dest('public/scripts'));
});
gulp.task('assets:fonts', () => {
  return gulp.src([
      'node_modules/typeface-ubuntu/files/ubuntu-latin-400.woff2',
      'node_modules/typeface-ubuntu/files/ubuntu-latin-400.woff',
      'node_modules/typeface-ubuntu/files/ubuntu-latin-400.eot',
      'node_modules/typeface-ubuntu/files/ubuntu-latin-400.svg'
    ])
    .pipe(gulp.dest('public/fonts'));
});
gulp.task('assets', gulp.parallel(
  'assets:core',
  'assets:server',
  'assets:js',
  'assets:fonts'
));
gulp.task('assets:watch', () => {
  return gulp.watch('app/assets/**/*', gulp.series('assets:core', 'sw'));
});

gulp.task('sass', () => {
  return gulp.src('app/styles/index.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/styles'));
});
gulp.task('sass:watch', () => {
  return gulp.watch('app/styles/**/*.scss', gulp.series('sass', 'sw'));
});

gulp.task('rollup:app', () => {
  return rollup.rollup(rollupAppConfig).then((bundle) => {
    return bundle.write(rollupAppConfig.output);
  });
});
gulp.task('rollup:test', () => {
  return rollup.rollup(rollupTestConfig).then((bundle) => {
    return bundle.write(rollupTestConfig.output);
  });
});
gulp.task('rollup:watch', () => {
  return gulp.watch(
    ['app/scripts/**/*.js', 'test/**/*.js'],
    gulp.series('rollup', 'sw')
  );
});
gulp.task('rollup', gulp.parallel(
  'rollup:app',
  'rollup:test'
));

gulp.task('uglify', () => {
  return gulp.src([
      'node_modules/fastclick/lib/fastclick.js',
      'node_modules/sw-update-manager/sw-update-manager.js'
    ])
    // .pipe(terser())
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('sw', () => {
  return workboxBuild.injectManifest({
    globDirectory: 'public',
    globPatterns: [
      '**\/*.{js,css,png}'
    ],
    // Precaching index.html using templatedUrls fixes a "Response served by
    // service worker has redirections" error on iOS 12; see
    // <https://github.com/v8/v8.dev/issues/4> and
    // <https://github.com/v8/v8.dev/pull/7>
    templatedUrls: {
      // '.' must be used instead of '/' because the app is not served from the
      // root of the domain (but rather, from a subdirectory)
      '.': ['index.html']
    },
    swSrc: 'app/scripts/service-worker.js',
    swDest: 'public/service-worker.js'
   }).then(({ warnings }) => {
    warnings.forEach(console.warn);
  });
});

gulp.task('build', gulp.series(
  gulp.parallel(
    'assets',
    'uglify',
    'sass',
    'rollup'
  ),
  'sw'
));
gulp.task('watch', gulp.parallel(
  'assets:watch',
  'sass:watch',
  'rollup:watch'
));
gulp.task('build:watch', gulp.series(
  'build',
  'watch'
));

gulp.task('connect', () => {
  require('esm')(module)('./public/server/index.js');
});
gulp.task('serve', gulp.series(
  'build',
  gulp.parallel(
    'watch',
    'connect'
  )
));
