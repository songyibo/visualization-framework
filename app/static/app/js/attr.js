var vis = vis || {};

vis.attr = (function(vis) {
    'use strict';

    function Attribute() {
        this.color = 'f0f0f0';
        this.enabled = false;
    }

    function Extent() {
        this.name = 'extent';
        this.text = 'Extent';
        this.color = '#80fa7f';
    }
    Extent.prototype = Object.create(Attribute.prototype);

    function Color() {
        this.name = 'color';
        this.text = 'Color';
        this.color = '#fafaae';
    }
    Color.prototype = Object.create(Attribute.prototype);

    function Size() {
        this.name = 'size';
        this.text = 'Size';
        this.color = '#95dcfa';
    }
    Size.prototype = Object.create(Attribute.prototype);

    return {
        Extent: Extent,
        Color: Color,
        Size: Size
    };
})(vis);
