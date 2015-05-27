'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var graphs = require('../../app/controllers/graphs.server.controller');

	// Graphs Routes
	app.route('/graphs')
		.get(graphs.list)
		.post(users.requiresLogin, graphs.create);

	app.route('/graphs/:graphId')
		.get(graphs.read)
		.put(users.requiresLogin, graphs.hasAuthorization, graphs.update)
		.delete(users.requiresLogin, graphs.hasAuthorization, graphs.delete);

	// Finish by binding the Graph middleware
	app.param('graphId', graphs.graphByID);
};
