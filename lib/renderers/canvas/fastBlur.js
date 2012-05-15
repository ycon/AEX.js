
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

define(function () {

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
