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

var app = angular.module('app',
    [
        'RestangularApp', 'BootstrapApp'
    ]
);

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
            when('/', {

                redirectTo: 'content/basics'
            });
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
            console.log(data);
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

        $scope.processForm = function () {
            console.log($scope.files);
            $scope.formData.name = $scope.files[0].name;
            $scope.formData.url = '/uploads/' + $scope.files[0].name;

            var formData = new FormData();

            formData.append('image[0]', $scope.files[0]);

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
	
var imageInfoList = [
	{
		name: "Banner",
		category: "Basics",
		favorite: "true",
	},
	{
		name: "Brain",
		category: "Icons",
		favorite: "false",
	},
	{
		name: "Arrow",
		category: "Emotions",
		favorite: "false",
	},
	{
		name: "Book",
		category: "Posters",
		favorite: "true",
	}
];

app.controller('EditController', ['$scope', 'Restangular', '$routeParams', 
	function editEntries($scope, db, $routeParams) {		
		console.log("EditController action");
		/*
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
			console.log(data);
		});
		*/

		$scope.images = imageInfoList;
		console.log(imageInfoList);
		
	}]);
	
/*
app.controller('ListController', function($scope, $rootScope) {
    $scope.list = db_list;
    
    $scope.editItem = function(item) {
        $rootScope.item = item;
    }
});

app.controller('ItemController', function($scope, $rootScope) {
    $scope.saveItem = function() {
        db_list.push($rootScope.item);
        $rootScope.item = null;
    }
});	
*/

var EditDialogController = function ($scope, $modal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: 'modal',
      controller: EditDialogInstanceController,
      size: size,
      /*resolve: {
        items: function () {
          return $scope.items;
        }
	   */
	   resolve: {
        images: function () {
          return $scope.images;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
};

var EditDialogInstanceController = function ($scope, $modalInstance, images) {

  $scope.images = images;
  $scope.selected = {
    image: $scope.images[0]
  };

  $scope.save = function () {
    $modalInstance.close($scope.selected.image);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

/*
var EditDialogInstanceController = function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.save = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
*/

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

   