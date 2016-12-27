var vis = vis || {};

vis.element = (function(vis) {
    'use strict';

    function Element(para) {
        para = para || {};
    }

    function AxisElement(para) {
        Element.apply(this, arguments);
        para = para || {};
        this.name = para.name || 'axis';
        this.text = para.text || 'Axis';
        this.id = this.name + (para.id ? '-' + para.id : '');

        this.attrs = [
            new vis.attr.Extent()
        ];
    }
    AxisElement.prototype = Object.create(Element.prototype);

    function CircleElement(para) {
        Element.apply(this, arguments);
        para = para || {};
        this.name = para.name || 'circle';
        this.text = para.text || 'Circle';
        this.id = this.name + (para.id ? '-' + para.id : '');

        this.attrs = [
            new vis.attr.Color(),
            new vis.attr.Size()
        ];
    }
    CircleElement.prototype = Object.create(Element.prototype);

    function ElementManager(module) {
        this.module = module || null;
        this.elements = {};
    }

    ElementManager.prototype.init = function(elements) {
        for (var i in elements) {
            var e = elements[i];
            var make = vis.element.construct[e.element];
            if (make) {
                var element = make({id: this.module.id, name: e.name, text: e.text});
            } else {
                console.warn('Element creation failed: ' + e.element);
                continue;
            }
            this.elements[element.id] = element;
        }
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
