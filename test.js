var keyword_extractor = require("keyword-extractor"),
	_ = require('lodash');

	var graph = {}
	graph.text = "Y, viéndole don Quijote de aquella manera, con muestras de tanta tristeza, le dijo: Sábete, Sancho, que no es un hombre más que otro si no hace más que otro.\nTodas estas borrascas que nos suceden son señales de que presto ha de serenar el tiempo y han de sucedernos bien las cosas; porque no es posible que el mal ni el bien sean durables, y de aquí se sigue que, habiendo durado mucho el mal, el bien está ya cerca.\nAsí que, no debes congojarte por las desgracias que a mí me suceden, pues a ti no te cabe parte dellas.\nY, viéndole don Quijote de aquella manera, con muestras de tanta tristeza, le dijo: Sábete, Sancho, que no es un hombre más que otro si no hace más que otro.\nTodas estas borrascas que nos suceden son señales de que presto ha de serenar el tiempo y han de sucedernos bien las cosas; porque no es posible que el mal ni el bien sean durables, y de aquí se sigue que, habiendo durado mucho el mal, el bien está ya cerca."
	graph.text = graph.text.toLowerCase()
	graph.language = "auto"
	graph.textPercent= 65
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


	//At this point we have sentences without stop-words.
	var newGraph  = []
	var temporal = {}
	for(var i = 0 ; i < sentences.length; i++){
		var sentence_words = sentences[i]
		for(var j = 0; j < sentence_words.length; j++){
			var array = new Array()
			for(var k = 0; k < sentence_words.length; k++){
				if(sentence_words[j] != sentence_words[k]){
					if(temporal[sentence_words[j]] == undefined)
						temporal[sentence_words[j]] = new Array()
					temporal[sentence_words[j]].push(sentence_words[k])
				}
			}
		}
	}

	var finalGraph = []
	var i = 0
	var number_key = {}
	var key_number = {}
	for(var key in temporal){
		number_key[i] = key
		key_number[key] = i
		i++
	}

	for(var key in temporal){
		var array = []
		for(var j = 0 ; j < temporal[key].length; j++){
			array.push(key_number[temporal[key][j]])
		}	
		finalGraph.push(array)
	}

	var Pagerank = require('pagerank-js');
	nodes = finalGraph
	linkProb = 0.85 //high numbers are more stable
	tolerance = 0.0001 //sensitivity for accuracy of convergence. 
	var sentences_score = {}

	Pagerank(nodes, linkProb, tolerance, function (err, res) {
	    if (err) throw new Error(err)
	    //res contains data. word - score

		for(var i = 0 ; i < sentences.length; i++){
			var total_sentence_score = 0
			for(var j = 0 ; j < sentences[i].length; j++){
				var index = number_key[sentences[i][j]]
				total_sentence_score+=res[index]
			}
			sentences_score[i] = total_sentence_score
			total_sentence_score = 0
		}	    
		var sentencesWithStopWords = graph.text.split('\n')
		graph.finalTextWithCssPresentation = ''
		for(var key in sentences_score){
			if(sentences_score[key] <= (graph.textPercent/100.0)){
				graph.finalTextWithCssPresentation+= '<b>'+sentencesWithStopWords[key]+'</b>'
			}else
				graph.finalTextWithCssPresentation+= sentencesWithStopWords[key];

		}
	})


