var vis = vis || {};

vis.svg = (function(vis) {

    var ScatterPlot = (function() {
        function ScatterPlot(module, widgetID) {
            this.module = module;
            this.wid = widgetID;
            this.config = {};

            this.fullWidth = 250; this.fullHeight = 240; // Initial width and height.
            this.margin = {top: 20, right: 20, bottom: 25, left: 30};

            this.svg = d3.select('#' + this.wid).append('svg')
                .attr('width', this.fullWidth)
                .attr('height', this.fullHeight);

            this.container = this.svg.append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

            this.xDataToPlot = d3.scaleLinear();
            this.yDataToPlot = d3.scaleLinear();

            this.xAxis = d3.axisBottom(this.xDataToPlot);
            this.yAxis = d3.axisLeft(this.yDataToPlot);

            // X axis setup.
            this.container.append('g')
                .attr('class', 'vis-svg-axis vis-svg-axis-x')
              .append('text')
                .attr('class', 'vis-svg-axis-label vis-svg-axis-label-x')
                .text('X');

            // Y axis setup.
            this.container.append('g')
                .attr('class', 'vis-svg-axis vis-svg-axis-y')
              .append('text')
                .attr('class', 'vis-svg-axis-label vis-svg-axis-label-y')
                .text('Y');

            // Setup actions.
            this._setup();
        }

        ScatterPlot.prototype.resize = function(w, h) {
            if (this.fullWidth == w && this.fullHeight == h) return;

            this.fullWidth = w; this.fullHeight = h;
            this.width = this.fullWidth - this.margin.left - this.margin.right;
            this.height = this.fullHeight - this.margin.top - this.margin.bottom;

            this.xDataToPlot.range([0, this.width]);
            this.yDataToPlot.range([this.height, 0]);

            this.svg
                .attr('width', this.fullWidth)
                .attr('height', this.fullHeight);

            this.svg.select('.vis-svg-axis-x')
                .attr('transform', 'translate(0,' + this.height + ')')
                .call(this.xAxis);

            this.svg.select('.vis-svg-axis-label-x')
                .attr('transform', 'translate(' + this.width + ',0)');

            this.svg.select('.vis-svg-axis-y')
                .call(this.yAxis);

            this.brush.extent([[-10, -10], [this.width + 10, this.height + 10]]);
            this.container.select('.brush').call(this.brush);

            // Avoid refresh svg frequently.
            var $this = this;
            clearTimeout(this.timer);
            this.timer = setTimeout(function() {
                $this.render($this.data, $this.config);
            }, 400);
        };

        ScatterPlot.prototype.render = function(data, config) {
            if (!data || !config) return;
            this.data = data;
            for (var c in config) {
                this.config[c] = config[c];
            }
            if (!this.config.x || !this.config.y) return;

            var x = this.xDataToPlot, y = this.yDataToPlot, conf = this.config;

            x.domain(d3.extent(this.data, function(d) { return d[conf.x]; })).nice();
            y.domain(d3.extent(this.data, function(d) { return d[conf.y]; })).nice();

            this.container.select('.vis-svg-axis-x')
                .call(this.xAxis);

            this.container.select('.vis-svg-axis-y')
                .call(this.yAxis);

            var nodes = this.container.selectAll('.vis-svg-scatter-circle')
                .data(this.data);

            this.config.duration = 400;

            nodes.transition().duration(conf.duration)
                .attr('r', function(d) { return d[conf.size] || 3 })
                .attr('cx', function(d) { return x(d[conf.x]); })
                .attr('cy', function(d) { return y(d[conf.y]); });

            nodes.enter().append('circle')
                .attr('class', 'vis-svg-scatter-circle')
                .attr('r', function(d) { return d[conf.size] || 3 })
                .attr('cx', function(d) { return x(d[conf.x]); })
                .attr('cy', function(d) { return y(d[conf.y]); })
                .attr('fill', 'slategrey')
                .attr('fill-opacity', 0)
                .transition().duration(conf.duration)
                .attr('fill-opacity', 1);

            nodes.exit()
                .transition().duration(conf.duration)
                .style('fill-opacity', 0)
                .remove();

            if (config.highlight) {
                var $this = this;
                this.highlight = config.highlight;
                this.container.selectAll('circle')
                    .classed('vis-svg-scatter-highlighted', function(d, i) { return $this.highlight[i]; });
            }
        };

        ScatterPlot.prototype._setup = function() {
            this.selection = {};

            var shift = false;

            var $this = this;
            var x = this.xDataToPlot, y = this.yDataToPlot, config = this.config;

            // Brushing selection.
            this.brush = d3.brush()
                .on('start', function() {
                    if (d3.event.selection) {
                        var e = d3.event.sourceEvent;
                        $this.pending = !!e.ctrlKey;
                    }
                })
                .on('brush', function() {
                    if (d3.event.selection) {
                        var e = d3.event.sourceEvent;
                        if (!e.ctrlKey) $this.pending = false;
                    }
                })
                .on('end', function() {
                    if (d3.event.selection) {
                        var e = d3.event.sourceEvent;
                        if (!e.ctrlKey) $this.pending = false;

                        // Clear selection if not holding ctrl key.
                        if (!$this.pending) $this.selection = {};

                        // Draw selection if the scatter plot is not empty.
                        if (config.x && config.y) {
                            var s = d3.event.selection;
                            $this.container.selectAll('circle')
                                .each(function(d, i) {
                                    var x0 = x(d[config.x]), y0 = y(d[config.y]);
                                    if (x0 >= s[0][0] && x0 <= s[1][0] && y0 >= s[0][1] && y0 <= s[1][1]) {
                                        $this.selection[i] = true;
                                    }
                                })
                                .classed('vis-svg-scatter-selected', function(d, i) { return $this.selection[i]; });
                        }

                        // Avoid clearing selected data after a valid selection (including empty selection).
                        $this.maintainSelection = true;

                        // Clear the brush. Even when scatter plot is empty.
                        // Attention! This call will asynchronously fire another brush process with an empty selection.
                        $this.container.select('.brush').call($this.brush.move, null);

                        // Update modules that connected to this module.
                        $this.module.trigger();
                    } else {
                        if ($this.maintainSelection) {
                            // Avoid clearing selected data after a valid selection.
                            $this.maintainSelection = false;
                        } else {
                            // Click blank area will fire 'end' with empty selection. D3 originally uses this to clear the brush.
                            $this.selection = {};
                            $this.container.selectAll('circle')
                                .classed('vis-svg-scatter-selected', false);

                            // Update connected modules.
                            $this.module.trigger();
                        }
                    }
                });

            this.container.append('g')
                .attr('class', 'brush')
                .call(this.brush);
        };

        return ScatterPlot;
    })();

    var CustomCanvas = (function() {
        function CustomCanvas(widgetID) {
            this.wid = widgetID;
            this.config = {};

            this.fullWidth = 200; this.fullHeight = 200;
            this.margin = {top: 0, right: 0, bottom: 0, left: 0};

            this.svg = d3.select('#' + this.wid).append('svg')
                .attr('width', this.fullWidth)
                .attr('height', this.fullHeight);

            this.container = this.svg.append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
        }

        CustomCanvas.prototype.resize = function(w, h) {
            if (this.fullWidth == w && this.fullHeight == h) return;

            this.fullWidth = w; this.fullHeight = h;
            this.width = this.fullWidth - this.margin.left - this.margin.right;
            this.height = this.fullHeight - this.margin.top - this.margin.bottom;

            this.svg
                .attr('width', this.fullWidth)
                .attr('height', this.fullHeight);

            // Avoid refresh svg frequently.
            var $this = this;
            clearTimeout(this.timer);
            this.timer = setTimeout(function() {
                $this._render($this.data, $this.config);
            }, 400);
        };

        CustomCanvas.prototype._render = function(data, config) {
        };

        return CustomCanvas;
    })();

    var construct = {
        'scatter-plot': function(module, widgetID) { return new ScatterPlot(module, widgetID); }
    };

    return {
        ScatterPlot: ScatterPlot,
        construct: construct
    };
})(vis);
