var vis = vis || {};

vis.control = (function(vis) {

    function Controller() {
        this.widgetCanvas = 'vis-widget-canvas';
        this.svgCanvas = 'vis-svg-canvas';

        this.datasets = {};
        this.modules = [];
    }

    Controller.prototype.addDataset = function(dataset) {
        var $this = this;

        if (!this.datasets[dataset]) {
            vis.network.getDataset(dataset, function(data) {
                $this.datasets[dataset] = data;
                $this._updateDataSources(dataset);
            });
        }
    };

    Controller.prototype._updateDataSources = function(dataset) {
        for (i in this.modules) {
            var m = this.modules[i];
            if (m.name == 'Data Source') {
                if (m.dataset == dataset) {
                    m.setDataPort(['mpg', 'displacement', 'cylinder', 'name']);
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
c.createModule('Scatterplot', 340, 250);
