var vis = vis || {};

vis.ui = (function(vis) {
    'use strict';

    function draggable(widget, options) {
        options = options || {};

        $(widget).on('mousedown.vis-ui-drag', function(e) {
            if (e.which == 1) {
                e.preventDefault();
                e.stopPropagation();

                $(widget).addClass('vis-ui-dragging');
                if (options.start) options.start.call(widget); // Drag start callback.

                var p = $(widget).position();
                var X0 = e.pageX, Y0 = e.pageY;

                var x0 = p.left, y0 = p.top;
                $(document).on('mousemove.vis-ui-drag', function(e) {
                    var dx = e.pageX - X0, dy = e.pageY - Y0;
                    var x = x0 + dx, y = y0 + dy;
                    $(widget).css('left', x + 'px').css('top', y + 'px');

                    if (options.drag) options.drag.call(widget); // Dragging callback.
                });

                $(widget).on('mouseup.vis-ui-drag', function(e) {
                    if (e.which == 1) {
                        $(document).off('mousemove.vis-ui-drag');
                        $(widget).off('mouseup.vis-ui-drag');

                        $(widget).removeClass('vis-ui-dragging');
                        if (options.end) options.end.call(widget); // Drag end callback.
                    }
                });
            }
        });
    }

    function resizable(widget, options) {
        options = options || {};
        var wMin = options.minWidth || 100, hMin = options.minHeight || 100;
        var wMax = options.maxWidth || 2000, hMax = options.maxHeight || 2000;

        var funcResize = {
            n: function(dx, dy, o, p) { p.y = o.y + dy; p.h = o.h - dy; },
            e: function(dx, dy, o, p) { p.w = o.w + dx; },
            s: function(dx, dy, o, p) { p.h = o.h + dy; },
            w: function(dx, dy, o, p) { p.x = o.x + dx; p.w = o.w - dx; },
            se: function(dx, dy, o, p) { funcResize.s.apply(this, arguments); funcResize.e.apply(this, arguments); },
            sw: function(dx, dy, o, p) { funcResize.s.apply(this, arguments); funcResize.w.apply(this, arguments); },
            ne: function(dx, dy, o, p) { funcResize.n.apply(this, arguments); funcResize.e.apply(this, arguments); },
            nw: function(dx, dy, o, p) { funcResize.n.apply(this, arguments); funcResize.w.apply(this, arguments); }
        };

        var handles = [];
        var hs = ['n', 'e', 's', 'w', 'se', 'sw', 'ne', 'nw'];
        for (var i in hs) {
            var handle = $('<div>').addClass('vis-ui-resize-handle').addClass('vis-ui-resize-' + hs[i]);
            $(widget).append(handle);
            handles.push(handle[0]);
        }

        $(handles).on('mousedown.vis-ui-resize', function(e) {
            if (e.which == 1) {
                e.preventDefault(); // Prevent DOM selection behavior.
                e.stopPropagation(); // Prevent move action on parent div.

                $(widget).addClass('vis-ui-resizing');
                if (options.start) options.start.call(widget); // Resize start callback.

                var X0 = e.pageX, Y0 = e.pageY;
                var p = $(widget).position();
                var x0 = p.left, y0 = p.top;

                var w0 = $(widget).outerWidth(), h0 = $(widget).outerHeight();
                var origin = {x: x0, y: y0, w: w0, h: h0};

                var pos = {x: x0, y: y0, w: w0, h: h0};

                var dir = this.className.match(/vis-ui-resize-(se|sw|ne|nw|n|e|s|w)/i)[1];
                $(document).on('mousemove.vis-ui-resize', function(e) {
                    var dx = e.pageX - X0, dy = e.pageY - Y0;
                    funcResize[dir](dx, dy, origin, pos);

                    pos.w = (pos.w < wMin) ? wMin : pos.w;
                    pos.h = (pos.h < hMin) ? hMin : pos.h;
                    pos.w = (pos.w > wMax) ? wMax : pos.w;
                    pos.h = (pos.h > hMax) ? hMax : pos.h;

                    $(widget).css({ left: pos.x, top: pos.y, width: pos.w, height: pos.h });

                    if (options.resize) options.resize.call(widget, pos); // Resizing callback.
                });

                // This event cannot be bound at the handle elements.
                // If new size goes beyond min or max size, the mouse cursor can be off the handles.
                $(document).on('mouseup.vis-ui-resize', function(e) {
                    if (e.which == 1) {
                        $(document).off('mousemove.vis-ui-resize');
                        $(document).off('mouseup.vis-ui-resize');

                        $(widget).removeClass('vis-ui-resizing');
                        if (options.end) options.end.call(widget); // Resize end callback.
                    }
                });
            }
        });
    }
    
    function connectable(widget, options) {
        options = options || {};

        var isSource = false;

        $(widget).on('mousedown.vis-ui-connect', function(e) {
            if (e.which == 3) {
                e.preventDefault();

                $(widget).addClass('vis-ui-connecting');
                if (options.start) options.start.call(widget); // Connect start callback on source widget.

                var offset = $(this).offset();

                var X0 = offset.left, Y0 = offset.top;
                isSource = true;

                // Capture mouse event outside the widget.
                $(document).on('mousemove.vis-ui-connect', function(e) {
                    var x = e.pageX - X0, y = e.pageY - Y0;
                    if (options.connect) options.connect.call(widget, x, y); // Connecting callback outside the widget.
                });

                // Exit 1. Connection canceled.
                $(document).on('mouseup.vis-ui-connect', function(e) {
                    $(document).off('mousemove.vis-ui-connect');
                    $(document).off('mouseup.vis-ui-connect');

                    isSource = false;
                    $(widget).removeClass('vis-ui-connecting');
                });
            }
        });

        $(widget).on('mousemove.vis-ui-connect', function(e) {
            if (e.which == 3) {
                e.stopPropagation();
            }
        });

        // Exit 2. Connection ends on Target.
        $(widget).on('mouseup.vis-ui-connect', function(e) {
            if (e.which == 3) {
                if (isSource) {
                    isSource = false;
                    return;
                }

                $(widget).removeClass('vis-ui-connecting');
                if (options.end) options.end.call(widget); // Connect end callback on target widget.
            }
        });

        $(widget).on('mouseenter.vis-ui-connect', function(e) {
            if (e.which == 3) {
                if (!isSource) {
                    $(widget).addClass('vis-ui-connecting');
                }
            }
        });

        $(widget).on('mouseleave.vis-ui-connect', function(e) {
            if (e.which == 3) {
                if (!isSource) {
                    $(widget).removeClass('vis-ui-connecting');
                }
            }
        });
    }

    return {
        draggable: draggable,
        resizable: resizable,
        connectable: connectable
    }
})(vis);
