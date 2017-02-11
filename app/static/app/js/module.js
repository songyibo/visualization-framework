var vis = vis || {};

vis.module = (function(vis) {
    'use strict';

    var Module = (function() {
        /**
         * Module Base Class
         */
        function Module() {
            this.name = 'module';
            this.displayName = 'Module';
            this.id = '';

            this.widget = null;
            this.panel = null;
            this.ports = null;

            this.conf = {};
            this.settings = {};
        }

        Module.prototype.init = function(canvasID, position) {
            if (this.widget) {
                this.widget.init(canvasID, position);
                this.widget.update();
            }
            if (this.panel) {
                this.panel.init(this.conf.elements);
            }
            if (this.ports) {
                this.ports.init(this.widget.element, this.conf.elements);
            }
            return this;
        };

        Module.prototype.select = function() {
            vis.control.instance().setPanel(this.panelID);
        };

        Module.prototype.unselect = function() {
            vis.control.instance().setPanel();
        };

        Module.prototype.resize = function() {
            this.ports.resize();
        };

        Module.prototype.move = function() {
            this.ports.move();
        };

        Module.prototype.update = function() {
            // To Override here.
        };

        return Module;
    })();

    var DataSourceModule = (function() {
        /**
         * Data Source Module
         */
        function DataSourceModule(dataset) {
            Module.call(this);

            this.name = 'data-source';
            this.displayName = 'Data Source';

            this.index = DataSourceModule.prototype.counter++;
            this.id = this.name + '-' + this.index;
            this.label = this.displayName + ' ' + this.index;
            this.panelID = 'vis-panel-' + this.id;

            this.widget = new vis.widget.DataSourceWidget(this);
            this.panel = new vis.panel.Panel(this);
            this.ports = new vis.port.PortManager(this);

            this.conf = {
                module: this.id,
                panel: this.panelID,
                elements: []
            };
        }
        DataSourceModule.prototype = Object.create(Module.prototype);
        DataSourceModule.prototype.counter = 1;

        DataSourceModule.prototype.setDataset = function(dataset) {
            if (this.dataset != dataset) {
                this.dataset = dataset;
                var $this = this;
                $.when(
                    vis.control.instance().addDataset(dataset)
                ).done(function() {
                    $this.updateData();
                    $this.resetPorts();
                });
            }
        };

        DataSourceModule.prototype.updateData = function() {
            var data = vis.control.instance().getDataset(this.dataset);
            this.ports.clear();
            var attributes = [];
            for (var i in data.columns) {
                var c = data.columns[i];
                attributes.push({
                    attribute: 'column', name: c.name, text: c.name, active: false
                });
            }
            this.conf.elements = [
                {element: 'table', type: 'output', name: 'table', text: 'Table Data', attributes: attributes}
            ];
            this.panel.reset();
        };

        DataSourceModule.prototype.resetPorts = function() {
            this.ports.reset(this.conf.elements);
        };

        return DataSourceModule;
    })();

    var ScatterPlotModule = (function() {
        /**
         * ScatterPlot Module
         */
        function ScatterPlotModule() {
            Module.call(this);

            this.name = 'scatter-plot';
            this.displayName = 'Scatter Plot';

            this.index = ScatterPlotModule.prototype.counter++;
            this.id = this.name + '-' + this.index;
            this.label = this.displayName + ' ' + this.index;
            this.panelID = 'vis-panel-' + this.id;

            this.widget = new vis.widget.SvgWidget(this);
            this.panel = new vis.panel.Panel(this);
            this.ports = new vis.port.PortManager(this);

            this.conf = {
                module: this.id,
                panel: this.panelID,
                elements: [
                    {
                        element: 'axis', type: 'input', name: 'axis-x', text: 'Axis X',
                        attributes: [
                            {attribute: 'extent', name: 'extent-x', text: 'Extent', active: true}
                        ]
                    },
                    {
                        element: 'axis', type: 'input', name: 'axis-y', text: 'Axis Y',
                        attributes: [
                            {attribute: 'extent', name: 'extent-y', text: 'Extent', active: true}
                        ]
                    },
                    {
                        element: 'circle', type: 'input', name: 'circle', text: 'Circle',
                        attributes: [
                            {attribute: 'color', name: 'color', text: 'Color', active: true},
                            {attribute: 'size', name: 'size', text: 'Size', active: false}
                        ]
                    },
                    {
                        element: 'selection', type: 'output', name: 'selection', text: 'Mouse Select',
                        attributes: [
                            {attribute: 'brush', name: 'brush', text: 'Brush', active: false}
                        ]
                    }
                ]
            };
        }
        ScatterPlotModule.prototype = Object.create(Module.prototype);
        ScatterPlotModule.prototype.counter = 1;

        ScatterPlotModule.prototype.update = function() {
            var dataset = this.settings.dataset;
            var data = vis.control.instance().getDataset(dataset).data.root;
            this.widget.svg.render(data, this.settings);
        };

        return ScatterPlotModule;
    })();

    var CustomViewModule = (function() {
        function CustomViewModule() {
            Module.call(this);

            this.w = 300; this.h = 300;
            this.hMin = 200; this.wMin = 200;

            this.name = 'Visualization';
            this.index = CustomViewModule.prototype.counter++;
            this.label = this.name + '_' + this.index;

            this.type = 'view';
            this.elements = [];
        }
        CustomViewModule.prototype = Object.create(Module.prototype);

        CustomViewModule.prototype.counter = 1;

        CustomViewModule.prototype.init = function(parent, position) {
            Module.prototype.init.apply(this, arguments);
            this._setDropAction(this.widget);

            var $this = this;
            $(this.button).on('click', function(e) {
                e.stopPropagation();
                $this.panel.toggle();
            });
            $(this.button).on('mousedown', function(e) { e.stopPropagation(); });
            return this;
        };

        CustomViewModule.prototype.addElement = function(name) {
            var make = vis.element.construct[name];
            if (!make) {
                console.warn('Element create failed: ' + name);
                return;
            }

            var element = make();
            if (element) {
                var idx = this.elements.length;
                var id = this.label + '_' + element.name + '_' + idx;

                this.elements.push({
                    id: id,
                    element: element
                });

                this.panel.addTab({
                    id: id,
                    title: element.name + '_' + idx,
                    content: element.interfaceBlocks()
                });
            }
        };

        CustomViewModule.prototype.updateComponents = function() {
            Module.prototype.updateComponents.call(this);
            this.panel.resize(-1, -105, this.w, 100);
            this.svg.resize(this.w - 22, this.h - 57);
        };

        CustomViewModule.prototype._createWidget = function(parent) {
            var widget = Module.prototype._createWidget.apply(this, arguments);

            var labelWrapper = $('<div>').addClass('vis-widget-label-wrapper').appendTo(widget);
            var label = $('<div>').addClass('vis-widget-label').text(this.label).appendTo(labelWrapper);
            var container = $('<div>', {id: 'vis-widget-view-' + this.index, class: 'vis-widget-container'}).appendTo(widget);
            
            var button = $('<span>').addClass('glyphicon glyphicon-cog').addClass('vis-widget-button').appendTo(labelWrapper);
            this.button = button[0];

            this.panel = new vis.ui.SubPanel(widget);
            this.svg = new vis.svg.CustomCanvas(container.attr('id'));

            return widget;
        };

        CustomViewModule.prototype._setDropAction = function(widget) {
            var $this = this;
            vis.ui.droppable(widget, {
                drop: function(element) {
                    if (element) {
                        $this.addElement(element);
                    }
                }
            });
        };

        return CustomViewModule;
    })();

    var construct = {
        'data-source': function() { return new DataSourceModule(); },
        'scatter-plot': function() { return new ScatterPlotModule(); },

        'custom-view': function() { return new CustomViewModule(); }
    };
 
    return {
        DataSource: DataSourceModule,
        ScatterPlot: ScatterPlotModule,
        CustomView: CustomViewModule,

        construct: construct
    };
    
})(vis);
