/** constructor */

var Text = function(){

	Layer.call(this);
	
	this.text = "";
	this.textPosition = new Vector();
	this.width = 150;
	this.height = 150;
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