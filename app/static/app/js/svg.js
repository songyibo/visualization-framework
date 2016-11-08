var vis = vis || {};

vis.svg = (function(vis) {

    function Scatterplot(widgetID) {
        this.wid = widgetID;

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
    };

    return {
        Scatterplot: Scatterplot
    };
})(vis);
