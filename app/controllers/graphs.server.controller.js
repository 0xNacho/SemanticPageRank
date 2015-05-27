'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Graph = mongoose.model('Graph'),
	graphUtils = require('./utils.graphs'),
	fs = require('fs'),
	keyword_extractor = require("keyword-extractor"),
	_ = require('lodash');

/**
 * Create a Graph
 */
exports.create = function(req, res) {
	var graph = new Graph(req.body);
	graphUtils.calculateGraphParameters(graph, function(newGraph){
		//Save newGraph
		newGraph.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(newGraph);
			}
		});
	})



};

/**
 * Show the current Graph
 */
exports.read = function(req, res) {
	res.jsonp(req.graph);
};

/**
 * Update a Graph
 */
exports.update = function(req, res) {
	var graph = req.graph ;

	graph = _.extend(graph , req.body);

	graphUtils.calculateGraphParameters(graph, function(newGraph){
		newGraph.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(newGraph);
			}
		});
	})

	
};

/**
 * Delete an Graph
 */
exports.delete = function(req, res) {
	var graph = req.graph ;

	graph.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(graph);
		}
	});
};

/**
 * List of Graphs
 */
exports.list = function(req, res) { 
	Graph.find().sort('-created').populate('user', 'displayName').exec(function(err, graphs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(graphs);
		}
	});
};

/**
 * Graph middleware
 */
exports.graphByID = function(req, res, next, id) { 
	Graph.findById(id).populate('user', 'displayName').exec(function(err, graph) {
		if (err) return next(err);
		if (! graph) return next(new Error('Failed to load Graph ' + id));
		req.graph = graph ;
		next();
	});
};

/**
 * Graph authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	//if (req.graph.user.id !== req.user.id) {
	//	return res.status(403).send('User is not authorized');
	//}
	next();
};
