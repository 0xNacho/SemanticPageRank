'use strict';

//Graphs service used to communicate Graphs REST endpoints
angular.module('graphs').factory('Graphs', ['$resource',
	function($resource) {
		return $resource('graphs/:graphId', { graphId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);