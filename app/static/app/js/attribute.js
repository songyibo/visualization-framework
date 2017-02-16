var vis = vis || {};

vis.attribute = (function(vis) {
    function Attribute(port) {
        this.port = port;
        this.type = '';
    }

    function InputAttribute(port) {
        Attribute.apply(this, arguments);
        this.type = 'input';
    }
    InputAttribute.prototype = Object.create(Attribute.prototype);

    function OutputAttribute(port) {
        Attribute.apply(this, arguments);
        this.type = 'output';
    }
    OutputAttribute.prototype = Object.create(Attribute.prototype);

    function AxisExtentInput(port) { InputAttribute.apply(this, arguments); }
    AxisExtentInput.prototype = Object.create(InputAttribute.prototype);
    AxisExtentInput.prototype.merge = function(module, data) {
        if (module.name == 'scatter-plot') {
            module.settings.dataset = data.dataset;
            if (this.port.name == 'extent-x') {
                module.settings.x = data.column;
            } else if (this.port.name == 'extent-y') {
                module.settings.y = data.column;
            }
        }
    };

    function TableDataColumnOutput(port) { OutputAttribute.apply(this, arguments); }
    TableDataColumnOutput.prototype = Object.create(OutputAttribute.prototype);
    TableDataColumnOutput.prototype.data = function(module) {
        if (module.name == 'data-source') {
            return {
                dataset: module.dataset,
                column: this.port.label
            }
        }
        return null;
    };

    function SelectionOutput(port) { OutputAttribute.apply(this, arguments); }
    SelectionOutput.prototype = Object.create(InputAttribute.prototype);
    SelectionOutput.prototype.data = function(module) {
        if (module.name == 'scatter-plot') {
            return {
                dataset: module.settings.dataset,
                selection: module.widget.svg.selection
            }
        }
    };

    function SelectionInput(port) { InputAttribute.apply(this, arguments); }
    SelectionInput.prototype = Object.create(InputAttribute.prototype);
    SelectionInput.prototype.merge = function(module, data) {
        if (module.name == 'scatter-plot') {
            if (module.settings.dataset && module.settings.dataset != data.dataset) return;
            module.settings.highlight = data.selection;
        }
    };

    var attributes = {
        extent: function(port) { return new AxisExtentInput(port); },
        column: function(port) { return new TableDataColumnOutput(port); },
        highlight: function(port) { return new SelectionInput(port); },
        brush: function(port) { return new SelectionOutput(port); }
    };

    return {
        attr: attributes
    }
})(vis);
