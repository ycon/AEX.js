var LayerSetting = function(panel){
	
	this.panel = panel;
	
	//this.panel.alignChildren = "left";
	
	this.panel.add("panel", [25,15,355,130], "Messages");
	
	var btn = this.panel.add('button', undefined,"toto");
	
	btn.size = [200, 100];
	
	//this.watcher = new LayerWatcher(panel);
	
	//this.watcher.changed.add(this.change,this);
	//this.watcher.start();
};

LayerSetting.prototype = {
		change : function(layer){
			this.layer = layer;
			writeLn(layer);
		},

		set : function(key,val){
			if (this.layer.comment == "" || !layer.comment){
				
				this.layer.comment = "{}";
				
			}
			
			var obj = JSON.parse(this.layer.comment);
			
			obj[key] = val;
			
			this.layer.comment = JSON.stringify(obj);
			
			
		},
		
		get : function(key){
			
			if (this.layer.comment == "" || !this.layer.comment){
				
				this.layer.comment = "{}";
				
			}
			
			return JSON.parse(this.layer.comment)[key];
			
		}
		
		
};




var base = new LayerSetting(this);