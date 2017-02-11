var vis = vis || {};

vis.attribute = (function(vis) {
    function Attribute() {
        this.type = '';
    }

    function InputAttribute() { this.type = 'input'; }
    InputAttribute.prototype = Object.create(Attribute.prototype);

    function OutputAttribute() { this.type = 'output'; }
    OutputAttribute.prototype = Object.create(Attribute.prototype);

    function AxisExtent(port) { this.port = port; }
    AxisExtent.prototype = Object.create(InputAttribute.prototype);
    AxisExtent.prototype.merge = function(module, data) {
        if (module.name == 'scatter-plot') {
            module.settings.dataset = data.dataset;
            if (this.port.name == 'extent-x') {
                module.settings.x = data.column;
            } else if (this.port.name == 'extent-y') {
                module.settings.y = data.column;
            }
        }
    };

    function TableDataColumn(port) { this.port = port; }
    TableDataColumn.prototype = Object.create(OutputAttribute.prototype);
    TableDataColumn.prototype.data = function(module) {
        if (module.name == 'data-source') {
            return {
                dataset: module.dataset,
                column: this.port.label
            }
        }
        return null;
    };

    var attributes = {
        extent: function(port) { return new AxisExtent(port); },
        column: function(port) { return new TableDataColumn(port); }
    };

    return {
        attr: attributes
    }
})(vis);
