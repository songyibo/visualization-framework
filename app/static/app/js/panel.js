var vis = vis || {};

vis.panel = (function(vis) {
    function Panel(module) {
        this.container = $('.side-panel').get(0);
        this.module = module || null;
        this.template = '';
        this.html = '';
    }

    Panel.prototype.init = function() {
        this.template = $('#vis-template-panel').html();
        this.html = Mustache.render(this.template, this.module.conf);
        this.panel = $.parseHTML(this.html);
        // this.panel = $('<div>').html(this.html);
        $(this.panel).hide();
        $(this.container).append(this.panel);

        this._setAction();
    };

    Panel.prototype.reset = function() {
        this.html = Mustache.render(this.template, this.module.conf);
        $(this.panel).html(this.html);
    };

    Panel.prototype._setAction = function() {
        var $this = this;
        $(this.panel).on('click', '.side-panel-box', function(e) {
            e.stopPropagation();

            var attribute = $(this).attr('data-attr')
            var attributeName = $(this).attr('data-attr-name');
            if (attributeName) {
                var type = $(this).closest('.side-panel-category').attr('data-type');
                var element = $(this).closest('.side-panel-category').attr('data-element');
                var elementName = $(this).closest('.side-panel-category').attr('data-element-name');
                if (elementName) {
                    var elements = $this.module.conf.elements;
                    for (var i in elements) {
                        if (elements[i].name == elementName) {
                            var attributes = elements[i].attributes;
                            for (var j in attributes) {
                                if (attributes[j].name == attributeName) {
                                    var id = $this.module.id + '-' + elementName + '-' + attributeName;
                                    if (attributes[j].active) {
                                        $this.module.ports.remove(id);
                                    } else {
                                        $this.module.ports.add({
                                            id: id,
                                            type: type,
                                            text: attributes[j].text,
                                            element: element,
                                            attribute: attribute,
                                            elementName: elementName,
                                            attributeName: attributeName
                                        });
                                    }
                                    attributes[j].active = !attributes[j].active;
                                    $(this).toggleClass('checked');
                                }
                            }
                        }
                    }
                }
            }
        });

        $(this.panel).on('mousedown', function(e) { e.stopPropagation(); });
    };

    Panel.prototype._render = function(context) {
        this.context = context || this.context;
        this.html = Mustache._render(this.template, this.context);
        return this.html;
    };

    return {
        Panel: Panel
    };
})(vis);
