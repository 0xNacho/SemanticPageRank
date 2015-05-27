'use strict';
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Graph = mongoose.model('Graph'),
	fs = require('fs'),
	keyword_extractor = require("keyword-extractor"),
	_ = require('lodash');


exports.calculateGraphParameters = function(graph, callback){
_ = require('lodash');
	graph.text = graph.text.toLowerCase()
	//Check auto language
	if(graph.language === 'auto'){
		var lngDetector = new (require('languagedetect'));
		graph.language = lngDetector.detect(graph.text, 2)[0][0].toLowerCase();
	}

	var sentences = graph.text.split('\n');
	var phrases = []
	for(var i = 0 ; i < sentences.length; i++){
		//Remove stop-words
		sentences[i] = keyword_extractor.extract(sentences[i],{
			language: graph.language,
			remove_digits: true,
			return_changed_case:true,
			remove_duplicates: false
		});
	}

	for(var i = 0 ; i < sentences.length; i++){
		console.log(sentences[i]+"\n")
	}

	//At this point we have sentences without stop-words.
	var newGraph  = []
	var temporal = {}
	var graph_links = []
	for(var i = 0 ; i < sentences.length; i++){
		var sentence_words = sentences[i]
		for(var j = 0; j < sentence_words.length; j++){
			var array = new Array()
			for(var k = 0; k < sentence_words.length; k++){
				if(sentence_words[j] != sentence_words[k]){
					if(temporal[sentence_words[j]] == undefined)
						temporal[sentence_words[j]] = new Array()
					temporal[sentence_words[j]].push(sentence_words[k]);
					graph_links.push({"source": j, "target": k});
				}
			}
		}
	}
	//PageRank graph.
	var finalGraph = [];
	var i = 0;
	var number_key = {};
	var key_number = {};
	for(var key in temporal){
		number_key[i] = key;
		key_number[key] = i;
		i++;
	}

	for(var key in temporal){
		var array = [];
		for(var j = 0 ; j < temporal[key].length; j++){
			array.push(key_number[temporal[key][j]]);
		}	
		finalGraph.push(array);
	}

	var Pagerank = require('pagerank-js');
	var nodes = finalGraph;
	var linkProb = 0.85; //high numbers are more stable
	var tolerance = 0.0001; //sensitivity for accuracy of convergence. 
	var sentences_score = {};

		Pagerank(nodes, linkProb, tolerance, function (err, res) {
		    if (err) throw new Error(err)
		    //res contains data. word - score
			var graph_nodes = [];
			for(var i = 0 ; i < res.length; i++){
				graph_nodes.push({"name": number_key[i]+' - ' +Math.round(res[i]*100000)/100000})
			}
			for(var i = 0 ; i < sentences.length; i++){
				var total_sentence_score = 0;
				for(var j = 0 ; j < sentences[i].length; j++){
					var index = key_number[sentences[i][j]];
					total_sentence_score+=res[index];
				}
				sentences_score[i] = total_sentence_score;
				total_sentence_score = 0;
			}	    
			var sentencesWithStopWords = graph.text.split('\n')
			graph.finalTextWithCssPresentation = '';
			for(var key in sentences_score){
				if(sentences_score[key] <= (graph.textPercent/100.0)){
					graph.finalTextWithCssPresentation+= '<u>'+sentencesWithStopWords[key]+'</u>';
				}else
					graph.finalTextWithCssPresentation+= sentencesWithStopWords[key];

			}
			graph.json = JSON.stringify({"nodes": graph_nodes, "links": graph_links});
			callback(graph);

	})
};