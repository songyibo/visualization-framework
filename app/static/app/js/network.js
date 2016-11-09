var vis = vis || {};

vis.network = (function(vis) {
	
	function getDatasets(callback) {
		$.get('/datasets/', function(data) {
			callback(data.datasets);
		});
	}

	return { getDatasets };
})(vis);
