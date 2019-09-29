import gulp from "gulp"; 
import del from "del";
import babelify from "babelify";
import bro from "gulp-bro";

import g_pug from "gulp-pug";
import g_img from "gulp-image";

import sass from "gulp-sass";
sass.compiler = require("node-sass");
import autoprefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";

import g_ws from "gulp-webserver";
import ghPages from "gulp-gh-pages";

const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build"
  },
  img: {
    src: "src/img/*",
    dest: "build/img"
  },
  js : {
    watch : "src/js/**/*.js",
    src : "src/js/main.js",
    dest: "build/js"
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css"
  }
};

const pugBuild = () => {
  return gulp
    .src(routes.pug.src)
    .pipe(g_pug())
    .pipe(gulp.dest(routes.pug.dest));
};
const imgBuild = () => {
  return gulp
    .src(routes.img.src)
    .pipe(g_img())
    .pipe(gulp.dest(routes.img.dest));
};
const jsBuild = () => {
  return gulp
    .src(routes.js.src)
    .pipe(bro({
      transform: [
        babelify.configure({ presets: ["@babel/preset-env"] }),
        [ 'uglifyify', { global: true } ]
      ]
    }))
    .pipe( gulp.dest(routes.js.dest) );
    
}

const webserver = () => {
  return gulp.src("build").pipe(g_ws({ livereload: true, open: true }));
};

const scssBuild = () => {
  return gulp
    .src(routes.scss.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));
};

const deploy = () =>{
  return gulp
    .src("build/**/*")
    .pipe(ghPages({
      brach: "release"
    }));
}

const watch = () => {
  gulp.watch(routes.pug.watch, pugBuild);
  gulp.watch(routes.scss.watch, scssBuild);
  gulp.watch(routes.js.watch, jsBuild);
  gulp.watch(routes.img.src, imgBuild);
};

const clean = () => {
  return del(["build/", ".publish"]);
};

// series 보다 runSequence 가 나을지도?
const live = gulp.parallel([webserver, watch]);
const prepare = gulp.series([clean, imgBuild]);
const assets = gulp.series([pugBuild, scssBuild, jsBuild]);

export const build = gulp.series([prepare, assets])
export const dev = gulp.series([build, live]);
export const release = gulp.series([build, deploy]);