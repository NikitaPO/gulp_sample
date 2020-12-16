"use strict";

const { src, dest } = require("gulp");
const scss = require("gulp-sass");
const concat = require("gulp-concat");
// scss.compiler = require("sass");

function styles() {
  return src("app/scss/style.scss")
    .pipe(scss({ outputStyle: "compressed" }).on("error", scss.logError))
    .pipe(dest("dist/css/"));
}

exports.styles = styles;
