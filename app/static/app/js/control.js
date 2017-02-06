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

    Controller.prototype.getDataset = function(dataset) {
        return this.datasets.get(dataset) || null;
    };

    Controller.prototype.addDataset = function(dataset) {
        var $this = this;
        if (!this.datasets[dataset]) {
            return vis.network.getDataset(dataset, function(response) {
                $this.datasets.push(dataset, response);
                // Temporarily for tabular data: passing column parameter in.
                // $this._updateDataSources(response.name, response.columns.map(function(c) { return c.name; }));
            });
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

    Controller.prototype.createModule = function(name, x, y) {
        var make = vis.module.construct[name];
        if (!make) {
            console.warn('Module creation failed: ' + name);
            return;
        }

        var module = make();
        if (module) {
            module.init(this.widgetCanvas, {x: x, y: y});
            this.modules.push(module.id, module);
        }
    };

    Controller.prototype.setPanel = function(id) {
        id = id || 'vis-panel-main';
        $(this.panel).children().hide();
        $('#' + id).show();
    };

    var controller = null;

    function createController() {
        return new Controller();
    }

    (function setup() {
        $(document).ready(function() {
            var control = vis.control.instance();

            // $(document).on('contextmenu', function(e) { e.preventDefault(); });

            $(control.panel).html($('#vis-template-main').html());
            $(control.panel).children('.side-panel-container').on('click', '.side-panel-box', function(e) {
                e.stopPropagation();
                var moduleName = $(this).attr('data-module');
                if (moduleName) {
                    var $c = $('#' + control.svgCanvas);
                    var w = $c.width(), h = $c.height();
                    control.createModule(moduleName, w / 3, h / 3);
                }
            });
            $(control.panel).on('mousedown', function(e) { e.stopPropagation(); });

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
