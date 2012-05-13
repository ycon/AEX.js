
/*global define */

define([
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


