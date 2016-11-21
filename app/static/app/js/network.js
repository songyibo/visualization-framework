var vis = vis || {};

vis.network = (function(vis) {
	
	function getDatasets(callback) {
		$.get('/datasets/', function(response) {
			callback(response.datasets);
		});
	}

	function getDataset(dataset, callback) {
		var url = '/dataset/' + dataset + '/';
		$.get(url, function(response) {
			callback(response.dataset);
		});
	}

	return { getDatasets, getDataset };
})(vis);
