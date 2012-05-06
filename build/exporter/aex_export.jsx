var global = this; 
 (function() {
/**
 * almond 0.0.3 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
/*jslint strict: false, plusplus: false */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {

    var defined = {},
        waiting = {},
        aps = [].slice,
        main, req;

    if (typeof define === "function") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseName = baseName.split("/");
                baseName = baseName.slice(0, baseName.length - 1);

                name = baseName.concat(name.split("/"));

                //start trimDots
                var i, part;
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }
        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            main.apply(undef, args);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, i, ret, map;

        //Use name if no relName
        if (!relName) {
            relName = name;
        }

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Default to require, exports, module if no deps if
            //the factory arg has any arguments specified.
            if (!deps.length && callback.length) {
                deps = ['require', 'exports', 'module'];
            }

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name]
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw name + ' missing ' + depName;
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef) {
                    defined[name] = cjsModule.exports;
                } else if (!usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {

            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            //Drop the config stuff on the ground.
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = arguments[2];
            } else {
                deps = [];
            }
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function () {
        return req;
    };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (define.unordered) {
            waiting[name] = [name, deps, callback];
        } else {
            main(name, deps, callback);
        }
    };

    define.amd = {
        jQuery: true
    };
}());
define("extern/almond", function(){});


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

define('extern/ES5',[],function () {

    var prototypeOfArray = Array.prototype,
        prototypeOfObject = Object.prototype,
        slice = prototypeOfArray.slice;

    function toInteger (n) {
        n = +n;
        if (n !== n) { // isNaN
            n = 0;
        } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
        return n;
    }

    if (!Function.prototype.bind) {
        Function.prototype.bind = function bind(that) {

            var target = this;

            if (typeof target !== "function") {
                throw new TypeError("Function.prototype.bind called on incompatible " + target);
            }

            var args = slice.call(arguments, 1);

            var bound = function () {

                if (this instanceof bound) {

                    var F = function(){};
                    F.prototype = target.prototype;
                    var self = new F();

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
            return Object.prototype.toString.call(obj) === "[object Array]";
        };
    }


    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {

            var self = this,
                length,
                prepareString = "a"[0] != "a";

            if (prepareString && typeof o == "string" && o) {
                self = self.split("");
            }

            self = Object(this),
            length = self.length >>> 0;

            if (!length) {
                return -1;
            }

            var i = 0;
            if (arguments.length > 1) {
                i = toInteger(arguments[1]);
            }

            i = i >= 0 ? i : Math.max(0, length + i);
            for (; i < length; i += 1) {
                if (i in self && self[i] === sought) {
                    return i;
                }
            }
            return -1;
        };
    }

    return {
        done: true
    }
});

/*jslint onevar:true, undef:true, newcap:true, regexp:true, bitwise:true, maxerr:50, indent:4, white:false, nomen:false, plusplus:false */
/*global define:false, require:false, exports:false, module:false*/

/** @license
 * JS Signals <http://millermedeiros.github.com/js-signals/>
 * Released under the MIT license
 * Author: Miller Medeiros
 * Version: 0.7.4 - Build: 252 (2012/02/24 10:30 PM)
 */

(function(global){

    /**
     * @namespace Signals Namespace - Custom event/messaging system based on AS3 Signals
     * @name signals
     */
    var signals = /** @lends signals */{
        /**
         * Signals Version Number
         * @type String
         * @const
         */
        VERSION : '0.7.4'
    };


    // SignalBinding -------------------------------------------------
    //================================================================

    /**
     * Object that represents a binding between a Signal and a listener function.
     * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
     * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
     * @author Miller Medeiros
     * @constructor
     * @internal
     * @name signals.SignalBinding
     * @param {signals.Signal} signal Reference to Signal object that listener is currently bound to.
     * @param {Function} listener Handler function bound to the signal.
     * @param {boolean} isOnce If binding should be executed just once.
     * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
     * @param {Number} [priority] The priority level of the event listener. (default = 0).
     */
    function SignalBinding(signal, listener, isOnce, listenerContext, priority) {

        /**
         * Handler function bound to the signal.
         * @type Function
         * @private
         */
        this._listener = listener;

        /**
         * If binding should be executed just once.
         * @type boolean
         * @private
         */
        this._isOnce = isOnce;

        /**
         * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @memberOf signals.SignalBinding.prototype
         * @name context
         * @type Object|undefined|null
         */
        this.context = listenerContext;

        /**
         * Reference to Signal object that listener is currently bound to.
         * @type signals.Signal
         * @private
         */
        this._signal = signal;

        /**
         * Listener priority
         * @type Number
         * @private
         */
        this._priority = priority || 0;
    }

    SignalBinding.prototype = /** @lends signals.SignalBinding.prototype */ {

        /**
         * If binding is active and should be executed.
         * @type boolean
         */
        active : true,

        /**
         * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
         * @type Array|null
         */
        params : null,

        /**
         * Call listener passing arbitrary parameters.
         * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
         * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
         * @return {*} Value returned by the listener.
         */
        execute : function (paramsArr) {
            var handlerReturn, params;
            if (this.active && !!this._listener) {
                params = this.params? this.params.concat(paramsArr) : paramsArr;
                handlerReturn = this._listener.apply(this.context, params);
                if (this._isOnce) {
                    this.detach();
                }
            }
            return handlerReturn;
        },

        /**
         * Detach binding from signal.
         * - alias to: mySignal.remove(myBinding.getListener());
         * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
         */
        detach : function () {
            return this.isBound()? this._signal.remove(this._listener, this.context) : null;
        },

        /**
         * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
         */
        isBound : function () {
            return (!!this._signal && !!this._listener);
        },

        /**
         * @return {Function} Handler function bound to the signal.
         */
        getListener : function () {
            return this._listener;
        },

        /**
         * Delete instance properties
         * @private
         */
        _destroy : function () {
            delete this._signal;
            delete this._listener;
            delete this.context;
        },

        /**
         * @return {boolean} If SignalBinding will only be executed once.
         */
        isOnce : function () {
            return this._isOnce;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
        }

    };


/*global signals:false, SignalBinding:false*/

    // Signal --------------------------------------------------------
    //================================================================

    function validateListener(listener, fnName) {
        if (typeof listener !== 'function') {
            throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName) );
        }
    }

    /**
     * Custom event broadcaster
     * <br />- inspired by Robert Penner's AS3 Signals.
     * @author Miller Medeiros
     * @constructor
     */
    signals.Signal = function () {
        /**
         * @type Array.<SignalBinding>
         * @private
         */
        this._bindings = [];
        this._prevParams = null;
    };

    signals.Signal.prototype = {

        /**
         * If Signal should keep record of previously dispatched parameters and
         * automatically execute listener during `add()`/`addOnce()` if Signal was
         * already dispatched before.
         * @type boolean
         */
        memorize : false,

        /**
         * @type boolean
         * @private
         */
        _shouldPropagate : true,

        /**
         * If Signal is active and should broadcast events.
         * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
         * @type boolean
         */
        active : true,

        /**
         * @param {Function} listener
         * @param {boolean} isOnce
         * @param {Object} [listenerContext]
         * @param {Number} [priority]
         * @return {SignalBinding}
         * @private
         */
        _registerListener : function (listener, isOnce, listenerContext, priority) {

            var prevIndex = this._indexOfListener(listener, listenerContext),
                binding;

            if (prevIndex !== -1) {
                binding = this._bindings[prevIndex];
                if (binding.isOnce() !== isOnce) {
                    throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
                }
            } else {
                binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
                this._addBinding(binding);
            }

            if(this.memorize && this._prevParams){
                binding.execute(this._prevParams);
            }

            return binding;
        },

        /**
         * @param {SignalBinding} binding
         * @private
         */
        _addBinding : function (binding) {
            //simplified insertion sort
            var n = this._bindings.length;
            do { --n; } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
            this._bindings.splice(n + 1, 0, binding);
        },

        /**
         * @param {Function} listener
         * @return {number}
         * @private
         */
        _indexOfListener : function (listener, context) {
            var n = this._bindings.length,
                cur;
            while (n--) {
                cur = this._bindings[n];
                if (cur._listener === listener && cur.context === context) {
                    return n;
                }
            }
            return -1;
        },

        /**
         * Check if listener was attached to Signal.
         * @param {Function} listener
         * @param {Object} [context]
         * @return {boolean} if Signal has the specified listener.
         */
        has : function (listener, context) {
            return this._indexOfListener(listener, context) !== -1;
        },

        /**
         * Add a listener to the signal.
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        add : function (listener, listenerContext, priority) {
            validateListener(listener, 'add');
            return this._registerListener(listener, false, listenerContext, priority);
        },

        /**
         * Add listener to the signal that should be removed after first execution (will be executed only once).
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        addOnce : function (listener, listenerContext, priority) {
            validateListener(listener, 'addOnce');
            return this._registerListener(listener, true, listenerContext, priority);
        },

        /**
         * Remove a single listener from the dispatch queue.
         * @param {Function} listener Handler function that should be removed.
         * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
         * @return {Function} Listener handler function.
         */
        remove : function (listener, context) {
            validateListener(listener, 'remove');

            var i = this._indexOfListener(listener, context);
            if (i !== -1) {
                this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
                this._bindings.splice(i, 1);
            }
            return listener;
        },

        /**
         * Remove all listeners from the Signal.
         */
        removeAll : function () {
            var n = this._bindings.length;
            while (n--) {
                this._bindings[n]._destroy();
            }
            this._bindings.length = 0;
        },

        /**
         * @return {number} Number of listeners attached to the Signal.
         */
        getNumListeners : function () {
            return this._bindings.length;
        },

        /**
         * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
         * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
         * @see signals.Signal.prototype.disable
         */
        halt : function () {
            this._shouldPropagate = false;
        },

        /**
         * Dispatch/Broadcast Signal to all listeners added to the queue.
         * @param {...*} [params] Parameters that should be passed to each handler.
         */
        dispatch : function (params) {
            if (! this.active) {
                return;
            }

            var paramsArr = Array.prototype.slice.call(arguments),
                n = this._bindings.length,
                bindings;

            if (this.memorize) {
                this._prevParams = paramsArr;
            }

            if (! n) {
                //should come after memorize
                return;
            }

            bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
            this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

            //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
            //reverse loop since listeners with higher priority will be added at the end of the list
            do { n--; } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
        },

        /**
         * Forget memorized arguments.
         * @see signals.Signal.memorize
         */
        forget : function(){
            this._prevParams = null;
        },

        /**
         * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
         * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
         */
        dispose : function () {
            this.removeAll();
            delete this._bindings;
            delete this._prevParams;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
        }

    };


    //exports to multiple environments
    if(typeof define === 'function' && define.amd){ //AMD
        define('extern/signals',signals);
    } else if (typeof module !== 'undefined' && module.exports){ //node
        module.exports = signals;
    } else { //browser
        //use string because of Google closure compiler ADVANCED_MODE
        global['signals'] = signals;
    }

}(this));


/*global define File app */

define('exporter/LayerWatcher',['extern/signals'], function(signals) {

    function LayerWatcher (panel) {

        this.panel      = panel;
        this.changed    = new signals.Signal();
        this.flash      = panel.add("flashplayer", [0, 0, 1, 1]);
        this.oldLayer   = null;
        var self        = this;

        this.flash.loadMovie(new File('timeout.swf'));
        this.flash.tick = function(){self.tick();};
    }

    LayerWatcher.prototype = {

        start : function () {
            this.flash.invokePlayerFunction('startLoop');
        },

        stop : function () {
            this.flash.invokePlayerFunction('stopLoop');
        },

        tick : function () {

            var layer = null;

            if (
                app
                && app.project
                && app.project.activeItem
            ) {
                var item = app.project.activeItem;

                if ( item.typeName === "Composition"){
                    if (item.selectedLayers.length){
                        layer = item.selectedLayers[0];
                        this.pauseCheck = false;
                    } else if (item !== this.oldItem) {
                        this.pauseCheck = false;
                    }
                    this.oldItem = item;
                }
            }

            try {
                if (layer && this.oldLayer !== layer) {
                    this.changed.dispatch(layer);
                    this.oldLayer = layer;
                } else if (!layer && !this.pauseCheck) {
                    this.changed.dispatch(null);
                    this.oldLayer = null;
                    this.pauseCheck = true;
                }
            } catch(e) {
                this.stop();
            }
        }
    };

    return LayerWatcher;
});

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

define('extern/json',JSON);



/*global define */

define('exporter/PanelBase',['extern/json'], function (json) {

    function PanelBase (panel, layer, width, context) {

        this.panel      = panel;
        this.layer      = layer;
        this.context    = context;

        if (panel && layer){
            this.group              = this.panel.add("group");
            this.group.orientation  = "column";
            this.group.margins      = 8;
            this.group.alignment    = 'left';
        }

        this.width = width || 190;
    }

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
                    self.set(prop,(field.text !== '') ? field.text : undefined);
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


            var group = this.group.add("group"),
                i, val, drop, def;
            group.alignment = 'left';
            group.spacing = 2;

            if (!name){
                name = prop;
            }

            group.add("statictext", undefined, name+' :').alignment = 'left';
            drop = group.add("dropdownlist", undefined);
            def = this.get(prop) || origin;

            for ( i = 0; i < vals.length; i += 1 ) {
                val = vals[i];
                name = (names && names[i]) ? names[i] : val;

                drop.add('item',name);

                if (val === def){
                    drop.selection = i;
                }
            }

            (function(prop,drop,self,vals){
                drop.onChange = function(e){

                    var y = 0;

                    if (drop.selection !== null){
                        selectLoop : for ( ; y < drop.items.length; y += 1) {
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

            if (!this.layer.comment){
                this.layer.comment = "{}";
            }

            var obj = json.parse(this.layer.comment);
            obj[key] = val;
            this.layer.comment = json.stringify(obj);
        },

        get : function(key){

            if (!this.layer.comment){
                return undefined;
            }

            return json.parse(this.layer.comment)[key];
        }
    };

    return PanelBase;
});


/*global define BlendingMode MaskMode*/

define('exporter/blendingModes',[],function () {

    return  {

        getString : function(val){

            switch(val){
            case BlendingMode.ADD:
                return "add";
            case BlendingMode.COLOR_BURN:
                return "subtract";
            case BlendingMode.DARKEN:
                return "darken";
            case BlendingMode.DIFFERENCE:
                return "difference";
            case BlendingMode.HARD_LIGHT:
                return "hardlight";
            case BlendingMode.LIGHTEN:
                return "lighten";
            case BlendingMode.LINEAR_LIGHT:
                return "hardlight";
            case BlendingMode.MULTIPLY:
                return "multiply";
            case BlendingMode.NORMAL:
                return "normal";
            case BlendingMode.OVERLAY:
                return "overlay";
            case BlendingMode.SCREEN:
                return "screen";
            case BlendingMode.SILHOUETE_ALPHA:
                return "erase";
            case BlendingMode.STENCIL_ALPHA:
                return "alpha";
            default:
                return "normal";
            }
        },

        getMaskString : function(val){

            switch(val){
            case MaskMode.NONE:
                return 'none';
            case MaskMode.ADD:
                return 'add';
            case MaskMode.SUBTRACT:
                return 'subtract';
            case MaskMode.INTERSECT:
                return 'intersect';
            case MaskMode.LIGHTEN:
                return 'lighten';
            case MaskMode.DARKEN:
                return 'darken';
            case MaskMode.DIFFERENCE:
                return 'difference';
            default:
                return 'add';
            }
        }
    };
});


/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 */

define('geom/Vector',[],function(){

    function Vector (x, y, z) {

        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    };

    Vector.isVector = function (v) {

        return (v && typeof v.x === 'number' && typeof v.y === 'number');
    };

    Vector.prototype = {

        constructor: Vector,

        set: function (x, y, z) {

            this.x = x;
            this.y = y;
            this.z = z;

            return this;
        },

        setX: function (x) {

            this.x = x;

            return this;
        },

        setY: function (y) {

            this.y = y;

            return this;
        },

        setZ: function (z) {

            this.z = z;

            return this;
        },

        copy: function (v) {

            this.x = v.x;
            this.y = v.y;
            this.z = v.z || 0;

            return this;
        },

        clone: function () {

            return new Vector(this.x, this.y, this.z);
        },

        add: function (v) {

            this.x += v.x;
            this.y += v.y;
            this.z += v.z;

            return this;
        },

        addScalar: function (s) {

            this.x += s;
            this.y += s;
            this.z += s;

            return this;
        },

        sub: function (v) {

            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;

            return this;
        },

        multiply: function (v) {

            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;

            return this;
        },

        multiplyScalar: function (s) {

            this.x *= s;
            this.y *= s;
            this.z *= s;

            return this;
        },

        divide: function (v) {

            this.x /= v.x;
            this.y /= v.y;
            this.z /= v.z;

            return this;
        },

        divideScalar: function (s) {

            if (s) {
                this.x /= s;
                this.y /= s;
                this.z /= s;
            }

            else {
                this.x = 0;
                this.y = 0;
                this.z = 0;
            }

            return this;
        },

        dot: function (v) {

            return this.x * v.x + this.y * v.y + this.z * v.z;
        },

        lengthSq: function () {

            return this.x * this.x + this.y * this.y + this.z * this.z;
        },

        length: function () {

            return Math.sqrt(this.lengthSq());
        },

        normalize: function () {

            return this.divideScalar(this.length());
        },

        lerp: function (v, alpha) {

            this.x += (v.x - this.x) * alpha;
            this.y += (v.y - this.y) * alpha;
            this.z += (v.z - this.z) * alpha;

            return this;
        },

        cross: function (v) {

            var x = this.x,
                y = this.y,
                z = this.z;

            this.x = y * v.z - z * v.y;
            this.y = z * v.x - x * v.z;
            this.z = x * v.y - y * v.x;

            return this;
        },

        flatten: function(zoom, center) {

            var scale = zoom / (zoom - this.z);
            this.x = this.x * scale + center.x * (1 - scale);
            this.y = this.y * scale + center.y * (1 - scale);

            return this;
        },

        multiplyMatrix: function(m) {

            m.multiplyVector(this);

            return this;
        },

        distance: function (v) {

            return Math.sqrt(this.distanceSq(v));
        },

        distanceSq: function (v) {

            return this.clone().sub(v).lengthSq();
        },

        equals: function (v) {

            return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
        },

        isZero: function () {

            return (this.lengthSq() < 0.0001 /* almostZero */ );
        },

        max: function () {

            return Math.max(this.x, Math.max(this.y, this.z));
        },

        min: function (v) {

            return Math.min(this.x, Math.min(this.y, this.z));
        },

        setFromQuaternion: function (q) {

            this.x = Math.atan2(2 * (q.x * q.w - q.y * q.z), (q.w * q.w - q.x * q.x - q.y * q.y + q.z * q.z));
            this.y = Math.asin(2 * (q.x * q.z + q.y * q.w));
            this.z = Math.atan2(2 * (q.z * q.w - q.x * q.y), (q.w * q.w + q.x * q.x - q.y * q.y - q.z * q.z));
        }

    };

    return Vector;
});



/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 */

define('geom/Quaternion',[],function(){

    var quat;

    function Quaternion (x, y, z, w){
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = w || 1;
    }

    Quaternion.isQuaternion = function(v){

        var n = 'number';

        return (v && typeof v.x === n && typeof v.y === n && typeof v.w === n);
    };

    Quaternion.prototype = {

        constructor : Quaternion,

        set: function (x, y, z, w) {

            this.x = x;
            this.y = y;
            this.z = z || 0;
            this.w = (!w && w !== 0) ? 1 : w;

            return this;
        },

        copy: function (v) {

            this.x = v.x;
            this.y = v.y;
            this.z = v.z || 0;
            this.w = v.w || 1;

            return this;
        },

        clone: function () {

            return new Quaternion(this.x, this.y, this.z, this.w);
        },

        equals: function (v) {

            return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z) && (v.w === this.w));
        },

        multiply: function (v) {

            var x = this.x,
                y = this.y,
                z = this.z,
                w = this.w;

            this.w = w * v.w - x * v.x - y * v.y - z * v.z;
            this.x = w * v.x + x * v.w + y * v.z - z * v.y;
            this.y = w * v.y + y * v.w + z * v.x - x * v.z;
            this.z = w * v.z + z * v.w + x * v.y - y * v.x;

            return this;
        },

        setFromEuler: function (v) {

            var sin = Math.sin,
                cos = Math.cos,
                c = Math.PI / 360, // 0.5 * Math.PI / 360, // 0.5 is an optimization
                x = v.x * c,
                y = v.y * c,
                z = v.z * c,
                cy = cos(y),
                sy = sin(y),
                cz = cos(-z),
                sz = sin(-z),
                cx = cos(x),
                sx = sin(x);

            this.set(
                0, 0, sz, cz
            ).multiply(quat.set(
                0, sy, 0, cy
            )).multiply(quat.set(
                sx, 0, 0, cx
            ));

            return this;
        },

        divideScalar: function ( s ) {

            if ( s ) {
                this.x /= s;
                this.y /= s;
                this.z /= s;
                this.w /= s;
            } else {
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.w = 0;
            }

            return this;
        },

        lengthSq: function () {

            return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
        },

        length: function () {

            return Math.sqrt( this.lengthSq() );
        },

        normalize: function () {

            return this.divideScalar( this.length() );
        },

        lerp: function(q, t){

            // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
            var x = this.x,
                y = this.y,
                z = this.z,
                w = this.w,
                cos_half_theta = w * q.w + x * q.x + y * q.y + z * q.z,
                half_theta,
                sin_half_theta,
                ratio_a,
                ratio_b;

            if (cos_half_theta < 0) {
                this.set(-q.x, -q.y, -q.z, -q.w);
                cos_half_theta = -cos_half_theta;
            } else {
                this.copy(q);
            }

            half_theta = Math.acos(cos_half_theta);
            sin_half_theta = Math.sqrt(1.0 - cos_half_theta * cos_half_theta);

            if (Math.abs( sin_half_theta ) < 0.001) {
                this.set(
                    0.5 * ( x + q.x ),
                    0.5 * ( y + q.y ),
                    0.5 * ( z + q.z ),
                    0.5 * ( w + q.w )
                );
                return this;
            }

            ratio_a = Math.sin((1 - t) * half_theta) / sin_half_theta,
            ratio_b = Math.sin(t * half_theta) / sin_half_theta;

            this.set(
                x * ratio_a + this.x * ratio_b,
                y * ratio_a + this.y * ratio_b,
                z * ratio_a + this.z * ratio_b,
                w * ratio_a + this.w * ratio_b
            );

            return this;
        },

        toJSON: function(){

            return {
                x:this.x,
                y:this.y,
                z:this.z,
                w:this.w
            };
        }
    };

    quat = new Quaternion();

    return Quaternion;
});


/*global define*/

define('exporter/propertyCleaner',[
    'geom/Vector',
    'geom/Quaternion',
    './blendingModes'
], function (
    Vector,
    Quaternion,
    blendingModes
) {

    function cleanAVLayer ( result, layer , project ) {

        var i,mask,mask_res;

        for(i = 1; i <= layer.Masks.numProperties; i += 1){

            mask_res = result.masks[i-1];
            mask = layer.Masks.property(i);

            mask_res.maskMode = blendingModes.getMaskString(mask.maskMode);
            mask_res.inverted = mask.inverted;
            delete mask_res.type;

        }

        if ( result.effects ){

            for(i = 0; i < result.effects.length; i += 1){

                result.effects[i].type = result.effects[i].type.replace("aDBE","");

            }
        }

        result.transform.anchor = result.transform.anchorPoint;
        delete result.transform.anchorPoint;

        if (result.is3D){

            cleanRotation(result.transform);

            if (result.transform.orientation){
                result.transform.orientation = transformOrientation(result.transform.orientation);
            }

            delete result.materialOptions;

            delete result.transform.xPosition;
            delete result.transform.yPosition;
            delete result.transform.zPosition;

        } else {

            if (result.transform.zRotation){
                result.transform.rotation = {z: result.transform.zRotation};
            }

            delete result.transform.zRotation;
            delete result.transform.xRotation;
            delete result.transform.yRotation;
            delete result.transform.orientation;

            if ( result.transform.scale ){
                delete result.transform.scale.z;
            }

            reduceProperty(result.transform.anchor);
            reduceProperty(result.transform.position);

            delete result.transform.xPosition;
            delete result.transform.yPosition;
        }

        mixin(result,result.transform);
        delete result.transform;
    }

    function cleanTextLayer (result, layer, project, options){

        result.type = "Text";

        var key;
        var txt = separateTextProperties(result.text.sourceText);

        mixin(result, result.text.pathOptions);
        mixin(result, result.text.moreOptions);
        mixin(result, separateTextProperties(result.text.sourceText));

        if (layer.Masks.numProperties >= 1){
            var bounds = getMaskBounds(layer.Masks.property(1));
            result.textPosition = {x:bounds.x,y:bounds.y};
            result.width = bounds.width;
            result.height = bounds.height;
        }
    }

    function getMaskBounds (m_obj) {

        var v  = m_obj.maskShape.value.vertices,
            max_x = -1000000000000000000,
            max_y = -1000000000000000000,
            result = {},
            i;

        result.x = 1000000000000000000;
        result.y = 1000000000000000000;

        for(i = 0; i < v.length; i += 1){

            result.x = Math.min(result.x,v[i][0]);
            result.y = Math.min(result.y,v[i][1]);
            max_x = Math.max(max_x,v[i][0]);
            max_y = Math.max(max_y,v[i][1]);
        }

        result.width = parseFloat((max_x-result.x).toFixed(2));
        result.height = parseFloat((max_y-result.y).toFixed(2));
        result.x = parseFloat(result.x.toFixed(2));
        result.y = parseFloat(result.y.toFixed(2));

        return result;
    }

    function cleanCameraLayer ( result, layer , project ) {
        result.type = "Camera";

        if (result.transform){
            //delete result.transform.xPosition;
            //delete result.transform.yPosition;
            //delete result.transform.zPosition;

            cleanRotation(result.transform);

            if (result.transform.orientation){
                result.transform.orientation = transformOrientation(result.transform.orientation);
            }

            if (result.transform.pointofInterest){
                result.transform.target = result.transform.pointofInterest;
                delete result.transform.pointofInterest;
            }

            delete result.transform.opacity;

            if (result.cameraOptions){
                result.transform.zoom = result.cameraOptions.zoom;
            }
        }
        delete result.cameraOptions;

        mixin(result,result.transform);
        delete result.transform;
    }

    function reduceProperty (prop) {

        var k;

        if (Array.isArray(prop)){
            for (var i = 0; i < prop.length; i += 1) {
                k = prop[i];
                if (Array.isArray(k)){
                    delete k[0].z;
                } else if (Vector.isVector(k)){
                    delete k.z;
                } else {
                    delete k.v.z;
                    if (k.t){
                        if (k.t.i){
                            k.t.i.pop();
                        }
                        if (k.t.o){
                            k.t.o.pop();
                        }
                    }
                }
            }
        } else {
            delete prop.z;
        }
    }

    function separateTextProperties (obj) {
        if ( Array.isArray( obj ) ) {

            var result = {},
                offsets = {},
                text_obj,
                prev_text_obj,
                i = 0,
                l = obj.length,
                current_time = 0,
                old_offset = 0,
                offset = 0,
                key;

            for ( ; i < l; i += 1 ) {
                text_obj = ( Array.isArray(obj[i]) ) ? obj[i][0] : obj[i];
                offset = ( Array.isArray(obj[i]) ) ? obj[i][1] : old_offset;
                current_time += offset;
                old_offset = offset;

                for (key in text_obj) {
                    if (text_obj.hasOwnProperty(key)){
                        prev_text_obj = ( Array.isArray( result[key] ) )
                                        ? result[key][result[key].length-1][0]
                                        : result[key];

                        if ( text_obj.hasOwnProperty( key ) && ( text_obj[key] !== prev_text_obj ) ) {

                            if ( result.hasOwnProperty( key ) ) {
                                if (!Array.isArray( result[key] ) ){
                                    result[key] = [ [ result[key], offsets[key] ] ];
                                }
                                result[key].push([ text_obj[key], current_time - offsets[key] ]);
                                offsets[key] = current_time;

                            } else {
                                result[key] = text_obj[key];
                                offsets[key] = current_time;
                            }
                        }
                    }
                }
            }

            return result;
        } else {

            return obj;
        }
    }

    function transformOrientation (obj) {

        var res, k;

        if (Array.isArray(obj)){

            res = [];

            for (var i = 0; i < obj.length; i += 1) {
                k = obj[i];
                if (Array.isArray(k)){
                    res.push([new Quaternion().setFromEuler(k[0]), k[1]]);
                } else if (Vector.isVector(k)){
                    res.push(new Quaternion().setFromEuler(k));
                } else {

                    res.push({
                        v: new Quaternion().setFromEuler(k.v),
                        d: k.d,
                        e : k.e
                    });
                }
            }
            return res;
        } else {
            return new Quaternion().setFromEuler(obj);
        }


    }

    function cleanRotation (obj) {

        obj.rotation = {
            x:obj.xRotation || 0,
            y:obj.yRotation || 0,
            z:obj.zRotation || 0
        };

        delete obj.xRotation;
        delete obj.yRotation;
        delete obj.zRotation;
    }

    function mixin (target, source, safe) {

        if (typeof source === 'object'){
            for ( var key in source ) {

                if (source.hasOwnProperty(key) && !(target.hasOwnProperty(key) && safe) ){
                        target[key] = source[key];
                }
            }
        }
    }

    function rename (obj, oldName, newName) {

        if ( obj.hasOwnProperty(oldName) ){
            obj[newName] = obj[oldName];
            delete obj[oldName];
        }
    }

    return {
        cleanAVLayer: cleanAVLayer,
        cleanTextLayer: cleanTextLayer,
        cleanCameraLayer: cleanCameraLayer
    };
});


define('path/Line',[],function () {

	function Line (start, end) {

		this.start = start;
		this.end = end;
		this.update = true;
	}

	Line.prototype = {

		constructor : Line,

		length : function () {

			if (this.update){
				this.length_ = this.start.distance(this.end);
				this.update = false;
			}

			return this.length_;
		},

		getVect : function (pos, vec) {

			return (
				vec
				? vec.copy(this.start)
				: this.start.clone()
			).lerp(this.end, pos);
		}
	};

	return Line;

});


define('path/QuadCurve',[],function() {

    /* Gaussian quadrature algorithm to calculate the length of a quadratic curve
     * for can find out more here: http://algorithmist.wordpress.com/2009/01/05/quadratic-bezier-arc-length/
     * I just unrolled it to death for speed purposes.
     */
    function getGaussLength (min, max, c1, c2) {

        var mult = 0.5 * (max - min),
            ab2 = 0.5 * (min + max),
            vec = c2.clone(),
            sum;

        sum = vec.multiplyScalar(2 * (ab2 + mult * -0.8611363116)).add(c1)
                .lengthSq() * 0.3478548451;

        sum += vec.copy(c2).multiplyScalar(2 * (ab2 + mult * 0.8611363116)).add(c1)
                .lengthSq() * 0.3478548451;

        sum += vec.copy(c2).multiplyScalar(2 * (ab2 + mult * -0.3399810436))
                .add(c1).lengthSq() * 0.6521451549;

        sum += vec.copy(c2).multiplyScalar(2 * (ab2 + mult * 0.3399810436)).add(c1)
                .lengthSq() * 0.6521451549;

        return sum;
    }

    function getPositionAt (t, inv) {

        var r1 = inv[0],
            r2 = inv[1],
            r3 = inv[2],
            smoothing1 = inv[3],
            smoothing2 = inv[4],
            i, tt, smoothing, pos;

        if (t >= r3) {
            i = (t - r3) / (1 - r3);
            smoothing = smoothing2;
            pos = 0.75;
        } else if (t >= r2) {
            i = (t - r2) / (r3 - r2);
            pos = 0.5;
            smoothing = smoothing2;
        } else if (t >= r1) {
            i = (t - r1) / (r2 - r1);
            pos = 0.25;
            smoothing = smoothing1;
        } else {
            i = t / r1;
            pos = 0;
            smoothing = smoothing1;
        }
        tt = 2 * (1 - i) * i;

        return (tt * smoothing + (i * i)) * 0.25 + pos;
    }

    function QuadCurve (start, anchor, end) {

        this.start = start;
        this.anchor = anchor;
        this.end = end;

        this.temp_ = this.start.clone();

        this.update = true;
    }

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
                r1 = sqrt(getGaussLength(0,0.25,c1,c2))/divider;
                r2 = sqrt(getGaussLength(0.25,0.5,c1,c2))/divider;
                r3 = sqrt(getGaussLength(0.5,0.75,c1,c2))/divider;
                l = r1+r2+r3+(sqrt(getGaussLength(0.75,1,c1,c2))/divider);
                r3 = (r1+r2+r3)/l;
                r2 = (r1+r2)/l;
                r1 /= l;
                // we'll smooth the values using a quadratic interpolation
                // this is an anchor for those
                s1 = 0.5+((1-(r1/(r2-r1)))/4);
                s2 = 0.5-((1-((1-r3)/(r3-r2)))/5);

                this.length_ = l;
                this.inverse_ = [r1,r2,r3,s1,s2];
            }

            return this.length_;
        },


        getVect : function(pos, vec){

            this.length();
            var p = getPositionAt(pos,this.inverse_);
            var start = (vec) ? vec.copy(this.start) : this.start.clone();

            return  start.lerp(this.anchor, p)
                    .lerp(this.temp_.copy(this.anchor).lerp(this.end, p), p);
        }
    };

    return QuadCurve;
});




define('path/SimplePath',['./Line','./QuadCurve'], function(Line, QuadCurve) {

    function Path (start) {

        this.start = start || 0;
        this.elements = [];
        this.update = true;
    }

    Path.prototype = {

        constructor : Path,

        length : function(){

            if (this.update){
                var current_length = 0,
                    l = this.elements.length,
                    i = 0;

                this.update = false;
                this.lengths_ = [current_length];

                for ( ; i < l; i += 1) {
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
                return (vec) ? vec.copy(this.start) : this.start.clone();
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
        }
    };

    return Path;
});






/**
 * Will divide a cubic curve into a set of quadratic curves.
 * this is based on the adaptive division algorythm defined here :
 * http://www.caffeineowl.com/graphics/2d/vectorial/cubic2quad01.html
 */

define('geom/cubicToQuadratic',[],function () {

    function cubicToQuadratic (p1, c1, c2, p2, path, precision) {

        var res1 = p1.clone();
        var res2 = p2.clone();

        if (c2.equals(p2)) {
            // exception made when an anchor is the same as end point, we just 1
            // quad curve to approximate that.
            path.curveTo(res1.lerp(c1, 0.89), p2);
            return path;
        }

        if (c1.equals(p1)) {
            // same as before
            path.curveTo(res2.lerp(c2, 0.89), p2);
            return path;
        }

        // we first guess where the quadratic mid-points candidate are

        res1.lerp(c1, 1.5);
        res2.lerp(c2, 1.5);

        if (!precision) {
            // if precision isn't set, we come up with one.
            // This one is a guess based on overall curve haul width and height.

            precision = (
                Math.max(
                    Math.max(res1.max(), res2.max()),
                    Math.max(p1.max(), p2.max())
                ) -
                Math.min(
                    Math.min(res1.min(), res2.min()),
                    Math.min(p1.min(), p2.min())
                )
            ) / 350;
        }

        // d will define where we will need to split the curve.
        // d is the distance between the 2 possible quadratic approximations.
        // the closer they are, the less curves we need.
        // if (d >= 1) = we only need one quadratic curve
        // if (d < 1 && >=.5) = We'll split it in 2 at d point
        // if (d < .5) = We'll split the curve is 3, one will be 0>d the other
        // (1-d)>1.
        // we will then iterate the algorithm in the remaining bit.

        var d = Math.sqrt(10.3923048 / res1.distance(res2) * precision);

        if (d > 1) {

            path.curveTo(res1.lerp(res2, 0.5), p2);

        } else {
            // Lets do some curve spliting!
            /*
             * var begin =p1.clone(); var end = p2.clone(); var mid =
             * c1.clone().lerp(c2,d);
             *
             * var d1_c1 = begin.lerp(c1,d).clone(); var d1_c2 =
             * begin.lerp(mid,d).clone();
             *
             * var d2_c2 = end.lerp(c2,1-d).clone(); var d2_c1 =
             * mid.lerp(end,d).clone();
             *
             * mid.lerp(begin,1-d); end.set(p2); begin.set(p1);
             */

            var d1_p1 = p1.clone(),
                d1_c1 = d1_p1.clone().lerp(c1, d),
                d2_p2 = p2,
                d2_c2 = c2.clone().lerp(p2, d),
                temp_c = c1.clone().lerp(c2, d),
                d1_c2 = d1_c1.clone().lerp(temp_c, d),
                d2_c1 = temp_c.lerp(d2_c2, d),
                p = d1_c2.clone().lerp(d2_c1, d);

            // trace(d);

            res1 = d1_p1.clone().lerp(d1_c1, 1.5);
            res2.copy(p).lerp(d1_c2, 1.5);

            path.curveTo(res1.lerp(res2, 0.5), p.clone());

            if (d < 0.5) {
                // mmm, we need to split it again.
                d = 1 - (d / (1 - d));

                c1 = d2_c1.clone();
                c2 = d2_c2.clone();

                p1 = d1_p1.copy(p);

                d1_c1.copy(d1_p1).lerp(c1, d);
                d2_c2.copy(c2).lerp(p2, d);
                temp_c.copy(c1).lerp(c2, d);
                d1_c2.copy(d1_c1).lerp(temp_c, d);
                d2_c1 = temp_c.lerp(d2_c2, d);
                p.copy(d1_c2).lerp(d2_c1, d);

                // path.curveTo(p.clone(),p.clone());
                cubicToQuadratic(d1_p1, d1_c1, d1_c2.clone(), p.clone(), path, precision);

                // cubicToQuadratic(d1_p1,d1_c1,d1_c2.clone(),p.clone(),path,precision*3);
            }

            res1 = p.clone().lerp(d2_c1, 1.5);
            res2 = d2_p2.clone().lerp(d2_c2, 1.5);

            // and finally the remaining
            path.curveTo(res1.lerp(res2, 0.5), p2.clone());

        }
        return path;
    }

    return cubicToQuadratic;
});


/*global define */

define('path/CubicCurve',['./SimplePath','geom/cubicToQuadratic'], function (Path, cubicToQuadratic) {


	function CubicCurve (start, a1, a2, end) {

		this.start = start;
		this.a1 = a1;
		this.a2 = a2;
		this.end = end;
		this.update = true;
	}

	CubicCurve.prototype = {

		constructor : CubicCurve,

		length : function(){

			if (this.update){
				this.update = false;
				this.path = cubicToQuadratic(
					this.start,
					this.a1,
					this.a2,
					this.end,
					new Path(this.start)
				);
				this.length_ = this.path.length();
			}

			return this.length_;
		},

		getVect : function(pos, vec){

			this.length();

			return this.path.getVect(pos, vec);
		}
	};

	return CubicCurve;
});




/*global define PropertyValueType KeyframeInterpolationType ParagraphJustification*/

define('exporter/propertyExporter',['extern/json', 'geom/Vector', 'path/CubicCurve'], function (json, Vector, CubicCurve) {

    function getProperty ( prop, project, options , force_separation) {

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

                    val = getSimpleProperty(prop, prop.valueAtTime(i, true), options);

                    if (json.stringify(val) !== json.stringify(old_val)){

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

                for (i = 1; i <= prop.numKeys; i += 1) {

                    result.x.push(getKey(prop,i,options,0,'x'));
                    result.y.push(getKey(prop,i,options,1,'y'));

                    if (result.z) {
                        result.z.push(getKey(prop,i,options,2,'z'));
                    }
                }

                return result;

            } else {
                keys = [];
                for (i = 1; i <= prop.numKeys; i += 1) {
                    keys.push(getKey(prop,i,options));
                }
                return keys;
            }

        } else {
            return getSimpleProperty(prop, prop.valueAtTime(0, true), options);
        }

    }


    function getKey (prop, index, options, ease_index, name) {

        var time = prop.keyTime(index),
            offset = (index > 1) ? time - prop.keyTime(index-1) : time,
            value = getSimpleProperty(prop, prop.keyValue(index), options),
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
                    o: 0
                }
            };

            if (in_type === bezier_type){

                key.e.i = getEaseData(
                    prop.keyInTemporalEase(index),
                    (index > 1) ? getEaseLength(prop, index-1, index, ease_index) : null,
                    true, ease_index
                );

            } else if (in_type !== hold_type) {
                delete key.e.i;
            }

            if (out_type === bezier_type){

                key.e.o = getEaseData(
                    prop.keyOutTemporalEase(index),
                    (index < prop.numKeys) ? getEaseLength(prop, index, index+1, ease_index) : null,
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


                if (index > 1 && isCurve(prop,index,index-1)){

                    key.t.i = [round(in_anchor[0],0.01), round(in_anchor[1],0.01)];
                    if (in_anchor.length >= 3){
                        key.t.i.push(round(in_anchor[2],0.01));
                    }
                }

                if (index < prop.numKeys && isCurve(prop,index+1,index)){

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


    }

    function getEaseData (data, length, to_invert, index) {

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

    }

    function isCurve (prop,key,next_key) {
        var p_1,t_1,t_2,p_2,c_1,c_2,
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


        p_1 = new Vector( start_val[0], start_val[1], start_val[2]);
        c_1 = new Vector( t_1[0], t_1[1], t_1[2]).add(p_1);
        p_2 = new Vector( end_val[0], end_val[1], end_val[2]);
        c_2 = new Vector( t_2[0], t_2[1], t_2[2]).add(p_2);


        l_1 = p_1.distance(p_2);
        l_2 = p_1.distance(c_1)+c_1.distance(c_2)+c_2.distance(p_2);
        return (l_2/l_1) > 1.03;
    }

    function getEaseLength (prop,key,next_key,index) {

        var p_1,c_1,c_2,p_2,
            start_val = prop.keyValue(key),
            end_val = prop.keyValue(next_key),
            type = prop.propertyValueType;

        if (!index) {
            index = 0;
        }

        if (prop.propertyValueType === PropertyValueType.OneD){

            return end_val - start_val;

        } else if ( type === PropertyValueType.TwoD_SPATIAL || type === PropertyValueType.ThreeD_SPATIAL) {

            p_1 = new Vector( start_val[0], start_val[1], start_val[2]);

            if (key < next_key){
                c_1 = prop.keyOutSpatialTangent(key);
                c_2 = prop.keyInSpatialTangent(next_key);
            } else {
                c_1 = prop.keyInSpatialTangent(key);
                c_2 = prop.keyOutSpatialTangent(next_key);
            }

            p_2 = new Vector( end_val[0], end_val[1], end_val[2]);

            return new CubicCurve(
                p_1,
                new Vector(c_1[0],c_1[1],c_1[2]).add(p_1),
                new Vector(c_2[0],c_2[1],c_2[2]).add(p_2),
                p_2
            ).length();

        } else if (prop.propertyValueType === PropertyValueType.SHAPE) {

            return 1;

        } else {

            return end_val[index] - start_val[index];

        }
    }

    function getSimpleProperty (prop, value, options) {

        var divider = (prop.unitsText === "percent") ? 100 : 1;
        var presision = 0.0001/divider;

        switch (prop.propertyValueType){

        case PropertyValueType.MARKER:
            return getMarker(value);

        case PropertyValueType.SHAPE:
            return getShape(value);

        case PropertyValueType.TEXT_DOCUMENT:
            return getText(value, prop, options);

        case PropertyValueType.OneD:
            return round(value/divider,presision);

        case PropertyValueType.TwoD_SPATIAL:
        case PropertyValueType.TwoD:
            return {
                x:round(value[0]/divider,presision),
                y:round(value[1]/divider,presision)
            };
        case PropertyValueType.ThreeD_SPATIAL:
        case PropertyValueType.ThreeD:
            return {
                x: round(value[0]/divider,presision),
                y: round(value[1]/divider,presision),
                z: round(value[2]/divider,presision)
            };
        default :
            return null;
        }

    }

    function getMarker (val) {

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
    }

    function getShape (val) {

        var obj = {

        };

        if (!val.closed){
            obj.closed = false;
        }

        var data = [];
        var v,in_data,out_data;

        for ( var i = 0; i < val.vertices.length; i += 1) {

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
    }

    function getText (val, prop, options) {

        var obj = {
            text: val.text,
            fontFamily: val.font,
            fontSize: val.fontSize,
            textColor: getColor(val.fillColor)
        };

        if (options.valign && options.valign !== 'top'){
            obj.verticalAlign = options.valign;
        }

        if (val.justification === ParagraphJustification.RIGHT_JUSTIFY) {
            obj.textAlign = 'right';
        } else if (val.justification === ParagraphJustification.CENTER_JUSTIFY) {
            obj.textAlign = 'center';
        } else {
            obj.textAlign = 'left';
        }

        if (val.tracking){
            obj.letterSpacing = val.tracking;
        }

        if (options.leading){
            obj.lineHeight = options.leading/val.fontSize;
        }

        if (val.isParaText){
            obj.width = val.boxTextSize[0];
            obj.height = val.boxTextSize[1];
        }

        return obj;
    }

    function getColor (color) {

        var r = Math.floor( Math.min( Math.max( color[0], 0 ), 1 )*0xFF );
        var g = Math.floor( Math.min( Math.max( color[1], 0 ), 1 )*0xFF );
        var b = Math.floor( Math.min( Math.max( color[2], 0 ), 1 )*0xFF );

        var str = Math.floor( ( r<<16 ) + ( g<<8 ) + b ).toString(16);

        return "#" + "000000".slice(0, 6-str.length) + str;

    }

    function round (number, rounding) {

        return Math.floor(number/rounding)*rounding;
    }

    return {
        getColor: getColor,
        getProperty: getProperty
    };

});


/*global define AutoOrientType CameraLayer AVLayer TextLayer ShapeLayer BlendingMode TrackMatteType PropertyType*/

define('exporter/projectExporter',[
    'extern/json',
    './blendingModes',
    './propertyCleaner',
    './propertyExporter'
], function (
    json,
    blendingModes,
    propertyCleaner,
    propertyExporter
) {

    function getProject (comp) {

        var project = {
            items : {}
        };

        project.root = getItem(comp,project);

        return project;
    }

    function getItem ( item, project ) {

        if ( !project.items[item.id] ){

            var options = json.parse(item.comment || "{}");

            var result = {
                name : item.name,
                id : item.id,
                type : item.typeName,
                width : item.width,
                height : item.height
            };

            switch (item.typeName) {
            case 'Composition':
                setComp( item, result, project );
                break;
            case 'Footage':
                var source = item.mainSource;
                if (source.toString() === '[object FileSource]') {
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
                    if (source.toString() === '[object SolidSource]'){
                        result.color = propertyExporter.getColor(source.color);
                    }
                }
                break;
            }

            project.items[item.id] = result;
        }

        return item.id;
    }

    function setComp (comp, result, project) {

        var parents = [],
            i = 1,
            layer,
            layer_opt;

        result.layers       = [];
        result.type         = "Composition";
        result.color        = propertyExporter.getColor(comp.bgColor);
        result.frameRate    = comp.frameRate;
        result.duration     = comp.duration;

        if (comp.motionBlur){
            result.motionBlur   = comp.motionBlur;
            result.shutterAngle = comp.shutterAngle;
            result.shutterPhase = comp.shutterAngle;
        }
        if (comp.workAreaStart){
            result.workAreaStart = comp.workAreaStart;
        }



        for ( ; i < comp.layers.length; i += 1) {

            layer = comp.layers[i];

            if (
                layer.parent != null
                && json.parse(layer.comment || "{}").exportable !== false
            ) {
                parents.push(layer.parent);
            }

            if (layer.selected){

                layer.selected = false;

            }
        }

        for ( i = 1; i <= comp.layers.length; i += 1) {

            layer = comp.layers[i];
            layer_opt = json.parse(layer.comment || "{}");

            var exportable = layer_opt.exportable !== false;
            if ( exportable  && ( layer.enabled || layer.isTrackMatte || parents.indexOf(layer) !== -1 ) ){
                result.layers.push( getLayer( layer, layer_opt, project ) );
            }

        }

    }

    function getLayer (layer, options, project) {

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

        var properties = getProperties( layer, project, false, options );

        for(var prop_name in properties){
            if (properties.hasOwnProperty(prop_name)){
                result[prop_name] = properties[prop_name];
            }
        }

        if (layer instanceof AVLayer || layer instanceof TextLayer || layer instanceof ShapeLayer){

            if (layer.adjustmentLayer) result.adjustmentLayer = true;
            if (layer.threeDLayer) result.is3D = true;
            if (layer.threeDPerChar) result.have3DCharacter = true;
            if (layer.collapseTransformation) result.collapse = true;
            //if (layer.audioActive) result.audioActive = true;
            if (layer.blendingMode !== BlendingMode.NORMAL) {
                result.blendingMode = blendingModes.getString(layer.blendingMode);
            }

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

            delete result.layerStyles;
            if (canParseProperty(layer.property("Layer Styles"), true)){
                result.layerStyles =  getProperties(
                    layer.property("Layer Styles"),
                    project,
                    true,
                    options
                );
                result.layerStyles.blendingOptions = getProperties(
                    layer.property("Layer Styles").property("Blending Options"),
                    project,
                    false,
                    options
                );
            }
            propertyCleaner.cleanAVLayer(result, layer, project, options);

            if ( layer.source && !layer.nullLayer ){
                result.source = getItem( layer.source, project );
            }
        }



        if ( layer instanceof TextLayer ){
            propertyCleaner.cleanTextLayer(result, layer, project, options);
        } else if ( layer instanceof ShapeLayer ) {

        } else if (layer instanceof CameraLayer) {
            propertyCleaner.cleanCameraLayer(result, layer, project, options);
        }

        return result;
    }

    function getProperties (item, project, removeStyle, options) {

        var result,i;

        switch( item.propertyType ){
        case PropertyType.INDEXED_GROUP:
            result = [];
            for(i = 1; i <= item.numProperties; i += 1){
                if ( canParseProperty( item.property(i), removeStyle, true ) ){
                    result.push( getProperties( item.property(i), project, removeStyle, options ) );
                }
            }
            break;

        case PropertyType.NAMED_GROUP:
            result = {};
            for(i = 1; i <= item.numProperties; i += 1){
                if ( canParseProperty( item.property(i), removeStyle ) ){
                    result[legalizeName(item.property(i).name)] = getProperties(item.property(i), project, removeStyle, options);
                }
            }
            if ( item.parentProperty ){
                if ( item.parentProperty.propertyType === PropertyType.INDEXED_GROUP ){
                    item.type = legalizeName(item.matchName);
                }
            }
            break;
        default:
            result = propertyExporter.getProperty( item, project, options );
        }

        return result;
    }

    function legalizeName (val) {

        var name = val.replace(/[^a-z0-9A-Z_]/g,"");

        return name[0].toLowerCase() +name.slice(1);
    }

    function canParseProperty ( prop, removeStyle, deep ) {

        if (!deep){
            if (!prop.isModified
                && prop.name !== "Position"
                && prop.name !== "Anchor Point"
                && prop.name !== "Zoom"
                && prop.name !== "Point of Interest"
                && !removeStyle ) {
                return false;
            }
        }

        if (removeStyle && !(prop.canSetEnabled && prop.enabled)) {
            return false;
        }

        if (prop.canSetEnabled) {
            if (!prop.enabled) {
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
            for(var i = 1; i <= prop.numProperties; i += 1){
                if ( canParseProperty( prop.property(i), removeStyle, true ) ){
                    return true;
                }
            }
            return false;
        default:
        }

        return true;
    }

    return {
        getProject: getProject,
        getItem: getItem
    };

});


/*global define FootageItem CompItem File Window*/

define('exporter/ItemSubPanel',[
    'extern/json',
    './PanelBase',
    './projectExporter'
], function (
    json,
    PanelBase,
    projectExporter
) {


    function  ItemSubPanel ( panel, item, width, context ){

        PanelBase.call(this, panel, item, width, context);

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
    }

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

        var result = json.stringify(projectExporter.getProject(this.item),undefined,(this.get("indent") === true) ? "\t" : 0);

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

    return ItemSubPanel;
});



/*global define TextLayer AVLayer */

define('exporter/LayerPanel',['./PanelBase', './ItemSubPanel'], function (PanelBase, ItemSubPanel) {

    function LayerPanel (panel, layer, context) {

        PanelBase.call(this,panel,layer);

        this.group.add("statictext", undefined, layer.name).alignment = 'left';

        this.setBoolean('exportable',"Exportable",true);


        if (this.layer instanceof TextLayer) {
            this.setDrop('valign','Vertical align',['top','middle','bottom'],'top');
        } else if (layer instanceof AVLayer) {
            var holder = this.group.add("panel",undefined,layer.source.name);
            holder.margins = 0;
            this.itemPanel = new ItemSubPanel(holder,layer.source,this.width-10,context);
        }

        this.setField('id','ID');
        this.setBoolean('bake',"Bake transform",false);
        this.setField('classes','Class');

    }

    LayerPanel.prototype = new PanelBase();
    LayerPanel.prototype.constructor = LayerPanel;

    return LayerPanel;
});


/*global define app global */

define('exporter',[
    'extern/ES5',
    'exporter/LayerWatcher',
    'exporter/LayerPanel',
    'exporter/ItemSubPanel'
], function (
    ES5,
    LayerWatcher,
    LayerPanel,
    ItemSubPanel
) {

    var panel = global,
        context = {},
        watcher, layerPanel;

    function change (layer) {

        if (layerPanel) {
            layerPanel.clear();
        }

        if (layer) {
            layerPanel = new LayerPanel(panel, layer, context);
        } else {
            if (
                app
                && app.project
                && app.project.activeItem
                && app.project.activeItem.typeName === "Composition"
            ) {
                layerPanel = new ItemSubPanel(
                    panel,
                    app.project.activeItem,
                    undefined,
                    context
                );
            } else {
                layerPanel = null;
            }
        }

        panel.layout.layout(true);
        panel.layout.resize();

        context.layer = layer;
    }

    panel.layout.layout(true);
    panel.layout.resize();
    panel.onResizing = panel.onResize = function() {
        panel.layout.resize();
    };

    panel.alignment = 'left';
    panel.margins = 0;
    panel.spacing = 0;

    watcher = new LayerWatcher(panel);
    watcher.changed.add(change);
    watcher.start();

    context.watcher = watcher;
    context.panel = panel;

    return context;
});
})();