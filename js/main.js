(function () {
    angular.module('RestangularApp', ["restangular"]);

    angular.module('RestangularApp').config(function (RestangularProvider, $httpProvider) {

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        RestangularProvider.setBaseUrl('https://api.mongolab.com/api/1/databases/visualfacilitation/collections');
        RestangularProvider.setDefaultRequestParams({
            apiKey: 'mFxXtZ1opPpsET7fdrmZ7LNjI3pd2OhB'
        })
        RestangularProvider.setRestangularFields({
            id: '_id.$oid'
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
                    when('/favourites', {

                        templateUrl: 'Sections/content.html',
                        controller: 'FavouritesController'
                    }).
                    when('/tips', {

                        templateUrl: 'Sections/tips.html',
                        controller: 'TipsController'
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
                    when('/register', {

                        templateUrl: 'Sections/register.html',
                        controller: 'LoginController'
                    }).
                    when('/', {

                        redirectTo: 'content/all'
                    });
            }]).run(function ($rootScope, $location) {
            // register listener to watch route changes
            $rootScope.$on("$routeChangeStart", function (event, next, current) {
                if ($rootScope.loggedUser == null) {
                    // no logged user, we should be going to #login
                    if (next.templateUrl == "Sections/login.html") {
                        // already going to #login, no redirect needed
                    } else {
                        if (next.templateUrl != "Sections/register.html")//not going to #login or #register, we should redirect now
                            $location.path("/login");
                    }
                } else {
                }
            });
        }).service('Global', ['$location', '$rootScope', 'ngDialog', function ($location, ngDialog) {
            var global;

            return {
                showCurrentUser: function () {
                    return $rootScope.loggedUser;
                },
                showMessage: function(input){
					ngDialog.open({ 
						template: '<p>'+input+'</p>',
						className: 'ngdialog-theme-plain',
    					plain: true 
			    	});
				}

            }
        }]);

    app.controller('RegistrationController', ['$scope', 'Restangular', '$routeParams', '$http',
        function RegistrationCtrl($scope, db, $routeParams, $http) {

            $scope.title = $routeParams.tag;
            $scope.register = function () {
                if ($scope.details.password !== $scope.details.confirmPassword) {
                    alert("Passwords do not match.");
                    return;
                }

                $http({
                    method: 'POST',
                    url: 'http://moodyrest.azurewebsites.net/users',
                    headers: {'Content-Type': 'application/json'},
                    data: JSON.stringify($scope.details)})
                    .success(function (data) {
                        alert('User created successfully');

                    })
                    .error(function (data) {
                        alert(data.message);
                    });
            };
        }]);


    app.controller('TipsController', ['$scope', 'Restangular', '$routeParams', '$http',
        function TipsCtrl($scope, db, $routeParams, $http) {
            var all = db.all('content');
            all.customGET('', {"q": {"section": "tips" }}).then(function (data) {
                $scope.search = data;
                $scope.contacts = data;
            });

        }]);

    app.controller('LoginController', ['$scope', '$rootScope', 'Restangular', '$routeParams', '$http', '$cookies',
        function LoginCtrl($scope, $rootScope, db, $routeParams, $http, $cookies, Global) {

            $scope.setUserProfileInViewsModel = function () {
                $scope.profile = angular.fromJson($cookies.UserCredential);
            }

            /*set defaults based on user credentials cookie*/
            if ($cookies.UserCredential != undefined) {
//                $scope.setUserProfileInViewsModel();
                $rootScope.loggedUser = $cookies.UserCredential;

            } else {
                $rootScope.loggedUser = null;
                $scope.profile = null;
            }

            $scope.logout = function () {
                $scope.profile = undefined;
                $cookies.UserCredential = undefined;
                $rootScope.loggedUser = null;
                changeLocation('/#/login', false);

            }

            $scope.showUserName = function () {
                if ($rootScope.loggedUser) {
                    var loggedUser = JSON.parse($rootScope.loggedUser);
                    return loggedUser.username;
                } else {
                    return 'Login';
                }
            }

            //be sure to inject $scope and $location
            changeLocation = function (url, forceReload) {
                $scope = $scope || angular.element(document).scope();
                if (forceReload || $scope.$$phase) {
                    window.location = url;
                }
                else {
                    //only use this if you want to replace the history stack
                    //$location.path(url).replace();

                    //this this if you want to change the URL and add it to the history stack
                    $location.path(url);
                    $scope.$apply();
                }
            };

            $scope.login = function () {
                $http({ method: 'GET', url: 'http://moodyrest.azurewebsites.net/users/' + $scope.credentials.username + '/' + $scope.credentials.password })
                    .success(function (data) {
                        $cookies.UserCredential = JSON.stringify(data);
                        $scope.setUserProfileInViewsModel();
                        window.location.href = '/';
                    })
                    .error(function (data) {
                    	Global.showMessage('login error');
                        alert('login error');
                    });
            }

            $scope.register = function () {
                if ($scope.details.password !== $scope.details.confirmPassword) {
                    alert("Passwords do not match.");
                    return;
                }

                $http({
                    method: 'POST',
                    url: 'http://moodyrest.azurewebsites.net/users',
                    headers: {'Content-Type': 'application/json'},
                    data: JSON.stringify($scope.details)})
                    .success(function (data) {
                        alert('User created successfully');
                        window.location.href = '/#/login';

                    })
                    .error(function (data) {
                        alert(data.message);
                    });
            };

        }]);

    app.controller('DisplayController', ['$scope', 'Restangular', '$routeParams',
        function IndexCtrl($scope, db, $routeParams) {

            $scope.title = $routeParams.tag;
            var all = db.all('content');

            $scope.addToFavourites = function (picture) {
                $scope.exists = true;
                var x = db.one('content', picture._id.$oid).get().then(function (obj) {
                    var copyObj = db.copy(obj)
                    var loggedUser = JSON.parse($scope.loggedUser);
                    if (copyObj.favourites.indexOf(loggedUser.username) > -1) {
                        return;
                    }
                    ;

                    if (copyObj.favourites.length == 0) {
                        copyObj.favourites = [loggedUser.username];
                    } else {
                        copyObj.favourites.push(loggedUser.username);
                    }
                    copyObj.put();
                    picture.favourites = copyObj.favourites;
                });
            }


            $scope.removeFromFavourites = function (picture) {
                var x = db.one('content', picture._id.$oid).get().then(function (obj) {
                    var copyObj = db.copy(obj)
                    var loggedUser = JSON.parse($scope.loggedUser);
                    copyObj.favourites.splice(copyObj.favourites.indexOf(loggedUser.username), 1);

                    copyObj.put();
                    picture.favourites = copyObj.favourites;
                });
            }

            $scope.searchFilter = function (item) {

                if ($scope.query == undefined || $scope.query == '') {
                    return true;
                }

                if (item.tags.indexOf($scope.query) > -1 || item.owner.indexOf($scope.query) > -1) {
                    return true;
                }
                return false;
            };

            $scope.isInFavourites = function (picture) {

                var loggedUser = JSON.parse($scope.loggedUser);
                if (picture.favourites.indexOf(loggedUser.username) > -1) {
                    return true;
                }
                ;
                return false;
            }


            if ($routeParams.tag == "all") {
                $scope.contacts = db.all('content').getList();

            } else if ($routeParams.tag == "favourites") {
                var loggedUser = JSON.parse($scope.loggedUser);
                all.customGET('', {"q": {"favourites": loggedUser.username }}).then(function (data) {
                    $scope.search = data;
                    $scope.contacts = data;

                });
            } else {
                all.customGET('', {"q": {"section": $routeParams.tag }}).then(function (data) {
                    $scope.search = data;
                    $scope.contacts = data;
                });
            }
            ;
        }]);

    app.controller('FavouritesController', ['$scope', 'Restangular', '$routeParams',
        function IndexCtrl2($scope, db, $routeParams) {
            var all = db.all('content');

            var loggedUser = JSON.parse($scope.loggedUser);

            all.customGET('', {"q": {"favourites": loggedUser.username }}).then(function (data) {
                $scope.search = data;
                $scope.contacts = data;

            });

            $scope.removeFromFavourites = function (picture) {

                var x = db.one('content', picture._id.$oid).get().then(function (obj) {
                    var copyObj = db.copy(obj)
                    var loggedUser = JSON.parse($scope.loggedUser);
                    copyObj.favourites.splice(copyObj.favourites.indexOf(loggedUser.username), 1);


                    copyObj.put().then(function (results) {
                        $scope.contacts.splice($scope.contacts.indexOf(picture), 1);

                    });


                });
            }


        }]);


    app.controller('UploadController', ['$scope', 'Restangular', '$routeParams', '$http',
        function addContent($scope, db, $routeParams, $http) {

            // create a blank object to hold our form information
            // $scope will allow this to pass between controller and view
            $scope.formData = {section: "basics"};

            $scope.setFiles = function (element) {
                $scope.files = element.files;
                $scope.$apply(
                )
            }

            $scope.generateId = function () {
                return  Math.random().toString(36).substr(2, 9) + '_';
            };

            $scope.processForm = function () {

                var processedFilename = $scope.generateId() + $scope.files[0].name;
                $scope.formData.url = '/uploads/' + processedFilename;
                var now = new Date();

                $scope.formData.dateAdded = now;
                $scope.formData.favourites = [];
                var loggedUser = JSON.parse($scope.loggedUser);
                $scope.formData.owner = loggedUser.username;

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
                            db.all('content').post($scope.formData).then(function (response) {
                                $scope.message = 'Your form has been sent!';

                            }).otherwise(function (response) {
                                    $scope.message = 'An error occured. Please fix data and try again';
                                });

                        }).error(
                        function (data, status, headers, config) {
                            $scope.message = 'An error occured uploading image. Please fix data and try again';
                        });
                }
            };

        }]);

    app.controller('EditController', ['$scope', 'Restangular', '$http', '$routeParams', '$filter', function ($scope, db, $httpProvider, $routeParams, $filter) {

        var all = db.all('content');
        $scope.all = [];

        all.customGET('', {"q": {"section": $routeParams.tag }}).then(function (data) {
            $scope.search = data;
            $scope.contacts = data;

            // creating cached image list for modification
            for (var i = 0; i < data.length; i++) {
                $scope.all.push({
                    id: i,
                    name: data[i].name,
                    section: data[i].section,
                    tags: data[i].tags,

                    uid: data[i]._id.$oid
                });
            }
        });
    }]);

    app.controller('EditDialogController', ['$scope', '$modal', '$log', '$http', 'Restangular' ,
        function EditDialogController($scope, $modal, $log, $http, db) {

            // edit image function
            $scope.open = function (id) {
                var modalInstance = $modal.open({
                    templateUrl: 'modal',
                    controller: EditDialogInstanceController,
                    resolve: {
                        selectedImage: function () {
                            return id;
                        }
                    }
                });

                modalInstance.result.then(function (selectedImage) {
                    $log.info('image with ID: ' + id + ' was edited and is going to be saved');
                    $log.info('name: ' + selectedImage.name);
                    $log.info('section: ' + selectedImage.section);

                    if (Array.isArray(selectedImage.tags) == false) {
                        selectedImage.tags = selectedImage.tags.split(',');
                    }

                    var x = db.one('content', selectedImage.uid).get().then(function (obj) {

                        var copyObj = db.copy(obj)
                        copyObj.name = selectedImage.name;
                        copyObj.tags = selectedImage.tags;
                        copyObj.section = selectedImage.section;
                        copyObj.put();
                        $scope.all[id] = selectedImage;

                    });
                }, function () {

                    $log.info('Edid Modal dismissed at: ' + new Date());
                });
            };

            // delete image function
            $scope.delete = function (id) {
                var modalInstance = $modal.open({
                    templateUrl: 'modalDelete',
                    controller: DeleteItemInstanceController,
                    resolve: {
                        selectedImage: function () {
                            return id;
                        }
                    }
                });

                modalInstance.result.then(function (content) {

                    db.one('content', content.uid).remove().then(function (data) {
                        $scope.all.splice(content.id, 1);
                    });
                    ;


                    /*                $http.post('/delete_ajax.php', data,
                     {
                     headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
                     }).success(function (data, status, headers, config) {
                     $scope.deleteImage(id);
                     alert("file successfully deleted, response data: " + data);
                     // todo: delete file from db

                     }).error(function (data, status, headers, config) {
                     alert("deleting the file was not successful, response data: " + data);
                     });
                     }, function () {
                     $log.info('Delete Modal dismissed at: ' + new Date());*/
                });

            };
        }]);

    var EditDialogInstanceController = function ($scope, $modalInstance, selectedImage) {

        $scope.selectedImage = selectedImage;

        $scope.save = function () {
            $modalInstance.close(selectedImage);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    var DeleteItemInstanceController = function ($scope, $modalInstance, selectedImage) {

        $scope.selectedImage = selectedImage;

        $scope.deleteConfirmed = function () {
            $modalInstance.close(selectedImage);
        };

        $scope.deleteCancelled = function () {
            $modalInstance.dismiss('cancel');
        };
    };
})();


$(document).ready(function () {


    $(".categories").click(function () {
        var X = $(this).attr('id');
        if (X == 1) {
            $(".submenu-cats").hide();
            $(this).attr('id', '0');
        }
        else {
            $(".submenu-cats").show();
            $(this).attr('id', '1');
        }
        return false;
    });

    $(".account").click(function () {
        var X = $(this).attr('id');
        if (X == 1) {
            $(".submenu-account").hide();
            $(this).attr('id', '0');
        }
        else {
            $(".submenu-account").show();
            $(this).attr('id', '1');
        }

    });

    $(".account").mouseup(function () {
        return false
    });


//Mouse click on sub menu
    $(".submenu").mouseup(function () {
        return false
    });

//Mouse click on my account link
    $(".categories").mouseup(function () {
        return false
    });


//Document Click
    $(document).mouseup(function () {
        $(".submenu-account").hide();
        $(".submenu-cat").hide();
        $(".account").attr('id', '');
        $(".categories").attr('id', '');
    });


    $(".the_nav li:has(a)").click(function () {
        window.location = $("a:first", this).attr("href");
        return false;
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


});
