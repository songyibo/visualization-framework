var vis = vis || {};

vis.widget = (function(vis) {
    'use strict';

    var Widget = (function() {
        function Widget(module, options) {
            options = options || {};

            this.x = options.x || 100;
            this.y = options.y || 100;
            this.w = options.w || 200;
            this.h = options.h || 200;
            this.wMin = options.minWidth || 100;
            this.hMin = options.minHeight || 100;
            this.wMax = options.maxWidth || 1000;
            this.hMax = options.maxHeight || 1000;

            this.module = module || null;
            this.element = null;
            this.canvas = null;
        }

        Widget.prototype.init = function(canvasId, position) {
            this.canvas = $('#' + canvasId).get(0);
            this.setPosition(position);
            this.element = this._createElement(this.canvas);

            this._setSelectAction(this.element);
            this._setDragAction(this.element);
            this._setResizeAction(this.element);
        };

        Widget.prototype.setPosition = function(position) {
            if (position) {
                this.x = position.x || this.x;
                this.y = position.y || this.y;
                this.w = position.w || this.w;
                this.h = position.h || this.h;
            }
        };

        Widget.prototype.updatePosition = function() {
            $(this.element).css({
                left: this.x,
                top: this.y,
                width: this.w,
                height: this.h
            });
        };

        Widget.prototype.updateComponents = function() {
            // To override here.
        };

        Widget.prototype.update = function() {
            this.updatePosition();
            this.updateComponents();
        };

        Widget.prototype._createElement = function(container) {
            var div = $('<div>').addClass('vis-widget').appendTo(container);
            return div.get(0);
        };

        Widget.prototype._setSelectAction = function(element) {
            var $this = this;
            vis.ui.selectable(element, {
                select: function() {
                    $this.module.select();
                },
                cancel: function() {
                    $this.module.unselect();
                }
            });
        };

        Widget.prototype._setDragAction = function(element) {
            var $this = this;
            vis.ui.draggable(element, {
                drag: function(x, y) {
                    $this.setPosition({x: x, y: y});
                }
            });
        };

        Widget.prototype._setResizeAction = function(element) {
            var $this = this;
            vis.ui.resizable(element, {
                minWidth: this.wMin,
                minHeight: this.hMin,
                maxWidth: this.wMax,
                maxHeight: this.hMax,

                resize: function(x, y, w, h) {
                    $this.setPosition({x: x, y: y, w: w, h: h});
                    $this.updateComponents();
                    $this.module.resize();
                }
            });
        };

        return Widget;
    })();

    var SvgWidget = (function() {
        function SvgWidget(module, options) {
            Widget.apply(this, arguments);
            options = options || {};

            this.w = options.w || 300;
            this.h = options.h || 300;
            this.wMin = options.minWidth || 200;
            this.hMin = options.minHeight || 200;
        }
        SvgWidget.prototype = Object.create(Widget.prototype);

        SvgWidget.prototype.updateComponents = function() {
            Widget.prototype.updateComponents.call(this);
            this.svg.resize(this.w - 22, this.h - 60);
        };

        SvgWidget.prototype._createElement = function(container) {
            var element = Widget.prototype._createElement.call(this, container);

            var labelWrapper = $('<div>').addClass('vis-widget-label-wrapper').appendTo(element);
            var label = $('<div>').addClass('vis-widget-label').text(this.module.label).appendTo(labelWrapper);
            var svgContainer = $('<div>', {id: 'vis-widget-svg-' + this.module.id, class: 'vis-widget-svg-container'}).appendTo(element);

            var make = vis.svg.construct[this.module.name];
            if (make) {
                this.svg = make(svgContainer.attr('id'));
            } else {
                console.warn('SVG creation failed: ' + this.module.name);
            }

            return element;
        };

        return SvgWidget;
    })();

    var DataSourceWidget = (function() {
        function DataSourceWidget(module, options) {
            Widget.apply(this, arguments);
            options = options || {};

            this.w = options.w || 200;
            this.h = options.h || 300;
            this.wMin = options.minWidth || 150;
            this.hMin = options.minHeight || 200;
        }
        DataSourceWidget.prototype = Object.create(Widget.prototype);

        DataSourceWidget.prototype._createElement = function(container) {
            var element = Widget.prototype._createElement.call(this, container);

            var labelWrapper = $('<div>').addClass('vis-widget-label-wrapper').appendTo(element);
            var label = $('<div>').addClass('vis-widget-label').text(this.module.label).appendTo(labelWrapper);
            var inputContainer = $('<div>').addClass('vis-widget-select-wrapper').appendTo(element);
            var input = $('<div>', {id: 'vis-widget-select-' + this.module.id, class: 'vis-widget-select'}).appendTo(inputContainer);

            var module = this.module;
            // Set callback when user selects a new dataset.
            // When new dataset selected, try to add the dataset to global controller.
            var select = new vis.html.Dropdown(input.attr('id'), function(dataset) {
                module.setDataset(dataset);
            });

            // Get available datasets from server.
            // Add names to select widget when datasets return.
            vis.network.getDatasets(function(datasets) {
                for (var i in datasets) {
                    select.addMenuItem(datasets[i]);
                }
            });

            return element;
        };

        return DataSourceWidget;
    })();

    return {
        SvgWidget: SvgWidget,
        DataSourceWidget: DataSourceWidget
    };
})(vis);
