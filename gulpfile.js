"use strict";

const gulp = require("gulp");

gulp.task("copy", function () {
    return gulp.src("./src/**/*.*")
        .pipe(gulp.dest("./dev/"))

});

gulp.task("start", gulp.series("copy"));