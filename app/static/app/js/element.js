var vis = vis || {};

vis.element = (function(vis) {
    'use strict';

    function Element(para) {
        para = para || {};
    }

    Element.prototype._id = function(moduleID) {
        return (moduleID || 'unknown') + '-' + this.type + '-' + this.name;
    };

    function AxisElement(para) {
        Element.apply(this, arguments);
        para = para || {};
        this.name = para.name || 'axis';
        this.text = para.text || 'Axis';
        this.type = 'input';
        this.id = this._id(para.module);

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
        this.type = 'input';
        this.id = this._id(para.module);

        this.attrs = {
            color: new vis.attr.Color(),
            size: new vis.attr.Size(),
            opacity: new vis.attr.Opacity()
        };
    }
    CircleElement.prototype = Object.create(Element.prototype);

    function DataColumnElement(para) {
        Element.apply(this, arguments);
        para = para || {};
        this.name = para.name || 'data';
        this.text = para.text || 'Data';
        this.type = 'input';
        this.id = this._id(para.module);

        this.attrs = {};
    }
    DataColumnElement.prototype = Object.create(Element.prototype);

    var ElementManager = (function() {
        function ElementManager(module) {
            this.module = module || null;

            this.all = new vis.util.OrderedDict();
            this.input = new vis.util.OrderedDict();
            this.output = new vis.util.OrderedDict();
        }

        ElementManager.prototype.init = function(elements) {
            for (var i in elements) {
                var e = elements[i];
                var make = vis.element.construct[e.element];
                if (make) {
                    var element = make({module: this.module.id, name: e.name, text: e.text});
                } else {
                    console.warn('Element creation failed: ' + e.element);
                    continue;
                }
                for (var j in e.attrs) {
                    var a = e.attrs[j];
                    var attr = element.attrs[a];
                    if (attr) attr.enabled = true;
                }
                this._addElement(element);
            }
        };

        ElementManager.prototype.clear = function() {
            this.all.clear();
            this.input.clear();
            this.output.clear();
        };

        ElementManager.prototype._addElement = function(element) {
            if (element.type == 'input' || element.type == 'output') {
                this.all.push(element.id, element);
                this[element.type].push(element.id);
            } else {
                console.warn('Unknown element type.');
            }
        };

        ElementManager.prototype.panelConfig = function() {
            var result = [];
            for (var i = 0; i < this.all.length; i++) {
                var element = this.all.at(i);
                var attrs = [];
                for (var k in element.attrs) {
                    var attr = element.attrs[k];
                    attrs.push({
                        name: attr.name,
                        text: attr.text,
                        checked: attr.enabled
                    });
                }
                result.push({
                    id: element.id,
                    name: element.name,
                    text: element.text,
                    type: element.type,
                    attrs: attrs
                });
            }
            return result;
        };

        ElementManager.prototype.portConfig = function() {
            var result = [];
            for (var i = 0; i < this.all.length; i++) {
                var element = this.all.at(i);
                for (var k in element.attrs) {
                    var attr = element.attrs[k];
                    if (attr.enabled) {
                        result.push({
                            module: this.module.id,
                            element: element.id,
                            type: element.type,
                            attr: attr.name
                        });
                    }
                }
            }
            return result;
        };

        ElementManager.prototype.toggleAttr = function(elementID, attrName) {
            var element = this.all.get(elementID);
            if (element) {
                var attr = element.attrs[attrName];
                attr.enabled = !attr.enabled;
            }
        };

        return ElementManager;
    })();

    var construct = {
        axis: function(para) { return new AxisElement(para); },
        circle: function(para) { return new CircleElement(para); },
        data: function(para) { return new DataColumnElement(para); }
    };

    return {
        Axis: AxisElement,
        Circle: CircleElement,

        ElementManager: ElementManager,
        construct: construct
    };
})(vis);
