var LayerWatcher = function(panel){
	
	this.panel = panel;
	
	this.changed = new panel.signals.Signal();
	
	
	this.flash = panel.add("flashplayer", [0,0,1,1]);
	this.flash.loadMovie(File("AELoop.swf"));
	
	this.oldLayer = null;
	
	var self = this;
	this.flash.tick = function(){self.tick();};
	
};


LayerWatcher.prototype = {
		
		start : function(){
			
			this.flash.invokePlayerFunction("startLoop");
			
		},
		
		stop : function(){
			
			this.flash.invokePlayerFunction("stopLoop");
			
		},
		
		tick : function(){
			
			var layer = null;
			
			if ( app && app.project && app.project.activeItem ){
				
				var item = app.project.activeItem;
				
				if ( item.typeName == "Composition"){
					
					if (item.selectedLayers.length){
						
						layer = item.selectedLayers[0];
						this.pauseCheck = false;
						
					} else if (item !== this.oldItem) {
						
						this.pauseCheck = false;
						
					}
					
					
					
					this.oldItem = item;
				}
				
			}

			try{

			    if ( layer && this.oldLayer !== layer ){
			    	
			    	this.changed.dispatch( layer );
					
			    	this.oldLayer = layer;
			    		
			    } else if ( !layer  && !this.pauseCheck){
			    	
			    	this.changed.dispatch(null);
			    	
			    	this.oldLayer = null;
			    	this.pauseCheck = true;
			    }
			  
			    
			} catch(e){
				
				writeLn(e);
				this.stop();
				
			}
		}
	
};