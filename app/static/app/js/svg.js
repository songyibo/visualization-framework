var vis = vis || {};

vis.svg = (function(vis) {

    function Scatterplot(widgetID) {
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

        // Set size up.
        this.resize(this.fullWidth, this.fullHeight);
    }

    Scatterplot.prototype.resize = function(w, h) {
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

        // Avoid refresh svg frequently.
        var $this = this;
        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
            $this.render($this.data, $this.config);
        }, 400);
    };

    Scatterplot.prototype.render = function(data, config) {
        if (!data || !config) return;
        this.data = data;
        this.config = config;
        if (!this.config.x || !this.config.y) return;

        var x = this.xDataToPlot, y = this.yDataToPlot, cfg = this.config;

        x.domain(d3.extent(this.data, function(d) { return d[cfg.x]; })).nice();
        y.domain(d3.extent(this.data, function(d) { return d[cfg.y]; })).nice();

        this.container.select('.vis-svg-axis-x')
            .call(this.xAxis);

        this.container.select('.vis-svg-axis-y')
            .call(this.yAxis);

        var nodes = this.container.selectAll('.vis-svg-scatterplot-circle')
            .data(this.data);

        this.config.duration = 400;

        nodes.transition().duration(cfg.duration)
            .attr('r', function(d) { return d[cfg.size] || 3 })
            .attr('cx', function(d) { return x(d[cfg.x]); })
            .attr('cy', function(d) { return y(d[cfg.y]); });

        nodes.enter().append('circle')
            .attr('class', 'vis-svg-scatterplot-circle')
            .attr('r', function(d) { return d[cfg.size] || 3 })
            .attr('cx', function(d) { return x(d[cfg.x]); })
            .attr('cy', function(d) { return y(d[cfg.y]); })
            .attr('fill', 'slategrey')
            .attr('fill-opacity', 0)
            .transition().duration(cfg.duration)
            .attr('fill-opacity', 1);

        nodes.exit()
            .transition().duration(cfg.duration)
            .style('fill-opacity', 0)
            .remove();
    };

    return {
        Scatterplot: Scatterplot
    };
})(vis);
