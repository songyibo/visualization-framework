var vis = vis || {};

vis.connection = (function(vis) {
    function Connection(id, start, end) {
        this.id = id;
        this.start = start;
        this.end = end;
    }

    function ConnectControl(canvasID) {
        this.cid = canvasID;
        this.svg = d3.select('#' + this.cid);
        this.pending = this.svg.append('line')
            .attr('class', 'vis-connect-pending')
            .style('stroke', 'black');

        this.connections = {};
    }

    ConnectControl.prototype.add = function(start, end) {
        var id = this._id(start, end);
        this.remove(id);

        var c = new Connection(id, start, end);
        c.path = this.svg.append('path')
            .attr('class', 'vis-connect-curve')
            .attr('d', function() {
                var sx = start.module.widget.x + start.widget.x + start.widget.w / 2;
                var sy = start.module.widget.y + start.widget.y + start.widget.h / 2;
                var ex = end.module.widget.x + end.widget.x + end.widget.w / 2;
                var ey = end.module.widget.y + end.widget.y + end.widget.h / 2;
                var mx = (sx + ex) / 2;
                return ('M' + sx + ',' + sy + 'C' + mx + ',' + sy + ' ' + mx + ',' + ey + ' ' + ex + ',' + ey);
            });
        this.connections[id] = c;
    };

    ConnectControl.prototype.remove = function(id) {
        if (this.connections[id]) {
            var c = this.connections[id];
            c.path.remove();
            delete this.connections[id];
        }
    };

    ConnectControl.prototype._id = function(start, end) {
        return 's-' + start.id + '-e-' + end.id;
    };

    ConnectControl.prototype.removePort = function(port) {
        for (var i = 0; i < port.connect.length; i++) {
            var p = port.connect.at(i);
            var id = port.type == 'input' ? this._id(p, port) : this._id(port, p);
            this.remove(id);
        }
    };

    ConnectControl.prototype.updatePort = function(port) {
        for (var i = 0; i < port.connect.length; i++) {
            var p = port.connect.at(i);

            var s = port.type == 'input' ? p : port;
            var e = port.type == 'input' ? port : p;

            var id = this._id(s, e);
            var c = this.connections[id];
            if (c) {
                c.path.attr('d', function() {
                    var start = s, end = e;
                    var sx = start.module.widget.x + start.widget.x + start.widget.w / 2;
                    var sy = start.module.widget.y + start.widget.y + start.widget.h / 2;
                    var ex = end.module.widget.x + end.widget.x + end.widget.w / 2;
                    var ey = end.module.widget.y + end.widget.y + end.widget.h / 2;
                    var mx = (sx + ex) / 2;
                    return ('M' + sx + ',' + sy + 'C' + mx + ',' + sy + ' ' + mx + ',' + ey + ' ' + ex + ',' + ey);
                });
            }
        }
    };

    ConnectControl.prototype.drawPending = function(x1, y1, x2, y2) {
        this.pending.attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
    };

    ConnectControl.prototype.resetPending = function() {
        this.pending.attr('x1', '').attr('y1', '').attr('x2', '').attr('y2', '');
    };

    return {
        ConnectControl: ConnectControl
    }
})(vis);
