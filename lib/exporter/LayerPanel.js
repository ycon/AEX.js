
/*global define TextLayer AVLayer */

define(['./PanelBase', './ItemSubPanel'], function (PanelBase, ItemSubPanel) {

    function LayerPanel (panel, layer, context) {

        PanelBase.call(this,panel,layer);

        this.group.add("statictext", undefined, layer.name).alignment = 'left';

        this.setBoolean('exportable',"Exportable",true);


        if (this.layer instanceof TextLayer) {
            this.setDrop('valign','Vertical align',['top','middle','bottom'],'top');
        } else if (layer instanceof AVLayer) {
            var holder = this.group.add("panel",undefined,layer.source.name);
            holder.margins = 0;
            this.itemPanel = new ItemSubPanel(holder,layer.source,this.width-10,context);
        }

        this.setField('id','ID');
        this.setBoolean('bake',"Bake transform",false);
        this.setField('classes','Class');

    }

    LayerPanel.prototype = new PanelBase();
    LayerPanel.prototype.constructor = LayerPanel;

    return LayerPanel;
});
