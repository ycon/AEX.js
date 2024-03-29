
/*global define FootageItem CompItem File Window*/

define ([
    'extern/json',
    './PanelBase',
    './projectExporter'
], function (
    json,
    PanelBase,
    projectExporter
) {


    function  ItemSubPanel ( panel, item, width, context ){

        PanelBase.call(this, panel, item, width, context);

        this.item = item;

        if (item instanceof FootageItem){
            this.setField("src", "source");
        } else if (item instanceof CompItem){

            this.field = this.setField("location", "Url");
            this.browse = this.group.add("button",undefined,"Browse");
            this.browse.aligment = 'left';

            var self = this;
            this.browse.onClick = function(e){
                self.setBrowse();
            };

            this.setBoolean("indent", "Indent",false);
            this.exporter = this.group.add("button",undefined,"Export");

            this.exporter.onClick = function(e){
                self.exportComp();
            };
        }
    }

    ItemSubPanel.prototype = new PanelBase();
    ItemSubPanel.prototype.constructor = ItemSubPanel;

    ItemSubPanel.prototype.setBrowse = function(){

        var f = new File();
        f = File.saveDialog("Define export location");

        this.set('location',f.absoluteURI);
        this.field.text = f.absoluteURI;

    };

    ItemSubPanel.prototype.exportComp = function(){

        var watcher = this.context.watcher;
        watcher.stop();

        var result = json.stringify(projectExporter.getProject(this.item),undefined,(this.get("indent") === true) ? "\t" : 0);

        if (this.get('location')){
            var file = new File(this.get('location'));
            file.encoding = "UTF8";
            file.open("w");
            file.write(result);
            file.close();
            watcher.start();
        } else {
            var win = new Window('dialog',"Exporting "+this.item.name, undefined, {closeButton: true});
            var txt = win.add ("edittext", [0, 0, 400, 400], "", {multiline: true});
            txt.text = result;
            txt.active = true;
            win.add("statictext", undefined, "press Esc to close window");
            win.onClose = function(){

            };
            win.show();
        }
    };

    return ItemSubPanel;
});

