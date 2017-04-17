var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var merge = require('merge-stream');
var rename = require('gulp-rename');

// 生成build
var libJavascriptPaths = ['./node_modules/jquery/dist/jquery.min.js',
    './node_modules/three/build/three.min.js',
    './node_modules/d.js/lib/D.min.js',
    './node_modules/uevent/uevent.min.js',
    './node_modules/dot/doT.min.js',
    './node_modules/three/examples/js/renderers/CanvasRenderer.js',
    './node_modules/three/examples/js/renderers/Projector.js',
    './node_modules/three/examples/js/postprocessing/EffectComposer.js',
    './node_modules/three/examples/js/postprocessing/RenderPass.js',
    './node_modules/three/examples/js/postprocessing/ShaderPass.js',
    './node_modules/three/examples/js/postprocessing/MaskPass.js',
    './node_modules/three/examples/js/shaders/CopyShader.js',
    './node_modules/three/examples/js/controls/DeviceOrientationControls.js',
    './node_modules/photo-sphere-viewer/dist/photo-sphere-viewer.min.js'
];

var libCssPaths = [
    './node_modules/photo-sphere-viewer/dist/photo-sphere-viewer.min.css'
];

var buildSrc = './src/paranoma-roaming';
var buildDest = './build/paranoma-roaming';

gulp.task('clean-build', function() {
    return gulp.src('./build/', {
        read: false
    }).pipe(plugins.clean());
});

gulp.task('build-libsJavascript', function() {
    return gulp.src(libJavascriptPaths)
        .pipe(plugins.concat('photo-sphere-viewer.min.js'))
        .pipe(gulp.dest(buildDest));
});

gulp.task('build-libsCss', function() {
    return gulp.src(libCssPaths)
        .pipe(plugins.concat('photo-sphere-viewer.min.css'))
        .pipe(gulp.dest(buildDest));
});

gulp.task('build-src-js', function() {
    return gulp.src(buildSrc + '/*.js')
        .pipe(gulp.dest(buildDest))
        .pipe(plugins.uglify())
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(buildDest));
});

gulp.task('build-src-css', function() {
    return gulp.src(buildSrc + '/*.css')
        .pipe(gulp.dest(buildDest))
        .pipe(plugins.csso())
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(buildDest));
});

gulp.task('build-src-image', function() {
    return gulp.src(buildSrc + '/*.gif')
        .pipe(gulp.dest(buildDest));
});

gulp.task('build-src-html', function() {
    return gulp.src(buildSrc + '/*.html')
        .pipe(gulp.dest(buildDest));
});

gulp.task('build-libsJavascript', function() {
    return gulp.src(libJavascriptPaths)
        .pipe(plugins.concat('photo-sphere-viewer.min.js'))
        .pipe(gulp.dest(buildDest));
});

// 生成build task
gulp.task('build-build', plugins.sequence(
    'clean-build', ['build-libsCss', 'build-libsJavascript',
        'build-src-js', 'build-src-css', 'build-src-image', 'build-src-html'
    ]));

// 生成dist
var buildDistSrc = './build/paranoma-roaming';
var buildDistDest = './dist/paranoma-roaming';

gulp.task('clean-dist', function() {
    return gulp.src('./dist/', {
        read: false
    }).pipe(plugins.clean());
});

gulp.task('build-dist-html', function() {
    return gulp.src(buildDistSrc + '/*.html')
        .pipe(gulp.dest(buildDistDest));
});

gulp.task('build-dist-image', function() {
    return gulp.src(buildDistSrc + '/*.gif')
        .pipe(gulp.dest(buildDistDest));
});

gulp.task('build-dist-css', function() {
    return gulp.src([buildDistSrc + '/photo-sphere-viewer.min.css', buildDistSrc + '/paranoma-roaming.min.css'])
        .pipe(plugins.concat('paranoma-roaming.min.css'))
        .pipe(gulp.dest(buildDistDest));
});

gulp.task('build-dist-js', function() {
    // merge-stream 合并两个stream流
    var stream = merge();

    var concatJs = gulp.src([buildDistSrc + '/photo-sphere-viewer.min.js', buildDistSrc + '/paranoma-roaming.min.js'])
        .pipe(plugins.concat('paranoma-roaming.min.js'))
        .pipe(gulp.dest(buildDistDest));

    stream.add(concatJs);

    var otherJs = gulp.src([buildDistSrc + '/preload.min.js'])
        .pipe(rename(function(path) {
            // path.dirname += '/ciao';
            path.basename = 'preload';
            // path.extname = '.md';
        }))
        .pipe(gulp.dest(buildDistDest));

    stream.add(otherJs);

    return stream;
});

// 生成dist task
gulp.task('build-dist', plugins.sequence(
    'build-build', 'clean-dist', ['build-dist-html', 'build-dist-image',
        'build-dist-css', 'build-dist-js'
    ]));
