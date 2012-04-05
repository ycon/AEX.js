/*

 JS Signals <http://millermedeiros.github.com/js-signals/>
 Released under the MIT license
 Author: Miller Medeiros
 Version: 0.7.1 - Build: 244 (2011/11/29 12:33 PM)
*/
var obj
(function(g){function f(a,b,d,h,c){this._listener=b;this._isOnce=d;this.context=h;this._signal=a;this._priority=c||0}function e(a,b){if(typeof a!=="function")throw Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}",b));}var c={VERSION:"0.7.1"};f.prototype={active:!0,params:null,execute:function(a){var b;this.active&&this._listener&&(a=this.params?this.params.concat(a):a,b=this._listener.apply(this.context,a),this._isOnce&&this.detach());return b},detach:function(){return this.isBound()?
this._signal.remove(this._listener):null},isBound:function(){return!!this._signal&&!!this._listener},getListener:function(){return this._listener},_destroy:function(){delete this._signal;delete this._listener;delete this.context},isOnce:function(){return this._isOnce},toString:function(){return"[SignalBinding isOnce:"+this._isOnce+", isBound:"+this.isBound()+", active:"+this.active+"]"}};c.Signal=function(){this._bindings=[];this._prevParams=null};c.Signal.prototype={memorize:!1,_shouldPropagate:!0,
active:!0,_registerListener:function(a,b,d,c){var e=this._indexOfListener(a);if(e!==-1){if(a=this._bindings[e],a.isOnce()!==b)throw Error("You cannot add"+(b?"":"Once")+"() then add"+(!b?"":"Once")+"() the same listener without removing the relationship first.");}else a=new f(this,a,b,d,c),this._addBinding(a);this.memorize&&this._prevParams&&a.execute(this._prevParams);return a},_addBinding:function(a){var b=this._bindings.length;do--b;while(this._bindings[b]&&a._priority<=this._bindings[b]._priority);
this._bindings.splice(b+1,0,a)},_indexOfListener:function(a){for(var b=this._bindings.length;b--;)if(this._bindings[b]._listener===a)return b;return-1},has:function(a){return this._indexOfListener(a)!==-1},add:function(a,b,d){e(a,"add");return this._registerListener(a,!1,b,d)},addOnce:function(a,b,d){e(a,"addOnce");return this._registerListener(a,!0,b,d)},remove:function(a){e(a,"remove");var b=this._indexOfListener(a);b!==-1&&(this._bindings[b]._destroy(),this._bindings.splice(b,1));return a},removeAll:function(){for(var a=
this._bindings.length;a--;)this._bindings[a]._destroy();this._bindings.length=0},getNumListeners:function(){return this._bindings.length},halt:function(){this._shouldPropagate=!1},dispatch:function(a){if(this.active){var b=Array.prototype.slice.call(arguments),d=this._bindings.length,c;if(this.memorize)this._prevParams=b;if(d){c=this._bindings.slice();this._shouldPropagate=!0;do d--;while(c[d]&&this._shouldPropagate&&c[d].execute(b)!==!1)}}},forget:function(){this._prevParams=null},dispose:function(){this.removeAll();
delete this._bindings;delete this._prevParams},toString:function(){return"[Signal active:"+this.active+" numListeners:"+this.getNumListeners()+"]"}};typeof define==="function"&&define.amd?define("signals",[],c):typeof module!=="undefined"&&module.exports?module.exports=c:g.signals=c})(this);

var signals = this.signals;
/*
    http://www.JSON.org/json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}


var BlendingModes = {
		
	getString : function(val){

		switch(val){

			case BlendingMode.ADD:
				return "add";
				break;
			case BlendingMode.COLOR_BURN:
				return "subtract";
				break;
			case BlendingMode.DARKEN:
				return "darken";
				break;
			case BlendingMode.DIFFERENCE:
				return "difference";
				break;
			case BlendingMode.HARD_LIGHT:
				return "hardlight";
				break;
			case BlendingMode.LIGHTEN:
				return "lighten";
				break;
			case BlendingMode.LINEAR_LIGHT:
				return "hardlight";
				break;
			case BlendingMode.MULTIPLY:
				return "multiply";
				break;
			case BlendingMode.NORMAL:
				return "normal";
				break;
			case BlendingMode.OVERLAY:
				return "overlay";
				break;
			case BlendingMode.SCREEN:
				return "screen";
				break;
			case BlendingMode.SILHOUETE_ALPHA:
				return "erase";
				break;
			case BlendingMode.STENCIL_ALPHA:
				return "alpha";
				break;
			default:
				return "normal";
			break;
		}
	},

	getMaskString : function(val){

		switch(val){
			case MaskMode.NONE:
				return 'none';
				break;
			case MaskMode.ADD:
				return 'add';
				break;
			case MaskMode.SUBTRACT:
				return 'subtract';
				break;
			case MaskMode.INTERSECT:
				return 'intersect';
				break;
			case MaskMode.LIGHTEN:
				return 'lighten';
				break;
			case MaskMode.DARKEN:
				return 'darken';
				break;
			case MaskMode.DIFFERENCE:
				return 'difference';
				break;
			default:
				return 'add';
		}
	}
};

var PropertyCleaner = {
	
	cleanAVLayer : function( result, layer , project ){
		
		var i,mask,mask_res;

		for( i = 1; i <= layer.Masks.numProperties; i++ ){
			
			mask_res = result.masks[i-1];
			mask = layer.Masks.property(i);
			
			mask_res.maskMode = BlendingModes.getMaskString(mask.maskMode);
			mask_res.inverted = mask.inverted;
			delete mask_res.type;

		}
		
		
		delete result.layerStyles;
		
		if ( ProjectExporter.canParseProperty( layer.property("Layer Styles"), true ) ){
			
			result.layerStyles =  ProjectExporter.getProperties( layer.property("Layer Styles"), project, true, options );
			result.layerStyles.blendingOptions = ProjectExporter.getProperties( layer.property("Layer Styles").property("Blending Options"), project, false, options );
			
		}

		if ( result.effects ){
			
	        for( i = 0; i < result.effects.length; i++ ){
	        	
	            result.effects[i].type = result.effects[i].type.replace("aDBE","");
	            
	        }
	    }
		
		if (result.is3D){
			
			this.cleanRotation(result.transform);
	        
			delete result.materialOptions;
			
			//delete result.transform.xPosition;
			//delete result.transform.yPosition;
			//delete result.transform.zPosition;
			
		} else {
			
			result.transform.rotation = result.transform.xRotation;
			delete result.transform.xRotation;
			delete result.transform.yRotation;
			delete result.transform.orientation;
			
			//delete result.transform.xPosition;
			//delete result.transform.yPosition;
			
		}
		
	},
	
	cleanTextLayer : function(result, layer, project, options){
		
		result.type = "Text";
		result.text.sourceText.valign = options.valign || 'top';
		result.text.sourceText.text = "["+result.text.sourceText.text+"]";

		if (options.leading){
			
			layer.text.sourceText.leading = options.leading;
			
		}
		
		if (layer.Masks.numProperties >= 1){
			
			result.text.bounds = this.getMaskBounds(layer.Masks.property(1));
			
		}

	},
	
	cleanCameraLayer : function( result, layer , project ){
		result.type = "Camera";

	    if (result.transform){
	        //delete result.transform.xPosition;
	        //delete result.transform.yPosition;
	        //delete result.transform.zPosition;
	    	
	    	this.cleanRotation(result.transform);
	        
	    	
	    	
	        if (result.transform.pointofInterest){
	        	//$.write(layer.Transform["Point of Interest"].active);
	        	result.transform.target = result.transform.pointofInterest;
	        	delete result.transform.pointofInterest;
	        }

	        delete result.transform.opacity;
	        
	        if (result.cameraOptions){
	            result.transform.zoom = result.cameraOptions.zoom;
	        }
	    }
	    delete result.cameraOptions;
	},
	
	getMaskBounds : function(m_obj){
		
		var v  = m_obj.maskShape.value.vertices,
			max_x = -1000000000000000000,
			max_y = -1000000000000000000,
			result = {};
		
		result.x = 1000000000000000000;
		result.y = 1000000000000000000;
		
		for(var i=0;i<v.length;i++){
			
			result.x = Math.min(result.x,v[i][0]);
			result.y = Math.min(result.y,v[i][1]);
			max_x = Math.max(max_x,v[i][0]);
			max_y = Math.max(max_y,v[i][1]);
			
		}
		
		result.width = (max_x-result.x).toFixed(2);
		result.height = (max_y-result.y).toFixed(2);
		result.x = result.x.toFixed(2);
		result.y = result.y.toFixed(2);

		return result;
	},
	
	cleanRotation : function( obj ) {
		
		obj.rotation = [ obj.xRotation || 0,
		                 obj.yRotation || 0,
		                 obj.zRotation || 0
		               ];
		
		delete obj.xRotation;
		delete obj.yRotation;
		delete obj.zRotation;
	}
};

var PropertyExporter = {
		
	getProperty : function( prop, project, options ){
		
		/*
		var keys = [[value,time,type,ease,path]];
		var val = [[value,time]];
		var val = [value];
		var val = value;
		var val = [[0],0,0];
		var val = [0,0,0];
		
		var val = ["L",0,0,"C",100,100,100,100,100,100,100,100,100,100,100,100];

		*/
		
		if (prop.isTimeVarying){
			
			var keys = [],
				y,
				key,
				ease,
				time,
				in_type,
				out_type,
				type,
				in_anchor,
				out_anchor,
				anchors,
				bezier_type = KeyframeInterpolationType.BEZIER,
				linear_type = KeyframeInterpolationType.LINEAR,
				old_type = 1,
				old_time = 0,
				old_time_dif = 0,
				old_ease = [],
				old_anchors = [];
			
			for ( var i = 1; i <= prop.numKeys; i++ ) {
				

				key = [this.getSimpleProperty( prop, prop.keyValue(i) )];
				
				time = prop.keyTime(i)-old_time;
				key.push(time);
				
				in_type = prop.keyInInterpolationType(i);
				out_type = prop.keyInInterpolationType(i);
				
				/*
				
				key :	[ value, time, ease, anchors ]
						[ value, time, ease ]
						[ value, time ]
						value
				
				types:
				
				1 = holdIn + holdOut
				2 = holdIn + linearOut
				3 = holdIn + bezierOut
				4 = linearIn + holdOut
				5 = linearIn + linearOut
				6 = linearIn + bezierOut
				7 = bezierIn + holdOut
				8 = bezierIn + linearOut
				9 = bezierIn + bezierOut
				
				*/
				
				type = 1;
				
				if (out_type === linear_type){
					type = 2;
				} else if (out_type === bezier_type){
					type = 3;
				}
				
				if (in_type === linear_type){
					type += 3;
				} else if (in_type === bezier_type){
					type += 6;
				}
				
				ease = [];
				
				if ( type > 6 ){
					ease = ease.concat(this.getEaseData( prop.keyInTemporalEase(i) ));
				}
				
				if ( type%3 === 0 ){
					ease = ease.concat(this.getEaseData( prop.keyOutTemporalEase(i) ));
				}
				
				key.push(type);
				
				if ( ease.length && ease.join(',') !== old_ease.join(',') ){
					key.push(ease);
				}
				
				old_ease = ease;
				
				if (prop.isSpatial){

					in_anchor = prop.keyInSpatialTangent(i);
					out_anchor = prop.keyOutSpatialTangent(i);
					anchors = [];
					
					for ( y = 0; y < in_anchor.length; i++) {
						anchors.push(in_anchor[y]);
					}
					
					for ( y = 0; y < out_anchor.length; i++) {
						anchors.push(out_anchor[y]);
					}
					
					if (anchors != old_anchors){
						key.push(anchors);
					}

				} else {
					anchors = undefined;
				}
				
				old_anchors = anchors;
				
				
				if (key.length == 3 && type === old_type) {
					key.pop();
				}
				
				old_type = type;
				
				if (key.length === 2 && time === old_time_dif) {
					key.pop();
				}
				
				old_time_dif = time;
				old_time += old_time_dif;
				
				if (keys.length && !key.length) {
					keys.push(key[0]);
				} else {
					keys.push(key);
				}
				
			}
			
			return keys;
			
		} else {
			return this.getSimpleProperty( prop, prop.valueAtTime( 0, true ) );
		}

	},
	
	getEaseData : function(data){
		
		var result = [];
		
		for ( var i = 0; i < data.length; i++) {
			
			result.push( data[i].speed, data[i].influence );
			
		}
		
		return result;
	},
	
	getSimpleProperty : function( prop, value){
		
		var divider = (prop.unitsText === "percent") ? 100 : 1;
		
        switch (prop.propertyValueType){
        	case PropertyValueType.MARKER:
        		return this.getMarker(value);
	        case PropertyValueType.SHAPE:
	        	return this.getShape(value);
	        case PropertyValueType.TEXT_DOCUMENT:
	        	return this.getText(value);
	            break;
	        case PropertyValueType.TwoD_SPATIAL:
            case PropertyValueType.TwoD:
            	return [value[0]/divider,value[1]/divider];
            	
	        default :
	        	
	        	return [value[0]/divider,value[1]/divider,value[2]/divider];
	    }
        
	},
	
	getMarker : function(val){
		return "marker";
	},
	
	getShape : function(val){
		return "shape";
	},

	getText : function(val){
		return "text";
	},
};
﻿

var ProjectExporter = {
		
	getProject : function(comp) {
		
		var project = {	
			items : {}
		};
		
		project.root = this.getItem(comp,project);
		
		return project;
	},
	
	getItem : function( item, project ){
		
		if ( !project.items[item.id] ){
			
			var options = JSON.parse(item.comment || "{}");
			
			var result = {
				name : item.name,
				id : item.id,
				type : item.typeName,
				width : item.width,
				height : item.height,
			};

			switch (item.typeName) {
			
				case 'Composition':
					this.setComp( item, result, project );
					break;
				case 'Footage':
					
					var source = item.mainSource;
					
					if (source.toString() == '[object FileSource]'){
						
						 result.src = options.src || source.file.displayName;
						 
						 if (source.isStill){
							 
							 result.type = "Image";
							 
						 } else {
							 
							 result.type = "Video";
							 result.frameRate = item.frameRate;
							 result.duration = item.duration;
							 
						 }
					} else {
						
						result.type = "Solid";
                   	 
						if (source.toString() == '[object SolidSource]'){
	                   		 
							result.color = this.getColor(source.color);
							
						}
						
					}
					
					break;
			};
			
			project.items[item.id] = result;
			
		}
		
		return item.id;
		
	},
	
	setComp : function(comp,result,project){
		
		result.layers = [];
		result.type = "Composition";
		result.color = this.getColor(comp.bgColor);
		
		var parents = [],
			layer,
			layer_opt;
		
		for ( var i = 1; i < comp.layers.length; i++) {
			
			layer = comp.layers[i];
			
			if ( layer.parent != null && JSON.parse(layer.comment || "{}").exportable !== false ) {
				
				parents.push(layer.parent);
	            
			}
			
			if (layer.selected){
				
				layer.selected = false;
				
			}
		}
		
		for ( var i = 1; i <= comp.layers.length; i++) {
			
			layer = comp.layers[i];
			layer_opt = JSON.parse(layer.comment || "{}");
			
			var exportable = layer_opt.exportable !== false;
			
			if ( exportable  && ( layer.enabled || layer.isTrackMatte || parents.indexOf(layer) !== -1 ) ){
				
				result.layers.push( this.getLayer( layer, layer_opt, project ) );
				
			};
			
		}

	},
	
	getLayer : function( layer, options, project ) {
		
		var result = {
				
			id : layer.index,
			name : options.id || layer.name,
			startTime : layer.startTime,
			inPoint : layer.inPoint,
			outPoint : layer.outPoint
			
		};
		
		if (layer.parent !== null) {
			result.parent = layer.parent.index;
		}
		
		if (layer.stretch !== 100) {
			result.stretch = layer.stretch;
		}
		
		switch ( layer.autoOrient ){
			case AutoOrientType.ALONG_PATH:
				result.autoOrient = 'path';
				break;
			case AutoOrientType.CAMERA_OR_POINT_OF_INTEREST:
				if ( ! (layer instanceof CameraLayer) ) result.autoOrient = 'camera';
				break;
			default:
				if ( layer instanceof CameraLayer ) result.autoOrient = 'none';
		}
		
		var properties = this.getProperties( layer, project, false, options );
		
		for(var prop_name in properties){
			
	        result[prop_name] = properties[prop_name];
	        
	    }

		if (layer instanceof AVLayer || layer instanceof TextLayer || layer instanceof ShapeLayer){

			if (layer.adjustmentLayer) result.adjustmentLayer = true;
			if (layer.threeDLayer) result.is3D = true;
			if (layer.threeDPerChar) result.have3DCharacter = true;
			if (layer.collapseTransformation) result.collapse = true;
			//if (layer.audioActive) result.audioActive = true;
			if (layer.blendingMode !== BlendingMode.NORMAL) result.blendingMode = BlendingModes.getString(l.blendingMode);

			if (layer.hasTrackMatte) {

				switch(layer.trackMatteType){

					case TrackMatteType.ALPHA:
						result.trackType = "alpha";
						break;
	
					case TrackMatteType.ALPHA_INVERTED:
						result.trackType = "alpha_inverted";
						break;
	
					case TrackMatteType.LUMA:
						result.trackType = "luma";
						break;
	
					case TrackMatteType.LUMA_INVERTED:
						result.trackType = "luma_inverted";
						break;
				}

			}
			
			PropertyCleaner.cleanAVLayer( result, layer, project, options );
			
			if ( layer.source && !layer.nullLayer ){
				
		        result.source = this.getItem( layer.source, project );
		        
		    }
			
			
			
		}
		
		
		
		if ( layer instanceof TextLayer ){
			
			PropertyCleaner.cleanTextLayer(result, layer, project, options);
			
		} else if ( layer instanceof ShapeLayer ) {
			
		} else if (layer instanceof CameraLayer) {
			
			PropertyCleaner.cleanCameraLayer(result, layer, project, options);
			
		}
		
		return result;
	},
	
	getProperties : function( item, project, removeStyle, options ){
		
		var result,i;
		
		switch( item.propertyType ){
		
	        case PropertyType.INDEXED_GROUP:
	        	
	            result = [];
	            
	            for( i=1; i<=item.numProperties; i++ ){
	            	
	                if ( this.canParseProperty( item.property(i), removeStyle, true ) ){
	                	
	                    result.push( this.getProperties( item.property(i), project, removeStyle, options ) );
	                    
	                }
	                
	            }
	            
	            break;
	            
	        case PropertyType.NAMED_GROUP:
	        	
	            result = {};
	            
	            for( i = 1; i <= item.numProperties; i++ ){
	            	
	                if ( this.canParseProperty( item.property(i), removeStyle ) ){
	                	
	                    result[ this.legalizeName( item.property(i).name ) ] = this.getProperties( item.property(i), project, removeStyle, options );
	                    
	                }
	                
	            }
	            
	            if ( item.parentProperty ){
	            	
	                if ( item.parentProperty.propertyType == PropertyType.INDEXED_GROUP ){
	                	
	                    item.type = this.legalizeName(item.matchName);
	                    
	                }
	                
	            }
	            
	            break;
	            
	        default:
	        	
	        	var divider = (item.matchName.match(/opacity$|scale$|/gi)) ? 100 : 1;
	        	
	        	result = PropertyExporter.getProperty( item, project, options, divider );
	        
	    }

		return result;
	},
	
	getColor : function( color ){
		
		var r = Math.floor( Math.min( Math.max( color[0], 0 ), 1 )*0xFF );
		var g = Math.floor( Math.min( Math.max( color[1], 0 ), 1 )*0xFF );
		var b = Math.floor( Math.min( Math.max( color[2], 0 ), 1 )*0xFF );
		
		return "#" + Math.floor( ( r<<16 ) + ( g<<8 ) + b ).toString(16);
		
	},
	
	legalizeName : function( val ){
		
		var name = val.replace(/[^a-z0-9A-Z_]/g,"");
		
		return name[0].toLowerCase() +name.slice(1);

	},
	
	canParseProperty : function ( prop, removeStyle, deep ){
		
	    if (!deep){
	    	
	    	if (!prop.isModified 
	    		&& prop.name != "Position" 
	    		&& prop.name != "Anchor Point" 
	    		&& prop.name != "Zoom" 
	    		&& prop.name != "Point of Interest"  
	    		&& !removeStyle ) {
	    		return false;
	    		
	    	}
	    	
	    }
	    
	    if ( removeStyle && !( prop.canSetEnabled && prop.enabled ) ) {
	        return false;
	        
	    }
	     
	    if (prop.canSetEnabled){
	    	
	        if (prop.enabled == false){
	        	return false;
	        }
	        
	    }
	    
	    if (!prop.active){
	    	return false;
	    }
	    
	    if ( removeStyle ){
	    	return true;
	    }
	    
	    switch( prop.propertyType ){
	    
	        case PropertyType.INDEXED_GROUP:
	        case PropertyType.NAMED_GROUP:
	            
	            if ( !prop.numProperties ){
	            	return false;
	            }
	            
	            for( var i = 1; i <= prop.numProperties; i++ ){
	            	
	                if ( this.canParseProperty( prop.property(i), removeStyle, true ) ){
	                	return true;
	                	
	                }
	                
	            }
	            return false;
	            
	            break;
	            
	        default:
	    }
	    return true;
	}
	
	
};
var LayerWatcher = function(panel){
	
	this.panel = panel;
	
	this.changed = new panel.signals.Signal();
	
	
	this.flash = panel.add("flashplayer", [0,0,1,1]);
	this.flash.loadMovie(File("AELoop.swf"));
	
	this.oldLayer = null;
	
	var self = this;
	this.flash.tick = function(){self.tick();};
	
};


LayerWatcher.prototype = {
		
		start : function(){
			
			this.flash.invokePlayerFunction("startLoop");
			
		},
		
		stop : function(){
			
			this.flash.invokePlayerFunction("stopLoop");
			
		},
		
		tick : function(){
			
			var layer = null;
			
			if ( app && app.project && app.project.activeItem ){
				
				var item = app.project.activeItem;
				
				if ( item.typeName == "Composition"){
					
					if (item.selectedLayers.length){
						
						layer = item.selectedLayers[0];
						this.pauseCheck = false;
						
					} else if (item !== this.oldItem) {
						
						this.pauseCheck = false;
						
					}
					
					
					
					this.oldItem = item;
				}
				
			}

			try{

			    if ( layer && this.oldLayer !== layer ){
			    	
			    	this.changed.dispatch( layer );
					
			    	this.oldLayer = layer;
			    		
			    } else if ( !layer  && !this.pauseCheck){
			    	
			    	this.changed.dispatch(null);
			    	
			    	this.oldLayer = null;
			    	this.pauseCheck = true;
			    }
			  
			    
			} catch(e){
				
				writeLn(e);
				this.stop();
				
			}
		}
	
};
var LayerSetting = function(panel){

	panel.layout.layout(true);
	panel.layout.resize();
	panel.onResizing = panel.onResize = function () {this.layout.resize();};
	
	this.panel = panel;
	this.panel.alignment = 'left';
	this.panel.margins = 0;
	this.panel.spacing = 0;
	
	this.watcher = new LayerWatcher(panel);
	
	this.watcher.changed.add(this.change,this);
	this.watcher.start();
};

LayerSetting.prototype = {
		
		change : function(layer){
			
			if (this.layerPanel){
				
				this.layerPanel.clear();
				
			}
			
			if (layer){
				
				this.layerPanel = new LayerPanel(this.panel,layer,this);
				
			} else {
				
				if ( 	app && app.project 
						&& app.project.activeItem 
						&& app.project.activeItem.typeName == "Composition"){
					
					this.layerPanel = new ItemSubPanel(this.panel,app.project.activeItem,undefined,this);

				} else {
					
					this.layerPanel = null;
					
				}
				
			}
			
			this.panel.layout.layout(true);
			this.panel.layout.resize();
			
			
			this.layer = layer;
			
		}
		
};

var base = new LayerSetting(this);
var PanelBase = function(panel,layer,width,context){

	this.panel = panel;
	this.layer = layer;
	this.context = context;
	
	if (panel && layer){
		
		this.group = this.panel.add("group");
		this.group.orientation = "column";
		this.group.margins = 8;
		this.group.alignment = 'left';
		
	}

	this.width = width || 190;
	
};

PanelBase.prototype = {
		
		clear : function(){
			this.panel.remove(this.group);
		},
		
		setField : function(prop,name){
			
			var group = this.group.add("group");
			group.alignment = 'left';
			group.spacing = 2;
			
			if (!name){
				name = prop;
			}
			var stat = group.add("statictext", undefined, name+' :');
			stat.alignment = 'left';

			var field = group.add("edittext", undefined, this.get(prop));
			field.preferredSize.width = this.width-stat.preferredSize.width;

			(function(prop,field,self){
				
				field.addEventListener('keyup',function(e){
					writeLn(self.layer);
					self.set(prop,(field.text != '') ? field.text : undefined);
				});
				
			})(prop,field,this);
			
			return field;
		},
		
		setBoolean : function(prop,name,origin){
			var group = this.group.add("group");
			group.alignment = 'left';
			group.spacing = 2;
			if (!name){
				name = prop;
			}
			
			var active = this.get(prop);

			if (active === undefined){
				active = origin;
			}
			
			var tick = group.add("checkBox", undefined, name);
			tick.value = active;

			(function(prop,tick,self){
			
				tick.addEventListener('click',function(e){
					self.set(prop,tick.value);
				});
			
			})(prop,tick,this);
			
		},
		
		setDrop : function(prop,name,vals,origin,names){
			
			var group = this.group.add("group");
			group.alignment = 'left';
			group.spacing = 2;
			
			if (!name){
				name = prop;
			}
			
			group.add("statictext", undefined, name+' :').alignment = 'left';
			
			
			
			var drop = group.add("dropdownlist", undefined);
			var i,val,name;
			
			var def = this.get(prop) || origin;
			
			for ( i = 0; i < vals.length; i++ ) {
				val = vals[i];
				name = (names && names[i]) ? names[i] : val;
				
				drop.add('item',name);
				
				if (val === def){
					drop.selection = i;
				}
			}
			
			

			(function(prop,drop,self,vals){

				drop.onChange = function(e){
	
					if (drop.selection !== null){
						selectLoop : for ( var y = 0; y < drop.items.length; y++) {
							if (drop.items[y] === drop.selection){
								self.set(prop,vals[y]);
								break selectLoop;
							}
						}
					}
				};
			
			})(prop,drop,this,vals);
			
		},
		
		set : function(key,val){
			if (this.layer.comment == "" || !this.layer.comment){
				
				this.layer.comment = "{}";
				
			}
			
			var obj = JSON.parse(this.layer.comment);
			
			obj[key] = val;
			
			this.layer.comment = JSON.stringify(obj);
			
			
		},
		
		get : function(key){
			
			if (this.layer.comment == "" || !this.layer.comment){
				
				return undefined;
				
			}
			
			return JSON.parse(this.layer.comment)[key];
			
		}
};
var LayerPanel = function(panel,layerm,context){

	PanelBase.call(this,panel,layer);
	
	this.group.add("statictext", undefined, layer.name).alignment = 'left';

	this.setBoolean('exportable',"Exportable",true);
			
			
	if (this.layer instanceof TextLayer){
		
		this.setDrop('valign','Vertical align',['top','middle','bottom'],'top');
		
	} else if (layer instanceof AVLayer){
		
		var holder = this.group.add("panel",undefined,layer.source.name);
		holder.margins = 0;
		this.itemPanel = new ItemSubPanel(holder,layer.source,this.width-10,context);
		
	}
			
	this.setField('id','ID');
	this.setBoolean('bake',"Bake transform",false);

	this.setField('classes','Class');
	
};

LayerPanel.prototype = new PanelBase();
LayerPanel.prototype.constructor = LayerPanel;


var  ItemSubPanel = function( panel, item, width, context ){
	
	
	PanelBase.call(this,panel,item,width,context);
	
	this.item = item;
	
	if (item instanceof FootageItem){
		
		this.setField("src", "source");
		
	} else if (item instanceof CompItem){
		
		this.field = this.setField("location", "Url");
		
		this.browse = this.group.add("button",undefined,"Browse");
		this.browse.aligment = 'left';
		
		var self = this;
		this.browse.onClick = function(e){
			
			self.setBrowse();
			
		};
		
		this.setBoolean("indent", "Indent",false);
		
		this.exporter = this.group.add("button",undefined,"Export");
		
		this.exporter.onClick = function(e){

			self.exportComp();
			
		};
		
	}
	
	
	
	

};

ItemSubPanel.prototype = new PanelBase();
ItemSubPanel.prototype.constructor = ItemSubPanel;

ItemSubPanel.prototype.setBrowse = function(){
	
	var f = new File();
	f = File.saveDialog("Define export location");
	
	this.set('location',f.absoluteURI);
	this.field.text = f.absoluteURI;
	
};

ItemSubPanel.prototype.exportComp = function(){
	
	var watcher = this.context.watcher;
	
	watcher.stop();
	
	var result = JSON.stringify(ProjectExporter.getProject(this.item),undefined,(this.get("indent") === true) ? "\t" : 0);
	
	
	
	if (this.get('src')){
		
		var file = new File(this.get('src'));
	    file.encoding = "UTF8";
	    file.open("w");
	    file.write(result);
        file.close();
	    
        watcher.start();
        
	} else {
		
		var win = new Window('dialog',"Exporting "+this.item.name, undefined, {closeButton: true});
		var txt = win.add ("edittext", [0, 0, 400, 400], "", {multiline: true});
		txt.text = result;
		txt.active = true;
		
		win.add("statictext", undefined, "press Esc to close window");
		
		
		win.onClose = function(){

		};
		
		win.show();
		
	}
	
};


