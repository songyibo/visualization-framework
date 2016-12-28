var vis = vis || {};

vis.element = (function(vis) {
    'use strict';

    function Element(para) {
        para = para || {};
    }

    Element.prototype._id = function(moduleId, name) {
        return (moduleId || 'unknown') + '-' + name;
    };

    function AxisElement(para) {
        Element.apply(this, arguments);
        para = para || {};
        this.name = para.name || 'axis';
        this.text = para.text || 'Axis';
        this.id = this._id(para.id, this.name);

        this.attrs = {
            extent: new vis.attr.Extent()
        };
    }
    AxisElement.prototype = Object.create(Element.prototype);

    function CircleElement(para) {
        Element.apply(this, arguments);
        para = para || {};
        this.name = para.name || 'circle';
        this.text = para.text || 'Circle';
        this.id = this._id(para.id, this.name);

        this.attrs = {
            color: new vis.attr.Color(),
            size: new vis.attr.Size(),
            opacity: new vis.attr.Opacity()
        };
    }
    CircleElement.prototype = Object.create(Element.prototype);

    function ElementManager(module) {
        this.module = module || null;

        this.input = new vis.util.OrderedDict();
        this.output = new vis.util.OrderedDict();
    }

    ElementManager.prototype.init = function(elements) {
        var $this = this;
        var iterate = function(elements, array) {
            for (var i in elements) {
                var e = elements[i];
                var make = vis.element.construct[e.element];
                if (make) {
                    var element = make({id: $this.module.id, name: e.name, text: e.text});
                } else {
                    console.warn('Element creation failed: ' + e.element);
                    continue;
                }
                for (var j in e.attrs) {
                    var a = e.attrs[j];
                    var attr = element.attrs[a];
                    if (attr) attr.enabled = true;
                }
                array.add(element);
            }
        };

        iterate(elements.input, this.input);
        iterate(elements.output, this.output);
    };

    ElementManager.prototype.format = function() {
        var iterate = function(dict, result, type) {
            dict.reset();
            while (!dict.end()) {
                var element = dict.next();
                var attrs = [];
                for (var i in element.attrs) {
                    var attr = element.attrs[i];
                    attrs.push({
                        name: attr.name,
                        text: attr.text,
                        checked: attr.enabled
                    });
                }
                result.push({
                    text: element.text,
                    type: type,
                    attrs: attrs
                });
            }
        };
        var result = [];
        iterate(this.input, result, 'input');
        iterate(this.output, result, 'output');
        return result;
    };

    ElementManager.prototype.enables = function() {
        var $this = this;
        var iterate = function(dict, result, type) {
            dict.reset();
            while (!dict.end()) {
                var element = dict.next();
                for (var i in element.attrs) {
                    var attr = element.attrs[i];
                    if (attr.enabled) {
                        result.push({
                            module: $this.module.id,
                            element: element.id,
                            attr: attr.name,
                            type: type
                        });
                    }
                }
            }
        };
        var result = [];
        iterate(this.input, result, 'input');
        iterate(this.output, result, 'output');
        return result;
    };

    var construct = {
        axis: function(para) { return new AxisElement(para); },
        circle: function(para) { return new CircleElement(para); }
    };

    return {
        Axis: AxisElement,
        Circle: CircleElement,

        ElementManager: ElementManager,
        construct: construct
    };
})(vis);
