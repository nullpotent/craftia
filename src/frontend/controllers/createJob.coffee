define ["./module", "json!cities", "json!categories"], (module, cities, categories) ->

	module.controller "CreateJobCtrl", [
		"$scope"
		"$state"
		"$http"
		"appUser"
		"logger"
		"cAPI"
		($scope, $state, $http, appUser, log, API) ->
			$scope.title1 = "Enter job details"
			$scope.title2 = "Upload job photos"
			
			$scope.firstStep = true
			$scope.secondStep = false

			job = 
				dateFrom: new Date
				dateTo: new Date

			job.jobPhotos = []
			$scope.job = job
			$scope.subcategories = []
			$scope.categories = Object.keys(categories)
			
			$scope.getCities = ->
				return cities
			
			$scope.categoryChanged = (cat) ->
				jsonFile = categories[job.category]
				console.log jsonFile, job
				require [ "json!#{jsonFile}" ], (data) ->
					$scope.subcategories = data.subcategories.slice()
					$scope.$digest()

			$scope.create = ->
				$http.post API.createJob, job
				.success (data) ->
					console.log data
					log.success "Job created!"
					appUser.createdJobs or= []
					appUser.createdJobs.push data
					console.log appUser, appUser.createJobs
					$state.transitionTo "customer.jobs"
				.error (err) ->
					log.error err
					$state.transitionTo "customer"
			
			$scope.nextStep = ->
				$scope.firstStep = false
				$scope.secondStep = true

			$scope.prevStep = ->
				$scope.firstStep = true
				$scope.secondStep = false

			$scope.photoUploaded = (file, content) ->
				console.log file, content
				console.log job
				# job.jobPhotos[index].img = content
	]