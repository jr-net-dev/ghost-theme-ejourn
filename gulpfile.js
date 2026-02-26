const {series, parallel, watch, src, dest} = require('gulp');
const pump = require('pump');
const fs = require('fs');
const order = require('ordered-read-streams');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const beeper = require('beeper');
const zip = require('gulp-zip');

// postcss plugins
const easyimport = require('postcss-easy-import');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

function serve(done) {
    livereload.listen();
    done();
}

function handleError(done) {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', 'partials/**/*.hbs']),
        livereload()
    ], handleError(done));
}

// --- Journal CSS ---
function journalCss(done) {
    pump([
        src('assets/css/journal-screen.css', {sourcemaps: true}),
        postcss([
            easyimport,
            autoprefixer(),
            cssnano()
        ]),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

// --- Edge CSS ---
function edgeCss(done) {
    pump([
        src('assets/css/edge-screen.css', {sourcemaps: true}),
        postcss([
            easyimport,
            autoprefixer(),
            cssnano()
        ]),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

// --- Journal JS ---
function getJournalJsFiles(version) {
    const jsFiles = [
        src(`node_modules/@tryghost/shared-theme-assets/assets/js/${version}/lib/**/*.js`),
        src(`node_modules/@tryghost/shared-theme-assets/assets/js/${version}/main.js`),
    ];

    if (fs.existsSync('assets/js/journal/lib')) {
        jsFiles.push(src('assets/js/journal/lib/*.js'));
    }

    if (fs.existsSync('assets/js/shared')) {
        jsFiles.push(src('assets/js/shared/*.js'));
    }

    jsFiles.push(src('assets/js/journal/main.js'));

    return jsFiles;
}

function journalJs(done) {
    pump([
        order(getJournalJsFiles('v1'), {sourcemaps: true}),
        concat('journal-main.min.js'),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

// --- Edge JS ---
function getEdgeJsFiles(version) {
    const jsFiles = [
        src(`node_modules/@tryghost/shared-theme-assets/assets/js/${version}/lib/**/*.js`),
        src(`node_modules/@tryghost/shared-theme-assets/assets/js/${version}/main.js`),
    ];

    if (fs.existsSync('assets/js/edge/lib')) {
        jsFiles.push(src('assets/js/edge/lib/*.js'));
    }

    if (fs.existsSync('assets/js/shared')) {
        jsFiles.push(src('assets/js/shared/*.js'));
    }

    jsFiles.push(src('assets/js/edge/main.js'));

    return jsFiles;
}

function edgeJs(done) {
    pump([
        order(getEdgeJsFiles('v1'), {sourcemaps: true}),
        concat('edge-main.min.js'),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

// --- Combined tasks ---
const css = parallel(journalCss, edgeCss);
const js = parallel(journalJs, edgeJs);

function zipper(done) {
    const pkg = require('./package.json');
    const filename = pkg.name + '-' + pkg.version + '.zip';

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**',
            '!yarn-error.log'
        ]),
        zip(filename),
        dest('dist/')
    ], handleError(done));
}

const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const journalCssWatcher = () => watch('assets/css/journal/**/*.css', journalCss);
const edgeCssWatcher = () => watch('assets/css/edge/**/*.css', edgeCss);
const journalEntryWatcher = () => watch('assets/css/journal-screen.css', journalCss);
const edgeEntryWatcher = () => watch('assets/css/edge-screen.css', edgeCss);
const journalJsWatcher = () => watch('assets/js/journal/**/*.js', journalJs);
const edgeJsWatcher = () => watch('assets/js/edge/**/*.js', edgeJs);
const sharedCssWatcher = () => watch('assets/css/shared/**/*.css', parallel(journalCss, edgeCss));
const sharedJsWatcher = () => watch('assets/js/shared/**/*.js', parallel(journalJs, edgeJs));
const watcher = parallel(hbsWatcher, journalCssWatcher, edgeCssWatcher, journalEntryWatcher, edgeEntryWatcher, journalJsWatcher, edgeJsWatcher, sharedCssWatcher, sharedJsWatcher);
const build = series(css, js);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = series(build, serve, watcher);
