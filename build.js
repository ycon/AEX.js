
/*global require */

var requirejs = require('requirejs');
var fs = require('fs');


var config = {
    baseUrl: './lib',
    name: 'extern/almond',
    include: ["main"],
    out: './build/aex.build.js',
    optimize: "none",
    inlineText: true,
    wrap: true
};

requirejs.optimize(config, function (buildResponse) {

    var contents = fs.readFileSync(config.out, 'utf8');
    var jsp = require("uglify-js").parser;
    var pro = require("uglify-js").uglify;
    var ast = jsp.parse(contents); // parse code and get the initial AST
    ast = pro.ast_mangle(ast,{toplevel:true}); // get a new AST with mangled names
    ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    var final_contents = pro.gen_code(ast); // compressed code here
    fs.writeFileSync('./build/aex.min.js', final_contents, 'utf8');
});

var exporter_config = {

    baseUrl: './lib',
    name: 'extern/almond',
    include: ["exporter"],
    out: './build/exporter/aex_export.jsx',
    optimize: "none",
    inlineText: true,
    wrap: {
        start: "var global = this; \n (function() {",
        end: "})();"
    }
};

requirejs.optimize(exporter_config, function (buildResponse) {

    var contents = fs.readFileSync(exporter_config.out, 'utf8');
    var ae_cs55 = '/Applications/Adobe After Effects CS5.5/Scripts/ScriptUI Panels';
    var ae_cs5 = '/Applications/Adobe After Effects CS5/Scripts/ScriptUI Panels';

    var new_jsx;
    var old_jsx = fs.createReadStream('./build/exporter/aex_export.jsx');

    var new_swf;
    var old_swf = fs.createReadStream('./build/exporter/timeout.swf');

    try {

        if (fs.lstatSync(ae_cs55).isDirectory()) {

            new_jsx = fs.createWriteStream(ae_cs55+'/aex_export.jsx');
            require('util').pump(old_jsx, new_jsx);

            new_swf = fs.createWriteStream(ae_cs55+'/timeout.swf');
            require('util').pump(old_swf, new_swf);
        }

    } catch (e) {

    }

    try {
        if (fs.lstatSync(ae_cs5).isDirectory()) {

            new_jsx = fs.createWriteStream(ae_cs5+'/aex_export.jsx');
            require('util').pump(old_jsx, new_jsx);

            new_swf = fs.createWriteStream(ae_cs5+'/timeout.swf');
            require('util').pump(old_swf, new_swf);
        }
    } catch (e) {

    }

    //fs.writeFileSync('./build/aex.min.js', final_contents, 'utf8');
});
