var vis = vis || {};

vis.widget = (function(vis) {
    
    /**
     * Widget Base Class
     */
    function Widget(parent) {
        this.x = 100; this.y = 100;
        this.w = 200; this.h = 200;
        this.wMin = 100; this.hMin = 100;
        this.wMax = 2000; this.hMax = 1000;
        this.parent = document.getElementById(parent) || null;

        this.widget = this._init(this.parent);

        this._setDragAction(this.widget);
        this._setResizeAction(this.widget);

        this._update();
    }

    Widget.prototype._init = function(parent) {
        if (!this.parent) return;

        var div = $('<div>').addClass('vis-widget');
        $(parent).append(div);

        return div[0];
    }

    Widget.prototype._setDragAction = function(widget) {
        var $this = this;

        $(widget).on('mousedown', function(e) {
            e.preventDefault();

            var X0 = e.pageX, Y0 = e.pageY;
            var x0 = $this.x, y0 = $this.y;

            $(widget).addClass('vis-widget-dragging');
            $(document).on('mousemove.vis-widget-dragging', function(e) {
                dx = e.pageX - X0;
                dy = e.pageY - Y0;

                $this.x = x0 + dx;
                $this.y = y0 + dy;

                $this._move();
            });
        });

        $(widget).on('mouseup', function(e) {
            $(widget).removeClass('vis-widget-dragging');
            $(document).off('mousemove.vis-widget-dragging');
        });
    }

    Widget.prototype._setResizeAction = function(widget) {
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
            e.preventDefault(); // Prevent DOM selection behavior.
            e.stopPropagation(); // Prevent drag action on parent div.

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
                $this._move();
            });
        });

        // This event cannot be bound at the handle elements.
        // If new size goes beyond min or max size, the mouse cursor can be off the handles.
        $(document).on('mouseup', function(e) {
            $(widget).removeClass('vis-widget-resizing');
            $(document).off('mousemove.vis-widget-resizing');
        });
    };

    Widget.prototype._update = function() {
        this._move();
    };

    Widget.prototype._move = function() {
        this.w = (this.w < this.wMin) ? this.wMin : this.w;
        this.h = (this.h < this.hMin) ? this.hMin : this.h;
        this.w = (this.w > this.wMax) ? this.wMax : this.w;
        this.h = (this.h > this.hMax) ? this.hMax : this.h;

        $(this.widget).css({
            left: this.x,
            top: this.y,
            width: this.w,
            height: this.h
        });
    };

    /**
     * Data Source Widget
     */
    function DataSourceWidget(parent, dataset) {
        Widget.call(this, parent);

        this.index = DataSourceWidget.prototype.counter++;
    }

    DataSourceWidget.prototype = Object.create(Widget.prototype);

    DataSourceWidget.prototype.counter = 1;

    return {
        DataSource: DataSourceWidget
    };
    
})(vis);
