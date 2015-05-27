'use strict';
var aa;
// Graphs controller
angular.module('graphs').controller('GraphsController', ['$scope', '$stateParams', '$location', 'Graphs',
	function($scope, $stateParams, $location, Graphs) {

		// Create new Graph
		$scope.create = function() {
			// Create new Graph object
			var graph = new Graphs ({
				name: this.name,
				text: this.text,
				language: this.language,
				textPercent: this.textPercent
			});

			// Redirect after save
			graph.$save(function(response) {
				$location.path('graphs/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Graph
		$scope.remove = function(graph) {
			if ( graph ) { 
				graph.$remove();

				for (var i in $scope.graphs) {
					if ($scope.graphs [i] === graph) {
						$scope.graphs.splice(i, 1);
					}
				}
			} else {
				$scope.graph.$remove(function() {
					$location.path('graphs');
				});
			}
		};

		// Update existing Graph
		$scope.update = function() {
			var graph = $scope.graph;

			graph.$update(function() {
				$location.path('graphs/' + graph._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Graphs
		$scope.find = function() {
			$scope.graphs = Graphs.query();
		};

		// Find existing Graph
		$scope.findOne = function() {
			$scope.graph = Graphs.get({ 
				graphId: $stateParams.graphId
			});
		};
		$scope.findOneAndShowOne = function() {
			$scope.graph = Graphs.get({ 
				graphId: $stateParams.graphId
			}, function(){
				
				aa = $scope.graph
				$scope.graph.json = JSON.parse($scope.graph.json)
				var width = 960,
				    height = 700;
				var color = d3.scale.category20();
				var force = d3.layout.force()
				    .charge(-120)
				    .linkDistance(30)
				    .size([width, height]);
				var svg = d3.select("#graph_area").append("svg")
				    .attr("width", width)
				    .attr("height", height);

				var drawGraph = function(graph) {
				  force
				      .nodes(graph.nodes)
				      .links(graph.links)
				      .start();

				  var link = svg.selectAll(".link")
				      .data(graph.links)
				    .enter().append("line")
				      .attr("class", "link")
				      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

				  var gnodes = svg.selectAll('g.gnode')
				     .data(graph.nodes)
				     .enter()
				     .append('g')
				     .classed('gnode', true);
				    
				  var node = gnodes.append("circle")
				      .attr("class", "node")
				      .attr("r", 10)
				      .style("fill", function(d) { return color(d.group); })
				      .call(force.drag);

				  var labels = gnodes.append("text")
				      .text(function(d) { return d.name; });

				  console.log(labels);
				    
				  force.on("tick", function() {
				    link.attr("x1", function(d) { return d.source.x; })
				        .attr("y1", function(d) { return d.source.y; })
				        .attr("x2", function(d) { return d.target.x; })
				        .attr("y2", function(d) { return d.target.y; });

				    gnodes.attr("transform", function(d) { 
				        return 'translate(' + [d.x, d.y] + ')'; 
				    });
				      
				  });
				};
				drawGraph($scope.graph.json);
				
			});
		};
	}
]);