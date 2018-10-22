const gulp = require('gulp');
const selenium = require('selenium-standalone');
const mocha = require('gulp-mocha');
const runSequence = require('run-sequence');
const allure = require("mocha-allure-reporter");

gulp.task('selenium', function (done) {
    return selenium.install(
        {
            logger: function (message) {
                console.log(message);
            }
        },
        function (error) {
            if (error) {
                return done(error);
            }

            selenium.start(function (error, child) {
                if (error) {
                    return done(error);
                }
                selenium.child = child;
                done();
            });
        }
    );
});

gulp.task('mocha', function () {
    return gulp
        .src('tests/**/**.js', {read: false})
        .pipe(mocha())
        .once('error', err => {
            console.error(err);
            process.exit(1);
        })
        .once('end', () => {
            process.exit();
        }).pipe(gulp.dest('./build/screenshots'));
});

gulp.task('test', function (callback) {
    return runSequence('mocha', function () {
        //selenium.child.kill();
        console.log("Tests ara finished!!##############################################");
        callback();
    });
});
