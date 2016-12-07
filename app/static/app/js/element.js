var vis = vis || {};

vis.element = (function(vis) {
    'use strict';

    var Element = (function() {

        function Element() {
            this.name = '';
        }

        return Element;
    })();

    var AxisElement = (function() {
        function AxisElement() {
            this.name = 'Axis';
        }
        AxisElement.prototype = Object.create(Element.prototype);
    })();

    var construct = {
        axis: function() { return new AxisElement(); },
        circle: function() { return new CircleElement(); }
    }

    return {
        construct: construct,
        Axis: AxisElement
    };
})();
