var vis = vis || {};

vis.util = (function(vis) {
    function OrderedDict(idName) {
        this.length = 0;
        this.array = [];
        this.dict = {};
    }

    OrderedDict.prototype.push = function(key, value) {
        if (key) {
            if (!this.dict[key]) {
                this.array.push(key);
                this.dict[key] = value;
                this.length++;
            } else {
                console.warn('Element already exists in the dict.');
            }
        }
    };

    OrderedDict.prototype.get = function(key) {
        return this.dict[key];
    };

    OrderedDict.prototype.at = function(index) {
        return this.dict[this.array[index]];
    };

    OrderedDict.prototype.key = function(index) {
        return this.array[index];
    };

    OrderedDict.prototype.remove = function(key) {
        if (this.dict.hasOwnProperty(key)) {
            delete this.dict[key];
            for (var i in this.array) {
                if (this.array[i] == key) {
                    this.array.splice(i, 1);
                    this.length--;
                    break;
                }
            }
        }
    };

    return {
        OrderedDict: OrderedDict
    };
})(vis);
