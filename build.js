
/*global require */

var requirejs = require('requirejs');
var fs = require('fs');


var config = {
    baseUrl    : './lib',
    name       : 'extern/almond',
    include    : ["main"],
    exclude    : ["text"],
    out        : './build/aex.build.js',
    optimize   : "none",
    inlineText : true,
    wrap       : true
};

console.log("Building optimized library");

requirejs.optimize(config, function (buildResponse) {

    console.log("Optimzed library built");
    console.log("Minimizing optimized library");

    var contents = fs.readFileSync(config.out, 'utf8'),
        jsp      = require("uglify-js").parser,
        pro      = require("uglify-js").uglify,
        ast      = jsp.parse(contents); // parse code and get the initial AST


    ast = pro.ast_mangle(ast,{toplevel:true}); // get a new AST with mangled names
    ast = pro.ast_squeeze(ast); // get an AST with compression optimizations

    var final_contents = pro.gen_code(ast); // compressed code here
    fs.writeFileSync('./build/aex.min.js', final_contents, 'utf8');

    console.log("Optimized library minimized");
});

var exporter_config = {

    baseUrl    : './lib',
    name       : 'extern/almond',
    include    : ["exporter"],
    out        : './build/exporter/aex_export.jsx',
    optimize   : "none",
    inlineText : true,
    wrap       : {

        start  : "var global = this; \n (function() {",
        end    : "})();"
    }
};

console.log("Building exporter");

requirejs.optimize(exporter_config, function (buildResponse) {

    console.log("Exporter built");

    var contents = fs.readFileSync(exporter_config.out, 'utf8'),
        ae_cs55  = '/Applications/Adobe After Effects CS5.5/Scripts/ScriptUI Panels',
        ae_cs5   = '/Applications/Adobe After Effects CS5/Scripts/ScriptUI Panels',
        old_jsx  = fs.createReadStream('./build/exporter/aex_export.jsx'),
        old_swf  = fs.createReadStream('./build/exporter/timeout.swf'),
        new_jsx, new_swf;

    try {

        if (fs.lstatSync(ae_cs55).isDirectory()) {

            console.log("After Effects CS5.5 detected, installing exporter");

            new_jsx = fs.createWriteStream(ae_cs55+'/aex_export.jsx');
            require('util').pump(old_jsx, new_jsx);

            new_swf = fs.createWriteStream(ae_cs55+'/timeout.swf');
            require('util').pump(old_swf, new_swf);

            console.log("Exporter installed on After Effects CS5.5");
        }

    } catch (e) {

    }

    try {
        if (fs.lstatSync(ae_cs5).isDirectory()) {

            console.log("After Effects CS5 detected, installing exporter");

            new_jsx = fs.createWriteStream(ae_cs5+'/aex_export.jsx');
            require('util').pump(old_jsx, new_jsx);

            new_swf = fs.createWriteStream(ae_cs5+'/timeout.swf');
            require('util').pump(old_swf, new_swf);

            console.log("Exporter installed on After Effects CS5");
        }
    } catch (e) {

    }
});
