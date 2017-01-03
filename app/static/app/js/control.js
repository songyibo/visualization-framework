var vis = vis || {};

vis.control = (function(vis) {

    function Controller() {
        this.widgetCanvas = 'vis-widget-canvas';
        this.svgCanvas = 'vis-svg-canvas';

        this.panel = $('.side-panel').get(0);

        this.datasets = new vis.util.OrderedDict();
        this.modules = new vis.util.OrderedDict();

        this.canvasManager = new vis.svg.CanvasManager(this.svgCanvas);
    }

    Controller.prototype.hasDataset = function(dataset) {
        return !!(this.datasets[dataset]);
    };

    Controller.prototype.getDataset = function(dataset) {
        return this.datasets[dataset] || null;
    };

    Controller.prototype.addDataset = function(dataset) {
        var $this = this;

        if (!this.datasets[dataset]) {
            vis.network.getDataset(dataset, function(response) {
                $this.datasets[dataset] = response;
                // Temporarily for tabular data: passing column parameter in.
                $this._updateDataSources(response.name, response.columns.map(function(c) { return c.name; }));
            });
        } else {
            var ds = this.datasets[dataset];
            $this._updateDataSources(ds.name, ds.columns.map(function(c) { return c.name; }));
        }
    };

    Controller.prototype.drawPendingConnection = function(x1, y1, x2, y2) {
        this.canvasManager.drawLine(x1, y1, x2, y2);
    };

    Controller.prototype.clearPendingConnection = function() {
        this.canvasManager.resetLine();
    };

    Controller.prototype.drawConnection = function(portStart, portEnd) {

    };

    Controller.prototype.setConnectSource = function(source) {
        this.connectSource = source;
    };

    Controller.prototype.setConnectTarget = function(target) {
        this.connectTarget = target;
    };

    Controller.prototype.setSourceData = function(dataset, data) {
        this.sourceDataset = dataset;
        this.sourceData = data;
    };

    Controller.prototype.connect = function() {
        var s = this.connectSource, t = this.connectTarget;
        var dataset = this.sourceDataset, data = this.sourceData;
        if (!s || !t) return;

        if (s.type == 'data') {
            t.setAxisInput(this.datasets[dataset].data.root, dataset, data);
        }
    };

    Controller.prototype._updateDataSources = function(dataset, columns) {
        // Implemented for tabular data.
        for (var i in this.modules) {
            var m = this.modules[i];
            if (m.name == 'Data Source') {
                if (m.dataset == dataset) {
                    m.setDataPort(columns);
                }
            }
        }
    };

    Controller.prototype.createModule = function(name, x, y) {
        var make = vis.module.construct[name];
        if (!make) {
            console.warn('Module creation failed: ' + name);
            return;
        }

        var module = make();
        if (module) {
            module.init(this.widgetCanvas, {x: x, y: y});
            this.modules.add(module);
        }
    };

    Controller.prototype.setPanel = function(panel) {
        var html = panel ? panel.getHtml() : $('#vis-template-main').html();
        $(this.panel).html(html);
    };

    var controller = null;

    function createController() {
        return new Controller();
    }

    (function setup() {
        $(document).ready(function() {
            var control = vis.control.instance();

            // $(document).on('contextmenu', function(e) { e.preventDefault(); });

            $('.side-panel').on('click', '.side-panel-box', function(e) {
                e.stopPropagation();
                var moduleName = $(this).attr('data-module');
                if (moduleName) {
                    var $c = $('#' + control.svgCanvas);
                    var w = $c.width(), h = $c.height();
                    control.createModule(moduleName, w / 3, h / 3);
                }
                var attrName = $(this).attr('data-attr');
                if (attrName) {
                    $(this).toggleClass('checked');
                    var elementID = $(this).closest('.side-panel-category').attr('data-element');
                    var ioType = $(this).closest('.side-panel-category').attr('data-type');
                    var moduleID = $(this).closest('.side-panel-container').attr('data-module');
                    if (elementID && moduleID) {
                        var module = control.modules.get(moduleID);
                        module.toggleAttr(elementID, attrName, ioType);
                    }
                }
            });

            $('.side-panel').on('mousedown', function(e) { e.stopPropagation(); });

            control.setPanel();
        });
    })();

    return {
        instance: function() {
            if (!controller) {
                controller = createController();
            }
            return controller;
        }
    };

})(vis);

var c = vis.control.instance();
