var vis = vis || {};

vis.port = (function(vis) {

    var Port = (function() {
        function Port(module, parent, position) {
            if (!position) position = {};
            this.x = position.x || 0;
            this.y = position.y || 0;
            this.w = position.w || 20;
            this.h = position.h || 20;

            this.module = module;
            this.parent = parent;
            this._createElement(parent);
            this._setConnectAction(this.element);

            this.source = [];
            this.dest = [];
        }

        Port.prototype.remove = function() {
            // TODO: Remove connections here;
            $(this.element).remove();
        };

        Port.prototype._createElement = function(parent) {
            var element = $('<div>').addClass('vis-port');
            $(parent).append(element);
            this.element = element[0];
        };

        Port.prototype._setConnectAction = function(element) {
            var $this = this;
            vis.ui.connectable(element, {
                start: function() {
                    // TODO: Set connections here.
                    $(document).on('vis-connect', function(e, port) {
                        console.log($this, port);
                        $this.dest.push(port);
                        port.source.push($this);
                        vis.control.instance().drawConnection($this, port);
                    });
                },
                connect: function(x, y) {
                    var X = $this.module.widget.x + $this.x, Y = $this.module.widget.y + $this.y;
                    var x0 = X + $this.w / 2, y0 = Y + $this.h / 2;
                    var x1 = X + x, y1 = Y + y;
                    vis.control.instance().drawPendingConnection(x0, y0, x1, y1);
                },
                cancel: function() {
                    $(document).off('vis-connect');
                    vis.control.instance().clearPendingConnection();
                },
                end: function() {
                    $(document).triggerHandler('vis-connect', $this);
                    $(document).off('vis-connect');
                }
            });
        };

        Port.prototype.resize = function(position) {
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

        return Port;
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
                        this.add(this.module.id + '-' + e.name + '-' + a.name, e.type);
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

        PortManager.prototype.add = function(id, type) {
            var p = new Port(this.module, this.container);
            var port = {
                id: id,
                type: type,
                port: p
            };

            this.all.push(port.id, port);
            if (type == 'input') {
                this.input.push(port.id);
            } else if (type == 'output') {
                this.output.push(port.id);
            } else {
                console.warn('Unknown port type.');
            }

            this.resize();
        };

        PortManager.prototype.remove = function(id) {
            var p = this.all.get(id);
            if (p) {
                p.port.remove();
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
            var index = 0;
            for (var i = 0; i < dict.length; i++) {
                var k = dict.key(i);
                var p = this.all.get(k);
                p.port.resize({x: x, y: y + index * (margin + size), w: size, h: size});
                index++;
            }
        };

        return PortManager;
    })();

    return {
        Port: Port,
        PortManager: PortManager
    };

})(vis);
