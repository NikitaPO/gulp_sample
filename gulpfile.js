const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const del = require("del");

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
}

function cleanDist() {
  return del("dist");
}

function cleanDocs() {
  return del("docs");
}

function cleanDistWithoutImg() {
  return del(["dist/**", "!dist/img/**"]);
}

function images() {
  return src("app/img/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(webp())
    .pipe(dest("dist/img/"));
}

function scripts() {
  return src(["app/js/index.js"])
    .pipe(concat("index.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js/"))
    .pipe(browserSync.stream());
}

function styles() {
  return src("app/scss/style.scss")
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }).on("error", scss.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 versions"],
        grid: true,
      })
    )
    .pipe(dest("app/css/"))
    .pipe(browserSync.stream());
}

function build() {
  return src(
    [
      "app/css/style.min.css",
      "app/fonts/**/*",
      "app/js/index.min.js",
      "app/*.html",
    ],
    { base: "app" }
  ).pipe(dest("dist"));
}

function copyToDocs() {
  return src(
    [
      "dist/css/style.min.css",
      "dist/fonts/**/*",
      "dist/img/**/*",
      "dist/js/index.min.js",
      "dist/*.html",
    ],
    { base: "dist" }
  ).pipe(dest("docs"));
}

function watching() {
  watch("app/scss/**/*.scss", styles);
  watch(["app/js/**/*.js", "!app/js/index.min.js"], scripts);
  watch("app/*.html").on("change", browserSync.reload);
}

exports.browsersync = browsersync;
exports.styles = styles;
exports.watching = watching;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;
exports.cleanDocs = cleanDocs;
exports.cleanDistWithoutImg = cleanDistWithoutImg;
exports.copyToDocs = copyToDocs;

const fullBuild = series(styles, scripts, build);

exports.build = series(cleanDistWithoutImg, fullBuild);
exports.buildWithImages = series(cleanDist, images, fullBuild);
exports.publicWithImages = series(
  cleanDist,
  images,
  fullBuild,
  cleanDocs,
  copyToDocs
);
exports.public = series(cleanDistWithoutImg, fullBuild, cleanDocs, copyToDocs);
exports.default = parallel(styles, scripts, browsersync, watching);
