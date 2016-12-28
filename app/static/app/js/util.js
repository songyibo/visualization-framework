var vis = vis || {};

vis.util = (function(vis) {
    function OrderedDict(idName) {
        this.idName = idName || 'id';

        this.length = 0;
        this.array = [];
        this.dict = {};

        this.index = 0;
    }

    OrderedDict.prototype.add = function(e) {
        var id = e[this.idName];
        if (id) {
            this.array.push(id);
            this.dict[id] = e;
            this.length++;
        }
    };

    OrderedDict.prototype.next = function() {
        if (this.index < this.length) {
            return this.dict[this.array[this.index++]];
        } else {
            return null;
        }
    };

    OrderedDict.prototype.reset = function() {
        this.index = 0;
    };

    OrderedDict.prototype.end = function() {
        return (this.index >= this.length);
    };

    return {
        OrderedDict: OrderedDict
    };
})(vis);
