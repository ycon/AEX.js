
define(['./Line','./QuadCurve'], function(Line, QuadCurve) {

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




