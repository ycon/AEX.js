
define([
	'extern/ES5',
	'builders/aeBuilder',
	'graph',
	'renderers/dom/Renderer',
	'utils/browser'
], function (
	ES5,
	aeBuilder,
	graph,
	DomRenderer,
	browser
) {

	var global = (function(){ return this || (1,eval)('this'); })(),
		exp = (typeof exports !== 'undefined') ? exports : {};

	exp.build = aeBuilder.build;
	exp.Composition = graph.Composition;
	exp.Text = graph.Text;
	exp.Solid = graph.Solid;
	exp.Camera = graph.Camera;
	exp.DomRenderer = DomRenderer;
	exp.browser = browser;

	if(typeof global.define === 'function' && global.define.amd){
		define('aex', [], function(){ return exp; });
	} else if (typeof module !== 'undefined' && module.exports){
		module.exports = exp;
	} else {
		global.aex = exp;
	}

	return exp;
});
