var vis = vis || {};

vis.port = (function(vis) {

    var Port = (function() {
        function Port(parent, position) {
            if (!position) position = {};
            this.x = position.x || 0;
            this.y = position.y || 0;
            this.w = position.w || 20;
            this.h = position.h || 20;

            this.parent = parent;
            this._createElement(parent);
            this._setConnectAction(this.element);

            this.source = [];
            this.dest = [];
        }

        Port.prototype.remove = function() {
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
                    // Set connections here.
                    $(document).on('vis-connect', function(e, port) {
                        console.log($this, port);
                        $this.dest.push(port);
                        port.source.push($this);
                        vis.control.instance().drawConnection($this, port);
                    });
                },
                connect: function(x, y) {
                    var X = $this.module.x + $this.x, Y = $this.module.y + $this.y;
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

            this.input = new vis.util.OrderedDict();
            this.output = new vis.util.OrderedDict();
        }

        PortManager.prototype.init = function(widget) {
            var container = $('<div>').addClass('vis-port-container').appendTo(widget);
            this.container = container.get(0);
        };

        PortManager.prototype.addPort = function(c) {
            var p = new Port(this.container);
            var dict = (c.type == 'input') ? this.input : this.output;
            dict.add({
                id: c.element + '-' + c.attr,
                context: c,
                port: p
            });
        };

        PortManager.prototype.togglePort = function(elementID, attrName, ioType) {
            var dict = (ioType == 'input') ? this.input : this.output;
            var id = elementID + '-' + attrName;
            var p = dict.get(id);
            if (p) {
                // TODO: Remove connections.
                p.port.remove();
                dict.remove(id);
            } else {
                dict.add({
                    id: id,
                    context: {
                        module: this.module.id,
                        element: elementID,
                        attr: attrName,
                        type: ioType
                    },
                    port: new Port(this.container)
                });
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
            var index = 0;
            dict.begin();
            while (!dict.end()) {
                var p = dict.next();
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
