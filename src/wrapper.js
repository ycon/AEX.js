
//::LICENSE:://


(function(global){

/**
* @namespace ::NAME:: namespace - Kick ass Animation Library
* @name ::NAME::
*/

var externs = /** @lends ::NAME:: */{
	/**
	* ::NAME:: Version Number
	* @type String
	* @const
	*/
	VERSION : '::VERSION_NUMBER::'
};
	
//::SOURCE:://


//exports to multiple environments
if(typeof define === 'function' && define.amd){ //AMD
	define('::NAME::', [], externs);
} else if (typeof module !== 'undefined' && module.exports){ //node
	module.exports = externs;
} else { //browser
	//use string because of Google closure compiler ADVANCED_MODE
	global['::NAME::'] = externs;
}

}(this));
