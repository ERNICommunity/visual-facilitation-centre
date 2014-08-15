(function(){
	angular.module('RestangularApp', ["restangular"]);

	angular.module('RestangularApp').config(function (RestangularProvider, $httpProvider) {

		$httpProvider.defaults.useXDomain = true;
		delete $httpProvider.defaults.headers.common['X-Requested-With'];

		RestangularProvider.setBaseUrl('https://api.mongolab.com/api/1/databases/visualfacilitation/collections');
		RestangularProvider.setDefaultRequestParams({
			apiKey: 'mFxXtZ1opPpsET7fdrmZ7LNjI3pd2OhB'
		})
		RestangularProvider.setRestangularFields({
			id: '_id'
		});
		RestangularProvider.setRequestInterceptor(function (elem, operation, what) {
			if (operation === 'put') {
				elem._id = undefined;
				return elem;
			}
			return elem;
		});
	});

	angular.module('BootstrapApp', ['ui.bootstrap']);

	var app = angular.module('app', ['RestangularApp', 'BootstrapApp', 'ngCookies']);

	app.config(['$routeProvider',
		function ($routeProvider) {
        $routeProvider.
            when('/content/:tag', {

                templateUrl: 'Sections/content.html',
                controller: 'DisplayController'
            }).
            when('/upload', {

                templateUrl: 'Sections/upload.html',
                controller: 'UploadController'
            }).
			when('/edit', {
				templateUrl: 'Sections/edit.html',
				controller: 'EditController'
			}).
            when('/login', {

                templateUrl: 'Sections/login.html',
                controller: 'LoginController'
            }).
            when('/', {

                redirectTo: 'content/basics'
            });
    }]);

	app.controller('LoginController', ['$scope', 'Restangular', '$routeParams', '$http', '$cookies',
        function LoginCtrl($scope, db, $routeParams, $http, $cookies) {
			$scope.loginLabel;
			
			if($cookies.UserCredential){
				$scope.profile = angular.fromJson($cookies.UserCredential);	
				$scope.loginLabel = 'logout';
			} else {
				$scope.profile;
				$scope.loginLabel = 'login';
			}
			
			$scope.toggle
			
			$scope.log = function(){
				if($scope.loginLabel == 'login'){
					$scope.logout();
					$scope.loginLabel = 'logout';
				} else {
					$scope.login($scope.credentials);
					$scope.loginLabel = 'login';
				}
			}
			
			$scope.logout = function(){
				$scope.profile = undefined;
			}
            
            $scope.login = function(){
                $http({ method: 'GET', url: 'http://moodyrest.azurewebsites.net/users/' + $scope.credentials.username + '/' + $scope.credentials.password })
                .success(function (data)
                {
					$cookies.UserCredential = JSON.stringify(data);
                    alert(JSON.stringify(data));
                })
                .error(function (data)
                {
                    alert('you failed');
                });
            }
        }]);

	app.controller('DisplayController', ['$scope', 'Restangular', '$routeParams',
		function IndexCtrl($scope, db, $routeParams) {

        $scope.title = $routeParams.tag;
        var all = db.all('content');

        // SEARCH
        all.customGET('', {"q": {"section": $routeParams.tag }}).then(function (data) {
            $scope.search = data;

            $scope.contacts = data;

            console.log(data);
        });

        // SEARCH
        db.several('items', '?q=' + JSON.stringify({"name": {"$in": ["angularjs"] }})).getList().then(function (data) {
            $scope.search = data;
            console.log(data.files);
        });

    }]);


	app.controller('UploadController', ['$scope', 'Restangular', '$routeParams', '$http',
		function addContent($scope, db, $routeParams, $http) {

        // create a blank object to hold our form information
        // $scope will allow this to pass between controller and view
        $scope.formData = {section: "basics"};

        $scope.setFiles = function (element) {
            $scope.files = element.files;
            $scope.$apply(
                /*
                 function(scope){
                 console.log(element.files);

                 var formData = new FormData();

                 for (var i = 0; i < element.files.length; i++) {
                 var file = element.files[i];
                 formData.append('image['+i+']', file);
                 }

                 tempName = element.files[0].name;
                 tempURL = '/uploads';

                 if(element.files && element.files.length > 0){
                 jQuery.ajax({
                 url: "/uploader_ajax.php",
                 type: "POST",
                 data: formData,
                 processData: false,
                 contentType: false,
                 success: function(data){
                 jQuery('#placeHolder').attr('src', data['details']['content-url']+data['details']['content-name']);


                 },

                 });
                 }

                 }
                 */
            )

        }

        $scope.upload = function () {

        }

        $scope.test = function () {
            $scope.formData.name = "hello";
        }

		$scope.generateId = function () {
			return  Math.random().toString(36).substr(2, 9) + '_';
		};

        $scope.processForm = function () {            
        
			var processedFilename = $scope.generateId() + $scope.files[0].name;			
            $scope.formData.url = '/uploads/' + processedFilename;
			
			
            var formData = new FormData();

            formData.append('image[0]', $scope.files[0], processedFilename);
            
            if ($scope.files && $scope.files.length > 0) {
                $http.post('/uploader_ajax.php', formData,
                    {
                        headers: { 'Content-Type': undefined },
                        transformRequest: angular.identity
                    }).success(
                    function (data, status, headers, config) {
                        if (typeof(data) != 'undefined' && typeof(data.details) != 'undefined') {
                            jQuery('#placeHolder').attr('src', data['details']['content-url'] + data['details']['content-name']);
                        }

                        //$scope.formData.tags.push($scope.formData.section);

                        db.all('content').post($scope.formData).then(function (response) {
                            $scope.message = 'Your form has been sent!';

                        }).otherwise(function (response) {
                                $scope.message = 'An error occured. Please fix data and try again';
                            });

                    }).error(
                    function (data, status, headers, config) {
                        $scope.message = 'An error occured uploading image. Please fix data and try again';
                    });
                //jQuery.ajax({
                //    url: "/uploader_ajax.php",
                //    type: "POST",
                //    data: formData,
                //    processData: false,
                //    contentType: false,
                //    success: function (data) {
                //        jQuery('#placeHolder').attr('src', data['details']['content-url'] + data['details']['content-name']);
                //    },
                //});
            }
        };

    }]);
	
	app.controller('EditController', ['$scope', 'Restangular', '$routeParams', 
		function editEntries($scope, db, $routeParams) {		
		console.log("EditController action");
		
		$scope.title = $routeParams.tag;
		var all = db.all('content');

		$scope.images = [];

		// SEARCH
		all.customGET('', {"q": {"section": $routeParams.tag }}).then(function (data) {
			$scope.search = data;
			$scope.contacts = data;
			
			// creating cached image list for modification
			for(var i = 0; i< data.length; i++){
				$scope.images.push({
					id: i,
					name: data[i].name,
					section: data[i].section,
					tags: data[i].tags,
					favorite: false,		
				});
			}
			console.log($scope.images);
		});
		
		$scope.deleteImage = function (id) {
		// delete image and sort remaining image id's new 
            $scope.images.splice(id, 1);
			console.log($scope.images);		
			for(var i = 0;i < $scope.images.length; i++){
				$scope.images[i].id = i; 
			}		
        }
		
	}]);
	
	app.controller('EditDialogController', ['$scope', '$modal', '$log', 
		function EditDialogController($scope, $modal, $log) {
			
			// edit image function
			$scope.open = function (id) {
				var modalInstance = $modal.open({
				  templateUrl: 'modal',
				  controller: EditDialogInstanceController,
				  resolve: {
					selectedImage: function() {
						return $scope.images[id];
					}
				  }
				});
				
				modalInstance.result.then(function (selectedImage) {
				  $log.info('image with ID: ' + id + ' was edited and is going to be saved');
				  $log.info('name: ' + selectedImage.name);
				  $log.info('section: ' + selectedImage.section);
				  $log.info('favorite: ' + selectedImage.favorite);
				  $log.info('tags: ' + selectedImage.tags);
				  $scope.images[id] = selectedImage;
				}, function () {
				  $log.info('Edid Modal dismissed at: ' + new Date());
				});
			};
			
			// delete image function
			$scope.delete = function(id){
				var modalInstance = $modal.open({
				  templateUrl: 'modalDelete',
				  controller: DeleteItemInstanceController,
				  resolve: {
					selectedImage: function() {
						return $scope.images[id];
					}
				  }
				});
	
				modalInstance.result.then(function (id) {
				  $log.info('image to be deleted: ' + id);
				  $scope.deleteImage(id);
				}, function () {
				  $log.info('Delete Modal dismissed at: ' + new Date());
				});
			};
	}]);

	var EditDialogInstanceController = function ($scope, $modalInstance, selectedImage) {

		$scope.selectedImage = selectedImage;

		$scope.save = function () {
			$modalInstance.close($scope.selectedImage);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	};
	
	var DeleteItemInstanceController = function ($scope, $modalInstance, selectedImage) {

		$scope.selectedImage = selectedImage;

		$scope.deleteConfirmed = function () {
			$modalInstance.close(selectedImage.id);
		};

		$scope.deleteCancelled = function () {
			$modalInstance.dismiss('cancel');
		};
	};
})();


$(document).ready(function () {

    $(".the_nav li:has(a)").click(function () {
        window.location = $("a:first", this).attr("href");
    });


    $.ajaxSetup({cache: false});
    var $nav = $('#primary_nav');

    $('.item').click(function () {

        //'unselect' all the rest

        $('.menu li').each(function (index, element) {
            $(this).removeClass('active'); // set all links' style to unselected first
        });

        // $(this) is now the link user has clicked on

        $(this).addClass('active'); // class you want to use for the link user clicked
    });

// Collapsing
    $('[data-action="nav_switch"]').click(function () {
        var $switch = $(this);

        $nav.toggleClass('collapsing');

        $switch.find('i').toggleClass("fa-chevron-circle-left fa-chevron-circle-right");


        if ($nav.hasClass('collapsing')) {
            $switch.find('span').text('Pin Menu');
        } else {
            $switch.find('span').text('Unpin Menu');
        }
    });

    $nav.hover(function () {
        if ($nav.hasClass('collapsing')) {
            $(this).toggleClass('collapsed');
        }
    });

// Submenus
    $('.has_submenu').hover(
        function () {
            var $sub = $(this).find('.submenu');

            var subheight = $sub.outerHeight(),
                subtop = $sub.offset(),
                winheight = $(window).height();

            /* var maxoffset = 0,
             curTop = $sub.css('margin-top');

             if ((subheight + subtop.top) >= winheight) {
             maxoffset = (0 - (subheight - 42));
             }

             $sub.css('margin-top', maxoffset );*/
        }
    );


});