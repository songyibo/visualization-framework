var vis = vis || {};

vis.network = (function(vis) {
    return {
        getDatasets: function(callback) {
            return $.get('/datasets/', function(response) {
                callback(response.datasets);
            });
        },
        getDataset: function(dataset, callback) {
            var url = '/dataset/' + dataset + '/';
            return $.get(url, function(response) {
                callback(response.dataset);
            });
        }
    };
})(vis);
