(function () {
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


/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 */

/*global define*/

define('geom/Vector',[],function(){

    function Vector (x, y, z) {

        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

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


define('core/Stack',['extern/signals'], function (signals) {

    function add (item,pos) {
        this.on.add.dispatch(item,pos,this);
    }

    function check (item) {
        if (!(item instanceof this.type_)){
            throw("not the right type");
        }
    }

    /** @constructor */
    function Stack (type) {

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
    }

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

            check.call(this,item);

            if (!this.have(item)){
                this.items_.push(item);
                add.call(this,item,this.length-1);
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

            check.call(this,item);

            var items = this.items_;



            if (!this.have(item)){
                var l = items.length;
                if (pos < l){
                    items.splice(pos,0,item);
                } else {
                    items.push(item);
                }
                add.call(this,item,Math.max(pos,this.length-1));
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
            var items = this.items_,
                l = items.length,
                i = 0;

            for ( ; i < l; i += 1) {
                func(items[i]);
            }
        }

    };

    return Stack;
});


/*global define */
define('path/Anchor',[
    'geom/Vector'
], function (
    Vector
) {

    function Anchor (x, y, inX, inY, outX, outY) {

        Vector.call(this, x, y);

        this.inVector = new Vector(inX, inY);
        this.outVector = new Vector(outX, outY);
    }

    Anchor.prototype = new Vector();
    Anchor.prototype.constructor = Anchor;

    Anchor.prototype.clone = function() {

        return new Anchor(
            this.x,
            this.y,
            this.inVector.x,
            this.inVector.y,
            this.outVector.x,
            this.outVector.y
        );
    };

    Anchor.prototype.copy = function(a) {

        Vector.prototype.copy.call(this,a);
        if (a.inVector && a.outVector) {
            this.inVector.copy(a.inVector);
            this.outVector.copy(a.outVector);
        }
        return this;
    };

    Anchor.prototype.equals = function(a) {

        if (
               a.inVector
            && a.outVector
            && this.inVector.equals(a.inVector)
            && this.outVector.equals(a.outVector)
            && Vector.prototype.equals.call(this, a)
        ) {
            return true;
        }
        return false;
    };

    return Anchor;
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




/*global define */

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

        add: function (item) {
            this.elements.push(item);
            this.start = item.end;
            this.update = true;
        },

        getItem : function (pos) {

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
                return item.getVect((pos - this.lastPos_) / item.length(), vec);
            } else {
                return (vec) ? vec.copy(this.start) : this.start.clone();
            }
        },

        lineTo : function(end){

            this.add(new Line(this.start, end));
        },

        curveTo : function(anchor,end){

            this.add(new QuadCurve(this.start, anchor, end));
        }
    };

    return Path;
});






/*global define */

define('path/CurvePatch',[
    './SimplePath',
    'geom/cubicToQuadratic',
    'geom/Vector',
    './Line'
], function (
    SimplePath,
    cubicToQuadratic,
    Vector,
    Line
) {

    var v0 = new Vector(),
        v1 = new Vector(),
        v2 = new Vector();


    function CurvePatch (start, end) {

        this.start = start;
        this.end = end;
        this.update = true;
    }

    CurvePatch.prototype = {

        constructor : CurvePatch,

        length : function(){

            if (this.update){
                this.update = false;
                this.path = (! this.isLine())
                            ? cubicToQuadratic(
                                this.start,
                                v1.copy(this.start.outVector).add(this.start),
                                v2.copy(this.end.inVector).add(this.end),
                                this.end,
                                new SimplePath(this.start)
                            )
                            : new Line(this.start, this.end);

                this.length_ = this.path.length();
            }

            return this.length_;
        },

        isLine : function() {
            return (this.start.outVector == null && this.end.inVector == null) ||
                   (this.start.outVector.equals(v0) && this.end.inVector.equals(v0));
        },

        getVect : function(pos, vec){

            this.length();

            return this.path.getVect(pos, vec);
        }
    };

    return CurvePatch;
});




/*global define */

define('path/Path',[
    'core/Stack',
    './Anchor',
    'path/CurvePatch',
    'path/SimplePath',
    'geom/Vector'
], function (
    Stack,
    Anchor,
    CurvePatch,
    SimplePath,
    Vector
) {


    function Path () {

        Stack.call(this);

        this.closed    = false;
        this.update    = true;
        this.path_     = null;

        var onChange = function () {
            this.update = true;
        };
        this.on.add.add(onChange, this);
        this.on.remove.add(onChange, this);
        this.on.swap.add(onChange, this);
    }

    Path.prototype = new Stack();
    Path.prototype.constructor = Path;

    Path.prototype.create = function(x, y, inX, inY, outX, outY) {

        var anchor = new Anchor(x, y, inX, inY, outX, outY);

        this.add(anchor);

        return anchor;
    };

    Path.prototype.getLogicalPath = function() {

        var last, path, previous;

        // We populate a new path when the mask had been updated
        if (this.update) {

            this.update = false;

            path = new SimplePath();
            this.each(function(anchor){
                if (previous) {
                    path.add(new CurvePatch(previous, anchor));
                }
                previous = anchor;
            });
            this.path_ = path;
        }

        // We update the path if the closed attribute has changed
        last = this.path_.elements[this.path_.elements.length - 1];

        if ( this.closed !== (this.get(0) === last.end)) {

            if (this.closed) {
                last  = this.get(this.getLength() - 1);
                this.path_.add(new CurvePatch(
                    last,
                    last.outVector,
                    this.get(0).inVector,
                    this.get(0)
                ));
            } else {
                this.path_.remove(last);
                this.path_.update = true;
            }
        }

        return this.path_;
    };

    return Path;
});






define('animation/KeyFrame',[],function () {

	function KeyFrame (offset, value, is_hold) {

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
	}

	return KeyFrame;
});

define('animation/AnimatorStack',['core/Stack'], function (Stack) {

    function AnimatorStack (item) {

        Stack.call(this);

        this.item = item;
        this.duration = 1;
        this.frameRate = 25;
        this.clamp = false;
    }

    AnimatorStack.prototype = new Stack();
    AnimatorStack.prototype.constructor = AnimatorStack;

    AnimatorStack.prototype.animate = function(time){

        var items = this.items_,
            l = items.length,
            i = 0;

        time = time%this.duration;

        if (this.clamp){
            time = Math.floor(time*this.frameRate)/this.frameRate;
        }

        if (time !== this.prevTime_){
            for ( ; i < l; i += 1) {
                items[i].animate(time);
            }
            this.prevTime_ = time;
        }

    };

    return AnimatorStack;

});

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
 * js port from www.netzgesta.de/dev/cubic-bezier-timing-function.html
 * </p>
 */

 define('geom/bezierEase',[],function () {

    function bezierEase (p1x, p1y, p2x, p2y, t, epsilon) {

        p1y = p1y || 0;
        p2y = p2y || 0;

        var t2 = solveCurveX(p1x || 0, p2x || 0, t || 0, epsilon),
            cy = p1y * 3,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;

        return ((ay * t2 + by) * t2 + cy) * t2;
    }

    // Given an x value, find a parametric value it came from.
    function solveCurveX (p1x, p2x, x, epsilon) {

        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            bx2 = bx * 2,
            ax3 = ax * 3,
            t0, t1, t2, x2, d2, i;

        if (!epsilon) {
            //epsilon = 1.0 / (100.0 * (precision||100));
            epsilon = 0.0001;
        }

        // First try a few iterations of Newton's method -- normally very fast.
        t2 = x;

        for (i = 0; i < 8; i += 1) {
            x2 = (((ax * t2 + bx) * t2 + cx) * t2) - x;
            if (fabs(x2) < epsilon) {
                return t2;
            }
            d2 = (ax3 * t2 + bx2) * t2 + cx;
            if (fabs(d2) < 1e-6) {
                break;
            }
            t2 = t2 - x2 / d2;
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
            if (fabs(x2 - x) < epsilon) {
                return t2;
            }
            if (x > x2) {
                t0 = t2;
            } else {
                t1 = t2;
            }
            t2 = (t1 - t0) * 0.5 + t0;
            i += 1;
        }

        return t2;
    }

    function fabs (n) {

        if (n >= 0) {
            return n;
        }

        return 0 - n;
    }

    return bezierEase;
 });


/*global define*/

define('animation/Keys',['geom/bezierEase','./KeyFrame'], function (bezierEase, KeyFrame) {

    function Keys (target, property) {
        this.target = target;
        this.property = property;

        this.keys_ = [];
        this.length_ = 0;
    }

    Keys.prototype = {

        constructor : Keys,

        length: function () {

            var keys = this.keys_,
                key,i,l,pos;

            if (this.update){

                l = keys.length;
                pos = 0,
                i = 0;

                for ( ; i < l; i += 1) {
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

        num: function () {
            return this.keys_.length;
        },

        indexAt: function (pos) {

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

                while (keys[i]){

                    if ( pos >= keys[i].position_ && (
                        !keys[i+1] || pos < keys[i+1].position_
                    )) {
                        this.prevIndex_ = i;
                        this.prevPosition_ = pos;
                        return this.prevIndex_;
                    }

                    i += iterator;
                }
            }

            this.prevIndex_ = 0;

            return this.prevIndex_;
        },

        get: function (pos, opt_obj) {

            var index = this.indexAt(pos),
                key = this.keys_[index],
                next_key, i;

            if ( (index === 0 && pos <= key.offset) || index >= this.num()-1 || key.isHold){
                return key.value;
            } else {
                next_key = this.keys_[index+1];

                i = (pos-key.position_)/next_key.offset;

                if (key.outX || key.outY || next_key.inX || next_key.inY){

                    i = bezierEase(key.outX, key.outY, next_key.inX, next_key.inY, i);

                }

                return this.interpolate(key, next_key, i, opt_obj);
            }
        },

        interpolate: function (key, next_key, pos) {

            return key.value + (next_key.value - key.value) * pos;
        },

        set: function(pos){

            var res = this.get(pos);
            if (this.target[this.property] !== res){
                this.target[this.property] = res;
            }
        },

        add : function(offset,val,is_hold){

            var key = new KeyFrame(offset, val, is_hold);

            this.length_ += offset;
            key.position_ = this.length_;
            this.keys_.push(key);

            return key;
        }
    };

    return Keys;
});


define('animation/Animator',['core/Stack','./Keys'], function (Stack, Keys) {

    function Animator (layer, in_point, out_point, source) {

        Stack.call(this);

        this.layer = layer;
        this.inPoint = in_point || 0;
        this.outPoint = out_point || 1/0;
        this.source = source;

        this.startTime = 0;
        this.speed = 1;

        this.remap = new Keys();
    }

    Animator.prototype = new Stack();
    Animator.prototype.constructor = Animator;

    Animator.prototype.animate = function(time){

        var layer = this.layer,
            items = this.items_,
            i = 0,
            l;

        if (time >= this.inPoint && time <= this.outPoint){

            layer.visible = true;
            l = items.length;

            for ( ; i < l; i += 1) {
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

    return Animator;
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




/*global define*/
define('animation/SpatialKeys',['./Keys','path/CubicCurve'], function (Keys, CubicCurve) {

    function SpatialKeys (target, property) {

        Keys.call(this, target, property);

        this.temp_ = target[property].clone();
    }

    SpatialKeys.prototype = new Keys();
    SpatialKeys.prototype.constructor = SpatialKeys;

    SpatialKeys.prototype.interpolate = function (key, next_key, pos, opt_vec) {

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
            return ((opt_vec) ? opt_vec.copy(key.value) : key.value.clone())
                   .lerp(next_key.value,pos);
        }
    };

    SpatialKeys.prototype.set = function(pos){

        var res = this.get(pos, this._temp),
            v = this.target[this.property];

        if (v.equals && !v.equals(res)){
            v.copy(res);
        }
    };

    return SpatialKeys;
});



/*global define*/
define('animation/PathKeys',[
    './Keys',
    'path/Path',
    'path/Anchor'
], function (
    Keys,
    Path,
    Anchor
) {

    var v1 = new Anchor();

    function PathKeys (target) {

        Keys.call(this, target, '');

        this.path = target;
    }

    PathKeys.prototype = new Keys();
    PathKeys.prototype.constructor = PathKeys;

    PathKeys.prototype.interpolate = function (key, next_key, pos, opt_path) {

        if (!opt_path) {
            opt_path = new Path();
        }

        var prev_path = key.value,
            next_path = next_key.value,
            i = opt_path.getLength(),
            l = prev_path.getLength(),
            anchor, prev_anchor, next_anchor;

        if (i !== l) {
            opt_path.update = true;
        }

        if (i < l) {
            for ( ; i < l; i += 1) {
                opt_path.add(prev_path.get(i).clone());
            }
        } else if (i > l) {
            for ( ; i > l; i -= 1) {
                opt_path.remove(opt_path.get(i - 1));
            }
        }

        i = 0;
        l = Math.min(l, next_path.getLength());
        for ( ; i < l; i += 1) {
            anchor = opt_path.get(i);
            prev_anchor = prev_path.get(i);
            next_anchor = next_path.get(i);

            anchor.copy(prev_anchor).lerp(next_anchor, pos);
            if (anchor.inVector && anchor.outVector) {
                anchor.inVector.copy(prev_anchor.inVector).lerp(next_anchor.inVector, pos);
                anchor.outVector.copy(prev_anchor.outVector).lerp(next_anchor.outVector, pos);
            }
        }
    };

    PathKeys.prototype.set = function(pos){

        this.get(pos, this.path);
    };

    return PathKeys;
});



define('animation',[
    'animation/KeyFrame',
    'animation/Animator',
    'animation/AnimatorStack',
    'animation/Keys',
    'animation/SpatialKeys',
    'animation/PathKeys'
], function (
    KeyFrame,
    Animator,
    AnimatorStack,
    Keys,
    SpatialKeys,
    PathKeys
) {

    return {
        KeyFrame        : KeyFrame,
        Animator        : Animator,
        AnimatorStack   : AnimatorStack,
        Keys            : Keys,
        SpatialKeys     : SpatialKeys,
        PathKeys        : PathKeys
    };
});


define('geom/Matrix',['./Vector'], function(Vector){

    var v1 = new Vector(),
        v2 = new Vector(),
        v3 = new Vector(),
        mat;

    /** @constructor */
    function Matrix () {

        if (arguments.length){
            this.injectArray(arguments);
        }
    }

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
        set: function (n11,n12,n13,n14,n21,n22,n23,n24,n31,n32,n33,n34,n41,n42,n43,n44) {

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
        injectArray: function (a) {

            return this.set.apply(this,a);
        },

        /**
         *
         * @param {Matrix} m
         * @returns {Matrix}
         */
        injectMatrix: function (m) {

            var t = this;

            t.m11 = m.m11;t.m12 = m.m12;t.m13 = m.m13;t.m14 = m.m14;
            t.m21 = m.m21;t.m22 = m.m22;t.m23 = m.m23;t.m24 = m.m24;
            t.m31 = m.m31;t.m32 = m.m32;t.m33 = m.m33;t.m34 = m.m34;
            t.m41 = m.m41;t.m42 = m.m42;t.m43 = m.m43;t.m44 = m.m44;

            return t;
        },

        /** @returns {Matrix} */
        identity: function () {

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
        translation: function (x, y, z) {

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
        translate: function (x, y, z) {

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
        scaling: function (scaleX, scaleY, scaleZ) {

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
        scale: function (scaleX, scaleY, scaleZ) {

            scaleX = scaleX || 0.000001;
            scaleY = scaleY || 0.000001;
            scaleZ = scaleZ || 0.000001;

            if (scaleX !== 1 || scaleY !== 1 || scaleZ !== 1){
                this.m11 *= scaleX; this.m21 *= scaleX; this.m31 *= scaleX; this.m41 *= scaleX;
                this.m12 *= scaleY; this.m22 *= scaleY; this.m32 *= scaleY; this.m42 *= scaleY;
                this.m13 *= scaleZ; this.m23 *= scaleZ; this.m33 *= scaleZ; this.m43 *= scaleZ;
            }

            return this;
        },

        /**
         * @param {number} rotationX
         * @param {number} rotationY
         * @param {number} rotationZ
         * @returns {Matrix}
         */
        rotation: function (rotationX, rotationY, rotationZ) {

            var p = Math.PI/180,
                cos = Math.cos,
                sin = Math.sin,
                a, b, c, d, e, f,
                ae, af, be, bf;

            this.identity();

            rotationX = ( rotationX || 0) * p;
            rotationY = ( rotationY || 0) * p;
            rotationZ = (-rotationZ || 0) * p;

            a = cos(rotationX);
            b = sin(rotationX);
            c = cos(rotationY);
            d = sin(rotationY);
            e = cos(rotationZ);
            f = sin(rotationZ);

            ae = a * e;
            af = a * f;
            be = b * e;
            bf = b * f;

            this.m11 = c * e;
            this.m12 = be * d - af;
            this.m13 = ae * d + bf;

            this.m21 = c * f;
            this.m22 = bf * d + ae;
            this.m23 = af * d - be;

            this.m31 = - d;
            this.m32 = b * c;
            this.m33 = a * c;

            this.m41 = this.m42 = this.m43 = 0;

            return this;
        },

        /**
         * @param {number} rotationX
         * @param {number} rotationY
         * @param {number} rotationZ
         * @returns {Matrix}
         */
        rotate: function (rotationX, rotationY, rotationZ) {

            return (rotationX || rotationY || rotationZ)
                   ? this.multiply(mat.rotation(rotationX, rotationY, rotationZ))
                   : this;
        },

        /**
         *
         * @param {number} x
         * @param {number} y
         * @param {number} z
         * @param {number} w
         * @returns {Matrix}
         */
        quaternionRotation: function ( x, y, z, w ) {

            var sqw = w * w,
                sqx = x * x,
                sqy = y * y,
                sqz = z * z,
                invs = 1 / (sqx + sqy + sqz + sqw),
                tmp1, tmp2;

            this.m11 = ( sqx - sqy - sqz + sqw)*invs ;
            this.m22 = (-sqx + sqy - sqz + sqw)*invs ;
            this.m33 = (-sqx - sqy + sqz + sqw)*invs ;

            tmp1 = x * y;
            tmp2 = z * w;
            this.m21 = 2 * (tmp1 + tmp2)*invs;
            this.m12 = 2 * (tmp1 - tmp2)*invs;

            tmp1 = x * z;
            tmp2 = y * w;
            this.m31 = 2 * (tmp1 - tmp2)*invs;
            this.m13 = 2 * (tmp1 + tmp2)*invs;

            tmp1 = y*z;
            tmp2 = x*w;
            this.m32 = 2 * (tmp1 + tmp2)*invs;
            this.m23 = 2 * (tmp1 - tmp2)*invs;

            return this;
        },

        /**
         *
         * @param {number} x
         * @param {number} y
         * @param {number} z
         * @param {number} w
         * @returns {Matrix}
         */
        quaternionRotate: function (x, y, z, w) {

            w = (!w && w !== 0) ? 1 : w;

            return  this.multiply(mat.quaternionRotation(x, y, z, w));
        },

        /**
         * @param {number} x
         * @param {number} y
         * @param {number} z
         * @returns {Matrix}
         */
        lookingAt: function (x, y, z) {

            var v_x = v1.set(0,1,0),
                v_y = v2,
                v_z = v3.set(-x,-y,z).normalize();

            v_x.cross(v_z);
            v_y.copy(v_z).cross(v_x);

            v_x.normalize();
            v_y.normalize();

            this.set(
                v_x.x, v_x.y, v_x.z, 0,
                v_y.x, v_y.y, v_y.z, 0,
                v_z.x, v_z.y, v_z.z, 0,
                0,     0,     0,     1
            );

            return this;
        },

        /**
         * @param {number} x
         * @param {number} y
         * @param {number} z
         * @returns {Matrix}
         */
        lookAt: function (x, y, z) {

            return (x || y) ? this.multiply(mat.lookingAt(x, y, z)) : this;
        },

        determinant: function(){

            return -this.m13 * this.m22 * this.m31 +
                    this.m12 * this.m23 * this.m31 +
                    this.m13 * this.m21 * this.m32 -
                    this.m11 * this.m23 * this.m32 -
                    this.m12 * this.m21 * this.m33 +
                    this.m11 * this.m22 * this.m33;
        },

        /**
         * @returns {Matrix}
         */
        invert: function () {

            var n11 = this.m11, n12 = this.m12, n13 = this.m13,
                n21 = this.m21, n22 = this.m22, n23 = this.m23,
                n31 = this.m31, n32 = this.m32, n33 = this.m33,
                n41 = this.m41, n42 = this.m42, n43 = this.m43,
                d = 1 / this.determinant();

            this.m11 = (-n23 * n32 + n22 * n33) * d;
            this.m12 = ( n13 * n32 - n12 * n33) * d;
            this.m13 = (-n13 * n22 + n12 * n23) * d;
            this.m14 = 0;
            this.m21 = ( n23 * n31 - n21 * n33) * d;
            this.m22 = (-n13 * n31 + n11 * n33) * d;
            this.m23 = ( n13 * n21 - n11 * n23) * d;
            this.m24 = 0;
            this.m31 = (-n22 * n31 + n21 * n32) * d;
            this.m32 = ( n12 * n31 - n11 * n32) * d;
            this.m33 = (-n12 * n21 + n11 * n22) * d;
            this.m34 = 0;

            this.m41 = (
                n23 * n32 * n41 -
                n22 * n33 * n41 -
                n23 * n31 * n42 +
                n21 * n33 * n42 +
                n22 * n31 * n43 -
                n21 * n32 * n43
            ) * d;

            this.m42 = (
                n12 * n33 * n41 -
                n13 * n32 * n41 +
                n13 * n31 * n42 -
                n11 * n33 * n42 -
                n12 * n31 * n43 +
                n11 * n32 * n43
            ) * d;

            this.m43 = (
                n13 * n22 * n41 -
                n12 * n23 * n41 -
                n13 * n21 * n42 +
                n11 * n23 * n42 +
                n12 * n21 * n43 -
                n11 * n22 * n43
            ) * d;

            this.m44 = 1;

            return this;
        },

        /**
         * @returns {Matrix}
         */
        createInvert: function () {

            return this.clone().invert();
        },

        /**
         * @returns {Matrix}
         */
        clone: function () {

            return new Matrix().set(
                this.m11, this.m12, this.m13, this.m14,
                this.m21, this.m22, this.m23, this.m24,
                this.m31, this.m32, this.m33, this.m34,
                this.m41, this.m42, this.m43, this.m44
            );
        },

        /**
         * @param {Matrix} a
         * @param {Matrix} b
         * @returns {Matrix}
         */
        join: function (a, b) {

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
        multiply: function (matrix) {

            return this.join(this, matrix);
        },

        /**
         * @param {Matrix} matrix
         * @returns {Matrix}
         */
        preMultiply: function (matrix) {

            return this.join(matrix, this);
        },

        multiplyVector: function (v) {

            var vx = v.x,
                vy = v.y,
                vz = v.z;

            v.x = this.m11 * vx + this.m21 * vy + this.m31 * vz + this.m41;
            v.y = this.m12 * vx + this.m22 * vy + this.m32 * vz + this.m42;
            v.z = this.m13 * vx + this.m23 * vy + this.m33 * vz + this.m43;

            return v;
        },

        /**
         * @returns {String}
         */
        toCSS: function () {

            return "matrix3d("+
                this.m11.toFixed(4)+","+this.m12.toFixed(4)+","+this.m13.toFixed(4)+","+this.m14.toFixed(4)+","+
                this.m21.toFixed(4)+","+this.m22.toFixed(4)+","+this.m23.toFixed(4)+","+this.m24.toFixed(4)+","+
                this.m31.toFixed(4)+","+this.m32.toFixed(4)+","+this.m33.toFixed(4)+","+this.m34.toFixed(4)+","+
                this.m41.toFixed(4)+","+this.m42.toFixed(4)+","+(this.m43 + 0.001).toFixed(4)+","+this.m44.toFixed(4)+
            ")";
        },

        /**
         * @returns {Array}
         */
        toArray: function () {

            return [
                this.m11, this.m12, this.m13, this.m14,
                this.m21, this.m22, this.m23, this.m24,
                this.m31, this.m32, this.m33, this.m34,
                this.m41, this.m42, this.m43, this.m44
            ];
        }
    };

    mat = new Matrix();

    return Matrix;
});


define('graph/LayerBase',['../geom/Matrix'], function (Matrix) {

	function LayerBase () {
		this.is3D = true;
		this.parent = null;
		this.visible = true;
		this.name = null;
		this.type = 'null';

		this.matrix_ = new Matrix();
		this.matrix2D_ = new Matrix();
	}

	LayerBase.prototype = {

		constructor: LayerBase,

		getMatrix: function () {

			if (!this.is3D){
				return this.getMatrix2D();
			}

			var mat = this.matrix_.injectMatrix(this.getLocalMatrix()),
				p = this.parent;

			if (p && p !== this){
				mat.multiply(p.getMatrix());
			}

			return mat;
		},

		getMatrix2D: function () {

			var mat = this.matrix2D_.injectMatrix(this.getLocalMatrix2D()),
				p = this.parent;

			if (p){
				mat.multiply(p.getMatrix2D());
			}

			return mat;
		},

		getLocalMatrix: function () {
			return new Matrix();
		},

		getLocalMatrix2D: function () {
			return new Matrix();
		}
	};

	return LayerBase;
});


define('graph/Layer',[
    'geom/Vector',
    'geom/Quaternion',
    'geom/Matrix',
    'core/Stack',
    './LayerBase'
], function(
    Vector,
    Quaternion,
    Matrix,
    Stack,
    LayerBase
) {

    function Layer () {

        LayerBase.call(this);

        this.filters        = new Stack();
        this.masks          = new Stack();
        this.collapse       = false;
        this.position       = new Vector();
        this.anchor         = new Vector();
        this.scale          = new Vector(1,1,1);
        this.rotation       = new Vector();
        this.orientation    = new Quaternion();
        this.opacity        = 1;
        this.type           = 'null';

        this.localMatrix_   = new Matrix();
        this.localMatrix2D_ = new Matrix();
        this.depthPoint_    = new Vector();
    }

    Layer.prototype = new LayerBase();
    Layer.prototype.constructor = Layer;

    Layer.prototype.getLocalMatrix = function () {

        var p = this.position,
            a = this.anchor,
            s = this.scale,
            r = this.rotation,
            o = this.orientation;

        return this.localMatrix_
               .translation(-a.x,-a.y, a.z)
               .scale(s.x, s.y, s.z)
               .rotate(r.x, r.y, r.z)
               .quaternionRotate(o.x, o.y, o.z, o.w)
               .translate(p.x,p.y, -p.z);
    };

    Layer.prototype.getLocalMatrix2D = function () {

        var p = this.position,
            a = this.anchor,
            s = this.scale;

        return this.localMatrix2D_
               .translation(-a.x, -a.y, 0)
               .scale(s.x, s.y, 1)
               .rotate(0, 0, this.rotation.z)
               .translate(p.x, p.y, 0);
    };

    Layer.prototype.getDepthPoint = function () {

        return this.depthPoint_.set(
            Math.max(
                Math.min(
                    this.width || 1024,
                    this.anchor.x
                ),
                0
            ),
            Math.max(
                Math.min(
                    this.height || 768,
                    this.anchor.y
                ),
                0
            ),
            0
        );
    };

    return Layer;
});



define('graph/Solid',['./Layer'], function(Layer) {

    function Solid () {

        Layer.call(this);

        this.color = '#000000';
        this.width = 640;
        this.height = 360;
        this.type = 'solid';
    }

    Solid.prototype = new Layer();
    Solid.prototype.constructor = Solid;

    return Solid;

});


/*global define*/

define('graph/Text',['geom/Vector', './Layer'], function(Vector, Layer) {

    function Text () {

        Layer.call(this);

        this.text           = "";
        this.textPosition   = new Vector();
        this.width          = 150;
        this.height         = 150;
        this.textClass      = null;
        this.fontFamily     = 'Arial';
        this.textColor      = '#888888';
        this.fontSize       = 18;
        this.lineHeight     = 1.2;
        this.letterSpacing  = 0;
        this.textAlign      = 'left';
        this.verticalAlign  = 'top';
        this.collapse       = true;
        this.type           = 'text';
    }


    Text.prototype = new Layer();
    Text.prototype.constructor = Text;

    Text.prototype.getDepthPoint = function () {

        var x = this.textPosition.x,
            y = this.textPosition.y;

        if (this.textAlign === 'center') {
            x += this.width*0.5;
        } else if (this.textAlign === 'right') {
            x += this.width;
        }

        if (this.verticalAlign === 'middle') {
            y += this.height*0.5;
        } else if (this.verticalAlign === 'bottom') {
            y += this.height;
        }

        return this.depthPoint_.set(x, y);
    };

    return Text;
});

define('graph/Camera',[
    'geom/Vector',
    'geom/Quaternion',
    'geom/Matrix',
    './LayerBase'
], function(
    Vector,
    Quaternion,
    Matrix,
    LayerBase
) {

    function Camera () {

        LayerBase.call(this);

        this.position       = new Vector();
        this.rotation       = new Vector();
        this.orientation    = new Quaternion();
        this.target         = new Vector();
        this.haveTarget     = true;
        this.zoom           = 1333.33;
        this.center         = new Vector();
        this.is3D           = true;
        this.type           = 'camera';

        this.localMatrix_   = new Matrix();
        this.localMatrix2D_ = new Matrix();
        this.matrixCamera_  = new Matrix();
        this.tMatCamera_    = new Matrix();
    }

    Camera.prototype = new LayerBase();
    Camera.prototype.constructor = Camera;

    Camera.prototype.getLocalMatrix = function(){

        var t   = this,
            r   = t.rotation,
            ta  = t.target,
            p   = t.position,
            o   = t.orientation,
            mat = this.localMatrix_
                  .rotation(r.x,r.y,r.z);

        mat.m41 = mat.m42 = mat.m43 = 0;
        mat.quaternionRotate(o.x, o.y, o.z, o.w);
        if (t.haveTarget){
            mat.lookAt(
                ta.x - p.x,
                ta.y - p.y,
                ta.z - p.z
            );
        }
        mat.translate(p.x, p.y, -p.z);

        return  mat;
    };

    Camera.prototype.getLocalMatrix2D = function(){

        return this.localMatrix2D_
               .rotation(0,0,this.rotation.z)
               .translate(this.position.x,this.position.y, 0);

    };


    Camera.prototype.getCameraMatrix = function(){

        var c = this.center;

        return  this.matrixCamera_
                .translation(c.x, c.y, this.zoom)
                .preMultiply(
                    this.tMatCamera_
                    .identity()
                    .injectMatrix(this.getMatrix())
                    .invert()
                );
    };

    Camera.prototype.align = function(x, y){

        this.center.x = this.position.x = x;
        this.center.y = this.position.y = y;
        this.position.z = -this.zoom;
    };

    return Camera;
});


define('graph/Composition',[
    'core/Stack',
    './Layer',
    './Camera'
], function (
    Stack,
    Layer,
    Camera
) {

    function Composition () {

        Layer.call(this);

        var cam;

        this.layers     = new Stack(Layer);
        this.cameras    = new Stack(Camera);
        this.width      = 640;
        this.height     = 360;
        this.color      = "#000000";
        this.type       = 'composition';

        cam = new Camera();
        cam.haveTarget = false;
        cam.align(this.width/2, this.height/2);
        this.defaultCam_ = cam;
    }

    Composition.prototype = new Layer();
    Composition.prototype.constructor = Composition;

    Composition.prototype.getCamera = function(){

        var i = 0,
            l = this.cameras.getLength(),
            temp_cam;

        for ( i = 0; i < l; i += 1 ) {
            temp_cam = this.cameras.get(i);
            if (temp_cam.visible){
                temp_cam.center.set(this.width/2, this.height/2);
                return temp_cam;
            }
        }

        temp_cam = this.defaultCam_;
        temp_cam.align(this.width/2, this.height/2);

        return temp_cam;
    };

    return Composition;
});


/*global define*/

define('graph/Mask',[
    'path/Path',
    'geom/Vector'
], function (
    Path,
    Vector
) {

    function Mask () {

        Path.call(this);

        this.inverted  = false;
        this.feather   = new Vector();
        this.opacity   = 1;
        this.expansion = 0;
        this.blending  = 'normal';
    }

    Mask.prototype = new Path();
    Mask.prototype.constructor = Mask;

    return Mask;
});


define('graph',[
    'graph/Solid',
    'graph/Text',
    'graph/Camera',
    'graph/Composition',
    'graph/Mask'
], function (
    Solid,
    Text,
    Camera,
    Composition,
    Mask
) {

    return {
        Solid       : Solid,
        Text        : Text,
        Camera      : Camera,
        Composition : Composition,
        Mask        : Mask
    };
});


/*global define */

define('builders/aeBuilder',[
    'geom/Vector',
    'geom/Quaternion',
    'path/Path',
    'animation',
    'graph'
], function(
    Vector,
    Quaternion,
    Path,
    animation,
    graph
) {

    var AnimatorStack = animation.AnimatorStack,
        Animator = animation.Animator;

    function build (data) {

        return buildItem(data.items[data.root], data.items);
    }

    function buildCompItem (item, items) {

        var comp = new graph.Composition(),
            item_animator = new AnimatorStack(comp),
            layers = item.layers,
            children = {},
            parents = {},
            key = "",
            i = 0,
            layer_data, animator;

        comp.width = item.width;
        comp.height = item.height;
        comp.color = item.color || "#000000";
        item_animator.duration = item.duration || 1;
        item_animator.frameRate = item.frameRate || 25;

        for ( ; i < layers.length; i += 1) {

            layer_data = layers[i];
            animator = null;

            switch (layer_data.type) {
            case 'Camera':
                animator = buildCameraLayer(layer_data);
                animator.layer.center.set(comp.width / 2, comp.height / 2);
                break;
            case 'Text':
                animator = buildTextLayer(layer_data);
                break;
            default:
                if (layer_data.source) {
                    animator = buildAVLayer(layer_data, items);
                }
                break;
            }

            if (animator) {
                if (layer_data.parent != null) {
                    if (!children[layer_data.parent]) {
                        children[layer_data.parent] = [];
                    }
                    children[layer_data.parent].push(animator.layer);
                }

                parents[layer_data.id] = animator.layer;
                item_animator.add(animator);

                if (animator.layer instanceof graph.Camera) {
                    comp.cameras.add(animator.layer);
                } else {
                    comp.layers.add(animator.layer);
                }
            }
        }

        for (key in children) {
            if (
                children.hasOwnProperty(key) &&
                Array.isArray(children[key]) &&
                parents.hasOwnProperty(key)
            ) {
                for (i = 0; i < children[key].length; i += 1) {
                    children[key][i].parent = parents[key];
                }
            }
        }
        return item_animator;
    }

    function buildSolidItem (data, items) {

        var solid = new graph.Solid(),
            item_animator = new AnimatorStack(solid);

        solid.width = data.width;
        solid.height = data.height;
        solid.color = data.color;

        return item_animator;
    }

    function buildItem (item, items) {
        switch (item.type) {
        case 'Composition':
            return buildCompItem(item, items);
        case 'Solid':
            return buildSolidItem(item, items);
        case 'Image':
            return buildImageItem(item, items);
        case 'Video':
            return buildVideoItem(item, items);
        }

    }

    function buildImageItem (item, items) {

    }

    function buildVideoItem (item, items) {

    }

    function buildAVLayer (data, items) {

        var item_animator = buildItem(items[data.source], items),
            layer = item_animator.item,
            animator = new Animator(layer, data.inPoint, data.outPoint);

        setLayerProperties(animator, data);

        animator.source = item_animator;
        animator.startTime = data.startTime || 0;
        animator.speed = data.speed || 1;

        return animator;
    }

    function buildCameraLayer (data) {

        var camera = new graph.Camera(),
            animator = new Animator(camera, data.inPoint, data.outPoint);

        camera.name = camera.name;
        camera.haveTarget = (data.autoOrient !== 'none' || data.autoOrient === 'target');

        setProp(camera, "position", animator, data.position);
        setProp(camera, "rotation", animator, data.rotation);
        setProp(camera, "orientation", animator, data.orientation);
        setProp(camera, "zoom", animator, data.zoom);

        if (camera.haveTarget) {
            setProp(camera, "target", animator, data.target);
        }

        return animator;
    }

    function buildTextLayer (data) {

        var text_layer = new graph.Text(),
            animator = new Animator(text_layer, data.inPoint, data.outPoint),
            props = [
                'text', 'textPosition', 'width',
                'height', 'textClass', 'fontFamily',
                'textColor', 'fontSize', 'lineHeight',
                'letterSpacing', 'textAlign', 'verticalAlign'
            ],
            i = 0,
            l = props.length;

        setLayerProperties(animator, data);

        for ( ; i < l; i += 1) {
            setProp(text_layer, props[i], animator, data[props[i]]);
        }

        return animator;

    }

    function setLayerProperties (animator, data) {

        var layer = animator.layer;

        layer.name = data.name;
        layer.is3D = data.is3D || false;

        if (data.collapse != null) {
            layer.collapse = (data.collapse === true);
        }

        if (data.masks) {
            setMasks(layer.masks, data.masks, animator);
        }

        setProp(layer, 'position', animator, data.position);
        setProp(layer, 'anchor', animator, data.anchor);
        setProp(layer, 'scale', animator, data.scale);
        setProp(layer, 'opacity', animator, data.opacity);

        if (layer.is3D) {
            setProp(layer, 'rotation', animator, data.rotation);
            setProp(layer, 'orientation', animator, data.orientation);
        } else {
            setProp(layer.rotation, 'z', animator, data.rotation);
        }
    }

    function setMasks (stack, data, animator) {
        var i = 0,
            l = data.length,
            mask_data,
            path_data,
            mask,
            a,
            y,
            y_l;


        for ( ; i < l; i += 1) {
            mask_data = data[i];

            if (mask_data.maskPath) {

                mask = new graph.Mask();

                mask.closed = mask_data.maskPath.closed || true;
                mask.inverted = mask_data.inverted || false;
                mask.blending = mask_data.maskMode || 'normal';

                setProp(mask, '', animator, mask_data.maskPath);
                setProp(mask, 'feather', animator, mask_data.maskFeather);
                setProp(mask, 'opacity', animator, mask_data.maskOpacity);
                setProp(mask, 'expansion', animator, mask_data.maskExpansion);

                stack.add(mask);

            }
        }
    }

    function buildPath (path_data, obj) {
        var i = 0,
            l = path_data.data.length,
            val;

        for ( ; i < l; i += 1) {
            val = path_data.data[i];
            obj.create(
                val[0],
                val[1],
                val[2] || 0,
                val[3] || 0,
                val[4] || 0,
                val[5] || 0
            );
        }

        if (path_data.closed){
            obj.closed = true;
        }

        return obj;
    }

    function setProp (obj, name, animator, value) {

        if (!value && value !== 0) {
            return;
        }
        var i, k, val, first_value, offset, is_hold, keys, key, is_object, is_array, is_spatial, is_vector, target = obj[name];

        if (Array.isArray(value)) {

            is_spatial = null;
            offset = 0;
            first_value = (Array.isArray(value[0]))
                          ? value[0][0]
                          : (typeof value[0] === 'object' && value[0].v)
                            ? value[0].v
                            : value[0];

            is_spatial = Vector.isVector(first_value);

            keys = (is_spatial)
                   ? new animation.SpatialKeys(obj, name)
                   : (typeof value[0] === 'object' && first_value.data)
                     ? new animation.PathKeys(obj)
                     : new animation.Keys(obj, name);

            for (i = 0; i < value.length; i += 1) {

                k = value[i];

                is_object = typeof k === 'object';
                is_array = Array.isArray(k);
                is_hold = (is_array || !is_object || (k.e && k.e.o === 0));
                val = (is_array) ? k[0] : (is_object && k.v != null) ? k.v : k;
                is_vector = Vector.isVector(val);

                if (is_vector) {
                    if (val.w !== undefined) {
                        val = new Quaternion(val.x, val.y, val.z, val.w);
                    } else {
                        val = new Vector(val.x, val.y, val.z);
                    }
                } else if (val.data) {
                    val = buildPath(val, new Path());
                }

                if (is_array) {
                    offset = k[1];
                } else if (is_object && k.d !== undefined) {
                    offset = k.d || 0;
                }

                key = keys.add(offset, val, is_hold);

                if (k.e && Array.isArray(k.e.i)) {
                    key.inX = k.e.i[0];
                    key.inY = k.e.i[1];
                }
                if (k.e && Array.isArray(k.e.o)) {
                    key.outX = k.e.o[0];
                    key.outY = k.e.o[1];
                }
                if (is_spatial && k.t) {
                    if (Array.isArray(k.t.i)) {
                        key.inTangent = new Vector(k.t.i[0], k.t.i[1], k.t.i[2]);
                    }
                    if (Array.isArray(k.t.o)) {
                        key.outTangent = new Vector(k.t.o[0], k.t.o[1], k.t.o[2]);
                    }
                    key.update = true;
                }
            }
            if (keys) {
                animator.add(keys);
            }
        } else {
            if (value.x != null && value.y != null) {
                setProp(target, 'x', animator, value.x);
                setProp(target, 'y', animator, value.y);
                if (value.z != null) {
                    setProp(target, 'z', animator, value.z);
                }
                if (value.w != null) {
                    setProp(target, 'w', animator, value.w);
                }
            } else if (value.data){
                buildPath(value, obj);
            } else {
                obj[name] = value;
            }
        }
    }

    return {
        build: build
    };
});

define('text!style/scene.css',[],function () { return '\nscene * {\n    position:absolute;\n    display:block;\n    top:0;\n    left:0;\n    margin:0;\n    padding:0;\n    border:0;\n    word-wrap:break-word;\n    -webkit-font-smoothing:antialiased;\n    transform-origin:0% 0%;\n    -o-transform-origin:0% 0%;\n    -khtml-transform-origin:0% 0%;\n    -moz-transform-origin:0% 0%;\n    -webkit-transform-origin:0% 0%;\n    -ms-transform-origin:0% 0%;\n}\n\nscene .filter {\n    -ms-filter: "progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\') progid:DXImageTransform.Microsoft.Alpha(opacity=100)";\n    filter: progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\') progid:DXImageTransform.Microsoft.Alpha(opacity=100);\n}\n\nscene.no_collapse > composition, .no_collapse > composition {\n\n    transform-style: flat;\n    -o-transform-style: flat;\n    -khtml-transform-style: flat;\n    -moz-transform-style: flat;\n    -webkit-transform-style: flat;\n    -ms-transform-style: flat;\n}\n\nscene .no_collapse {\n    overflow: hidden;\n}\n\n\n';});


define('geom/Matrix2D',['./Vector'], function(Vector){

    var v1 = new Vector(),
        v2 = new Vector(),
        v3 = new Vector(),
        mat;

    function Matrix2D () {
        if (arguments.length){
            this.injectArray(arguments);
        }
    }

    Matrix2D.prototype = {

        constructor : Matrix2D,

        m11:1,m12:0,m21:0,m22:1,x:0,y:0,z:0,

        /**
         * @param {number} n11
         * @param {number} n12
         * @param {number} n21
         * @param {number} n22
         * @param {number} x
         * @param {number} y
         * @param {number} z
         *
         * @returns {Matrix2D}
         */
        set: function (n11, n12, n21, n22, x, y, z) {

            this.m11 = n11; this.m12 = n12;
            this.m21 = n21; this.m22 = n22;
            this.x = x; this.y = y; this.z = z;

            return this;
        },

        /**
         *
         * @param {Array.<Number>} a
         * @returns {Matrix2D}
         */
        injectArray: function (a) {

            return this.set.apply(this,a);
        },

        /**
         *
         * @param {Matrix2D} m
         * @returns {Matrix2D}
         */
        injectMatrix: function (m) {

            this.m11 = m.m11; this.m12 = m.m12;
            this.m21 = m.m21; this.m22 = m.m22;
            this.x = m.x; this.y = m.y; this.z = m.z;

            return this;
        },

        /** @returns {Matrix} */
        identity: function () {

            this.set(
                1,0,
                0,1,
                0,0,0
            );

            return this;
        },

        /**
         * @param {number} x
         * @param {number} y
         * @param {number} z
         * @returns {Matrix}
         */
        translation: function (x, y, z) {

            this.set(
                1,0,
                0,1,
                x||0,y||0,z||0,1
            );

            return this;
        },

        /**
         * @param {number} x
         * @param {number} y
         * @param {number} z
         * @returns {Matrix2D}
         */
        translate: function (x, y, z) {

            this.x += x||0;
            this.y += y||0;
            this.z += z||0;

            return this;
        },

        /**
         * @param {number} x
         * @param {number} y
         * @param {number} z
         * @returns {Matrix2D}
         */
        preTranslate: function (x, y, z) {

            this.x += x * this.m11 + y * this.m21;
            this.y += x * this.m12 + y * this.m22;
            this.z += z||0;

            return this;
        },


        /**
         * @param {number} scaleX
         * @param {number} scaleY
         * @returns {Matrix2D}
         */
        scaling: function (scaleX, scaleY) {

            this.set(
                scaleX||0,
                0,scaleY||0,
                0,0,0
            );

            return this;
        },

        /**
         * @param {number} scaleX
         * @param {number} scaleY
         * @returns {Matrix2D}
         */
        scale: function (scaleX, scaleY) {

            scaleX = scaleX || 0.000001;
            scaleY = scaleY || 0.000001;

            if (scaleX !== 1 || scaleY !== 1){
                this.m11 *= scaleX; this.m12 *= scaleX; this.x *= scaleX;
                this.m21 *= scaleY; this.m22 *= scaleY; this.y *= scaleY;
            }

            return this;
        },

        /**
         * @param {number} rotation
         * @returns {Matrix2D}
         */
        rotation: function (rotation) {
            //TODO implement 2D rotation that have 3D rotation interface
            return this;
        },

        /**
         * @param {number} rotationX
         * @param {number} rotationY
         * @param {number} rotationZ
         * @returns {Matrix}
         */
        rotate: function (rotation) {

            return (rotation) ? this.multiply(mat.rotation(rotation)) : this;
        },

        /**
         * @returns {Matrix}
         */
        clone: function () {

            return new Matrix2D().set(
                this.m11, this.m12,
                this.m21, this.m22,
                this.x, this.y, this.z
            );
        },

        /**
         * @param {Matrix2D} a
         * @param {Matrix2D} b
         * @returns {Matrix2D}
         */
        join: function (a, b) {

            var a11 = a.m11, a12 = a.m12,
                a21 = a.m21, a22 = a.m22,
                ax = a.x, ay = a.y,

                b11 = b.m11, b12 = b.m12,
                b21 = b.m21, b22 = b.m22,
                bx = b.x, by = b.y;

            this.m11 = a11 * b11 + a12 * b21;
            this.m12 = a11 * b12 + a12 * b22;

            this.m21 = a21 * b11 + a22 * b21;
            this.m22 = a21 * b12 + a22 * b22;

            this.x = ax * b11 + ay * b21 + bx;
            this.y = ax * b12 + ay * b22 + by;

            return this;

        },

        /**
         * @param {Matrix2D} matrix
         * @returns {Matrix2D}
         */
        multiply: function (matrix) {

            return this.join(this, matrix);
        },

        /**
         * @param {Matrix2D} matrix
         * @returns {Matrix2D}
         */
        preMultiply: function (matrix) {

            return this.join(matrix, this);
        },

        multiplyVector: function (v) {

            var vx = v.x,
                vy = v.y;

            v.x = this.m11 * vx + this.m21 * vy + this.x;
            v.y = this.m12 * vx + this.m22 * vy + this.y;

            return v;
        },

        copy3D: function (m) {

            this.m11 = m.m11; this.m12 = m.m12;
            this.m21 = m.m21; this.m22 = m.m22;
            this.x = m.m41; this.y = m.m42;

            return this;
        },

        simulate3D: function (m, center_v, depth_v, zoom) {

            var v = v1.copy(depth_v)
                    .multiplyMatrix(m)
                    .flatten(zoom, center_v),

                vx = v2.set(depth_v.x + 1, depth_v.y, 0)
                     .multiplyMatrix(m)
                     .flatten(zoom, center_v)
                     .sub(v),

                vy = v3.set(depth_v.x, depth_v.y + 1, 0)
                     .multiplyMatrix(m)
                     .flatten(zoom, center_v)
                     .sub(v);

            this.m11 = vx.x;
            this.m12 = vx.y;
            this.m21 = vy.x;
            this.m22 = vy.y;

            this.x = v.x - (depth_v.x * this.m11 + depth_v.y * this.m21);
            this.y = v.y - (depth_v.x * this.m12 + depth_v.y * this.m22);

            return this;
        },

        /**
         * @returns {String}
         */
        toCSS: function () {

            var m = this;

            return "matrix("+
                m.m11.toFixed(4)+","+m.m12.toFixed(4)+","+
                m.m21.toFixed(4)+","+m.m22.toFixed(4)+","+
                m.x.toFixed(4)+","+m.y.toFixed(4)+
            ")";

        },

        /**
         * @returns {Array}
         */
        toArray: function () {
            var m = this;
            return [
                    m.m11, m.m12,
                    m.m21, m.m22,
                    m.x, m.y
            ];
        }
    };

    mat = new Matrix2D();

    return Matrix2D;

});



define('geom/Rectangle',[],function(){

    /** @constructor */
    function Rectangle (x, y, width, height) {

        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 100;
        this.height = height || 100;
    }

    Rectangle.prototype = {

            constructor : Rectangle,

            clone : function(){

                return new Rectangle(this.x,this.y,this.width,this.height);
            },

            compare : function(obj){

                if (obj === null) return false;

                if (
                    obj.x !== this.x ||
                    obj.y !== this.y ||
                    obj.width !== this.width ||
                    obj.height !== this.height
                ){
                    return false;
                }

                return true;
            },

            multiplyScalar: function(val) {

                this.width  *= val;
                this.height *= val;
                this.x      *= val;
                this.y      *= val;
            }
    };

    return Rectangle;
});


/*global define*/

define('renderers/dom/Solid',[],function () {

    function Solid (model) {

        this.element = document.createElement('solid');
        this.model = model;
    }

    Solid.prototype = {

        constructor: Solid,

        render: function(bounds){

            var style = this.element.style,
                model = this.model;

            style.width = model.width+'px';
            style.height = model.height+'px';
            style.backgroundColor = model.color;

            if (bounds) {
                bounds.x = 0;
                bounds.y = 0;
                bounds.width = model.width;
                bounds.height = model.height;
            }

            return bounds;
        }
    };

    return Solid;
});



/*global define*/
define('renderers/dom/Text',[],function () {

    function checkDifference (source, target) {

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
                } else if (s_prop != null && s_prop.clone && s_prop.equals){
                    if (!s_prop.equals(t_prop)){
                        res = true;
                        target[i] = s_prop.clone();
                    }
                }
            }
        }

        return res;
    }


    function Text (model) {

        this.model = model;
        this.element = document.createElement('text');
        this.text = document.createElement('p');
        this.element.appendChild(this.text);

        this.oldX = 0;
        this.oldY = 0;
        this.offsetY = 0;

        this.oldModel = {
            text : null,
            textClass : null,
            fontFamily : null,
            textColor : null,
            fontSize : null,
            lineHeight : null,
            letterSpacing : null,
            textAlign : null,
            verticalAlign : null,
            width : null,
            height : null
        };
    }

    Text.prototype = {

        constructor: Text,

        render: function(bounds) {

            var model       = this.model,
                style       = this.text.style,
                size        = model.fontSize,
                maxResize   = 6,
                maxHeight   = model.height,
                offset      = (size * model.leading) - size,
                i           = 0,
                node;

            if (checkDifference(this.model, this.oldModel)){

                node = document.createTextNode(model.text);
                if (this.node){
                    this.text.replaceChild(node,this.node);
                } else {
                    this.text.appendChild(node);
                }
                this.node = node;


                style.width      = model.width + 'px';
                style.color      = model.textColor;
                style.textAlign  = model.textAlign;
                style.fontFamily = model.fontFamily;
                style.fontSize   = model.fontSize + 'px';
                style.lineHeight = model.lineHeight + 'em';

                offset = (size * model.lineHeight) - size;
                while (i <= maxResize && (this.text.offsetHeight - offset) >= maxHeight) {
                    size = size * 0.92;
                    offset = (size * model.lineHeight) - size;
                    style.fontSize = size + 'px';
                    i += 1;
                }

                this.offsetY = (model.textPosition.y - (offset / 2));
                var dif = (maxHeight - (this.text.offsetHeight - (offset / 2)));

                switch (model.verticalAlign) {
                case 'bottom':
                    this.offsetY += dif;
                    break;
                case 'middle':
                    this.offsetY += dif / 2;
                    break;
                default:
                    break;
                }

            }

            this.oldX = model.textPosition.x;
            this.oldY = this.offsetY;

            if (bounds) {
                bounds.x = this.oldX;
                bounds.y = this.oldY - 10;
                bounds.width = model.width;
                bounds.height = this.text.offsetHeight;
            }

            return bounds;
        }
    };

    return Text;
});


/*

Superfast Blur - a fast Box Blur For Canvas

Version:    0.5
Author:     Mario Klingemann
Contact:    mario@quasimondo.com
Website:    http://www.quasimondo.com/BoxBlurForCanvas
Twitter:    @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr:
https://flattr.com/thing/140066/Superfast-Blur-a-pretty-fast-Box-Blur-Effect-for-CanvasJavascript

Copyright (c) 2011 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

/*global define*/

define('renderers/canvas/fastBlur',[],function () {

    var mul_table = [
        1,57,41,21,203,34,97,73,227,91,149,62,105,45,39,137,241,107,3,173,39,
        71,65,238,219,101,187,87,81,151,141,133,249,117,221,209,197,187,177,169,
        5,153,73,139,133,127,243,233,223,107,103,99,191,23,177,171,165,159,77,
        149,9,139,135,131,253,245,119,231,224,109,211,103,25,195,189,23,45,175,
        171,83,81,79,155,151,147,9,141,137,67,131,129,251,123,30,235,115,113,221,
        217,53,13,51,50,49,193,189,185,91,179,175,43,169,83,163,5,79,155,19,75,147,
        145,143,35,69,17,67,33,65,255,251,247,243,239,59,29,229,113,111,219,27,213,105,
        207,51,201,199,49,193,191,47,93,183,181,179,11,87,43,85,167,165,163,161,159,157,
        155,77,19,75,37,73,145,143,141,35,138,137,135,67,33,131,129,255,63,250,247,61,121,
        239,237,117,29,229,227,225,111,55,109,216,213,211,209,207,205,203,201,199,197,195,
        193,48,190,47,93,185,183,181,179,178,176,175,173,171,85,21,167,165,41,163,161,5,79,
        157,78,154,153,19,75,149,74,147,73,144,143,71,141,140,139,137,17,135,134,133,66,131,65,129,1
    ];


    var shg_table = [
        0,9,10,10,14,12,14,14,16,15,16,15,16,15,15,17,18,17,12,18,16,17,17,19,19,18,19,
        18,18,19,19,19,20,19,20,20,20,20,20,20,15,20,19,20,20,20,21,21,21,20,20,20,21,
        18,21,21,21,21,20,21,17,21,21,21,22,22,21,22,22,21,22,21,19,22,22,19,20,22,22,
        21,21,21,22,22,22,18,22,22,21,22,22,23,22,20,23,22,22,23,23,21,19,21,21,21,23,
        23,23,22,23,23,21,23,22,23,18,22,23,20,22,23,23,23,21,22,20,22,21,22,24,24,24,
        24,24,22,21,24,23,23,24,21,24,23,24,22,24,24,22,24,24,22,23,24,24,24,20,23,22,
        23,24,24,24,24,24,24,24,23,21,23,22,23,24,24,24,22,24,24,24,23,22,24,24,25,23,
        25,25,23,24,25,25,24,22,25,25,25,24,23,24,25,25,25,25,25,25,25,25,25,25,25,25,
        23,25,23,24,25,25,25,25,25,25,25,25,25,24,22,25,25,23,25,25,20,24,25,24,25,25,
        22,24,25,24,25,24,25,25,24,25,25,25,25,22,25,25,25,24,25,24,25,18
    ];


    function blurAlpha (image_data, radius, iterations) {

        if ( isNaN(radius) || radius < 1 ) return image_data;

        radius |= 0;

        if ( isNaN(iterations) ) iterations = 1;
        iterations |= 0;
        if ( iterations > 3 ) iterations = 3;
        if ( iterations < 1 ) iterations = 1;

        var width   = image_data.width,
            height  = image_data.height,
            pixels  = image_data.data,
            wm      = width - 1,
            hm      = height - 1,
            wh      = width * height,
            rad1    = radius + 1,
            mul_sum = mul_table[radius],
            shg_sum = shg_table[radius],
            r       = [],
            g       = [],
            b       = [],
            a       = [],
            vmin    = [],
            vmax    = [],
            rsum,gsum,bsum,asum,x,y,i,p,p1,p2,yp,yi,yw,idx,pa;

        while ( (iterations -= 1) >= 0 ){
            yw = yi = 0;

            for (y = 0; y < height; y += 1){
                asum = pixels[yw+3] * rad1;

                for( i = 1; i <= radius; i += 1){
                    p = yw + (((i > wm ? wm : i )) << 2 );
                    asum += pixels[p += 3];
                }

                for (x = 0; x < width; x += 1) {

                    a[yi] = asum;

                    if(y === 0) {
                        vmin[x] = ( ( p = x + rad1) < wm ? p : wm ) << 2;
                        vmax[x] = ( ( p = x - radius) > 0 ? p << 2 : 0 );
                    }

                    p1 = yw + vmin[x];
                    p2 = yw + vmax[x];
                    asum += pixels[p1 += 3]   - pixels[p2 += 3];

                    yi += 1;
                }
                yw += ( width << 2 );
            }

            for ( x = 0; x < width; x += 1) {
                yp = x;

                asum = a[yp] * rad1;

                for( i = 1; i <= radius; i += 1) {
                  yp += ( i > hm ? 0 : width );

                  asum += a[yp];
                }

                yi = x << 2;
                for ( y = 0; y < height; y += 1) {

                    pixels[yi+3] = pa = (asum * mul_sum) >>> shg_sum;

                    if( x === 0 ) {
                        vmin[y] = ( ( p = y + rad1) < hm ? p : hm ) * width;
                        vmax[y] = ( ( p = y - radius) > 0 ? p * width : 0 );
                    }

                    p1 = x + vmin[y];
                    p2 = x + vmax[y];

                    asum += a[p1] - a[p2];

                    yi += width << 2;
                }
            }
        }

        return image_data;
    }


    return {
        blurAlpha: blurAlpha
    };
});


/*jshint
    undef:true
    curly:true
    browser: true
    laxbreak: true
    eqnull: true
    white: true
*/
/*global
    define
*/

define('renderers/canvas/canvasMask',['./fastBlur'], function (fastBlur) {

    var canvasElement = document.createElement('canvas'),
        tempContext = (canvasElement.getContext) ? canvasElement.getContext('2d') : null,
        maskCounter = 0;



    function setBlending(context, mask) {

        var blending = 'source-over';

        switch (mask.blending) {
        case 'subtract':
            blending = 'destination-out';
            break;
        case 'intersect':
            blending = 'source-in';
            break;
        case 'lighten':
            blending = 'lighter';
            break;
        case 'darken':
            blending = 'destination-in';
            break;
        case 'difference':
            blending = 'xor';
            break;
        }

        context.globalCompositeOperation = blending;
    }

    function draw(context, inAnchor, outAnchor) {
        context.bezierCurveTo(
            inAnchor.x + inAnchor.outVector.x,
            inAnchor.y + inAnchor.outVector.y,
            outAnchor.x + outAnchor.inVector.x,
            outAnchor.y + outAnchor.inVector.y,
            outAnchor.x,
            outAnchor.y
        );
    }

    function renderMask(context, mask, scale, bounds, opt_is_first) {

        scale = scale || 1;

        var big_number = 99999999,
            is_first_sub = (mask.blending === 'subtract') && opt_is_first,
            to_invert = (is_first_sub) ? !mask.inverted : mask.inverted,
            blur_val = Math.round(Math.abs(mask.feather.x)) * scale,
            buffer = tempContext,
            prev_anchor, blending;

        buffer.canvas.width = bounds.width + (blur_val * 2);
        buffer.canvas.height = bounds.height + (blur_val * 2);
        buffer.globalCompositeOperation = 'source-over';

        buffer.setTransform(scale, 0, 0, scale, -bounds.x + blur_val, -bounds.y + blur_val);

        buffer.beginPath();

        if (to_invert) {

            buffer.moveTo(-big_number, -big_number);
            buffer.lineTo(big_number, -big_number);
            buffer.lineTo(big_number, big_number);
            buffer.lineTo(- big_number, big_number);
            buffer.closePath();
        }

        mask.each(function (anchor) {
            if (!prev_anchor) {
                buffer.moveTo(anchor.x, anchor.y);
            } else {
                draw(buffer, prev_anchor, anchor);
            }
            prev_anchor = anchor;
        });

        draw(buffer, prev_anchor, mask.get(0));
        buffer.closePath();

        buffer.fillStyle = '#000000';
        buffer.fill();

        if (mask.expansion !== 0) {
            buffer.globalCompositeOperation = (to_invert !== mask.expansion < 0)
                                              ? 'destination-out'
                                              : 'source-over';
            buffer.lineWidth = Math.abs(mask.expansion * 2);
            buffer.lineStyle = 'black';
            buffer.lineJoin  = 'round';
            buffer.stroke();
        }

        if (mask.feather && mask.feather.x > 0) {
            buffer.putImageData(
                fastBlur.blurAlpha(
                    buffer.getImageData(
                        0, 0,
                        buffer.canvas.width,
                        buffer.canvas.height
                    ),
                    mask.feather.x * 0.6 * scale, 1
                ),
            0, 0);
        }

        context.globalAlpha = mask.opacity;

        if (is_first_sub) {
            context.globalCompositeOperation = 'add';
        } else {
            setBlending(context, mask);
        }
        context.setTransform(1, 0, 0, 1, -blur_val, -blur_val);
        context.drawImage(buffer.canvas, 0, 0);

    }

    function renderMasks(context, masks, scale, bounds) {

        var is_first = true;

        context.canvas.width = bounds.width;
        context.canvas.height = bounds.height;

        masks.each(function (mask) {

            if (mask.blending && mask.blending !== 'none' && mask.getLength() && mask.closed) {
                renderMask(context, mask, scale, bounds, is_first);
                is_first = false;
            }
        });
    }

    function setMask(element) {
        var mask_name = 'layer_mask_' + (maskCounter += 1),
            mask_canvas = document.getCSSCanvasContext('2d', mask_name, 10, 10);

        element.style.WebkitMaskImage = '-webkit-canvas(' + mask_name + ')';

        return mask_canvas;
    }

    function removeMask(element, context) {

        context.canvas.width = context.canvas.height = 0;
        element.style.WebkitMaskImage = '';
    }

    return {
        render: renderMasks,
        set: setMask,
        remove: removeMask
    };
});


/*global define*/

define('renderers/svg/svgUtils',[],function () {


    function draw (seq_path, inAnchor, outAnchor) {

        seq_path.x1 = inAnchor.x + inAnchor.outVector.x;
        seq_path.y1 = inAnchor.y + inAnchor.outVector.y;
        seq_path.x2 = outAnchor.x + outAnchor.inVector.x;
        seq_path.y2 = outAnchor.y + outAnchor.inVector.y;

        seq_path.x = outAnchor.x;
        seq_path.y = outAnchor.y;

    }

    function setPath (node, path, invert) {


        var seq_list = node.pathSegList,
            l = path.getLength(),
            i = 1,
            big_number = 10000,
            move = 'createSVGPathSegMovetoAbs',
            line = 'createSVGPathSegLinetoAbs',
            curve = 'createSVGPathSegCurvetoCubicAbs',
            padding = (invert ? 5 : 0),
            patch, prev_anchor, item, anchor;

        if (!l) {
            return;
        }

        if (l + (path.closed ? 1 : 0) + padding !== seq_list.numberOfItems) {

            console.log("remove");
            seq_list.clear();

            if (invert) {
                seq_list.appendItem(node[move](-big_number, -big_number));
                seq_list.appendItem(node[line](big_number, -big_number));
                seq_list.appendItem(node[line](big_number, big_number));
                seq_list.appendItem(node[line](-big_number, big_number));
                seq_list.appendItem(node[line](-big_number, -big_number));
            }

            seq_list.appendItem(node[move](0, 0));

            for (; i < l; i += 1) {
                seq_list.appendItem(node[curve](0, 0, 0, 0, 0, 0));
            }

            if (path.closed) {
                seq_list.appendItem(node[curve](0, 0, 0, 0, 0, 0));
            }

        }

        i = 1;

        item = seq_list.getItem(padding);

        prev_anchor = path.get(0);

        item.x = prev_anchor.x;
        item.y = prev_anchor.y;

        for (; i < l; i += 1) {
            anchor = path.get(i);
            draw(seq_list.getItem(i + padding), prev_anchor, anchor);
            prev_anchor = anchor;
        }

        if (path.closed) {
            draw(seq_list.getItem(i + padding), prev_anchor, path.get(0));
        }

    }

    function create (type, opt_attr, opt_style) {

        var elem = document.createElementNS("http://www.w3.org/2000/svg", type),
            key;

        if (opt_attr) {
            for (key in opt_attr) {
                if (opt_attr.hasOwnProperty(key)) {
                    elem.setAttribute(key, String(opt_attr[key]));
                }
            }
        }

        if (opt_style) {
            for (key in opt_style) {
                if (opt_style.hasOwnProperty(key)) {
                    elem.style[key] = opt_style[key];
                }
            }
        }

        if (this.appendChild) {
            this.appendChild(elem);
        }

        elem.create = create;

        return elem;
    }

    return {
        create: create,
        path: setPath
    };

});


/*jshint
    undef:true
    curly:true
    browser: true
    laxbreak: true
    eqnull: true
    white: true
*/
/*global
    define
*/

define('renderers/svg/svgMask',[
    './svgUtils'
], function (
    utils
) {

    var svg_mask_counter = 0;


    function updateMask(node, mask) {

        utils.path(node.pathNode, mask, mask.inverted);
        node.style.opacity = mask.opacity;

        if (mask.expansion > 0) {

            node.style.strokeWidth = (mask.expansion * 2) + 'px';
        } else {
            node.style.strokeWidth = 0;
        }
    }

    function renderMask(root, masks, scale, bounds) {

        var mask_node  = root.maskNode,
            children   = mask_node.childNodes,
            l          = masks.getLength(),
            i          = children.length,
            to_add     = i < l,
            big_number = 90000,
            group;


        if (i !== l) {
            if (to_add) {
                for (; i < l; i += 1) {
                    group = mask_node.create('g', {
                    }, {
                        'fill': 'white',
                        'stroke-linejoin': 'round',
                        'stroke': 'white',
                        'strokeWidth': '0px',
                        'fillRulle': 'evenodd'
                    });
                    group.pathNode = group.create('path', {
                        id: mask_node.id + '_' + i + '_shape'
                    });

                }
            } else {
                for (; i >= l; i -= 1) {
                    //remove mask
                }
            }

            children = mask_node.childNodes;
            l = children.length;
        }

        i = 0;

        for (; i < l; i += 1) {
            updateMask(children[i], masks.get(i));
        }


    }

    function setMask(element) {

        var mask_name = 'svg_mask_' + (svg_mask_counter += 1),
            svg_node = utils.create('svg', {height: 0}),
            svg_mask = svg_node.create('mask', {
                id: mask_name
            });

        svg_node.maskNode = svg_mask;
        element.appendChild(svg_node);
        element.firstChild.style.mask = 'url(#' + mask_name + ")";

        return svg_node;
    }

    function removeMask(element, root) {


    }

    return {
        render: renderMask,
        set: setMask,
        remove: removeMask
    };
});


/*global define*/

define('utils/browser',[],function () {

    function upProperty (val) {
        return val.charAt(0).toUpperCase() + val.substr(1);
    }

    function getVendorProperty (val) {

        var result = [ val ], i = 0, l = vendors.length;

        val = upProperty(val);

        for (; i < l; i += 1) {
            result.push(vendors[i] + val);
        }

        return result;
    }

    var vendors = 'Webkit Moz O ms Khtml'.split(' ');

    var browser = {

        TRANSFORM       : 'Transform',
        TRANSFORM_STYLE : 'transformStyle',
        PERSPECTIVE     : 'perspective',
        ORIGIN          : 'perspectiveOrigin'
    };

    browser.haveTransform = (function() {

        var element = document.createElement('div'),
            props   = getVendorProperty(this.TRANSFORM),
            i       = 0,
            l       = props.length;

        if (element) {
            for (; i < l; i += 1) {
                if (i && element.style[props[i]] !== undefined) {
                    this.TRANSFORM = vendors[i - 1] + upProperty(this.TRANSFORM);
                    return true;
                }
            }
        }

        return false;

    }.call(browser));

    browser.have3DTransform = (function() {

        var element = document.createElement('div'),
            props   = getVendorProperty(this.PERSPECTIVE),
            i       = 0,
            l       = props.length,
            vendor;

        if (element) {

            for (; i < l; i += 1) {
                if (i && element.style[props[i]] !== undefined) {

                    vendor = vendors[i-1];
                    this.PERSPECTIVE = vendor + upProperty(this.PERSPECTIVE);
                    this.ORIGIN = vendor + upProperty(this.ORIGIN);
                    this.TRANSFORM_STYLE = vendor + upProperty(this.TRANSFORM_STYLE);
                    return true;

                }
            }
        }

        return false;

    }.call(browser));

    browser.haveIEFilter = (function() {

        var element = document.createElement('div');

        if (element && element.style.filter !== undefined) {

            element.style.width = element.style.height = '100px';
            element.style.filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand')";

            return element.onfilterchange !== undefined;
        }

        return false;

    }.call(browser));

    browser.haveCanvasMask = (function() {

        return document.createElement('div').style.WebkitMaskImage !== undefined
               && typeof document.getCSSCanvasContext === 'function';

    }.call(browser));

    browser.haveSvgMask = (function() {
        var elem = document.createElement('div');
        elem.style.mask = "url(#idid)";
        console.log(elem.style.mask);
        return document.createElement('div').style.mask !== undefined;

    }.call(browser));

    return browser;
});



/*jshint
    undef:true
    curly:true
    browser: true
    laxbreak: true
    eqnull: true
    white: true
*/
/*global
    define
*/

define('renderers/dom/Composition',[

    'geom/Matrix2D',
    'geom/Matrix',
    'geom/Rectangle',
    'utils/browser',
    './Solid',
    './Text',
    '../canvas/canvasMask',
    '../svg/svgMask'
], function (

    Matrix2D,
    Matrix,
    Rectangle,
    browser,
    Solid,
    Text,
    canvasMask,
    svgMask
) {

    var m2D = new Matrix2D();

    var maskUtils = (browser.haveCanvasMask) ? canvasMask : svgMask;


    function haveActiveMasks(masks) {

        var i, l, mask;
        var y;


        if (masks == null) {
            return false;
        }

        l = masks.getLength();
        if (l) {
            for (i = 0; i < l; i += 1) {
                mask = masks.get(i);
                if (mask && mask.blending !== 'none' && mask.getLength() && mask.closed) {
                    return true;
                }
            }
        } else {
            return false;
        }
        return false;
    }

    function add(layer, pos) {

        var e       = generate.call(this, layer),
            elem    = this.element,
            children;

        if (e) {
            //TODO test DOM layer insertion properly
            if (elem.hasChildNodes() || pos < 0) {
                children = elem.childNodes();
                elem.insertBefore(e.element, children[children.length - pos - 1]);
            } else {
                elem.appendChild(e.element);
            }
            this.layers.splice(pos, 0, e);
        }
    }

    function remove(layer, pos) {

        var e = this.layers[pos];

        this.element.removeChild(e.element);
        this.layers.splice(pos, 1);
    }

    function swap(pos_1, pos_2) {

        var e = this.layers[pos_1];

        this.layers[pos_1] = this.layers[pos_2];
        this.layers[pos_2] = e;
    }

    function generate(model) {

        var element = document.createElement('layer'),
            result  = {
                model: model,
                element: element,
                mask: null,
                scale: 1,
                opacity: 1
            },
            handler = null;

        switch (model.type) {
        case 'composition':
            handler = new Composition(model);
            break;
        case 'text':
            handler = new Text(model);
            break;
        case 'solid':
            handler = new Solid(model);
            break;
        }

        if (handler && handler.element) {
            element.appendChild(handler.element);
            result.content = handler.element;
            result.handler = handler;
            result.bounds = new Rectangle(0, 0, model.width, model.height);
        }

        return result;
    }

    function Composition(model) {

        var sig  = model.layers.on,
            self = this,
            e;

        this.model    = model;
        this.element  = document.createElement('composition');
        this.collapse = null;
        this.zoom     = 0;
        this.centerX  = 0;
        this.centerY  = 0;
        this.width    = 0;
        this.height   = 0;
        this.layers   = [];

        model.layers.each(function (layer) {
            e = generate.call(self, layer);
            if (e) {
                if (self.element.firstChild) {
                    self.element.insertBefore(e.element, self.element.firstChild);
                } else {
                    self.element.appendChild(e.element);
                }
                self.layers.push(e);
            }
        });

        sig.add.add(add, this);
        sig.remove.add(remove, this);
        sig.swap.add(swap, this);

        this.matrix_     = new Matrix();
        this.matrix2D_   = new Matrix();
        this.tempMatrix_ = new Matrix();
    }

    Composition.prototype = {

        constructor: Composition,

        render: function (bounds, opt_camera, opt_parent, opt_parent_2D) {

            var layers  = this.layers,
                l       = this.layers.length,
                i       = 0,
                model   = this.model,
                style   = this.element.style,
                camera  = (opt_camera)
                          ? opt_camera
                          : model.getCamera(),
                cam_mat = camera.getCameraMatrix();

            if (this.collapse !== model.collapse) {

                this.collapse = model.collapse;

                if (this.collapse) {
                    this.element.removeAttribute('style');
                } else {
                    this.width = this.height = this.zoom = null;
                }

            }

            if (this.width !== model.width || this.height !== model.height) {

                this.width   = model.width;
                this.height  = model.height;
                style.width  = this.width.toFixed(4) + 'px';
                style.height = this.height.toFixed(4) + 'px';

                if (!this.collapse) {
                    style.clip = "rect(0px, " + this.width + "px, " + this.height + "px, 0px)";
                }
            }

            if (this.zoom !== camera.zoom) {
                this.zoom = camera.zoom;
                if (browser.have3DTransform) {
                    style[browser.PERSPECTIVE] = this.zoom.toString() + 'px';
                }
            }

            if (this.centerX !== camera.center.x || this.centerY !== camera.center.y) {

                this.centerX = camera.center.x;
                this.centerY = camera.center.y;
                if (browser.have3DTransform) {
                    style[browser.ORIGIN] = this.centerX.toString() + 'px ' +
                                            this.centerY.toString() + 'px';
                }
            }

            for (; i < l; i += 1) {

                this.renderLayer(layers[i], camera, cam_mat, opt_parent, opt_parent_2D);
            }

            if (bounds) {
                bounds.x = 0;
                bounds.y = 0;
                bounds.width = model.width;
                bounds.height = model.height;
            }

            return bounds;
        },

        renderLayer: function (layer, camera, cam_mat, opt_parent, opt_parent_2D) {

            var model   = layer.model,
                element = layer.element,
                handler = layer.handler,
                content = layer.content,
                style   = element.style,
                is3D    = model.is3D,
                mat,
                mat_2D,
                mask_canvas,
                mask_name,
                className,
                bounds;

            if (layer.visible !== model.visible) {
                layer.visible = model.visible;
                style.display = (layer.visible) ? 'block' : 'none';
            }

            if (layer.visible && handler && content) {

                mat = this.matrix_.injectMatrix(model.getMatrix());

                if (opt_parent && is3D) {
                    mat.multiply(opt_parent);
                } else if (opt_parent_2D && !is3D) {
                    mat.multiply(opt_parent_2D);
                }

                if (model.collapse !== layer.collapse) {

                    layer.collapse = model.collapse;
                    className = (model.collapse)
                                ? 'collapse'
                                : 'no_collapse';

                    if (model.type === 'composition' && layer.collapse) {
                        element.removeAttribute('style');
                    } else {
                        className += ' filter';
                    }
                    element.className = className;
                }

                if (model.type === 'composition' && model.collapse) {

                    mat_2D = mat;

                    if (is3D) {
                        mat_2D = this.matrix2D_.injectMatrix(model.getMatrix2D());
                        if (opt_parent_2D) {
                            mat_2D.multiply(opt_parent_2D);
                        }
                    }

                    handler.render(layer.bounds, camera, mat, mat_2D);

                } else if (handler && content) {

                    if (is3D) {
                        mat.multiply(cam_mat);
                    }

                    if (model.collapse) {

                        var mx = mat.m21,
                            my = mat.m22,
                            mz = mat.m23,
                            scale = (
                                (is3D)
                                ? Math.sqrt(
                                    (mx * mx) + (my * my) + (mz * mz)) *
                                    (this.zoom / (this.zoom - mat.m43)
                                )
                                : Math.sqrt((mx * mx) + (my * my))
                            ) * 1.2,
                            ratio = scale / layer.scale;

                        if (ratio > 1.3 || ratio < 0.77) {
                            layer.scale = (scale > 0.77 && scale < 1.1) ? 1 : scale;
                            this.setScale(content, scale);
                        }

                        scale = 1 / layer.scale;

                    } else if (!model.collapse && is3D && layer.scale !== 1) {

                        layer.scale = 1;
                        this.setScale(content, layer.scale);

                    }

                    layer.collapse = model.collapse;
                    bounds = handler.render(layer.bounds);


                    if (layer.scale !== 1 || layer.bounds.x || layer.bounds.y) {
                        mat.preMultiply(this.tempMatrix_.set(
                            1 / layer.scale, 0,               0, 0,
                            0,               1 / layer.scale, 0, 0,
                            0,               0,               1, 0,
                            bounds.x,        bounds.y,        0, 1
                        ));
                    }
                    bounds.multiplyScalar(layer.scale);

                    this.setMatrix(
                        element,
                        mat,
                        (model.is3D) ? camera : null,
                        model.getDepthPoint(),
                        bounds
                    );

                    style.width = bounds.width;
                    style.height = bounds.height;

                    if (haveActiveMasks(model.masks)) {

                        if (!layer.masks) {
                            layer.masks = maskUtils.set(element);
                        }
                        maskUtils.render(layer.masks, model.masks, layer.scale, bounds);

                    } else if (layer.masks) {

                        maskUtils.remove(element, layer.masks);
                        delete layer.masks;
                    }

                }

                if (layer.opacity !== model.opacity) {
                    layer.opacity = model.opacity;
                    this.setOpacity(element, model.opacity);
                }

                mat.identity();

            }
        },

        setScale: function (elem, scale) {

            if (browser.haveTransform) {

                elem.style[browser.TRANSFORM] = (scale !== 1)
                                                ? 'scale(' + scale.toFixed(4) + ',' + scale.toFixed(4) + ')'
                                                : '';

            } else if (elem.style.zoom !== undefined) {
                elem.style.zoom = scale;
            }
        },

        setMatrix: function (elem, matrix, camera, depth_point, bounds) {

            var style = elem.style,
                matrix2D, filter;

            if (browser.have3DTransform) {
                style[browser.TRANSFORM] = matrix.toCSS();
            } else {

                matrix2D = m2D;

                if (camera) {
                    matrix2D.simulate3D(matrix, camera.center, depth_point, camera.zoom);
                } else {
                    matrix2D.copy3D(matrix);
                }

                if (browser.haveTransform) {
                    style[browser.TRANSFORM] = matrix2D.toCSS();
                } else {

                    if (browser.haveIEFilter && elem.filters.length) {

                        style.width = bounds.width + 'px';
                        style.height = bounds.height + 'px';

                        this.slideMatrixBounds(matrix2D, bounds.width, bounds.height);

                        filter = elem.filters.item(0);

                        filter.M11 = matrix2D.m11;
                        filter.M12 = matrix2D.m21;
                        filter.M21 = matrix2D.m12;
                        filter.M22 = matrix2D.m22;
                    }

                    style.left = matrix2D.x.toFixed(4) + 'px';
                    style.top = matrix2D.y.toFixed(4) + 'px';
                }
            }
        },

        slideMatrixBounds: function (matrix, width, height) {

            var min = Math.min;

            matrix.x += min(
                0, min(
                    width * matrix.m11 + height * matrix.m21,
                    min(
                        width * matrix.m11,
                        height * matrix.m21
                    )
                )
            );

            matrix.y += min(
                0, min(
                    width * matrix.m12 + height * matrix.m22,
                    min(
                        width * matrix.m12,
                        height * matrix.m22
                    )
                )
            );
        },

        setOpacity: function (elem, opacity) {

            if (elem.style.opacity !== undefined) {
                elem.style.opacity = (opacity !== 1) ? opacity : "";
            } else if (browser.haveIEFilter && elem.filters.length >= 2) {
                elem.filters.item(1).Opacity = opacity * 100;
            }
        }
    };

    return Composition;
});


define('renderers/dom/Renderer',['text!style/scene.css', './Composition'], function (sceneCss, Composition) {

    function Renderer (scene, opt_camera) {

        this.scene   = new Composition(scene);
        this.camera  = opt_camera;
        this.element = document.createElement('scene');

        this.element.className = 'no_collapse';
        this.element.appendChild(this.scene.element);

        if (!document.getElementById('AEStyleSheet')){

            var cssNode = document.createElement('style');

            var cssRules = sceneCss;

            /*
            var cssRules = "scene * {" +
                    "position:absolute;" +
                    "display:block;" +
                    "top:0px;" +
                    "left:0px;" +
                    "margin:0px;" +
                    "padding:0px;" +
                    "border:0px;" +
                    "word-wrap:break-word;" +
                    "-webkit-font-smoothing:antialiased;" +
                    "transform-origin:0% 0%;" +
                    "-o-transform-origin:0% 0%;" +
                    "-khtml-transform-origin:0% 0%;" +
                    "-moz-transform-origin:0% 0%;" +
                    "-webkit-transform-origin:0% 0%;" +
                    "-ms-transform-origin:0% 0%;" +
                "}" +
                "scene layer {" +
                    "-ms-filter: \"progid:DXImageTransform.Microsoft.Matrix(M11='2.0', sizingMethod='auto expand')\"" +
                "}" +
                "scene solid {" +
                    "position: absolute" +
                "}";
            */
            cssNode.id = 'AEStyleSheet';
            cssNode.type = 'text/css';
            cssNode.rel = 'stylesheet';
            cssNode.media = 'screen';
            cssNode.title = 'AEStyleSheet';

            if (cssNode.styleSheet){
                cssNode.styleSheet.cssText = cssRules;
                //console.log(cssNode.styleSheet.cssText );
            } else {
                cssNode.innerHTML = cssRules;
            }
            document.getElementsByTagName("head")[0].appendChild(cssNode);
        }

        if (scene.color){
            this.scene.element.style.backgroundColor = scene.color;
        }
    }

    Renderer.prototype.render = function(){

        this.scene.render();
    };

    return Renderer;
});


define('main',[
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
}());