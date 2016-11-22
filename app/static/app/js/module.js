var vis = vis || {};

vis.module = (function(vis) {
    
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

        this._setMoveAction(this.widget);
        this._setConnectAction(this.widget);
        this._setResizeAction(this.widget);
        this.resize();

        return this;
    };

    Module.prototype.resize = function(w, h) {
        $(this.widget).css({
            left: this.x,
            top: this.y,
            width: this.w,
            height: this.h
        });

        this._resizePorts();
    };

    Module.prototype._createWidget = function(parent) {
        var div = $('<div>').addClass('vis-widget vis-widget-allow-move').appendTo(parent);
        return div[0];
    };

    Module.prototype._createPorts = function(widget) {
        return {};
    };

    Module.prototype._resizePorts = function() {
        return;
    };

    Module.prototype._setMoveAction = function(widget) {
        var $this = this;

        $(widget).on('mousedown', function(e) {
            if (e.which == 1) {
                if (!$(e.target).hasClass('vis-widget-allow-move')) return;
                e.preventDefault();

                var X0 = e.pageX, Y0 = e.pageY;
                var x0 = $this.x, y0 = $this.y;

                $(widget).addClass('vis-widget-moving');
                $(document).on('mousemove.vis-widget-moving', function(e) {
                    dx = e.pageX - X0;
                    dy = e.pageY - Y0;

                    $this.x = x0 + dx;
                    $this.y = y0 + dy;

                    $this.resize();
                });
            }
        });

        $(widget).on('mouseup', function(e) {
            if (e.which == 1) {
                $(widget).removeClass('vis-widget-moving');
                $(document).off('mousemove.vis-widget-moving');
            }
        });
    };

    Module.prototype._setConnectAction = function(widget) {
        var $this = this;

        var isSource = false;

        $(widget).on('mousedown', function(e) {
            if (e.which == 3) {
                e.preventDefault();

                // Record the widget where dragging starts.
                vis.control.instance().setConnectSource($this);

                var offset = $(this).offset();
                var X0 = offset.left, Y0 = offset.top;

                $(widget).addClass('vis-widget-dragging');
                isSource = true;
                
                // Capture mouse event outside the widget.
                $(document).on('mousemove.vis-widget-dragging', function(e) {
                    var dx = e.pageX - X0, dy = e.pageY - Y0;
                    console.log(dx, dy);
                    // TODO: Invoke to draw pending connection.
                    // vis.control.instance().updateCurve();
                });

                // Exit 1. Self. Source.
                $(document).on('mouseup.vis-widget-dragging', function(e) {
                    $(document).off('mousemove.vis-widget-dragging');
                    $(document).off('mouseup.vis-widget-dragging');

                    isSource = false;
                    $(widget).removeClass('vis-widget-dragging');
                });
            }
        });

        $(widget).on('mousemove', function(e) {
            if (e.which == 3) {
                e.stopPropagation();
                console.log('move on widget');
            }
        });
        
        // Exit 2. Target.
        $(widget).on('mouseup', function(e) {
            if (e.which == 3) {
                if (isSource) {
                    isSource = false;
                    return;
                }
                // Record the widget where dragging ends.
                vis.control.instance().setConnectTarget($this);
                // TODO: Invoke to draw final connection.
                vis.control.instance().connect();

                $(widget).removeClass('vis-widget-dragging');
            }
        });

        $(widget).on('mouseenter', function(e) {
            if (e.which == 3) {
                if (!isSource) {
                    $(widget).addClass('vis-widget-dragging');
                }
            }
        });

        $(widget).on('mouseleave', function(e) {
            if (e.which == 3) {
                if (!isSource) {
                    $(widget).removeClass('vis-widget-dragging');
                }
            }
        });
    };

    Module.prototype._setResizeAction = function(widget) {
        var $this = this;

        this._resizeFunc = {
            n: function(dx, dy, o) { this.y = o.y0 + dy; this.h = o.h0 - dy; },
            e: function(dx, dy, o) { this.w = o.w0 + dx; },
            s: function(dx, dy, o) { this.h = o.h0 + dy; },
            w: function(dx, dy, o) { this.x = o.x0 + dx; this.w = o.w0 - dx; },
            se: function(dx, dy, o) { this._resizeFunc.s.apply(this, arguments); this._resizeFunc.e.apply(this, arguments); },
            sw: function(dx, dy, o) { this._resizeFunc.s.apply(this, arguments); this._resizeFunc.w.apply(this, arguments); },
            ne: function(dx, dy, o) { this._resizeFunc.n.apply(this, arguments); this._resizeFunc.e.apply(this, arguments); },
            nw: function(dx, dy, o) { this._resizeFunc.n.apply(this, arguments); this._resizeFunc.w.apply(this, arguments); }
        };

        this.handles = [];
        var handles = ['n', 'e', 's', 'w', 'se', 'sw', 'ne', 'nw'];
        for (i in handles) {
            var h = $('<div>').addClass('vis-widget-resize-handle').addClass('vis-widget-resize-' + handles[i]);
            $(widget).append(h);
            this.handles.push(h[0]);
        }

        $(this.handles).on('mousedown', function(e) {
            if (e.which == 1) {
                e.preventDefault(); // Prevent DOM selection behavior.
                e.stopPropagation(); // Prevent move action on parent div.

                var X0 = e.pageX, Y0 = e.pageY;
                var x0 = $this.x, y0 = $this.y;
                var w0 = $this.w, h0 = $this.h;

                var dir = this.className.match(/vis-widget-resize-(se|sw|ne|nw|n|e|s|w)/i)[1];
                var func = $this._resizeFunc[dir];
                
                $(widget).addClass('vis-widget-resizing');
                $(document).on('mousemove.vis-widget-resizing', function(e) {
                    dx = e.pageX - X0;
                    dy = e.pageY - Y0;

                    func.call($this, dx, dy, {x0, y0, w0, h0});

                    $this.w = ($this.w < $this.wMin) ? $this.wMin : $this.w;
                    $this.h = ($this.h < $this.hMin) ? $this.hMin : $this.h;
                    $this.w = ($this.w > $this.wMax) ? $this.wMax : $this.w;
                    $this.h = ($this.h > $this.hMax) ? $this.hMax : $this.h;

                    $this.resize();
                });
            }
        });

        // This event cannot be bound at the handle elements.
        // If new size goes beyond min or max size, the mouse cursor can be off the handles.
        $(document).on('mouseup', function(e) {
            if (e.which == 1) {
                $(widget).removeClass('vis-widget-resizing');
                $(document).off('mousemove.vis-widget-resizing');
            }
        });
    };

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

    DataSourceModule.prototype.setDataPort = function(items) {
        if (this.ports.data) {
            this.ports.data.setDataItems(items);
            this.ports.data.dataset = this.dataset;
        }
    };

    DataSourceModule.prototype.counter = 1;

    DataSourceModule.prototype._createWidget = function(parent) {
        var widget = Module.prototype._createWidget.apply(this, arguments)

        var labelWrapper = $('<div>').addClass('vis-widget-label-wrapper vis-widget-allow-move').appendTo(widget);
        var label = $('<div>').addClass('vis-widget-label').text(this.label).appendTo(labelWrapper);

        var selectWrapper = $('<div>').addClass('vis-widget-select-wrapper vis-widget-allow-move').appendTo(widget);
        var select = $('<div>', {id: 'vis-widget-datasource-' + this.index, class: 'vis-widget-select'}).appendTo(selectWrapper);

        var $this = this;
        // Set callback when user selects a new dataset.
        // When new dataset selected, try to add the dataset to global controller.
        var element = new vis.html.Dropdown(select.attr('id'), function(dataset) {
            $this.dataset = dataset;
            vis.control.instance().addDataset(dataset);
        });
        
        // Get avaliable datasets from server.
        // Add names to select widget when datasets return.
        vis.network.getDatasets(function(datasets) {
            for (i in datasets) {
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

        $(widget).on('mousedown', function(e) {
            if (e.which == 3) {
                e.preventDefault();
                // Record the widget where dragging starts.
                vis.control.instance().setConnectSource($this);
            }
        });
    };

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

    ScatterplotModule.prototype.resize = function() {
        Module.prototype.resize.call(this);
        this.svg.resize(this.w - 20, this.h - 60);
        $(this.portContainer).css({top: 0, left: 0, width: this.w + 'px', height: this.h + 'px'});
        $(this.portContainer).css({display: 'none'});
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

        var labelWrapper = $('<div>').addClass('vis-widget-label-wrapper vis-widget-allow-move').appendTo(widget);
        var label = $('<div>').addClass('vis-widget-label').text(this.label).appendTo(labelWrapper);
        var container = $('<div>', {id: 'vis-widget-scatterplot-' + this.index, class: 'vis-widget-container'}).appendTo(widget);
        this.svg = new vis.svg.Scatterplot(container.attr('id'));

        return widget;
    };

    ScatterplotModule.prototype._createPorts = function(widget) {
        this.portSizeLarge = 40;
        this.portSizeSmall = 20;

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

    return {
        DataSource: DataSourceModule,
        Scatterplot: ScatterplotModule
    };
    
})(vis);
