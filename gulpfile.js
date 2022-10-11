import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import csso from 'gulp-csso';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import squoosh from 'gulp-libsquoosh';
import {deleteAsync} from 'del';

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
};

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
};

const script = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
};

const optimazeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
};

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(gulp.dest('build/img'))
};

const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/sprite/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'))
};

const sprite = () => {
  return gulp.src('source/img/sprite/*.svg')
    .pipe(svgo())
    .pipe(svgstore( {
      inLineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'))
};

const copy = (done) => {
  gulp.src([
    'source/*.ico',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
};

const clean = () => {
  return deleteAsync('build')
};

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

const reload = (done) => {
  browser.reload();
  done();
};

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(script));
  gulp.watch('source/*.html', gulp.series(html, reload));
};

export const build = gulp.series (
  clean,
  copy,
  optimazeImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    sprite,
  ),
);

export default gulp.series (
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    sprite,
  ),
  gulp.series (
    server,
    watcher
  )
);
