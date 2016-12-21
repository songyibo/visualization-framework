var vis = vis || {};

vis.ui = (function(vis) {
    'use strict';

    /**
     * Mouse interactions.
     */
    var selectIndex = 0; // Distinguish different unselect handlers.
    function selectable(widget, options) {
        options = options || {};

        var index = selectIndex++;
        var selected = false;
        $(widget).on('mousedown.vis-ui-select', function(e) {
            if (e.which == 1) {
                if (selected) return;
                e.preventDefault();
                e.stopPropagation();

                selected = true;
                $(widget).addClass('vis-ui-selected');
                if (options.select) options.select.call(widget);

                $(document).on('mousedown.vis-ui-select' + index, function(e, i) {
                    if (e.which == 1 || i != index) {
                        // Unbind its own handler.
                        $(document).off('mousedown.vis-ui-select' + index);

                        selected = false;
                        $(widget).removeClass('vis-ui-selected');
                        if (options.cancel) options.cancel.call(widget);
                    }
                });

                // Unselect other selectable objects.
                $(document).triggerHandler('mousedown', index);
            }
        });
    }

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
                    $(widget).css('left', x).css('top', y);

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

    function droppable(widget, options) {
        options = options || {};

        var counter = 0;

        $(widget).on('drop.vis-ui-drop', function(e) {
            var data = e.originalEvent.dataTransfer.getData('vis-ui-drop');

            counter = 0;
            $(widget).removeClass('vis-ui-dropping');
            if (options.drop) options.drop.call(widget, data); // Drop callback.
        });

        $(widget).on('dragenter.vis-ui-drop', function(e) {
            e.preventDefault();
            counter++;
            if (counter == 1) {
                $(widget).addClass('vis-ui-dropping');
            }
        });

        $(widget).on('dragover.vis-ui-drop', function(e) {
            e.preventDefault();
        });

        $(widget).on('dragleave.vis-ui-drop', function(e) {
            counter--;
            if (counter == 0) {
                $(widget).removeClass('vis-ui-dropping');
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
        var box = $('<div>').addClass('vis-ui-resize-handles').appendTo(widget);
        for (var i in hs) {
            var handle = $('<div>').addClass('vis-ui-resize-handle').addClass('vis-ui-resize-' + hs[i]);
            box.append(handle);
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
                    if (options.cancel) options.cancel.call(widget); // Connect cancel callback outside the widget.
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

    /**
     * UI functions.
     */
    function scrollable(widget, options) {
        options = options || {};

        $(widget).addClass('vis-ui-scrollable');
        var scrollbar = new vis.ui.Scrollbar(widget, options);

        $(widget).on('mousewheel', function(e) {
            scrollbar.scroll(e.deltaY * e.deltaFactor);
        });

        return scrollbar;
    }

    /**
     * UI elements.
     */
    var SubPanel = (function() {
        function SubPanel(parent) {
            if (!parent) return;
            var panel = $('<div>').addClass('vis-ui-panel').appendTo(parent);
            panel.on('mousedown', function(e) { e.stopPropagation(); });
            this.panel = panel[0];

            this.$tabHead = $('<ul>').addClass('vis-ui-tab-head').appendTo(panel);
            this.$tabContent = $('<div>').addClass('vis-ui-tab-content').appendTo(panel);
            this.$tabHead.on('click', 'li > a', function(e) {
                e.preventDefault();
                var wid = $(this).attr('href');
                $(wid).parent().children().hide();
                $(wid).show();
            });
            
            this.scrollbar = vis.ui.scrollable(this.panel, {
                position: 'bottom'
            });

            this.tabs = [];
        }

        SubPanel.prototype.addTab = function(options) {
            options = options || {};

            var item = $('<a>').attr('href', '#' + options.id).text(options.title);
            this.$tabHead.append(item);
            item.wrap('<li></li>');

            var div = $('<div>').attr('id', options.id).addClass('vis-ui-tab-pane').hide();
            div.append(options.content);
            this.$tabContent.append(div);

            if (!this.tabs) {

            }

            this.tabs.push({ id: options.id, head: item, pane: div });
        };

        SubPanel.prototype.resize = function(x, y, w, h) {
            $(this.panel).css({width: w, height: h, top: y, left: x});
            this.scrollbar.resize();
        };

        SubPanel.prototype.toggle = function(flag) {
            var p = $(this.panel);
            if (flag === undefined) {
                p.is(':visible') ? p.hide() : p.show();
            } else {
                flag ? p.show() : p.hide();
            }
        };

        return SubPanel;
    })();

    var Scrollbar = (function() {
        function Scrollbar(parent, options) {
            if (!parent) return;
            this.parent = parent;
            this.options = options || {};

            $(parent).wrapInner('<div class="vis-ui-scroll-content"></div>');
            var content = $(parent).find(':first-child');
            var container = $('<div>').addClass('vis-ui-scroll-container').hide();
            var bar = $('<div>').addClass('vis-ui-scroll-bar').appendTo(container);
            $(parent).append(container);

            this.container = container[0];
            this.content = content[0];
            this.bar = bar[0];

            this.barWidth = 3;

            var $c = $(this.container);
            $(this.parent).on('mouseenter.vis-ui-scrollbar', function() { $c.show(); });
            $(this.parent).on('mouseleave.vis-ui-scrollbar', function() { $c.hide(); });
        }

        Scrollbar.prototype.scroll = function(displacement) {
            var $p = $(this.parent);
            var w = $p.width(), h = $p.height();

            var c = this.content;
            var sw = c.scrollWidth, sh = c.scrollHeight;

            var $cp = $(this.content).position();
            var cx = $cp.left, cy = $cp.top;

            var pos = this.options.position;
            var f = this._scroll[pos];
            if (f) f.call(this, w, h, sw, sh, cx, cy, displacement);
        };

        Scrollbar.prototype._scroll = {
            top: function(w, h, sw, sh, cx, cy, d) {
                var x = cx + d;
                if (x > 0) x = 0;
                if (x + sw < w) x = w - sw;
                $(this.content).css('left', x);

                var l = $(this.bar).width();
                var percent = (w == sw) ? 0 : (x / (w - sw));
                $(this.bar).css('left', (w - l) * percent);
            },
            left: function(w, h, sw, sh, cx, cy, d) {
                var y = cy + d;
                if (y > 0) y = 0;
                if (y + sh < h) y = w - sh;
                $(this.content).css('top', y);

                var l = $(this.bar).height();
                var percent = (h == sh) ? 0 : (y / (h - sh));
                $(this.bar).css('top', (h - l) * percent);
            },
            bottom: function(w, h, sw, sh, cx, cy, d) { this._scroll.top.apply(this, arguments); },
            right: function(w, h, sw, sh, cx, cy, d) { this._scroll.left.apply(this, arguments); }
        };

        Scrollbar.prototype.resize = function() {
            $(this.content).css('top', 0).css('left', 0);

            var p = this.parent, $p = $(this.parent);
            var w = $p.width(), h = $p.height();

            var pos = this.options.position;

            var fc = this._resizeContainer[pos];
            if (fc) fc.call(this, w, h);

            var sw = p.scrollWidth || w, sh = p.scrollHeight || h;
            var fb = this._resizeBar[pos];
            if (fb) fb.call(this, w, h, sw, sh);
        };

        Scrollbar.prototype._resizeContainer = {
            top:    function(w, h) { this._setSize(this.container, 0, 0, w, this.barWidth); },
            bottom: function(w, h) { this._setSize(this.container, 0, h - this.barWidth, w, this.barWidth); },
            left:   function(w, h) { this._setSize(this.container, 0, 0, this.barWidth, h); },
            right:  function(w, h) { this._setSize(this.container, w - this.barWidth, 0, this.barWidth, h); }
        };

        Scrollbar.prototype._resizeBar = {
            top:    function(w, h, sw, sh) { this._setSize(this.bar, 0, 0, w / sw * w, this.barWidth); },
            bottom: function(w, h, sw, sh) { this._setSize(this.bar, 0, 0, w / sw * w, this.barWidth); },
            left:   function(w, h, sw, sh) { this._setSize(this.bar, 0, 0, this.barWidth, h / sh * h); },
            right:  function(w, h, sw, sh) { this._setSize(this.bar, 0, 0, this.barWidth, h / sh * h); }
        };

        Scrollbar.prototype._setSize = function(e, x, y, w, h) {
            $(e).css({width: w, height: h, left: x, top: y});
        };

        return Scrollbar;
    })();

    return {
        selectable: selectable,
        draggable: draggable,
        droppable: droppable,
        resizable: resizable,
        connectable: connectable,

        scrollable: scrollable,

        SubPanel: SubPanel,
        Scrollbar: Scrollbar
    }
})(vis);
