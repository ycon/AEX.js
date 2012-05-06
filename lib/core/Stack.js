
define(['extern/signals'], function (signals) {

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
