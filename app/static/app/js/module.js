var vis = vis || {};

vis.module = (function(vis) {
    'use strict';

    var Module = (function() {
        /**
         * Module Base Class
         */
        function Module() {
            this.name = 'Module';

            this.x = 100; this.y = 100;
            this.w = 200; this.h = 200;
            this.wMin = 100; this.hMin = 100;
            this.wMax = 2000; this.hMax = 1000;
        }

        Module.prototype.init = function(parent, position) {
            this.parent = document.getElementById(parent) || null;
            
            if (position) {
                this.x = position.x || this.x;
                this.y = position.y || this.y;
                this.w = position.w || this.w;
                this.h = position.h || this.h;
            }

            if (!this.parent) return;

            this.widget = this._createWidget(this.parent);
            this.ports = this._createPorts(this.widget);
            this._setDragAction(this.widget);
            this._setResizeAction(this.widget);
            this._setConnectAction(this.widget);

            this.updateSize();
            this.updateComponent();
            return this;
        };

        Module.prototype.setSize = function(x, y, w, h) {
            if (x) this.x = x;
            if (y) this.y = y;
            if (w) this.w = w;
            if (h) this.h = h;
        };

        Module.prototype.updateSize = function() {
            $(this.widget).css({
                left: this.x,
                top: this.y,
                width: this.w,
                height: this.h
            });
        };

        Module.prototype.updateComponent = function() {
            this._resizePorts();
        };

        Module.prototype._createWidget = function(parent) {
            var div = $('<div>').addClass('vis-widget').appendTo(parent);
            return div[0];
        };

        Module.prototype._createPorts = function(widget) {
            return {};
        };

        Module.prototype._resizePorts = function() {};

        Module.prototype._setDragAction = function(widget) {
            var $this = this;
            vis.ui.draggable(widget, {
                start: function() {},
                drag: function() {},
                end: function() {}
            });
        };

        Module.prototype._setResizeAction = function(widget) {
            var $this = this;
            vis.ui.resizable(widget, {
                minWidth: this.wMin,
                minHeight: this.hMin,
                maxWidth: this.wMax,
                maxHeight: this.hMax,

                start: function() {},
                resize: function(pos) {
                    if (pos) {
                        $this.setSize(pos.x, pos.y, pos.w, pos.h);
                    }
                    $this.updateComponent();
                },
                end: function() {}
            });
        };

        Module.prototype._setConnectAction = function(widget) {
            var $this = this;
            vis.ui.connectable(widget, {
                start: function() {
                    // Record this source data widget.
                    vis.control.instance().setConnectSource($this);
                },
                connect: function(x, y) {
                    // TODO: Invoke to draw pending connection.
                    // vis.control.instance().updateCurve();
                },
                end: function() {
                    // Record the widget where dragging ends.
                    vis.control.instance().setConnectTarget($this);
                    // TODO: Invoke to draw final connection.
                    vis.control.instance().connect();
                }
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
            if (this.ports.data) {
                this.ports.data.setDataItems(items);
                this.ports.data.dataset = this.dataset;
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
            this.ports.data.resize({
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

    var ScatterplotModule = (function() {
        /**
         * Scatterplot Module
         */
        function ScatterplotModule() {
            Module.call(this);

            this.w = 300; this.h = 300;
            this.wMin = 200; this.hMin = 200;

            this.name = 'Scatterplot';
            this.index = ScatterplotModule.prototype.counter++;
            this.label = this.name + '_' + this.index;

            this.type = 'view';
        }
        ScatterplotModule.prototype = Object.create(Module.prototype);

        ScatterplotModule.prototype.updateComponent = function() {
            Module.prototype.updateComponent.call(this);
            this.svg.resize(this.w - 22, this.h - 60);
        };

        ScatterplotModule.prototype.setAxisInput = function(data, dataset, key) {
            if (this.dataset != dataset) {
                this.dataset = dataset;
                this.xAxis = '';
            }

            this.data = data;

            if (this.yAxis) {
                this.xAxis = this.yAxis;
                this.yAxis = key;
            } else if (this.xAxis) {
                this.yAxis = key;
            } else {
                this.xAxis = key;
                this.yAxis = '';
            }

            if (this.xAxis && this.yAxis) {
                this.svg.render(data, {
                    x: this.xAxis,
                    y: this.yAxis,
                    color: null
                });
            }
        };

        ScatterplotModule.prototype.counter = 1;

        ScatterplotModule.prototype._createWidget = function(parent) {
            var widget = Module.prototype._createWidget.apply(this, arguments);

            var labelWrapper = $('<div>').addClass('vis-widget-label-wrapper').appendTo(widget);
            var label = $('<div>').addClass('vis-widget-label').text(this.label).appendTo(labelWrapper);
            var container = $('<div>', {id: 'vis-widget-scatterplot-' + this.index, class: 'vis-widget-container'}).appendTo(widget);
            this.svg = new vis.svg.Scatterplot(container.attr('id'));

            return widget;
        };

        ScatterplotModule.prototype._createPorts = function(widget) {
            var container = $('<div>').addClass('vis-port-container');
            $(widget).append(container);
            this.portContainer = container[0];

            var p1 = new vis.port.AxisInput(this.portContainer);
            var p2 = new vis.port.ShapeInput(this.portContainer);
            var p3 = new vis.port.SelectionInput(this.portContainer);
            var p4 = new vis.port.SelectionOutput(this.portContainer);

            return { axis: p1, shape: p2, sin: p3, sout: p4 };
        };

        ScatterplotModule.prototype._resizePorts = function() {
            this.ports.axis.resize({x: 0, y: 0, w: this.w, h: this.h});
            this.ports.shape.resize({x: 0, y: 0, w: this.w, h: this.h});
            this.ports.sin.resize({x: 0, y: 0, w: this.w, h: this.h});
            this.ports.sout.resize({x: 0, y: 0, w: this.w, h: this.h});
        };

        return ScatterplotModule;
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
        }
        CustomViewModule.prototype = Object.create(Module.prototype);

        CustomViewModule.prototype.counter = 1;

        CustomViewModule.prototype._createWidget = function(parent) {
            var widget = Module.prototype._createWidget.apply(this, arguments);

            var labelWrapper = $('<div>').addClass('vis-widget-label-wrapper').appendTo(widget);
            var label = $('<div>').addClass('vis-widget-label').text(this.label).appendTo(labelWrapper);
            var container = $('<div>', {id: 'vis-widget-view-' + this.index, class: 'vis-widget-container'}).appendTo(widget);
            this.svg = new vis.svg.CustomCanvas(container.attr('id'));

            return widget;
        };

        CustomViewModule.prototype.updateComponent = function() {
            Module.prototype.updateComponent.call(this);
            this.svg.resize(this.w - 22, this.h - 55);
        };

        return CustomViewModule;
    })();

    return {
        DataSource: DataSourceModule,
        Scatterplot: ScatterplotModule,
        CustomView: CustomViewModule
    };
    
})(vis);
