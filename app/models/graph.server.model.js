'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Graph Schema
 */
var GraphSchema = new Schema({
	name: {
		type: String,
		default: 'Empty graph name',
		required: 'Please fill Graph name',
		trim: true
	},
	text: {
		type: String,
		default: '',
		required: 'Please fill Graph text',
		trim: true
	},
	finalTextWithCssPresentation:{
		type: String,
		trim: true
	},
	textPercent: {
		type: Number,
		min: 1, 
		max: 100,
		required: 'Please fill  Text Percent, betweeen 1 and 100)',
	},
	language: {
		type: String,
		default: 'es',
		required: 'Please fill Graph language',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	json: {
		type: String
	}
});

mongoose.model('Graph', GraphSchema);