'use strict';

//Setting up route
angular.module('graphs').config(['$stateProvider',
	function($stateProvider) {
		// Graphs state routing
		$stateProvider.
		state('listGraphs', {
			url: '/graphs',
			templateUrl: 'modules/graphs/views/list-graphs.client.view.html'
		}).
		state('createGraph', {
			url: '/graphs/create',
			templateUrl: 'modules/graphs/views/create-graph.client.view.html'
		}).
		state('viewGraph', {
			url: '/graphs/:graphId',
			templateUrl: 'modules/graphs/views/view-graph.client.view.html'
		}).
		state('editGraph', {
			url: '/graphs/:graphId/edit',
			templateUrl: 'modules/graphs/views/edit-graph.client.view.html'
		});
	}
]);