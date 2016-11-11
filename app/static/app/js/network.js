var vis = vis || {};

vis.network = (function(vis) {
	
	function getDatasets(callback) {
		$.get('/datasets/', function(data) {
			callback(data.datasets);
		});
	}

	function getDataset(dataset, callback) {
		var url = '/dataset/' + dataset + '/';
		$.get(url, function(data) {
			callback(data.dataset);
		});
	}

	return { getDatasets, getDataset };
})(vis);
