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
            this.templateName = 'panel';
            this.id = '';

            this.widget = null;
            this.panel = null;

            this.elements = null;
            this.ports = null;

            this.conf = {};
        }

        Module.prototype.init = function(canvasID, position) {
            if (this.widget) {
                this.widget.init(canvasID, position);
                this.widget.update();
            }
            if (this.elements) {
                this.elements.init(this.conf.elements);
                if (this.panel) {
                    this.panel.load(this.templateName);
                    var context = {
                        id: 'vis-panel-' + this.id,
                        module: this.id,
                        custom: false,
                        elements: this.elements.panelConfig()
                    };
                    this.panel.render(context);
                }
                if (this.ports) {
                    this.ports.init(this.widget.element);
                    var ports = this.elements.portConfig();
                    for (var i in ports) {
                        this.ports.add(ports[i]);
                    }
                    this.ports.resize();
                }
            }
            return this;
        };

        Module.prototype.select = function() {
            vis.control.instance().setPanel(this.panel);
        };

        Module.prototype.unselect = function() {
            vis.control.instance().setPanel();
        };

        Module.prototype.resize = function() {
            this.ports.resize();
        };

        Module.prototype.toggleAttr = function(elementID, attrName, type) {
            this.elements.toggleAttr(elementID, attrName);
            this.ports.togglePort(elementID, attrName, type);
            this.ports.resize();
            this.panel.render({
                id: 'vis-panel-' + this.id,
                module: this.id,
                custom: false,
                elements: this.elements.panelConfig()
            });
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

            this.widget = new vis.widget.DataSourceWidget(this);
            this.panel = new vis.panel.Panel(this);

            this.elements = new vis.element.ElementManager(this);
            this.ports = new vis.port.PortManager(this);

            this.conf = {
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
                    var data = vis.control.instance().getDataset(dataset);
                    $this.elements.clear();
                    $this.ports.clear();
                    var attrs = [];
                    for (var i in data.columns) {
                        attrs.push({
                            name: 'data', type: 'input', text: data.columns[i].name
                        });
                    }
                    $this.elements.init([
                        {element: 'table', type: 'input', name: 'table', text: 'Table Data', attrs: attrs}
                    ]);
                });
            }
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

            this.widget = new vis.widget.SvgWidget(this);
            this.panel = new vis.panel.Panel(this);

            this.elements = new vis.element.ElementManager(this);
            this.ports = new vis.port.PortManager(this);

            this.conf = {
                elements: [
                    {element: 'axis', type: 'input', name: 'axis-x', text: 'Axis X', attrs: ['extent']},
                    {element: 'axis', type: 'input', name: 'axis-y', text: 'Axis Y', attrs: ['extent']},
                    {element: 'circle', type: 'input', attrs: ['color', 'size']}
                ]
            };
        }
        ScatterPlotModule.prototype = Object.create(Module.prototype);
        ScatterPlotModule.prototype.counter = 1;
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
