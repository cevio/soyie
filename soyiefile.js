/**
 * Created by evio on 15/9/1.
 */
var browserify = require('browserify');
var uglify = require('uglify-js');
var path = require('path');
var fs = require('fs');
var clc = require('cli-color');
var file = path.resolve(process.cwd(), 'src', 'index.js');
var bundle = browserify(file, { standalone: 'cmd' }).bundle();
var outfile = path.resolve(process.cwd(), 'dist', 'soyie.js');
var outminfile = path.resolve(process.cwd(), 'dist', 'soyie.min.js');

bundle.on('error', function(err) {
    if (err.stack) {
        console.error(err.stack);
    }else{
        console.error(String(err));
    }
    process.exit(1);
});

bundle.pipe(fs.createWriteStream(outfile)).on('finish', function(){
    console.log(clc.blue('- ') + clc.green('compress:js:browserify success > ') + outfile);
    console.log(clc.blue('- ') + clc.yellow('compress:js:uglify start > ') + outfile);
    var result = uglify.minify(outfile);
    fs.writeFileSync(outminfile, result.code, 'utf8');
    console.log(clc.blue('- ') + clc.green('compress:js:gulify success > ') + outminfile);
    console.log(clc.blue('- ') + clc.cyan('compress:js > success'));
    console.log('All done!');
}).on('error', function(){
    console.error('task catch error.');
});