var vis = vis || {};

vis.port = (function(vis) {

    function Port(parent, position) {
        if (!position) position = {};
        this.x = position.x || 0;
        this.y = position.y || 0;
        this.w = position.w || 50;
        this.h = position.h || 50;

        this.parent = parent;
        this._createElement(parent);
    }

    Port.prototype._createElement = function(parent) {
        var element = $('<div>').addClass('vis-port');
        element.hide();
        $(parent).append(element);

        this.element = element[0];
    };

    Port.prototype.resize = function(position) {
        if (position) {
            this.x = position.x || this.x;
            this.y = position.y || this.y;
            this.w = position.w || this.w;
            this.h = position.h || this.h;
        }

        $(this.element).css({
            top: this.y + 'px',
            left: this.x + 'px',
            width: this.w + 'px',
            height: this.h + 'px'
        });
    };

    /**
     * DataSource output port.
     */
    function DataPort(parent, position) {
        Port.apply(this, arguments);
        this.w = 0;
        this.h = 0;
    }
    DataPort.prototype = Object.create(Port.prototype);

    DataPort.prototype.setDataItems = function(items) {
        var e = $(this.element);
        e.empty();

        for (i in items) {
            var div = $('<div>').addClass('vis-port-data-item').text(items[i]);
            e.append(div);
        }

        var $this = this;
        $(this.element).children().each(function(index, item) {
            $this._setConnectAction(item);
        });

        this.resize();
    };

    DataPort.prototype.resize = function(position) {
        if (position) {
            this.x = position.x || this.x;
            this.y = position.y || this.y;
        }

        var copy = $(this.element).clone();
        copy.css({
            position: 'absolute',
            display: 'inline-block',
            visibility: 'hidden',
            width: ''
        });
        copy.appendTo('body');
        var w = copy.width();
        copy.remove();

        $(this.element).css({
            'left': (this.x - w) / 2,
            'top': this.y + 10,
            'width': w
        });
    };

    DataPort.prototype._createElement = function(parent) {
        var element = $('<div>').addClass('vis-port-data');
        $(parent).append(element);
        this.element = element[0];
    };

    DataPort.prototype._setConnectAction = function(item) {
        var $this = this;

        $(item).on('mousedown', function(e) {
            if (e.which == 3) {
                $this.source = this;
                vis.control.instance().setSourceData($this.dataset, $(this).text());

                $(item).addClass('vis-port-dragging');

                $(document).on('mousemove.vis-port-dragging', function(e) {
                    console.log('port dragging');
                    // TODO: Invoke to draw pending connection.
                    // vis.control.instance().updateCurve();
                });

                $(document).on('mouseup.vis-port-dragging', function(e) {
                    $(document).off('mousemove.vis-port-dragging');
                    $(document).off('mouseup.vis-port-dragging');

                    $(item).removeClass('vis-port-dragging');
                });
            }
        });
    };

    function AxisInputPort() {
        Port.apply(this, arguments);
    }
    AxisInputPort.prototype = Object.create(Port.prototype);

    AxisInputPort.prototype._createElement = function(parent) {
        Port.prototype._createElement.apply(this, arguments);
        $(this.element).addClass('vis-port-axis');
    };

    function ShapeInputPort() {
        Port.apply(this, arguments);
    }
    ShapeInputPort.prototype = Object.create(Port.prototype);

    ShapeInputPort.prototype._createElement = function(parent) {
        Port.prototype._createElement.apply(this, arguments);
        $(this.element).addClass('vis-port-shape');
    };

    function SelectionInputPort() {
        Port.apply(this, arguments);
    }
    SelectionInputPort.prototype = Object.create(Port.prototype);

    SelectionInputPort.prototype._createElement = function(parent) {
        Port.prototype._createElement.apply(this, arguments);
        $(this.element).addClass('vis-port-sin');
    };

    function SelectionOutputPort() {
        Port.apply(this, arguments);
    }
    SelectionOutputPort.prototype = Object.create(Port.prototype);

    SelectionOutputPort.prototype._createElement = function(parent) {
        Port.prototype._createElement.apply(this, arguments);
        $(this.element).addClass('vis-port-sout');
    };

    return {
        DataPort: DataPort,

        AxisInput: AxisInputPort,
        ShapeInput: ShapeInputPort,
        SelectionInput: SelectionInputPort,
        SelectionOutput: SelectionOutputPort
    };

})(vis);
