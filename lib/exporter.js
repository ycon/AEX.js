
/*global define app global */

define([
    'extern/ES5',
    'exporter/LayerWatcher',
    'exporter/LayerPanel',
    'exporter/ItemSubPanel'
], function (
    ES5,
    LayerWatcher,
    LayerPanel,
    ItemSubPanel
) {

    var panel = global,
        context = {},
        watcher, layerPanel;

    function change (layer) {

        if (layerPanel) {
            layerPanel.clear();
        }

        if (layer) {
            layerPanel = new LayerPanel(panel, layer, context);
        } else {
            if (
                app
                && app.project
                && app.project.activeItem
                && app.project.activeItem.typeName === "Composition"
            ) {
                layerPanel = new ItemSubPanel(
                    panel,
                    app.project.activeItem,
                    undefined,
                    context
                );
            } else {
                layerPanel = null;
            }
        }

        panel.layout.layout(true);
        panel.layout.resize();

        context.layer = layer;
    }

    panel.layout.layout(true);
    panel.layout.resize();
    panel.onResizing = panel.onResize = function() {
        panel.layout.resize();
    };

    panel.alignment = 'left';
    panel.margins = 0;
    panel.spacing = 0;

    watcher = new LayerWatcher(panel);
    watcher.changed.add(change);
    watcher.start();

    context.watcher = watcher;
    context.panel = panel;

    return context;
});
