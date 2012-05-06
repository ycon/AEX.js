
define(function() {

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


