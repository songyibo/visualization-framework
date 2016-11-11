var vis = vis || {};

vis.module = (function(vis) {
    
    function Module() {
        this.name = 'Module';
        this.widget = null;
        this.ports = [];
    }

    function DataSourceModule() {
        
    }
    DataSourceModule.prototype = Object.create(Module.prototype);

    DataSourceModule.prototype.getDataset = function() {
        if (this.widget) {
            return this.widget.dataset || '';
        } else {
            return '';
        }
    }

    function ScatterplotModule() {
        
    }
    ScatterplotModule.prototype = Object.create(Module.prototype);

    return {
        DataSource: DataSourceModule,
        Scatterplot: ScatterplotModule
    };

})(vis);
