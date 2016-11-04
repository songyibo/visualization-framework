var vis = vis || {};

vis.widget = (function(vis) {
    
    /**
     * Widget Base Class
     */
    function Widget(parent) {
        this.x = 100;
        this.y = 100;
        this.width = 200;
        this.height = 200;
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

    };

    Widget.prototype._update = function() {
        this._move();
    };

    Widget.prototype._move = function() {
        $(this.widget).css({
            left: this.x,
            top: this.y,
            width: this.width,
            height: this.height
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
