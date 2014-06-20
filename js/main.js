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

var app = angular.module('app',
    [
        'RestangularApp'
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


app.controller('UploadController', ['$scope', 'Restangular', '$routeParams',
    function addContent($scope, db, $routeParams) {

        // create a blank object to hold our form information
        // $scope will allow this to pass between controller and view
        $scope.formData = {section: "basics"};
        
        $scope.setFiles = function(element){
			$scope.$apply(function(scope){
				console.log(element.files);
				var formData = new FormData();
			
				for (var i = 0; i < element.files.length; i++) {
					var file = element.files[i];
					formData.append('image['+i+']', file);
				}
				if(element.files && element.files.length > 0){				
					jQuery.ajax({
						url: "/uploader_ajax.php",
						type: "POST",
						data: formData,
						processData: false,  
						contentType: false,
						success: function(data){
						jQuery('#placeHolder').append('<img src="'+data['details']['content-url']+data['details']['content-name']+'"/>');
						
											
						},
				   
					});
				}
			})
		}
        
        $scope.test = function () {
        	$scope.formData.name = "hello";
        }
        
        $scope.processForm = function () {
            $scope.formData.tags.push($scope.formData.section);

            db.all('content').post($scope.formData).then(function (response) {
                $scope.message = 'Your form has been sent!';
                $scope.formData = {section: "basics"};
            }).otherwise(function (response) {
                    $scope.message = 'An error occured. Please fix data and try again';

                });

        };

    }]);


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

   