global = this;
var document = {
		createElement : function(obj){
			
		}
};

var window = {
		document : document
};

var round = function(number,rounding){
	return Math.floor(number/rounding)*rounding;
};
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

/** @license
 * Released under the MIT license
 * Author: Yannick Connan
 * Version: 0.1.1 - Build: 17338 (2012/04/10 09:03 PM)
 */



(function(global){

/**
* @namespace AE namespace - Kick ass Animation Library
* @name AE
*/

var externs = /** @lends AE */{
	/**
	* AE Version Number
	* @type String
	* @const
	*/
	VERSION : '0.1.1'
};
	
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

// vim: ts=4 sts=4 sw=4 expandtab
// -- kriskowal Kris Kowal Copyright (C) 2009-2011 MIT License
// -- tlrobinson Tom Robinson Copyright (C) 2009-2010 MIT License (Narwhal Project)
// -- dantman Daniel Friesen Copyright (C) 2010 XXX TODO License or CLA
// -- fschaefer Florian Sch�fer Copyright (C) 2010 MIT License
// -- Gozala Irakli Gozalishvili Copyright (C) 2010 MIT License
// -- kitcambridge Kit Cambridge Copyright (C) 2011 MIT License
// -- kossnocorp Sasha Koss XXX TODO License or CLA
// -- bryanforbes Bryan Forbes XXX TODO License or CLA
// -- killdream Quildreen Motta Copyright (C) 2011 MIT Licence
// -- michaelficarra Michael Ficarra Copyright (C) 2011 3-clause BSD License
// -- sharkbrainguy Gerard Paapu Copyright (C) 2011 MIT License
// -- bbqsrc Brendan Molloy (C) 2011 Creative Commons Zero (public domain)
// -- iwyg XXX TODO License or CLA
// -- DomenicDenicola Domenic Denicola Copyright (C) 2011 MIT License
// -- xavierm02 Montillet Xavier Copyright (C) 2011 MIT License
// -- Raynos Jake Verbaten Copyright (C) 2011 MIT Licence
// -- samsonjs Sami Samhuri Copyright (C) 2010 MIT License
// -- rwldrn Rick Waldron Copyright (C) 2011 MIT License
// -- lexer Alexey Zakharov XXX TODO License or CLA

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/


if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }

        var args = slice.call(arguments, 1);

        var bound = function () {

            if (this instanceof bound) {

                var F = function(){};
                F.prototype = target.prototype;
                var self = new F;

                var result = target.apply(
                    self,
                    args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return self;

            } else {

                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );

            }

        };

        return bound;
    };
}



if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return Object.prototype.toString.call(obj) == "[object Array]";
    };
}


if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
        var self = toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }
        
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    };
}


var TRANSFORM = 'WebkitTransform';
var TRANSFORM_STYLE = 'WebkitTransformStyle';
var PERSPECTIVE = 'WebkitPerspective';
var PERSPECTIVE_ORIGIN = 'WebkitPerspectiveOrigin';
var BGCOLOUR = 'BackgroundColour';

/* getGaussLength
 * this may seem mysterious, but this is just an implementation of a Gaussian quadrature
 * algorithm to calculate the length of a quadratic curve
 * for can find out more here: http://algorithmist.wordpress.com/2009/01/05/quadratic-bezier-arc-length/
 * I just unrolled it to death for speed purposes.
 */
var getGaussLength = function(min,max,c1,c2) {

	var mult = 0.5*(max-min),
		ab2 = 0.5*(min+max),
		vec = c2.clone();

	sum = vec.multiplyScalar(2*(ab2 + mult*-0.8611363116)).add(c1).lengthSq()*0.3478548451;
	
	sum += vec.transfer(c2).multiplyScalar(2*(ab2 + mult*0.8611363116)).add(c1).lengthSq()*0.3478548451;
	
	sum += vec.transfer(c2).multiplyScalar(2*(ab2 + mult*-0.3399810436)).add(c1).lengthSq()*0.6521451549;
	
	sum += vec.transfer(c2).multiplyScalar(2*(ab2 + mult*0.3399810436)).add(c1).lengthSq()*0.6521451549;
	
	return sum;
			
};

var getPositionAt = function (t,inv) {
	
	
	var i,tt,smoothing,pos,
		r1 = inv[0],
		r2 = inv[1],
		r3 = inv[2],
		smoothing1 = inv[3],
		smoothing2 = inv[4];
	
	
	if (t>=r3){
		i = (t-r3)/(1-r3);
		smoothing = smoothing2;
		pos = .75;
	} else if (t>=r2){
		i = (t-r2)/(r3-r2);
		pos = .5;
		smoothing = smoothing2;
	} else if (t>=r1){
		i = (t-r1)/(r2-r1);
		pos = .25;
		smoothing = smoothing1;
	} else {
		i = t/r1;
		pos = 0;
		smoothing = smoothing1;
	}
	tt = 2*(1-i)*i;
	return (tt*smoothing+(i*i))*.25+pos;
	
};




/**
 * cubicToQuadratic
 * Will divide a cubic curve into a set of quadratic curves.
 * this is based on the adaptive division algorythm defined here :
 * http://www.caffeineowl.com/graphics/2d/vectorial/cubic2quad01.html
 */

var cubicToQuadratic = function(p1,c1,c2,p2,path,precision){
	
	var res1 = p1.clone();
	var res2 = p2.clone();
	
	if (c2.equals(p2)){
		//exception made when an anchor is the same as end point, we just 1 quad curve to approximate that.
		path.curveTo(res1.lerp(c1,.89), p2);
		return path;
	}
	
	if (c1.equals(p1)){
		//same as before
		path.curveTo(res2.lerp(c2,.89), p2);
		return path;
	}
	
	
	// we first guess where the quadratic mid-points candidate are

	res1.lerp(c1,1.5);
	res2.lerp(c2,1.5);
	
	if (!precision){
		// if precision isn't set, we come up with one. 
		// This one is a guess based on overall curve haul width and height.
		
		precision = (Math.max(
						Math.max(res1.max(),res2.max()),
						Math.max(p1.max(),p2.max())		
					)-Math.min(
						Math.min(res1.min(),res2.min()),
						Math.min(p1.min(),p2.min())	
					))/350;
	}

	// d will define where we will need to split the curve.
	// d is the distance between the 2 possible quadratic approximations.
	// the closer they are, the less curves we need.
	// if (d >= 1) = we only need one quadratic curve
	// if (d < 1 && >=.5) = We'll split it in 2 at d point
	// if (d < .5) = We'll split the curve is 3, one will be 0>d the other (1-d)>1.
	// we will then iterate the algorithm in the remaining bit.
	
	var d = Math.sqrt(10.3923048/res1.distance(res2)*precision);
	
	if (d>1){

		path.curveTo(res1.lerp(res2,.5),p2);
		
	} else {
		// Lets do some curve spliting!
		/*
		var begin =p1.clone();
		var end = p2.clone();
		var mid = c1.clone().lerp(c2,d);
		
		var d1_c1 = begin.lerp(c1,d).clone();
		var d1_c2 = begin.lerp(mid,d).clone();
		
		var d2_c2 = end.lerp(c2,1-d).clone();
		var d2_c1 = mid.lerp(end,d).clone();
		
		mid.lerp(begin,1-d);
		end.set(p2);
		begin.set(p1);
		*/
		
		
		
		var d1_p1 = p1.clone(),
			d1_c1 = d1_p1.clone().lerp(c1,d),
			d2_p2 = p2,
			d2_c2 = c2.clone().lerp(p2,d),
			temp_c = c1.clone().lerp(c2,d),
			d1_c2 = d1_c1.clone().lerp(temp_c,d),
			d2_c1 = temp_c.lerp(d2_c2,d),
			p = d1_c2.clone().lerp(d2_c1,d);
			
		//trace(d);
		
		res1 = d1_p1.clone().lerp(d1_c1,1.5);
		res2.transfer(p).lerp(d1_c2,1.5);

		
		path.curveTo(res1.lerp(res2,.5),p.clone());
		
		if (d<.5){
			// mmm, we need to split it again.
			d = 1-(d/(1-d));
			
			c1 = d2_c1.clone();
			c2 = d2_c2.clone();
			
			p1 = d1_p1.transfer(p);
			
			
			d1_c1.transfer(d1_p1).lerp(c1,d);
			d2_c2.transfer(c2).lerp(p2,d);
			temp_c.transfer(c1).lerp(c2,d);
			d1_c2.transfer(d1_c1).lerp(temp_c,d);
			d2_c1 = temp_c.lerp(d2_c2,d);
			p.transfer(d1_c2).lerp(d2_c1,d);
			
			//path.curveTo(p.clone(),p.clone());
			cubicToQuadratic(d1_p1,d1_c1,d1_c2.clone(),p.clone(),path,precision);
			
			//cubicToQuadratic(d1_p1,d1_c1,d1_c2.clone(),p.clone(),path,precision*3);
		}
		
		res1 = p.clone().lerp(d2_c1,1.5);
		res2 = d2_p2.clone().lerp(d2_c2,1.5);
		
		// and finally the remaining
		path.curveTo(res1.lerp(res2,.5),p2.clone());
		
	}
	return path;
};


var _Stack = {
		
	add : function(item,pos){
		this.on.add.dispatch(item,pos,this);
	},
	check : function(item){
		if (!(item instanceof this.type_)){
			throw("not the right type");
		}
	}
	
};

/** @constructor */
var Stack = function(type){
	
	this.items_ = [];

	this.type_ = Object;
	if (type && type.prototype instanceof this.type_){
		this.type_ = type;
	}
	
	this.on = {
		add:new signals.Signal(),
		remove:new signals.Signal(),
		swap:new signals.Signal()
	};
};


Stack.prototype = {

	constructor : Stack,
	
	/** @private */
	items_ : null,
	
	/** @private */
	type_ : null,
	
	/**
	 * @param item
	 * @returns {Number}
	 */
	index : function(item){
		return this.items_.indexOf(item);
	},

	/**
	 * @param item
	 * @returns {Boolean}
	 */
	have : function(item){
		return this.index(item) !== -1;
	},

	/**
	 * 
	 * @param i
	 * @returns {Object}
	 */
	get : function(i){
		return this.items_[i];
	},
	
	/**
	 * 
	 * @returns {Number}
	 */
	getLength : function(){
		return this.items_.length;
	},
	
	/**
	 *
	 * @param item
	 * @throws item already present
	 */
	add : function(item){
		
		_Stack.check.call(this,item);
		
		if (!this.have(item)){
			this.items_.push(item);
			_Stack.add.call(this,item,this.length-1);
		} else {
			throw("item already present");
		}
	},
	
	/**
	 * 
	 * @param {Object} item
	 * @param {Number} pos
	 */
	insert : function(item,pos){
		
		_Stack.check.call(this,item);
		
		var items = this.items_;
		
		
		
		if (!this.have(item)){
			var l = items.length;
			if (pos < l){
				items.splice(pos,0,item);
			} else {
				items.push(item);
			}
			_Stack.add.call(this,item,Math.max(pos,this.length-1));
		} else {
			throw("item already present");
		}
		
	},
	
	/**
	 * 
	 * @param item
	 * @throws item not present
	 */
	remove : function(item){
		
		var items = this.items_;
		var pos = items.indexOf(item);
		
		if (pos !== -1){
			
			items.splice(pos,1);
			this.on.remove.dispatch(item,pos,this);
			
		} else {
			throw("item not present");
		}
		
	},
	
	/**
	 * 
	 * @param item1
	 * @param item2
	 * @throws one of the items not present
	 */
	swap : function(item1,item2){
		
		var items = this.items_;
		var pos1 = items.indexOf(item1);
		var pos2 = items.indexOf(item2);
		
		if (pos1 !== -1 && pos2 !== -1){
			
			items[pos1] = item2;
			items[pos2] = item1;
			this.on.swap.dispatch(pos1,pos2,this);
			
		} else {
			throw("one of the items not present");
		}
	},
	
	/**
	 * @param {function} func
	 */
	each : function(func){
		var items = this.items_;
		var l = items.length;
		
		for ( var i = 0; i < l; i++) {
			func(items[i]);
		}
	}
	
};

externs['Stack'] = Stack;

	/**
	 * Cubic Bezier timing function compatible with CSS3 transition-timing-function
	 * <p>
	 * The timing function is specified using a cubic Bezier curve,
	 * which is defined by four control points.
	 * The first and last control points are always set to (0,0) and (1,1),
	 * so you just need to specify the two in-between control points.
	 * The points are specified as a percentage of the overall duration
	 * (percentage: interpolated as a real number between 0 and 1).
	 * The timing function takes as its input the current elapsed percentage
	 * of the transition duration and outputs a percentage that determines 
	 * how close the transition is to its goal state.
	 * </p>
	 * <p>
	 * currently used function to determine time
	 * conversion to js from webkit source files
	 * UnitBezier.h, WebCore_animation_AnimationBase.cpp
	 * js port from www.netzgesta.de/dev/cubic-bezier-timing-function.html
	 * </p>
	 */


var BezierEasing = {
	
	ease : function (p1x, p1y, p2x, p2y,t,epsilon) {
		
		p1y = p1y || 0;
		p2y = p2y || 0;
		
		var t2 = this.solveCurveX(p1x||0,p2x||0,t||0,epsilon),
			cy = p1y * 3,
			by = 3 * (p2y - p1y) - cy,
			ay = 1 - cy - by;
		
		console.log(t,t2);
		return ((ay * t2 + by) * t2 + cy) * t2;

	},
	
	// Given an x value, find a parametric value it came from.
	solveCurveX : function (p1x, p2x, x, epsilon) {
		
		
		var fabs = this.fabs,
			
			cx = 3 * p1x,
			bx = 3 * (p2x - p1x) - cx,
			ax = 1 - cx - bx,
			bx2 = bx * 2,
			ax3 = ax * 3,
			t0,t1,t2,x2,d2,i;
		
		if (!epsilon){
			//epsilon = 1.0 / (100.0 * (precision||100));
			epsilon = 0.0001;
		}
		
		// First try a few iterations of Newton's method -- normally very fast.
		t2 = x;
		
		
		newton_loop: for (i = 0; i < 8; i++) {
			
			x2 = (((ax * t2 + bx) * t2 + cx) * t2)-x;
			//x2 = this.sampleCurveX(t2) - x;
			if (fabs(x2) < epsilon) {
				return t2;
			}
			d2 = (ax3 * t2 + bx2) * t2 + cx;
			if (fabs(d2) < 1e-6) {
				
				break newton_loop;
			}
			t2 = t2 - x2 / d2;
			
			//return x;
		}
		
		
		
		// Fall back to the bisection method for reliability.

		t0 = 0;
		t1 = 1;
		t2 = x;
		if (t2 < t0) {
			return t0;
		}
		if (t2 > t1) {
			return t1;
		}
		i = 0;
		
		
		
		while (t0 < t1 && i < 10) {
			
			x2 = ((ax * t2 + bx) * t2 + cx) * t2;
			//x2 = this.sampleCurveX(t2);
			if (fabs(x2 - x) < epsilon) {
				return t2;
			}
			if (x > x2) {
				t0 = t2;
			} else {
				t1 = t2;
			}
			t2 = (t1 - t0) * .5 + t0;
			i++;
		}
		
		return t2;
		// Failure.
	},
	
	fabs : function (n) {
		if (n >= 0) {
			return n;
		} else {
			return 0 - n;
		}
	}
};



/** @constructor */
var Matrix = function(){
	if (arguments.length){
		this.injectArray(arguments);
	}
};

Matrix.prototype = {
		
		constructor : Matrix,
		
		m11:1,m12:0,m13:0,m14:0,
		m21:0,m22:1,m23:0,m24:0,
		m31:0,m32:0,m33:1,m34:0,
		m41:0,m42:0,m43:0,m44:1,
		
		/**
		 * @param {number} n11
		 * @param {number} n12
		 * @param {number} n13
		 * @param {number} n14
		 * @param {number} n21
		 * @param {number} n22
		 * @param {number} n23
		 * @param {number} n24
		 * @param {number} n31
		 * @param {number} n32
		 * @param {number} n33
		 * @param {number} n34
		 * @param {number} n41
		 * @param {number} n42
		 * @param {number} n43
		 * @param {number} n44
		 * 
		 * @returns {Matrix}
		 */
		set:function(n11,n12,n13,n14,n21,n22,n23,n24,n31,n32,n33,n34,n41,n42,n43,n44){
			
			var m = this;
			
			m.m11 = n11;m.m12 = n12;m.m13 = n13;m.m14 = n14;
			
			m.m21 = n21;m.m22 = n22;m.m23 = n23;m.m24 = n24;
			
			m.m31 = n31;m.m32 = n32;m.m33 = n33;m.m34 = n34;
			
			m.m41 = n41;m.m42 = n42;m.m43 = n43;m.m44 = n44;
			
			return this;
		},
		
		/**
		 * 
		 * @param {Array.<Number>} a
		 * @returns {Matrix}
		 */
		injectArray:function(a){
			
			return this.set.apply(this,a);
		},
		
		/**
		 * 
		 * @param {Matrix} m
		 * @returns {Matrix}
		 */
		injectMatrix:function(m){
			
			/** @type Matrix */
			var t = this;
			
			t.m11 = m.m11;t.m12 = m.m12;t.m13 = m.m13;t.m14 = m.m14;
			
			t.m21 = m.m21;t.m22 = m.m22;t.m23 = m.m23;t.m24 = m.m24;
			
			t.m31 = m.m31;t.m32 = m.m32;t.m33 = m.m33;t.m34 = m.m34;
			
			t.m41 = m.m41;t.m42 = m.m42;t.m43 = m.m43;t.m44 = m.m44;
			
			return t;
		},
		
		/** @returns {Matrix} */
		identity:function(){
			
			this.set(
					
				1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				0,0,0,1
				
			);
			
			return this;
		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @returns {Matrix}
		 */
		translation:function(x,y,z){
			
			this.set(	
					
				1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				x||0,y||0,z||0,1
				
			);
			
			return this;
			
		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @returns {Matrix}
		 */
		translate:function(x, y, z){
			
			this.m41 += x||0;
			this.m42 += y||0;
			this.m43 += z||0;
			
			return this;
			
		},
		
		/**
		 * @param {number} scaleX
		 * @param {number} scaleY
		 * @param {number} scaleZ
		 * @returns {Matrix}
		 */
		scaling:function(scaleX, scaleY, scaleZ){
			
			this.set(
					
				scaleX||0,0,0,0,
				0,scaleY||0,0,0,
				0,0,scaleZ||0,0,
				0,0,0,1
				
			);
			
			return this;
			
		},
		
		/**
		 * @param {number} scaleX
		 * @param {number} scaleY
		 * @param {number} scaleZ
		 * @returns {Matrix}
		 */
		scale:function(scaleX, scaleY, scaleZ){
			
			scaleX = scaleX||0.000001;
			scaleY = scaleY||0.000001;
			scaleZ = scaleZ||0.000001;
			
			var t = this;
			
			if (scaleX !== 1 || scaleY !== 1 || scaleZ !== 1){
				
				t.m11*=scaleX;t.m21*=scaleX;t.m31*=scaleX;t.m41*=scaleX;
				
				t.m12*=scaleY;t.m22*=scaleY;t.m32*=scaleY;t.m42*=scaleY;
				
				t.m13*=scaleZ;t.m23*=scaleZ;t.m33*=scaleZ;t.m43*=scaleZ;
			}

			return t;
			
		},
		
		/**
		 * @param {number} rotationX
		 * @param {number} rotationY
		 * @param {number} rotationZ
		 * @returns {Matrix}
		 */
		rotation:function(rotationX,rotationY,rotationZ){
			
			this.identity();
			
			var p = Math.PI/180,
				t = this;
			
			rotationX = (rotationX||0)*p;
			rotationY = (rotationY||0)*p;
			rotationZ = (-rotationZ||0)*p;
			
			var	cos = Math.cos,
				sin = Math.sin,
				a = cos( rotationX ), b = sin( rotationX ),
				c = cos( rotationY ), d = sin( rotationY ),
				e = cos( rotationZ ), f = sin( rotationZ );
			
			var ae = a * e, af = a * f, be = b * e, bf = b * f;

			t.m11 = c * e;
			t.m12 = be * d - af;
			t.m13 = ae * d + bf;

			t.m21 = c * f;
			t.m22 = bf * d + ae;
			t.m23 = af * d - be;

			t.m31 = - d;
			t.m32 = b * c;
			t.m33 = a * c;
			
			t.m41 = t.m42 = t.m43 = 0;
			
			
			
			return this;
			
		},
		
		/**
		 * @param {number} rotationX
		 * @param {number} rotationY
		 * @param {number} rotationZ
		 * @returns {Matrix}
		 */
		rotate:function(rotationX, rotationY, rotationZ){

			return (rotationX || rotationY || rotationZ) ? this.multiply(new Matrix().rotation(rotationX, rotationY, rotationZ)) : this;
			
		},
		
		/**
		 * 
		 * @param {Object{x:number,y:number,x:number,w:number} q
		 * @returns {Matrix}
		 */
		quaternion: function( q ) {

			var t,
				x = q.x,
				y = q.y,
				z = q.z,
				w = q.w,
				x2 = x + x,  y2 = y + y,  z2 = z + z,
				xx = x * x2, xy = x * y2, xz = x * z2,
				yy = y * y2, yz = y * z2, zz = z * z2,
				wx = w * x2, wy = w * y2, wz = w * z2;

			t.m11 = 1 - ( yy + zz );
			t.m12 = xy - wz;
			t.m13 = xz + wy;

			t.m21 = xy + wz;
			t.m22 = 1 - ( xx + zz );
			t.m23 = yz - wx;

			t.m31 = xz - wy;
			t.m32 = yz + wx;
			t.m33 = 1 - ( xx + yy );

			return this;

		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @returns {Matrix}
		 */
		lookingAt:function(x,y,z){
			
			
			x = x||0;
			y = y||0;
			z = -z||0;
			
			var l = Math.sqrt((x * x) + (y * y) + (z * z));
			if (l){

				x /= l;
				y /= l;
				z /= l;
				
				this.set(
						
					-z,    0,        x,    0,
					-x*y,  x*x+z*z, -z*y,  0,
					-x,   -y,       -z,    0,
					 0,    0,        0,    1
						
				);
			}
			
			return this;
			
		},
		
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @returns {Matrix}
		 */
		lookAt:function(x, y, z){
			
			return (x || y) ? this.multiply(new Matrix().lookingAt(x, y, z)) : this;
			
		},
		
		/**
		 * @returns {Matrix}
		 */
		invert:function(){
			var m = this,
				n11 = m.m11, n12 = m.m12, n13 = m.m13,
				n21 = m.m21, n22 = m.m22, n23 = m.m23,
				n31 = m.m31, n32 = m.m32, n33 = m.m33,
				n41 = m.m41, n42 = m.m42, n43 = m.m43,
				d = 1/(-n13 * n22 * n31+
					    n12 * n23 * n31+
					    n13 * n21 * n32-
					    n11 * n23 * n32-
					    n12 * n21 * n33+
					    n11 * n22 * n33 );

			m.m11 = (-n23*n32 + n22*n33)*d;
			m.m12 = ( n13*n32 - n12*n33)*d;
			m.m13 = (-n13*n22 + n12*n23)*d;
			m.m14 = 0;
			m.m21 = ( n23*n31 - n21*n33)*d;
			m.m22 = (-n13*n31 + n11*n33)*d;
			m.m23 = ( n13*n21 - n11*n23)*d;
			m.m24 = 0;
			m.m31 = (-n22*n31 + n21*n32)*d;
			m.m32 = ( n12*n31 - n11*n32)*d;
			m.m33 = (-n12*n21 + n11*n22)*d;
			m.m34 = 0;

			m.m41 = (n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43)*d;
			m.m42 = (n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43)*d;
			m.m43 = (n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43)*d;
			m.m44 = 1;
			    
			return m;
		},

		/**
		 * @returns {Matrix}
		 */
		createInvert:function(){
			return this.clone().invert();
		},
		
		/**
		 * @returns {Matrix}
		 */
		clone:function(){
			var m = this;
			
			return new Matrix().set(
					
				m.m11,m.m12,m.m13,m.m14,
				m.m21,m.m22,m.m23,m.m24,
				m.m31,m.m32,m.m33,m.m34,
				m.m41,m.m42,m.m43,m.m44
				
			);
			
		},
		
		/**
		 * @param {Matrix} a
		 * @param {Matrix} b
		 * @returns {Matrix}
		 */
		join:function(a,b){
			
			var a11 = a.m11, a12 = a.m12, a13 = a.m13, a14 = a.m14,
				a21 = a.m21, a22 = a.m22, a23 = a.m23, a24 = a.m24,
				a31 = a.m31, a32 = a.m32, a33 = a.m33, a34 = a.m34,
				a41 = a.m41, a42 = a.m42, a43 = a.m43, a44 = a.m44,
		
				b11 = b.m11, b12 = b.m12, b13 = b.m13, b14 = b.m14,
				b21 = b.m21, b22 = b.m22, b23 = b.m23, b24 = b.m24,
				b31 = b.m31, b32 = b.m32, b33 = b.m33, b34 = b.m34,
				b41 = b.m41, b42 = b.m42, b43 = b.m43, b44 = b.m44;

			this.m11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
			this.m12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
			this.m13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
			this.m14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

			this.m21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
			this.m22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
			this.m23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
			this.m24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

			this.m31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
			this.m32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
			this.m33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
			this.m34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

			this.m41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
			this.m42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
			this.m43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
			this.m44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
			
			return this;
			
		},
		
		/**
		 * @param {Matrix} matrix
		 * @returns {Matrix}
		 */
		multiply:function(matrix){
			
			return this.join(this, matrix);
			
		},
		
		/**
		 * @param {Matrix} matrix
		 * @returns {Matrix}
		 */
		preMultiply:function(matrix){
			
			return this.join(matrix, this);
			
			
		},
		
		/**
		 * @returns {String}
		 */
		toString:function(){
			var m = this;
			if (this.m13 || this.m23 || this.m33 !== 1 || this.m43){
				return "matrix3d("+m.m11.toFixed(4)+","+m.m12.toFixed(4)+","+m.m13.toFixed(4)+","+m.m14.toFixed(4)+","+
								m.m21.toFixed(4)+","+m.m22.toFixed(4)+","+m.m23.toFixed(4)+","+m.m24.toFixed(4)+","+
								m.m31.toFixed(4)+","+m.m32.toFixed(4)+","+m.m33.toFixed(4)+","+m.m34.toFixed(4)+","+
								m.m41.toFixed(4)+","+m.m42.toFixed(4)+","+m.m43.toFixed(4)+","+m.m44.toFixed(4)+")";
			} else {
				return "matrix("+m.m11.toFixed(4)+","+m.m12.toFixed(4)+","+m.m21.toFixed(4)+","+m.m22.toFixed(4)+","+m.m41.toFixed(4)+","+m.m42.toFixed(4)+")";
			}
			
		},
		
		/**
		 * @returns {Array}
		 */
		toArray:function(){
			var m = this;
			return [
			        m.m11, m.m12, m.m13, m.m14,
			        m.m21, m.m22, m.m23, m.m24,
			        m.m31, m.m32, m.m33, m.m34,
			        m.m41, m.m42, m.m43, m.m44
			        ];
		}
};


externs['Matrix'] = Matrix;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 */


var Vector = function(x,y,z){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

Vector.isVector = function(v){
	
	return (v && typeof v.x === 'number' && typeof v.y === 'number');

};

Vector.prototype = {
		
		constructor : Vector,
		
		set: function ( x, y, z ) {

			this.x = x;
			this.y = y;
			this.z = z;

			return this;

		},
		
		transfer: function ( v ) {

			this.x = v.x;
			this.y = v.y;
			this.z = v.z || 0;

			return this;

		},

		setX: function ( x ) {

			this.x = x;

			return this;

		},

		setY: function ( y ) {

			this.y = y;

			return this;

		},

		setZ: function ( z ) {

			this.z = z;

			return this;

		},

		copy: function ( v ) {

			this.x = v.x;
			this.y = v.y;
			this.z = v.z;

			return this;

		},

		clone: function () {

			return new Vector( this.x, this.y, this.z );

		},

		add: function ( v ) {

			this.x += v.x;
			this.y += v.y;
			this.z += v.z;

			return this;

		},

		addScalar: function ( s ) {

			this.x += s;
			this.y += s;
			this.z += s;

			return this;

		},

		sub: function ( v ) {

			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;

			return this;

		},

		multiply: function ( v ) {

			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;

			return this;

		},

		multiplyScalar: function ( s ) {

			this.x *= s;
			this.y *= s;
			this.z *= s;

			return this;

		},

		divide: function ( v ) {

			this.x /= v.x;
			this.y /= v.y;
			this.z /= v.z;

			return this;

		},

		divideScalar: function ( s ) {

			if ( s ) {

				this.x /= s;
				this.y /= s;
				this.z /= s;

			} else {

				this.x = 0;
				this.y = 0;
				this.z = 0;

			}

			return this;

		},

		dot: function ( v ) {

			return this.x * v.x + this.y * v.y + this.z * v.z;

		},

		lengthSq: function () {

			return this.x * this.x + this.y * this.y + this.z * this.z;

		},

		length: function () {

			return Math.sqrt( this.lengthSq() );

		},

		normalize: function () {

			return this.divideScalar( this.length() );

		},
		
		lerp: function ( v, alpha ) {

			this.x += ( v.x - this.x ) * alpha;
			this.y += ( v.y - this.y ) * alpha;
			this.z += ( v.z - this.z ) * alpha;

			return this;

		},

		cross: function ( v ) {

			var x = this.x, y = this.y, z = this.z;

			this.x = y * v.z - z * v.y;
			this.y = z * v.x - x * v.z;
			this.z = x * v.y - y * v.x;

			return this;

		},

		distance: function ( v ) {

			return Math.sqrt( this.distanceSq( v ) );

		},

		distanceSq: function ( v ) {

			return this.clone().sub( v ).lengthSq();

		},

		equals: function ( v ) {

			return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

		},

		isZero: function () {

			return ( this.lengthSq() < 0.0001 /* almostZero */ );

		},
		
		max: function () {

			return Math.max(this.x,Math.max(this.y,this.z));

		},
		
		min: function ( v ) {

			return Math.min(this.x,Math.min(this.y,this.z));

		},
		
		setFromQuaternion: function ( q ) {

			this.x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( q.w * q.w - q.x * q.x - q.y * q.y + q.z * q.z ) );
			this.y = Math.asin( 2 *  ( q.x * q.z + q.y * q.w ) );
			this.z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( q.w * q.w + q.x * q.x - q.y * q.y - q.z * q.z ) );

		},
		
		getQuaternion: function(){
			
			var sin = Math.sin,
				cos = Math.cos,
				t = this,
				sx = sin(t.x * .5),
				cx = cos(t.x * .5),
				sy = sin(t.y * .5),
				cy = cos(t.y * .5),
				sz = sin(t.z * .5),
				cz = cos(t.z * .5),
				cxy = cx * cy,
				sxy = sx * sy;
				
			return {
				x: sz * cxy     - cz * sxy,
				y: cz * sx * cy + sz * cx * sy,
				z: cz * cx * sy - sz * sx * cy,
				w: cz * cxy     + sz * sxy
			};
			
		}
		
};

externs['Vector'] = Vector;

/** @constructor */
var Rectangle = function(_x,_y,_width,_height){
	
	this.x = _x || 0;
	this.y = _y || 0;
	this.width = _width || 100;
	this.height = _height || 100;
	
};



Rectangle.prototype = {
		
		constructor : Rectangle,
		
		clone : function(){
			return new Rectangle(this.x,this.y,this.width,this.height);
		},
		
		compare : function(obj){
			
			if (obj === null) return false;
			
			if (	obj.x !== this.x
				 || obj.y !== this.y 
				 || obj.width !== this.width 
				 || obj.height !== this.height
			){
				return false;
			}
			return true;
		}
};




var Line = function(start,end){
	
	this.start = start;
	this.end = end;
	
	this.update = true;
	
};


Line.prototype = {
		
		constructor : Line,

		length : function(){
			
			if (this.update){
				
				this.length_ = this.start.distance(this.end);
				this.update = false;
			}
			
			return this.length_;
		},
		
		getVect : function(pos, vec){
			
			return ((vec)? vec.transfer(this.start) : this.start.clone()).lerp(this.end,pos);
			
		}

};

externs['Line'] = Line;


var QuadCurve = function(start,anchor,end){
	
	this.start = start;
	this.anchor = anchor;
	this.end = end;
	
	this.temp_ = this.start.clone();
	
	this.update = true;
	
};


QuadCurve.prototype = {
		
		constructor : QuadCurve,
		
		length : function(){
			
			if (this.update){
				
				this.update = false;

				var c1 = this.anchor.clone().sub(this.start).multiplyScalar(2),
	          		c2 = this.start.clone().sub(this.anchor.clone().multiplyScalar(2)).add(this.end),
	       			sqrt = Math.sqrt,
	       			divider = 5.65685425,
	       			l,r1,r2,r3,s1,s2;

				
				// We'll calculate the length by quarter.
				// This will be used for arc-length parametization latter on
				r1 = sqrt(getGaussLength(0,.25,c1,c2))/divider;
				r2 = sqrt(getGaussLength(.25,.5,c1,c2))/divider;
				r3 = sqrt(getGaussLength(.5,.75,c1,c2))/divider;
				l = r1+r2+r3+(sqrt(getGaussLength(.75,1,c1,c2))/divider);
				r3 = (r1+r2+r3)/l;
				r2 = (r1+r2)/l;
				r1 /= l;
				// we'll smooth the values using a quadratic interpolation
				// this is an anchor for those
				s1 = .5+((1-(r1/(r2-r1)))/4);
				s2 = .5-((1-((1-r3)/(r3-r2)))/5);
				
				this.length_ = l;
				this.inverse_ = [r1,r2,r3,s1,s2];
			}
			
			return this.length_;
		},

		
		getVect : function(pos, vec){

			this.length();
			
			var p = getPositionAt(pos,this.inverse_);
			
			var start = (vec) ? vec.transfer(this.start) : this.start.clone();
			
			return 	start.lerp(this.anchor, p)
					.lerp(this.temp_.transfer(this.anchor).lerp(this.end, p), p);
		}

};


externs['QuadCurve'] = QuadCurve;




var Path = function(start){

	this.start = start || 0;
	
	this.elements = [];
	
	this.update = true;
	
};

Path.prototype = {
	
	constructor : Path,
	
	length : function(){
		
		if (this.update){
			
			var current_length = 0,
				l = this.elements.length,
				i;
			
			this.update = false;
			
			this.lengths_ = [current_length];
			
			for (i = 0; i < l; i++) {
				
				current_length += this.elements[i].length();
				this.lengths_.push(current_length);
				
			}
			
			this.lastPos_ = 0;
			this.lastItemPos_ = 0;
			this.length_ = current_length;
			
		}

		return this.length_;
	},
	
	getItem : function(pos){

		pos *= this.length();
		
		var increment = ( pos >= this.lastPos_ ) ? 1 : -1,
			l = this.elements.length,
			limit,item;
		
		
		
		for ( var i = this.lastItemPos_; i < l; i += increment ) {
			
			limit = this.lengths_[i];
			
			item = this.elements[i];
			
			if ( pos >= limit && pos < limit+item.length() ){
				
				
				
				this.lastItemPos_ = i;
				this.lastPos_ = limit;
				return item;
			}
			
		}
		
	},

	getVect : function(pos, vec){

		var item = this.getItem(pos);

		pos *= this.length();
		
		if (item){
			return item.getVect((pos-this.lastPos_) / item.length(), vec);
		} else {
			return (vec) ? vec.transfer(this.start) : this.start.clone();
		}
		
	},
	
	lineTo : function(end){
		
		this.elements.push(new Line(this.start,end));
		this.start = end;
		this.update = true;
		
	},
	
	curveTo : function(anchor,end){
		
		this.elements.push( new QuadCurve( this.start,anchor,end ) );
		this.start = end;
		this.update = true;
		
	},
	
	cubicCurveTo : function(a1,a2,end){
		
		this.elements.push(new CubicCurve(this.start,a1,a2,end));
		this.start = end;
		this.update = true;
		
	}

};

externs['Path'] = Path;



var CubicCurve = function(start,a1,a2,end){
	
	
	this.start = start;
	this.a1 = a1;
	this.a2 = a2;
	this.end = end;
	
	this.update = true;
	
};


CubicCurve.prototype = {
		
		constructor : CubicCurve,
		
		length : function(){
			
			if (this.update){
				
				this.update = false;

				this.path = cubicToQuadratic(this.start,this.a1,this.a2,this.end,new Path(this.start));
				
				this.length_ = this.path.length();
			}
			
			return this.length_;
		},
		
		getVect : function(pos, vec){

			this.length();
			
			return this.path.getVect(pos, vec);
			
		}

};

externs['CubicCurve'] = CubicCurve;


var Animator = function(layer,in_point,out_point,source){
	
	Stack.call(this);
	
	
	this.layer = layer;
	this.inPoint = in_point || 0;
	this.outPoint = out_point || 1/0;
	this.source = source;
	
	this.startTime = 0;
	this.speed = 1;
	
	this.remap = new Keys();
};

Animator.prototype = new Stack();
Animator.prototype.constructor = Animator;

Animator.prototype.animate = function(time){
	
	var layer = this.layer,
		items = this.items_,
		l;
	
	if (time >= this.inPoint && time <= this.outPoint){
		
		layer.visible = true;
		l = items.length;
		
		for ( var i = 0; i < l; i++) {
			items[i].set(time);
		}
		
		if (this.source){
			
			if (!this.remap.num()){
				this.source.animate((time - this.startTime) * this.speed);
			} else {
				this.source.animate(this.remap.get(time - this.startTime));
			}

		}
		
	} else {
		layer.visible = false;
	}
	

};

var AnimatorStack = function(item){
	
	Stack.call(this);
	
	this.item = item;
	this.duration = 1;
	this.frameRate = 25;
	this.clamp = false;
};

AnimatorStack.prototype = new Stack();
AnimatorStack.prototype.constructor = AnimatorStack;

AnimatorStack.prototype.animate = function(time){
	
	var items = this.items_,
		l = items.length;
	
	time = time%this.duration;
	
	if (this.clamp){
		time = Math.floor(time*this.frameRate)/this.frameRate;
	}
	
	if (time !== this.prevTime_){
		for ( var i = 0; i < l; i++) {
			items[i].animate(time);
		}
		
		this.prevTime_ = time;
	}
	
};

var KeyFrame = function(offset,value,is_hold){
	
	this.offset = offset;
	this.position_ = 0;
	
	this.value = value;
	this.isHold = is_hold;
	this.inX = 0;
	this.inY = 0;
	this.outX = 0;
	this.outY = 0;
	this.inTangent = null;
	this.outTangent = null;
	this.path = null;
	this.update = false;
};



var Keys = function(target,property){

	this.target = target;
	this.property = property;
	
	this.keys_ = [];
	this.length_ = 0;
};

Keys.prototype = {
	
	constructor : Keys,
	
	length : function(){
		
		var keys = this.keys_,
			key,i,l,pos;
		
		if (this.update){
			
			l = keys.length;
			pos = 0;
			
			for ( i = 0; i < l; i++) {
				key = keys[i];
				pos += key.offset;
				key.position_ = pos;
				if (key.update && key.path && (key.inTangent || key.outTangent)){
					this.path = null;
					key.update = false;
				}
			}
			
			this.length_ = pos;
			this.update = false;
		}

		return this.length_;
	},
	
	num : function(){
		return this.keys_.length;
	},
	
	indexAt : function(pos){
		
		var keys = this.keys_,
			i = this.prevIndex_ || 0,
			iterator = (pos >= (this.prevPosition_||0)) ? 1 : -1;
		
		this.length();
		this.prevPosition_ = pos;
		
		if (pos <= keys[0].position_) {
			this.prevIndex_ = 0;
			return this.prevIndex_;
		} else if (pos >= keys[keys.length-1].position_) {
			this.prevIndex_ = keys.length-1;
			return this.prevIndex_;
		} else {
			
			key_loop: while (keys[i]){
				
				if ( pos >= keys[i].position_ && (!keys[i+1] || pos < keys[i+1].position_) ){
					
					this.prevIndex_ = i;
					this.prevPosition_ = pos;
					return this.prevIndex_;
					
					break key_loop;
				}
				
				i += iterator;
			}
		}

		this.prevIndex_ = 0;
		return this.prevIndex_;
	},
	
	get : function(pos, opt_obj){
		
		var index = this.indexAt(pos),
			key = this.keys_[index],
			next_key, i;
		
		if ( (index === 0 && pos <= key.offset) || index >= this.num()-1 || key.isHold){
			return key.value;
		} else {
			next_key = this.keys_[index+1];
			
			i = (pos-key.position_)/next_key.offset;
			
			if (key.outX || key.outY || next_key.inX || next_key.inY){
				
				i = BezierEasing.ease(key.outX, key.outY, next_key.inX, next_key.inY, i);
				
			}
			
			return this.interpolate(key, next_key, i, opt_obj);
		}
	},
	
	interpolate: function(key, next_key, pos){
		return key.value + (next_key.value - key.value) * pos;
	},
	
	set: function(pos){
		var res = this.get(pos);
		if (this.target[this.property] !== res){
			this.target[this.property] = res;
		};
	},
	
	add : function(offset,val,is_hold){
		
		var key = new KeyFrame(offset, val, is_hold);
		
		this.length_ += offset;
		key.position_ = this.length_;
		this.keys_.push(key);
		
		return key;
		
	}

	
};

externs['Keys'] = Keys;



var SpatialKeys = function(target, property){

	Keys.call(this, target, property);
	
	this.temp_ = target[property].clone();
};

SpatialKeys.prototype = new Keys();
SpatialKeys.prototype.constructor = SpatialKeys;

SpatialKeys.prototype.interpolate = function(key, next_key, pos, opt_vec){
	
	if (key.update){
		if (key.outTangent && next_key.inTangent){
			key.path = new CubicCurve(	
				key.value,
				key.outTangent.clone().add(key.value),
				next_key.inTangent.clone().add(next_key.value),
				next_key.value
			);
		} else {
			key.path = null;
		}
		
		key.update = false;
	}
	if (key.path){
		return key.path.getVect(pos, opt_vec);
	} else {
		return ((opt_vec) ? opt_vec.transfer(key.value) : key.value.clone())
			   .lerp(next_key.value,pos);
	}
};

SpatialKeys.prototype.set = function(pos){
	
	var res = this.get(pos, this._temp),
		v = this.target[this.property];
	
	if (v.equals && !v.equals(res)){
		v.transfer(res);
	};
	
};

externs['SpatialKeys'] = SpatialKeys;

/** @constructor */
var LayerBase = function(){
	
	this.is3D = true;
	this.parent = null;
	this.visible = true;
	this.name = null;
	
	this.matrix_ = new Matrix;;
	this.matrix2D_ = new Matrix;
	
};


LayerBase.prototype.getMatrix = function(){
	
	if (!this.is3D){
		return this.getMatrix2D();
	}

	var mat = this.matrix_.injectMatrix(this.getLocalMatrix()),
		p = this.parent;
	
	if (p){
		mat.multiply(p.getMatrix());
	}
	
	return mat;
};


LayerBase.prototype.getMatrix2D = function(){
	
	var mat = this.matrix2D_.injectMatrix(this.getLocalMatrix2D()),
		p = this.parent;

	if (p){
		mat.multiply(p.getMatrix2D());
	}
	
	return mat;
};


LayerBase.prototype.getLocalMatrix = function(){
	return new Matrix();
};

LayerBase.prototype.getLocalMatrix2D = function(){
	return new Matrix();
};

/** @constructor */
var Layer = function(){
	
	LayerBase.call(this);

	this.filters = new Stack();
	this.masks = new Stack();
	
	this.collapse = false;
	
	this.position = new Vector();
	this.anchor = new Vector();
	this.scale = new Vector(1,1,1);
	this.rotation = new Vector();
	this.orientation = new Vector();
	this.opacity = 1;
	
	this.localMatrix_ = new Matrix();
	this.localMatrix2D_ = new Matrix();
	
};

Layer.prototype = new LayerBase();
Layer.prototype.constructor = Layer;

Layer.prototype.getLocalMatrix = function(){
	
	var t = this,
		p = t.position,
		a = t.anchor,
		s = t.scale,
		r = t.rotation,
		o = t.orientation;
	
	return 	this.localMatrix_
			.translation(-a.x,-a.y, -a.z)
			.scale(s.x, s.y, s.z)
			.rotate(r.x, r.y, r.z)
			.rotate(o.x, o.y, o.z)
			.translate(p.x,p.y, -p.z);
};

Layer.prototype.getLocalMatrix2D = function(){
	
	var t = this,
		p = t.position,
		a = t.anchor,
		s = t.scale;

	return 	this.localMatrix2D_
			.translation(-a.x, -a.y, 0)
			.scale(s.x, s.y, 1)
			.rotate(0, 0, t.rotation.z)
			.translate(p.x, p.y, 0);
};


externs['Layer'] = Layer;

/** @constructor */
var Camera = function(){
	
	LayerBase.call(this);
	
	this.position = new Vector();
	this.rotation = new Vector();
	this.target = new Vector();
	this.haveTarget = true;
	this.zoom = 1333.33;
	this.center = new Vector();
	this.is3D = true;
	
	this.localMatrix_ = new Matrix();
	this.localMatrix2D_ = new Matrix();
	this.matrixCamera_ = new Matrix();
	this.tempMatrixCamera_ = new Matrix();
};

Camera.prototype = new LayerBase();
Camera.prototype.constructor = Camera;

Camera.prototype.getLocalMatrix = function(){
	
	var t   = 	this,
		r	=	t.rotation,
		ta	=	t.target,
		p	=	t.position,
		mat = 	this.localMatrix_
				.rotate(r.x,r.y,r.z);
	
	mat.m41 = mat.m42 = mat.m43 = 0;
	
	if (t.haveTarget){
		mat.lookAt(
				ta.x - p.x,
				ta.y - p.y, 
				ta.z - p.z
		);
	}
	
	mat.translate(p.x,p.y, -p.z);
	
	return 	mat;
};

Camera.prototype.getLocalMatrix2D = function(){
	
	return 	this.localMatrix2D_
			.rotate(0,0,this.rotation.z)
			.translate(this.position.x,this.position.y, 0);
	
};


Camera.prototype.getCameraMatrix = function(){
	
	
	var c = this.center;

	return	this.matrixCamera_
			.translate(c.x,c.y,this.zoom)
			.preMultiply(
				this.tempMatrixCamera_
				.injectMatrix(this.getMatrix())
				.invert()
			);
	//return 	new Matrix()
	//		.translate(c.x,c.y,this.zoom)
	//		.preMultiply(this.getMatrix().createInvert());
	
};


externs['Camera'] = Camera;

/** @constructor */
var Solid = function(){
	
	Layer.call(this);
	
	this.color = '#000000';
	this.width = 640;
	this.height = 360;
	
};


Solid.prototype = new Layer();
Solid.prototype.constructor = Solid;


externs['Solid'] = Solid;

/** @constructor */
var Composition = function(){
	Layer.call(this);
	
	this.layers = new Stack(Layer);
	this.cameras = new Stack(Camera);
	this.width = 640;
	this.height = 360;
	this.color = "#000000";
};


Composition.prototype = new Layer();
Composition.prototype.constructor = Composition;


Composition.prototype.getCamera = function(){
	
	
	var i = 0,
		l = this.cameras.length,
		temp_cam = null,
		cam = null;
	
	camLoop : for (i = 0; i < l; i++) {
		
		temp_cam = this.cameras.get(i);
		
		if (temp_cam.visible){
			cam = temp_cam;
			break camLoop;
		}
		
	}
	
	return cam;
};

externs['Composition'] = Composition;
/** constructor */

var Text = function(){

	Layer.call(this);
	
	this.text = "";
	this.textArea = new Rectangle(0,0,150,150);
	this.textClass = null;
	this.fontFamily = 'Arial';
	this.textColor = '#888888';
	this.fontSize = 18;
	this.lineHeight = 1.2;
	this.letterSpacing = 0;
	this.textAlign = 'left';
	this.verticalAlign = 'top';
	this.collapse = true;
	
};


Text.prototype = new Layer();
Text.prototype.constructor = Text;


externs['Text'] = Text;

var AEBuilder = {
	
	build: function(data){
		
		return this.buildItem(data.items[data.root],data.items);
		
	},
	
	buildItem: function(item,items){
		switch (item.type) {
		case 'Composition':
			return this.buildComp(item,items);
			break;
		case 'Solid':
			return this.buildSolid(item,items);
			break;
		case 'Image':
			return this.buildImage(item,items);
			break;
		case 'Video':
			return this.buildVideo(item,items);
			break;
		}
		
	},
	
	buildComp: function (item, items) {
		
		var comp = new Composition(),
			item_animator = new AnimatorStack(comp),
			layers = item.layers,
			i,layer_data,animator;
		
		comp.width = item.width;
		comp.height = item.height;
		comp.color = item.color || "#000000";
		item_animator.duration = item.duration || 1;
		item_animator.frameRate = item.frameRate || 25;
		
		
		for ( i = 0; i < layers.length; i++) {
			
			layer_data = layers[i];
			animator = null;
			
			switch (layer_data.type) {
			case 'Camera':
				animator = this.buildCamera(layer_data);
				break;
			case 'Text':
				animator = this.buildText(layer_data);
				break;
			default:
				if (layer_data.source){
					animator = this.buildItemLayer(layer_data,items);
				}
				break;
			}

			if (animator){
				
				item_animator.add(animator);
				((animator.layer instanceof Camera)
					? comp.cameras 
					: comp.layers
				).add(animator.layer);
				
			}
		}
		
		return item_animator;
	},
	
	setLayer: function(animator,data){
		var layer = animator.layer,
			tr = data.transform;
		
		layer.name = data.name;
		layer.is3D = data.is3D || false;
		
		if (tr){
			this.setProp(layer, "position", animator, tr.position);
			this.setProp(layer, "anchor", animator, tr.anchor);
			this.setProp(layer, "scale", animator, tr.scale);
			this.setProp(layer, "opacity", animator, tr.opacity);
		}
		
		if (layer.is3D){
			this.setProp(layer, "rotation", animator, tr.rotation);
			this.setProp(layer, "orientation", animator, tr.orientation);
		} else {
			this.setProp(layer.rotation, "z", animator, tr.rotation);
		}
		
	},
	
	

	buildSolid: function (data, items) {
		
		var solid = new Solid(),
			item_animator = new AnimatorStack(solid);
		
		solid.width = data.width;
		solid.height = data.height;
		solid.color = data.color;
		
		return item_animator;
		
	},
	
	
	buildItemLayer: function (data, items) {
		
		var item_animator = this.buildItem(items[data.source], items),
			layer = item_animator.item,
			animator = new Animator(layer, data.inPoint, data.outPoint);
		
		this.setLayer(animator, data);
		
		animator.source = item_animator;
		animator.startTime = data.startTime || 0;
		animator.speed = data.speed || 1;
		
		return animator;
	},
	
	buildImage: function (item, items) {
		
	},
	
	buildVideo: function (item, items) {
		
	},

	
	buildCamera: function (layer) {
		
	},

	buildText: function (layer) {
		
	},


	dump: function(){
		
	},
	
	
	setProp: function (obj, name, animator, value) {
		
		if (!value && value !== 0){
			return;
		}
		
		var i,k,val,offset,is_hold,keys,key,is_object,is_array,is_spatial,is_vector;
		
		if (Array.isArray(value)){
			
			is_spatial = null;
			offset = 0;
			
			for (i = 0; i < value.length; i++) {
				
				k = value[i];
				
				is_object = typeof k === 'object';
				is_array = Array.isArray(k);
				is_hold = ( is_array || !is_object || (k.e && k.e.o === 0));
				val = (is_array) ? k[0] : (is_object && k.v) ? k.v : k;
				is_vector = Vector.isVector(val);
				
				if (is_vector){
					val = new Vector(val.x,val.y,val.z);
				}
				
				if (is_spatial === null){
					
					is_spatial = is_vector;
					
					if (is_spatial){
						keys = new SpatialKeys(obj,name);
					} else {
						keys = new Keys(obj,name);
					}
				}
				
				if (is_array){
					offset = k[1];
				} else if (is_object && k.d !== undefined){
					
					offset = k.d || 0;
				}
				
				key = keys.add(offset,val,is_hold);
				
				if (k.e && Array.isArray(k.e.i)){
					key.inX = k.e.i[0];
					key.inY = k.e.i[1];
				}
				if (k.e && Array.isArray(k.e.o)){
					key.outX = k.e.o[0];
					key.outY = k.e.o[1];
				}
				
				if (is_spatial && k.t){
					if (Array.isArray(k.t.i)){
						key.inTangent = new Vector(k.t.i[0],k.t.i[1],k.t.i[2]);
					}
					if (Array.isArray(k.t.o)){
						key.outTangent = new Vector(k.t.o[0],k.t.o[1],k.t.o[2]);
					}
					key.update = true;
				}
				
			}
			
			if (keys){
				animator.add(keys);
			}
			
		} else if (Array.isArray(value.x)) {
			
			setProp(obj[name],'x',animator,value.x);
			
			if (prop.y){
				setProp(obj[name],'y',animator,value.y);
			}
			
			if (prop.z){
				setProp(obj[name],'z',animator,value.z);
			}
			
		} else {
			
			if (Vector.isVector(value)){
				obj[name].set(value.x,value.y,value.z);
			} else {
				obj[name] = value;
			}
			
		}
		
	}
	
};

externs["AEBuilder"] = AEBuilder;



/**
 * @constructor
 */
var LayerDomElement = function(layer){

	this.model = layer;
	
	this.holder = document.createElement(this.tagName);
	this.element = this.holder;

	this.prevScale = 0;
	this.visible = false;
	
	this.matrix_ = new Matrix();
	this.tempMatrix_ = new Matrix();
};

LayerDomElement.prototype = {
		
		constructor : LayerDomElement,
		
		tagName : 'layer',
		
		visible : false,
		
		setVisible : function(val){
			
			if (val !== this.visible){
				this.visible = val;
				if (val){
					this.element.style.display = undefined;
				} else {
					this.element.style.display = 'none';
				}
			}
			
		},
		
		
		render : function(camera_mat,camera_zoom){
			
			var t = this,
				m = t.model,
				mat = t.matrix_.injectMatrix(m.getMatrix());
			
			
			t.modifyMatrix(mat);

			if (camera_mat){
				mat.multiply(camera_mat);
			}
			
			t.modifyCollapse(mat,camera_zoom);

			t.element.style[TRANSFORM] = mat.toString();
			t.holder.style.opacity = (m.opacity !== 1) ? m.opacity : undefined;
			
			
		},
		
		modifyCollapse : function(mat,zoom){
			
			
			var t = this,
				e = t.element,
				h = t.holder,
				m = t.model;
			
			if ((e === h) === m.collapse){
				
				if (m.collapse){
					
					e = t.element = document.createElement('transform');
					
					if (h.parentElement){
						h.parentElement.replaceChild(e,h);
						e.style[TRANSFORM] = h.style[TRANSFORM];
						e.appendChild(h);
					}
					
				} else {
					
					if (e.parentElement){
						e.parentElement.replaceChild(h,e);
						h.style[TRANSFORM] = e.style[TRANSFORM];
					}
					
					t.element = h;
				}
				
			}
			
			
			if (m.collapse){
				
				var scale = 1,
					invScale,
					mx = mat.m21,
					my = mat.m22,
					mz = mat.m23,
					prev = t.prevScale;
				
				scale = Math.sqrt((mx * mx) + (my * my) + (mz * mz)) * (zoom / (zoom - mat.m43));
				
				
				
				if (scale / prev > 1.5 || scale / prev < .75) {
					
					t.prevScale = scale;
					h.style[TRANSFORM] = 'scale('+scale+','+scale+')';
					
				}
				
				invScale = 1/scale;
				mat.preMultiply(t.tempMatrix_.scaling(invScale, invScale, 1));
				
			} else {
				this.prevScale = 0;
			}

		},

		modifyMatrix : function(mat){
			return mat;
		}
};




/**
 * @constructor
 */
var SolidDomElement = function(layer){

	LayerDomElement.call(this,layer);
	
};

SolidDomElement.prototype = new LayerDomElement(null);
SolidDomElement.prototype.constructor = SolidDomElement;
SolidDomElement.prototype.tagName = 'solid';

SolidDomElement.prototype.render = function(camera_mat,camera_zoom){
	
	LayerDomElement.prototype.render.call(this,camera_mat,camera_zoom);
	
	var h = this.holder,
		m = this.model;
	
	h.style.width = m.width;
	h.style.height = m.height;
	h.style.backgroundColor = m.color;
	
};

var checkDifference = function(source,target){
	var res = false,
		s_prop,
		t_prop;
	
	for ( var i in target) {
		
		if (target.hasOwnProperty(i)){
			s_prop = source[i];
			t_prop = target[i];
			if (s_prop !== t_prop && (typeof s_prop !== 'object' || s_prop === null)){
				
				res = true;
				target[i] = s_prop;

			} else if (s_prop !== null && s_prop.clone && s_prop.compare){
				if (!s_prop.compare(t_prop)){
					res = true;
					target[i] = s_prop.clone();
				}
			}
		}
	}
	
	return res;
};


/**
 * @constructor
 */
var TextDomElement = function(layer){

	this.text = layer;
	
	LayerDomElement.call(this,layer);
	
	
	this.oldText = {
		text : null,
		textArea : null,
		textClass : null,
		fontFamily : null,
		textColor : null,
		fontSize : null,
		lineHeight : null,
		letterSpacing : null,
		textAlign : null,
		verticalAlign : null
	};
	
};

TextDomElement.prototype = new LayerDomElement(null);
TextDomElement.prototype.constructor = SolidDomElement;

TextDomElement.prototype.tagName = 'text';

TextDomElement.prototype.render = function(camera_mat,camera_zoom){

	if (checkDifference(this.text,this.oldText)){
		
		var holder = this.holder,
			style = this.holder.style,
			text = this.text,
			size = text.fontSize,
			maxResize = 6,
			maxHeight = text.textArea.height,
			offset = (size * text.leading) - size;
			i = 0;
		
		style.width = text.textArea.width + 'px';
		style.color = text.textColor;
		style.textAlign = text.textAlign;
		style.fontFamily = text.fontFamily;
		style.fontSize = text.fontSize + 'px';
		style.lineHeight = text.lineHeight + 'em';
		
		var t_node = document.createTextNode(text.text);
		
		if (this.textNode){
			
			holder.replaceChild(t_node,this.textNode);
			
		} else {
			
			holder.appendChild(t_node);
			
		}
		
		this.textNode = t_node;
		
		while (i <= maxResize && (holder.offsetHeight - offset) >= maxHeight) {
			size = size * 0.92;
			offset = (size * text.leading) - size;
			style.fontSize = size + 'px';
			i++;
		}
		
		this.offsetY = (text.textArea.y - (offset / 2));
		var dif = (maxHeight - (holder.offsetHeight - (offset / 2)));
		
		switch (text.verticalAlign) {
			case 'bottom':
				this.offsetY += dif;
				break;
			case 'middle':
				this.offsetY += dif / 2;
				break;
			default:
				break;
		}
		
		style.height = (holder.offsetHeight + 5) + 'px';
		
	}
	
	LayerDomElement.prototype.render.call(this,camera_mat,camera_zoom);
	
};


TextDomElement.prototype.modifyMatrix = function(mat){
	return mat;
};


/** @this {CompositionDomElement} */
var _Composition_add = function(layer,pos){
	
	var e = _Composition_generate(layer);
	this.holder.appendChild(e.element);
	this.layers.splice(pos,0,e);
	
	
	
};

/** @this {CompositionDomElement} */
var _Composition_remove = function(layer,pos){
	
	var e = this.layers[pos];
	this.holder.removeChild(e.element);
	this.layers.splice(pos,1);
	
	
};

/** @this {CompositionDomElement} */
var _Composition_swap = function(pos_1,pos_2){
	
	var e = this.layers[pos_1];
	this.layers[pos_1] = this.layers[pos_2];
	this.layers[pos_2] = e;
	
};

/** 
 * 
 * @this {CompositionDomElement}
 * @param {Layer} obj
 * @returns {LayerDomElement}
 * 
 * */
var _Composition_generate = function(obj){
	
	if (obj instanceof Composition){
		return new CompositionDomElement(obj);
	} else if (obj instanceof Solid){
		return new SolidDomElement(obj);
	} else if (obj instanceof Text){
		return new TextDomElement(obj);
	} else {
		return new LayerDomElement(obj);
	};
	
};

/**
 * @constructor
 * @param {Composition} layer
 */
var CompositionDomElement = function(comp){

	var t = this,
		e,
		sig = comp.layers.on;

	LayerDomElement.call(t,comp);

	/** @type Composition */
	t.composition = comp;
	
	t.collapse = null;
	t.zoom = 1333.33;
	t.width = 0;
	t.height = 0;
	
	
	/** @type Array.<Layer> */
	t.layers = [];
	
	comp.layers.each(function(lyr){
		e = _Composition_generate(lyr);
		t.holder.appendChild(e.element);
		t.layers.push(e);
	});

	sig.add.add(_Composition_add,t);
	sig.remove.add(_Composition_remove,t);
	sig.swap.add(_Composition_swap,t);
};

CompositionDomElement.prototype = new LayerDomElement(null);
CompositionDomElement.prototype.constructor = CompositionDomElement;

CompositionDomElement.prototype.tagName = 'composition';

CompositionDomElement.prototype.render = function(camera_mat,camera_zoom,opt_camera){
	
	LayerDomElement.prototype.render.call(this,camera_mat,camera_zoom);
	
	var t = this,
		layers = t.layers,
		l = t.layers.length,
		model = t.model,
		style = t.element.style,
		i,
		camera = (opt_camera || (!model.collapse) ? t.composition.getCamera() : null),				
		cam_mat = (camera) ? camera.getCameraMatrix() : null,
		cam_zoom = (camera) ? camera.zoom : 1333.33,
		layer;
		
	if (t.collapse !== model.collapse){
		
		if (model.collapse){
			
			style[TRANSFORM_STYLE] = 'preserve-3d';
			style[PERSPECTIVE] = undefined;
			style[PERSPECTIVE_ORIGIN] = undefined;
			style.clip = undefined;
			style.overflow = undefined;
		} else {
			
			t.width = null;
			t.height = null;
			t.zoom = null;
			
			style[TRANSFORM_STYLE] = 'flat';
			
		}
		
		t.collapse = model.collapse;
	}
	
	
	
	if (!t.collapse){
		
		if (t.width !== model.width || t.heigh !== model.height){
			
			t.width = model.width;
			t.height = model.height;
			style.width = t.width.toString()+'px';
			style.height = t.height.toString()+'px';
			style.overflow = 'hidden';
			style.clip = "rect(0px,"+t.width+"px,"+t.height+",0px)"
			style[PERSPECTIVE_ORIGIN] = (t.width/2).toString()+'px '+(t.height/2).toString()+'px';
		}
		
		
		if (t.zoom !== cam_zoom){
			
			t.zoom = cam_zoom;
			style[PERSPECTIVE] = t.zoom.toString()+'px';
		}
	}
	

	for ( i = 0; i < l; i++) {
		
		layer = layers[i];
		
		if (layer.visible !== layer.model.visible){
			layer.setVisible(layer.model.visible);
		}
		
		if (layer.visible){
			layer.render(cam_mat,cam_zoom);
		}
		
	}
	
};

CompositionDomElement.prototype.modifyCollapse = function(mat,zoom){
	
	return mat;
	
};


/**
 * @param {Composition} scene
 * @param {Camera} opt_camera
 */
var DomRenderer = function(scene,opt_camera){
	
	this.scene = new CompositionDomElement(scene);

	this.camera = opt_camera;
	
	this.element = document.createElement('scene');
	this.element.appendChild(this.scene.element);
	
	if (!document.getElementById('AEStyleSheet')){
		var cssNode = document.createElement('style');
		cssNode.id = 'AEStyleSheet';
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.media = 'screen';
		cssNode.title = 'AEStyleSheet';
		cssNode.innerHTML = "scene * {position:absolute;display:block;top:0px;left:0px;word-wrap:break-word;-webkit-font-smoothing:antialiased;-moz-transform-origin:0% 0%;-webkit-transform-origin:0% 0%;-ms-transform-origin:0% 0%;}";
		document.getElementsByTagName("head")[0].appendChild(cssNode);
		
	}
	
	if (scene.color){
		this.scene.element.style.backgroundColor = scene.color;
	}
	
	
};

DomRenderer.prototype.render = function(){
	
	this.scene.render(null,null,this.camera);
	
};



externs['DomRenderer'] = DomRenderer;



//exports to multiple environments
if(typeof define === 'function' && define.amd){ //AMD
	define('AE', [], externs);
} else if (typeof module !== 'undefined' && module.exports){ //node
	module.exports = externs;
} else { //browser
	//use string because of Google closure compiler ADVANCED_MODE
	global['AE'] = externs;
}

}(this));

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

if (!isArray){
	
	var isArray = function (o) {
		return Object.prototype.toString.call(o) === '[object Array]';
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
		
		result.transform.anchor = result.transform.anchorPoint;
		delete result.transform.anchorPoint;
		
		if (result.is3D){
			
			this.cleanRotation(result.transform);
	        
			delete result.materialOptions;
			
			delete result.transform.xPosition;
			delete result.transform.yPosition;
			delete result.transform.zPosition;
			
		} else {
			
			result.transform.rotation = result.transform.zRotation;
			delete result.transform.xRotation;
			delete result.transform.yRotation;
			delete result.transform.orientation;
			
			
			if ( result.transform.scale ){
				delete result.transform.scale.z;
			}
			
			this.reduceProperty(result.transform.anchor);
			this.reduceProperty(result.transform.position);
			
			delete result.transform.xPosition;
			delete result.transform.yPosition;
			
		}
		
	},
	
	cleanTextLayer : function(result, layer, project, options){
		
		result.type = "Text";
		
		if (layer.Masks.numProperties >= 1){
			
			result.text.bounds = this.getMaskBounds(layer.Masks.property(1));
			
		}

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
	
	reduceProperty : function (prop){
		if (isArray(prop)){
			for (var i = 0; i < prop.length; i++) {
				delete prop[i].v.z;
				if (prop.t){
					prop[i].t.i.pop();
					prop[i].t.o.pop();
				}
			}
		} else {
			delete prop.z;
		}
	},
	
	cleanRotation : function( obj ) {
		
		obj.rotation = {
			x:obj.xRotation || 0,
		    y:obj.yRotation || 0,
		    z:obj.zRotation || 0
		};
		
		delete obj.xRotation;
		delete obj.yRotation;
		delete obj.zRotation;
	}
};

var PropertyExporter = {
		
	getProperty : function( prop, project, options ){
		
		var keys = [],
			result,
			i,
			val,old_val,
			time,
			old_time = 0,
			old_time_dif = 0,
			type = prop.propertyValueType,
			is_marker = type === PropertyValueType.MARKER,
			is_text = type === PropertyValueType.TEXT_DOCUMENT,
			is_two = type === PropertyValueType.TwoD,
			is_three = type === PropertyValueType.ThreeD,
			layer = prop.propertyGroup(prop.propertyDepth),
			dur = layer.containingComp.frameDuration;
		

		
		if (prop.isTimeVarying){
			
			if ( (options.bake || prop.expressionEnabled) && !(is_marker || is_text) ) {

				old_val = val = [];
				keys = [];
				
				for (i = layer.inPoint; i <= layer.outPoint; i+=dur) {
					
					val = this.getSimpleProperty(prop, prop.valueAtTime(i, true), options);
					
					if (JSON.stringify(val) !== JSON.stringify(old_val)){
						
						time = prop.keyTime(i)-old_time;
						
						if (!keys.length){
							keys.push([val,time]);
						} else if (time === old_time_dif) {
							keys.push(val);
						} else {
							keys.push([val,time]);
						}

						old_time = i;
						old_time_dif = time;
						old_val = val;
					}
				}

				return keys;
				
			} else if (is_two || is_three) {
				
				result = {
					x: [],
					y: []
				};
				
				if (is_three) {
					result.z = [];
				}
				
				for (i = 1; i <= prop.numKeys; i++ ) {
					
					result.x.push(this.getKey(prop,i,options,0,'x'));
					result.y.push(this.getKey(prop,i,options,1,'y'));
					
					if (result.z) {
						result.z.push(this.getKey(prop,i,options,2,'z'));
					}
				}
				
				return result;
				
			} else {
				keys = [];
				for (i = 1; i <= prop.numKeys; i++ ) {
					keys.push(this.getKey(prop,i,options));
				}
				return keys;
			}
				
		} else {
			return this.getSimpleProperty(prop, prop.valueAtTime(0, true), options);
		}
		
	},
	
	
	getKey : function(prop, index, options, ease_index, name){
		
		var time = prop.keyTime(index),
			offset = (index > 1) ? time - prop.keyTime(index-1) : time,
			value = this.getSimpleProperty(prop, prop.keyValue(index), options),
			in_type = prop.keyInInterpolationType(index),
			out_type = prop.keyOutInterpolationType(index),
			bezier_type = KeyframeInterpolationType.BEZIER,
			hold_type = KeyframeInterpolationType.HOLD,
			key,in_anchor,out_anchor;
		
		if (!ease_index) {
			ease_index = 0;
		}
		
		if (name && value.hasOwnProperty(name)){
			value = value[name];
		}
		
		if (in_type === hold_type && out_type === hold_type){
				
			if (index > 2 && (offset === prop.keyTime(index-1) - prop.keyTime(index-2)) ){
				return value;
			} else {
				return [value, offset];
			}
				
		} else {
			
			key = {
				v:value,
				d:offset,
				e:{
					i: 0,
					o: 0,
				}
			};
			
			if (in_type === bezier_type){
				
				key.e.i = this.getEaseData(
					prop.keyInTemporalEase(index), 
					(index > 1) ? this.getEaseLength(prop, index-1, index, ease_index) : null,
					true, ease_index
				);
				
			} else if (in_type !== hold_type) {
				delete key.e.i;
			}
			
			if (out_type === bezier_type){

				key.e.o = this.getEaseData(
					prop.keyOutTemporalEase(index), 
					(index < prop.numKeys) ? this.getEaseLength(prop, index, index+1, ease_index) : null,
					false, ease_index
				);
				
			} else if (out_type !== hold_type) {
				delete key.e.o;
			}
			
			if (key.e.i === undefined && key.e.o === undefined){
				delete key.e;
			}
			
			if (prop.isSpatial) {
				
				in_anchor = prop.keyInSpatialTangent(index);
				out_anchor = prop.keyOutSpatialTangent(index);
				
				
				
				
				key.t = {};
				
				
				if (index > 1 && this.isCurve(prop,index,index-1)){
					
					key.t.i = [round(in_anchor[0],0.01), round(in_anchor[1],0.01)];
					if (in_anchor.length >= 3){
						key.t.i.push(round(in_anchor[2],0.01));
					}
				}
				
				if (index < prop.numKeys && this.isCurve(prop,index+1,index)){
					
					key.t.o = [round(out_anchor[0],0.01), round(out_anchor[1],0.01)];
					if (out_anchor.length >= 3){
						key.t.o.push(round(out_anchor[2],0.01));
					}
				}
				
				if (!key.t.i && !key.t.o){
					delete key.t;
				}

			}
			
			return key;
			
		}
		
		
	},
	
	getEaseData : function(data, length, to_invert, index){
		
		var x = data[index].influence /100,
			y = data[index].speed * x;
		
		if (!index) {
			index = 0;
		}
		
		if (length){
			y = (data[index].speed * x)/length;
		}
		
		if (to_invert){
			x = 1-x;
			y = 1-y;
		}
		
		return [round(x,0.001), round(y,0.001)];

	},
	
	isCurve : function(prop,key,next_key){
		var ae = global.AE,
			p_1,t_1,t_2,p_2,c_1,c_2,
			start_val = prop.keyValue(key),
			end_val = prop.keyValue(next_key),
			l_1,l_2;
			
		if (key < next_key){
			t_1 = prop.keyOutSpatialTangent(key);
			t_2 = prop.keyInSpatialTangent(next_key);
		} else {
			t_1 = prop.keyInSpatialTangent(key);
			t_2 = prop.keyOutSpatialTangent(next_key);
		}
		
		
		p_1 = new ae.Vector( start_val[0], start_val[1], start_val[2]);
		c_1 = new ae.Vector( t_1[0], t_1[1], t_1[2]).add(p_1);
		p_2 = new ae.Vector( end_val[0], end_val[1], end_val[2]);
		c_2 = new ae.Vector( t_2[0], t_2[1], t_2[2]).add(p_2);
		
		
		l_1 = p_1.distance(p_2);
		l_2 = p_1.distance(c_1)+c_1.distance(c_2)+c_2.distance(p_2);
		return (l_2/l_1) > 1.03;
	},
	
	getEaseLength : function (prop,key,next_key,index){
		
		var ae = global.AE,
			p_1,c_1,c_2,p_2,
			start_val = prop.keyValue(key),
			end_val = prop.keyValue(next_key),
			type = prop.propertyValueType;

		if (!index) {
			index = 0;
		}
		
		if (prop.propertyValueType === PropertyValueType.OneD){
			
			return end_val - start_val;
			
		} else if (	type === PropertyValueType.TwoD_SPATIAL || type === PropertyValueType.ThreeD_SPATIAL) {
			
			p_1 = new ae.Vector( start_val[0], start_val[1], start_val[2]);
			
			if (key < next_key){
				c_1 = prop.keyOutSpatialTangent(key);
				c_2 = prop.keyInSpatialTangent(next_key);
			} else {
				c_1 = prop.keyInSpatialTangent(key);
				c_2 = prop.keyOutSpatialTangent(next_key);
			}
			
			p_2 = new ae.Vector( end_val[0], end_val[1], end_val[2]);
			
			return new ae.CubicCurve(
				p_1,
				new ae.Vector(c_1[0],c_1[1],c_1[2]).add(p_1),
				new ae.Vector(c_2[0],c_2[1],c_2[2]).add(p_2),
				p_2
			).length();
			
		} else if (prop.propertyValueType === PropertyValueType.SHAPE) {
			
			return 1;
			
		} else {
			
			return end_val[index] - start_val[index];
			
		}
	},
	
	getSimpleProperty : function( prop, value, options){
		
		var divider = (prop.unitsText === "percent") ? 100 : 1;
		var presision = 0.01/divider;
		
        switch (prop.propertyValueType){
        	case PropertyValueType.MARKER:
        		return this.getMarker(value);
        		break;
	        case PropertyValueType.SHAPE:
	        	return this.getShape(value);
	        	break;
	        case PropertyValueType.TEXT_DOCUMENT:
	        	return this.getText(value, prop, options);
	            break;
	        case PropertyValueType.OneD:
            	return round(value/divider,presision);
            	break;
	        case PropertyValueType.TwoD_SPATIAL:
            case PropertyValueType.TwoD:
            	return {
            		x:round(value[0]/divider,presision),
            	    y:round(value[1]/divider,presision)
            	};
            	break;
            case PropertyValueType.ThreeD_SPATIAL:
            case PropertyValueType.ThreeD:
            	return {
            		x: round(value[0]/divider,presision),
            	    y: round(value[1]/divider,presision),
            	    z: round(value[2]/divider,presision)
            	};
            	break;
	        default :
	        	return null;
	    }
        
	},
	
	getMarker : function(val){
		
		var obj = {
			comment: val.comment,
			duration: val.duration
		};
		
		if (val.chapter){
			obj.chapter = val.chapter;
		}
		
		if (val.cuePointName){
			obj.name = val.cuePointName;
		}
		
		if (val.eventCuePoint){
			obj.event = val.eventCuePoint;
		}
		
		if (val.url){
			obj.url = val.url;
		}
		
		if (val.frameTarget){
			obj.target = val.frameTarget;
		}
		
		var params = val.getParameters();
		
		if (params){
			obj.params = params;
		}
		
		return obj;
	},
	
	getShape : function(val){
		
		var obj = {
			
		};
		
		if (!val.closed){
			obj.closed = false;
		}
		
		var data = [];
		var v,in_data,out_data;
		
		for ( var i = 0; i < val.vertices.length; i++) {
			
			v = val.vertices[i];
			in_data = val.inTangents[i];
			out_data = val.outTangents[i];
			
			if (in_data[0] || in_data[1] || out_data[0] || out_data[1]){
				data.push([
				           round(v[0],0.01),
				           round(v[1],0.01),
				           round(in_data[0],0.01),
				           round(in_data[1],0.01),
				           round(out_data[0],0.01),
				           round(out_data[1],0.01)
				           ]);
			} else {
				data.push([
				           round(v[0],0.01),
				           round(v[1],0.01)
				           ]);
			}
		}
		
		obj.data = data;
		
		return obj;
	},

	getText : function(val, prop, options){
		
		var obj = {
			text: val.text,
			font: val.font,
			fontSize: val.fontSize,
			color: ProjectExporter.getColor(val.fillColor)
		};
		
		if (options.valign && options.valign !== 'top'){
			obj.valign = options.valign;
		}
		
		if (val.justification === ParagraphJustification.RIGHT_JUSTIFY) {
			obj.align = 'right';
		} else if (val.justification !== ParagraphJustification.CENTER_JUSTIFY) {
			obj.align = 'center';
		}

		if (val.tracking){
			obj.tracking = val.tracking;
		}
		
		if (options.leading){
			obj.leading = options.leading;
		}
		
		if (val.isParaText){
			obj.width = val.boxTextSize[0];
			obj.height = val.boxTextSize[1];
		}
		
		return obj;
	}
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
		result.frameRate = comp.frameRate;
		result.duration = comp.duration;
		
		if (comp.motionBlur){
			result.motionBlur = comp.motionBlur;
			result.shutterAngle = comp.shutterAngle;
			result.shutterPhase = comp.shutterAngle;
			
		}
		
		if (comp.workAreaStart){
			result.workAreaStart = comp.workAreaStart;
		}
		
		
		
		
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
	        	
	        	result = PropertyExporter.getProperty( item, project, options );
	        
	    }

		return result;
	},
	
	getColor : function( color ){
		
		var r = Math.floor( Math.min( Math.max( color[0], 0 ), 1 )*0xFF );
		var g = Math.floor( Math.min( Math.max( color[1], 0 ), 1 )*0xFF );
		var b = Math.floor( Math.min( Math.max( color[2], 0 ), 1 )*0xFF );
		
		var str = Math.floor( ( r<<16 ) + ( g<<8 ) + b ).toString(16);
		
		return "#" + "000000".slice(0, 6-str.length) + str;
		
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
var LayerPanel = function(panel,layer,context){

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
	
	
	
	if (this.get('location')){
		
		var file = new File(this.get('location'));
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


