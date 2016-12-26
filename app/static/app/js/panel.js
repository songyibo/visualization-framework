var vis = vis || {};

vis.panel = (function(vis) {
    function Panel(module) {
        this.module = module || null;
        this.context = {};
        this.template = '';
        this.html = '';

        this.changed = false;
    }

    Panel.prototype.load = function(name) {
        this.name = name;
        this.changed = true;
        this.template = $('#vis-template-' + name).html();
    };

    Panel.prototype.getHtml = function(context) {
        if (this.changed) {
            return this.render(context);
        } else {
            return this.html;
        }
    };

    Panel.prototype.render = function(context) {
        this.context = context || this.context;
        this.html = Mustache.render(this.template, this.context);
        this.changed = false;
        return this.html;
    };

    Panel.prototype.setContext = function(context) {
        if (!context) return;
        this.changed = true;
        this.context = context;
    };

    return {
        Panel: Panel
    };
})(vis);
