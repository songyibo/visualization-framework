var vis = vis || {};

vis.port = (function(vis) {

    var Port = (function() {
        function Port(module, options) {
            this.module = module;
            this.widget = null;

            this.options = options || {};
            this.id = options.id;
            this.type = options.type || 'unknown';
            this.label = options.text || 'label';

            this.element = options.element;
            this.attribute = options.attribute;
            this.name = options.attributeName;

            this.data = null;

            this.connect = new vis.util.OrderedDict();
        }

        Port.prototype.init = function(container) {
            this.widget = new vis.port.Widget(this);
            this.widget.init(container);
        };

        Port.prototype.remove = function() {
            vis.control.instance().connections.removePort(this);
            this.widget.remove();
        };

        Port.prototype.resize = function(position) {
            this.widget.resize(position);
        };

        Port.prototype.connectTo = function(port) {
            this.connect.push(port.id, port);
        };

        Port.prototype.connectedFrom = function(port) {
            this.connect.push(port.id, port);
        };

        return Port;
    })();

    var Widget = (function() {
        function Widget(port, options) {
            options = options || {};

            this.x = options.x || 0;
            this.y = options.y || 0;
            this.w = options.w || 20;
            this.h = options.h || 20;

            this.port = port || null;
            this.element = null;
        }

        Widget.prototype.init = function(container) {
            this.container = container;
            this._createElement(container);
            this._setConnectAction(this.element);
        };

        Widget.prototype.remove = function() {
            $(this.element).remove();
        };

        Widget.prototype.resize = function(position) {
            if (position) {
                this.x = position.x || this.x;
                this.y = position.y || this.y;
                this.w = position.w || this.w;
                this.h = position.h || this.h;
            }

            $(this.element).css({
                top: this.y,
                left: this.x,
                width: this.w,
                height: this.h
            });
        };

        Widget.prototype._createElement = function(container) {
            var element = $('<div>').addClass('vis-port');
            var l = $('<label>').text(this.port.label);
            var label = $('<div>').append(l).hide();
            element.on('mouseenter', function() { label.show(); });
            element.on('mouseleave', function() { label.hide(); });
            element.append(label);
            $(container).append(element);
            this.label = l[0];
            this.element = element[0];
        };

        Widget.prototype._setConnectAction = function(element) {
            var $this = this, thisPort = this.port;
            vis.ui.connectable(element, {
                start: function() {
                    $(document).on('vis-connect', function(e, thatPort) {
                        vis.control.instance().connections.connect(thisPort, thatPort);
                        thisPort.connectTo(thatPort);
                        thatPort.connectedFrom(thisPort);
                    });
                },
                connect: function(x, y) {
                    var X = $this.port.module.widget.x + $this.x, Y = $this.port.module.widget.y + $this.y;
                    var x0 = X + $this.w / 2, y0 = Y + $this.h / 2;
                    var x1 = X + x, y1 = Y + y;
                    vis.control.instance().connections.drawPending(x0, y0, x1, y1);
                },
                cancel: function() {
                    $(document).off('vis-connect');
                    vis.control.instance().connections.resetPending();
                },
                end: function() {
                    $(document).triggerHandler('vis-connect', thisPort);
                    $(document).off('vis-connect');
                }
            });
        };

        return Widget;
    })();

    var PortManager = (function() {
        function PortManager(module) {
            this.module = module || null;

            this.size = 20;
            this.margin = 5;

            this.all = new vis.util.OrderedDict();
            this.input = new vis.util.OrderedDict();
            this.output = new vis.util.OrderedDict();
        }

        PortManager.prototype.init = function(widget, elements) {
            var container = $('<div>').addClass('vis-port-container').appendTo(widget);
            this.container = container.get(0);

            this.reset(elements);
            this.resize();
        };

        PortManager.prototype.reset = function(elements) {
            this.clear();
            for (var i in elements) {
                var e = elements[i];
                for (var j in e.attributes) {
                    var a = e.attributes[j];
                    if (a.active) {
                        this.add({
                            id: this.module.id + '-' + e.name + '-' + a.name,
                            type: e.type,
                            text: a.text,
                            element: e.element,
                            attribute: a.attribute,
                            elementName: e.name,
                            attributeName: a.name
                        });
                    }
                }
            }
        };

        PortManager.prototype.clear = function() {
            for (var i = 0; i < this.all.length; i++) {
                var p = this.all.at(i);
                p.port.remove();
            }
            this.all.clear();
            this.input.clear();
            this.output.clear();
        };

        PortManager.prototype.add = function(obj) {
            var p = new Port(this.module, obj);
            p.init(this.container);

            this.all.push(p.id, p);
            if (p.type == 'input') {
                this.input.push(p.id);
            } else if (p.type == 'output') {
                this.output.push(p.id);
            } else {
                console.warn('Unknown port type.');
            }

            this.resize();
        };

        PortManager.prototype.remove = function(id) {
            var p = this.all.get(id);
            if (p) {
                p.remove();
                this.all.remove(id);
                if (p.type == 'input') {
                    this.input.remove(p.id);
                } else if (p.type == 'output') {
                    this.output.remove(p.id);
                } else {
                    console.warn('Unknown port type.');
                }
            }

            this.resize();
        };

        PortManager.prototype.move = function() {
            this._move(this.input);
            this._move(this.output);
        };

        PortManager.prototype._move = function(dict) {
            for (var i = 0; i < dict.length; i++) {
                var k = dict.key(i);
                var p = this.all.get(k);
                vis.control.instance().connections.updatePort(p);
            }
        };

        PortManager.prototype.resize = function() {
            var s = this.size, m = this.margin;
            var w = this.module.widget.w, h = this.module.widget.h;
            this._resize(this.input, 0 - m - s, h, s, m);
            this._resize(this.output, w + m, h, s, m);
        };

        PortManager.prototype._resize = function(dict, start, total, size, margin) {
            var num = dict.length;
            var t = num * size + (num - 1) * margin;
            var x = start, y = (total - t) / 2;
            for (var i = 0; i < dict.length; i++) {
                var k = dict.key(i);
                var p = this.all.get(k);
                p.resize({x: x, y: y + i * (margin + size), w: size, h: size});
                vis.control.instance().connections.updatePort(p);
            }
        };

        return PortManager;
    })();

    return {
        Port: Port,
        Widget: Widget,
        PortManager: PortManager
    };

})(vis);
