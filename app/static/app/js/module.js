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

            this.conf = {input: [], output: []};
        }

        Module.prototype.init = function(canvasID, position) {
            if (this.widget) {
                this.widget.init(canvasID, position);
                this.widget.update();
            }
            if (this.elements) {
                this.elements.init(this.conf);
                if (this.panel) {
                    this.panel.load(this.templateName);
                    var context = {
                        id: 'vis-panel-' + this.id,
                        custom: false,
                        elements: this.elements.format()
                    };
                    this.panel.render(context);
                }
                if (this.ports) {
                    this.ports.init(this.widget.element);
                    var array = this.elements.enables();
                    for (var i in array) {
                        this.ports.addPort(array[i]);
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

        return Module;
    })();

    var DataSourceModule = (function() {
        /**
         * Data Source Module
         */
        function DataSourceModule(dataset) {
            Module.call(this);

            this.w = 180; this.h = 100;
            this.wMin = 150; this.hMin = 80;
            this.hMax = 120;

            this.name = 'Data Source';
            this.index = DataSourceModule.prototype.counter++;
            this.label = this.name + '_' + this.index;

            this.type = 'data';
            this.dataset = dataset || '';
        }
        DataSourceModule.prototype = Object.create(Module.prototype);

        DataSourceModule.prototype.counter = 1;

        DataSourceModule.prototype.setDataPort = function(items) {
            if (this.portManager.data) {
                this.portManager.data.setDataItems(items);
                this.portManager.data.dataset = this.dataset;
            }
        };

        DataSourceModule.prototype._createWidget = function(parent) {
            var widget = Module.prototype._createWidget.apply(this, arguments);

            var labelWrapper = $('<div>').addClass('vis-widget-label-wrapper').appendTo(widget);
            var label = $('<div>').addClass('vis-widget-label').text(this.label).appendTo(labelWrapper);

            var selectWrapper = $('<div>').addClass('vis-widget-select-wrapper').appendTo(widget);
            var select = $('<div>', {id: 'vis-widget-datasource-' + this.index, class: 'vis-widget-select'}).appendTo(selectWrapper);

            var $this = this;
            // Set callback when user selects a new dataset.
            // When new dataset selected, try to add the dataset to global controller.
            var element = new vis.html.Dropdown(select.attr('id'), function(dataset) {
                $this.dataset = dataset;
                vis.control.instance().addDataset(dataset);
            });

            // Get available datasets from server.
            // Add names to select widget when datasets return.
            vis.network.getDatasets(function(datasets) {
                for (var i in datasets) {
                    element.addMenuItem(datasets[i]);
                }
            });

            this.select = element;
            return widget;
        };

        DataSourceModule.prototype._createPorts = function(widget) {
            var p = new vis.port.DataPort(widget);
            return { data: p };
        };

        DataSourceModule.prototype._resizePorts = function() {
            // The port needs to calculate width by itself, and needs parent width as reference.
            this.portManager.data.resize({
                x: this.w,
                y: this.h
            });
        };

        DataSourceModule.prototype._setConnectAction = function(widget) {
            var $this = this;
            vis.ui.connectable(widget, {
                start: function() {
                    // Record this source data widget.
                    vis.control.instance().setConnectSource($this);
                }
            });
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
                input: [
                    {element: 'axis', name: 'axis-x', text: 'Axis X', attrs: ['extent']},
                    {element: 'axis', name: 'axis-y', text: 'Axis Y', attrs: ['extent']},
                    {element: 'circle', attrs: ['color', 'size']}
                ],
                output: []
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
        
        'custom-view': function() { return new CustomViewModule(); },
        'scatter-plot': function() { return new ScatterPlotModule(); }
    };
 
    return {
        DataSource: DataSourceModule,
        ScatterPlot: ScatterPlotModule,
        CustomView: CustomViewModule,

        construct: construct
    };
    
})(vis);
