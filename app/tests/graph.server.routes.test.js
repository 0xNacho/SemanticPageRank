'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Graph = mongoose.model('Graph'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, graph;

/**
 * Graph routes tests
 */
describe('Graph CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Graph
		user.save(function() {
			graph = {
				name: 'Graph Name'
			};

			done();
		});
	});

	it('should be able to save Graph instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Graph
				agent.post('/graphs')
					.send(graph)
					.expect(200)
					.end(function(graphSaveErr, graphSaveRes) {
						// Handle Graph save error
						if (graphSaveErr) done(graphSaveErr);

						// Get a list of Graphs
						agent.get('/graphs')
							.end(function(graphsGetErr, graphsGetRes) {
								// Handle Graph save error
								if (graphsGetErr) done(graphsGetErr);

								// Get Graphs list
								var graphs = graphsGetRes.body;

								// Set assertions
								(graphs[0].user._id).should.equal(userId);
								(graphs[0].name).should.match('Graph Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Graph instance if not logged in', function(done) {
		agent.post('/graphs')
			.send(graph)
			.expect(401)
			.end(function(graphSaveErr, graphSaveRes) {
				// Call the assertion callback
				done(graphSaveErr);
			});
	});

	it('should not be able to save Graph instance if no name is provided', function(done) {
		// Invalidate name field
		graph.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Graph
				agent.post('/graphs')
					.send(graph)
					.expect(400)
					.end(function(graphSaveErr, graphSaveRes) {
						// Set message assertion
						(graphSaveRes.body.message).should.match('Please fill Graph name');
						
						// Handle Graph save error
						done(graphSaveErr);
					});
			});
	});

	it('should be able to update Graph instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Graph
				agent.post('/graphs')
					.send(graph)
					.expect(200)
					.end(function(graphSaveErr, graphSaveRes) {
						// Handle Graph save error
						if (graphSaveErr) done(graphSaveErr);

						// Update Graph name
						graph.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Graph
						agent.put('/graphs/' + graphSaveRes.body._id)
							.send(graph)
							.expect(200)
							.end(function(graphUpdateErr, graphUpdateRes) {
								// Handle Graph update error
								if (graphUpdateErr) done(graphUpdateErr);

								// Set assertions
								(graphUpdateRes.body._id).should.equal(graphSaveRes.body._id);
								(graphUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Graphs if not signed in', function(done) {
		// Create new Graph model instance
		var graphObj = new Graph(graph);

		// Save the Graph
		graphObj.save(function() {
			// Request Graphs
			request(app).get('/graphs')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Graph if not signed in', function(done) {
		// Create new Graph model instance
		var graphObj = new Graph(graph);

		// Save the Graph
		graphObj.save(function() {
			request(app).get('/graphs/' + graphObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', graph.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Graph instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Graph
				agent.post('/graphs')
					.send(graph)
					.expect(200)
					.end(function(graphSaveErr, graphSaveRes) {
						// Handle Graph save error
						if (graphSaveErr) done(graphSaveErr);

						// Delete existing Graph
						agent.delete('/graphs/' + graphSaveRes.body._id)
							.send(graph)
							.expect(200)
							.end(function(graphDeleteErr, graphDeleteRes) {
								// Handle Graph error error
								if (graphDeleteErr) done(graphDeleteErr);

								// Set assertions
								(graphDeleteRes.body._id).should.equal(graphSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Graph instance if not signed in', function(done) {
		// Set Graph user 
		graph.user = user;

		// Create new Graph model instance
		var graphObj = new Graph(graph);

		// Save the Graph
		graphObj.save(function() {
			// Try deleting Graph
			request(app).delete('/graphs/' + graphObj._id)
			.expect(401)
			.end(function(graphDeleteErr, graphDeleteRes) {
				// Set message assertion
				(graphDeleteRes.body.message).should.match('User is not logged in');

				// Handle Graph error error
				done(graphDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Graph.remove().exec();
		done();
	});
});