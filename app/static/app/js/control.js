var vis = vis || {};

vis.control = (function(vis) {

    function Controller() {
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

var w1 = new vis.widget.DataSource().init('vis-widget-canvas', {x: 200, y: 200});
var w2 = new vis.widget.Scatterplot().init('vis-widget-canvas', {x: 500, y: 100});
