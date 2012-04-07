
var ItemController = function(item){
	
	Stack.call(this);
	
	
	this.item = item;
};

ItemController.prototype = new Stack();
ItemController.prototype.constructor = ItemController;

ItemController.prototype.render = function(ItemController){
	
	var items = this.items_,
		l = items.length;
	
	for ( var i = 0; i < l; i++) {
		items[i].render(time);
	}
	
};