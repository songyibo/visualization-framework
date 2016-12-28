var vis = vis || {};

vis.attr = (function(vis) {
    'use strict';

    function Attribute() {
        this.color = 'f0f0f0';
        this.enabled = false;
    }

    function Extent() {
        Attribute.call(this);
        this.name = 'extent';
        this.text = 'Extent';
        this.color = '#80fa7f';
    }
    Extent.prototype = Object.create(Attribute.prototype);

    function Color() {
        Attribute.call(this);
        this.name = 'color';
        this.text = 'Color';
        this.color = '#fafaae';
    }
    Color.prototype = Object.create(Attribute.prototype);

    function Size() {
        Attribute.call(this);
        this.name = 'size';
        this.text = 'Size';
        this.color = '#95dcfa';
    }
    Size.prototype = Object.create(Attribute.prototype);

    function Opacity() {
        Attribute.call(this);
        this.name = 'opacity';
        this.text = 'Opacity';
        this.color = '#bebebe'
    }
    Opacity.prototype = Object.create(Attribute.prototype);

    return {
        Extent: Extent,
        Color: Color,
        Size: Size,
        Opacity: Opacity
    };
})(vis);
