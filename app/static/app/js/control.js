var vis = vis || {};

vis.control = (function(vis) {

    function Controller() {
        this.widgetCanvas = 'vis-widget-canvas';
        this.svgCanvas = 'vis-svg-canvas';

        this.datasets = {};
        this.modules = [];
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
            vis.network.getDataset(dataset, function(dataset) {
                $this.datasets[dataset] = dataset;
                // Temporarily for tabular data: passing column parameter in.
                $this._updateDataSources(dataset.name, dataset.columns.map(function(c) { return c.name; }));
            });
        } else {
            var ds = this.datasets[dataset];
            $this._updateDataSources(ds.name, ds.columns.map(function(c) { return c.name; }));
        }
    };

    Controller.prototype.setConnectSource = function(source) {
        this.connectSource = source;
    };

    Controller.prototype.setConnectTarget = function(target) {
        this.connectTarget = target;
    };

    Controller.prototype.setSourceData = function(data) {
        this.sourceData = data;
    }

    Controller.prototype.connect = function() {
        var s = this.connectSource, t = this.connectTarget;
        if (!s || !t) return;

        console.log(s, t, this.sourceData);
    };

    Controller.prototype._updateDataSources = function(dataset, columns) {
        // Implemented for tabular data.
        for (i in this.modules) {
            var m = this.modules[i];
            if (m.name == 'Data Source') {
                if (m.dataset == dataset) {
                    m.setDataPort(columns);
                }
            }
        }
    };

    Controller.prototype._moduleMaker = {
        DataSource: function() { return new vis.module.DataSource(); },
        Scatterplot: function() { return new vis.module.Scatterplot(); },
        DataTable: function() { return new vis.module.DataTable(); },
        ParallelCoordinates: function() { return new vis.module.ParallelCoordinates(); },
        BarChart: function() { return new vis.module.BarChart(); },
        LineChart: function() { return new vis.module.LineChart(); },
        PieChart: function() { return new vis.module.PieChart(); },
        NetworkDiagram: function() { return new vis.module.NetworkDiagram(); }
    };

    Controller.prototype.createModule = function(name, x, y) {
        var make = this._moduleMaker[name];
        if (!make) {
            console.warn('Module create failed: ' + name);
            return;
        }

        var module = make();
        if (module) {
            module.init(this.widgetCanvas, {x, y});
            this.modules.push(module);
        }
    };

    var controller = null;

    function createController() {
        return new Controller();
    }

    (function setup() {
        $(document).ready(function() {
            $(document).on('contextmenu', function(e) { e.preventDefault(); });
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
c.createModule('DataSource', 400, 50);
c.createModule('Scatterplot', 150, 250);
c.createModule('Scatterplot', 550, 250);
