'use strict';

(function() {
	// Graphs Controller Spec
	describe('Graphs Controller Tests', function() {
		// Initialize global variables
		var GraphsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Graphs controller.
			GraphsController = $controller('GraphsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Graph object fetched from XHR', inject(function(Graphs) {
			// Create sample Graph using the Graphs service
			var sampleGraph = new Graphs({
				name: 'New Graph'
			});

			// Create a sample Graphs array that includes the new Graph
			var sampleGraphs = [sampleGraph];

			// Set GET response
			$httpBackend.expectGET('graphs').respond(sampleGraphs);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.graphs).toEqualData(sampleGraphs);
		}));

		it('$scope.findOne() should create an array with one Graph object fetched from XHR using a graphId URL parameter', inject(function(Graphs) {
			// Define a sample Graph object
			var sampleGraph = new Graphs({
				name: 'New Graph'
			});

			// Set the URL parameter
			$stateParams.graphId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/graphs\/([0-9a-fA-F]{24})$/).respond(sampleGraph);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.graph).toEqualData(sampleGraph);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Graphs) {
			// Create a sample Graph object
			var sampleGraphPostData = new Graphs({
				name: 'New Graph'
			});

			// Create a sample Graph response
			var sampleGraphResponse = new Graphs({
				_id: '525cf20451979dea2c000001',
				name: 'New Graph'
			});

			// Fixture mock form input values
			scope.name = 'New Graph';

			// Set POST response
			$httpBackend.expectPOST('graphs', sampleGraphPostData).respond(sampleGraphResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Graph was created
			expect($location.path()).toBe('/graphs/' + sampleGraphResponse._id);
		}));

		it('$scope.update() should update a valid Graph', inject(function(Graphs) {
			// Define a sample Graph put data
			var sampleGraphPutData = new Graphs({
				_id: '525cf20451979dea2c000001',
				name: 'New Graph'
			});

			// Mock Graph in scope
			scope.graph = sampleGraphPutData;

			// Set PUT response
			$httpBackend.expectPUT(/graphs\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/graphs/' + sampleGraphPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid graphId and remove the Graph from the scope', inject(function(Graphs) {
			// Create new Graph object
			var sampleGraph = new Graphs({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Graphs array and include the Graph
			scope.graphs = [sampleGraph];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/graphs\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleGraph);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.graphs.length).toBe(0);
		}));
	});
}());