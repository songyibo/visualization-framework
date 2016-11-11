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

    Controller.prototype.createModule = function(name, x, y) {
        var module = null, widget = null;

        switch (name) {
            case 'DataSource':
                module = new vis.module.DataSource();
                widget = new vis.widget.DataSource().init(this.widgetCanvas, {x, y});
                break;
            case 'DataTable':
                break;
            case 'Scatterplot':
                module = new vis.module.Scatterplot();
                widget = new vis.widget.Scatterplot().init(this.widgetCanvas, {x, y});
                break;
            case 'ParallelCoordinates':
                break;
            case 'BarChart':
                break;
            case 'LineChart':
                break;
            case 'PieChart':
                break;
            case 'NetworkDiagram':
                break;
            default:
                console.warning('No such module.');
        }

        if (module) {
            module.widget = widget;
            this.modules.push(module);
        }
    };

    Controller.prototype._updateDataSources = function(dataset) {

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
c.createModule('DataSource', 200, 200);
c.createModule('Scatterplot', 500, 100);
