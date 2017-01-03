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
            if (!this.dict[id]) {
                this.array.push(id);
                this.dict[id] = e;
                this.length++;
            } else {
                console.warn('Element already exists in the dict.');
            }
        }
    };

    OrderedDict.prototype.get = function(id) {
        return this.dict[id];
    };

    OrderedDict.prototype.remove = function(id) {
        delete this.dict[id];
        for (var i in this.array) {
            if (this.array[i] == id) {
                this.array.splice(i, 1);
                this.length--;
                break;
            }
        }
    };

    OrderedDict.prototype.next = function() {
        if (this.index < this.length) {
            return this.dict[this.array[this.index++]];
        } else {
            return null;
        }
    };

    OrderedDict.prototype.begin = function() {
        this.index = 0;
    };

    OrderedDict.prototype.end = function() {
        return (this.index >= this.length);
    };

    return {
        OrderedDict: OrderedDict
    };
})(vis);
