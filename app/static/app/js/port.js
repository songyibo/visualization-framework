var vis = vis || {};

vis.port = (function(vis) {

    var Port = (function() {
        function Port(module, parent, name, type, position) {
            if (!position) position = {};
            this.x = position.x || 0;
            this.y = position.y || 0;
            this.w = position.w || 20;
            this.h = position.h || 20;

            this.name = name || '';
            this.type = type || '';

            this.module = module;
            this.parent = parent;
            this._createElement(parent);
            this._setConnectAction(this.element);

            this.source = [];
            this.dest = [];
        }

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
        function PortManager() {

        }

        return PortManager;
    })();

    return {
        Port: Port,
        PortManager: PortManager
    };

})(vis);
