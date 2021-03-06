(function () {
    angular.module('RestangularApp', ["restangular"]);
    angular.module('RestangularApp').config(function (RestangularProvider, $httpProvider) {

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];


        RestangularProvider.setBaseUrl('https://api.mongolab.com/api/1/databases/visualfacilitation/collections');
        RestangularProvider.setDefaultRequestParams({
            apiKey: 'mFxXtZ1opPpsET7fdrmZ7LNjI3pd2OhB'
        });


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
    angular.module('FileUploaderApp', ['angularFileUpload']);

    var app = angular.module('app', ['RestangularApp', 'BootstrapApp', 'ngCookies', 'ngDialog', 'FileUploaderApp']);


    app.directive('triggerChange', function ($sniffer) {
        return {
            link: function (scope, elem, attrs) {
                elem.bind('click', function () {
                    $(attrs.triggerChange).trigger($sniffer.hasEvent('input') ? 'input' : 'change');
                });
            },
            priority: 1
        }
    });


    app.directive('tager', function () {


        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).tagsInput({
                    'height': '100px',
                    'width': '200px',
                    onAddTag: function onAddTag(tag) {
                        if (scope.selectedImage.tags == undefined) {

                            scope.selectedImage.tags = [];
                        }
                        ;
                        scope.selectedImage.tags.push(tag.replace(/ +$/, ""));
                    },
                    onRemoveTag: function onAddTag(tag) {
                        scope.selectedImage.tags.splice(scope.selectedImage.tags.indexOf(tag));
                    }
                });

                if (scope.selectedImage.tags != undefined) {

                    $(element).importTags(scope.selectedImage.tags.join());
                }
                ;

            }
        };
    });

    app.directive('tagerupload', function () {


        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).tagsInput({
                    'height': '50px',
                    'width': '700px',
                    onAddTag: function onAddTag(tag) {
                        if (scope.formData.tags == undefined) {

                            scope.formData.tags = [];
                        }
                        scope.formData.tags.push(tag.replace(/ +$/, ""));
                    },
                    onRemoveTag: function onAddTag(tag) {
                        scope.formData.tags.splice(scope.formData.tags.indexOf(tag));
                    }
                });


            }
        };
    });


    app.config(['$routeProvider', 'ngDialogProvider',
            function ($routeProvider, ngDialogProvider) {
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
                    when('/welcome', {

                        templateUrl: 'Sections/welcome.html',
                        controller: 'TipsController'
                    }).
                    when('/register', {

                        templateUrl: 'Sections/register.html',
                        controller: 'LoginController'
                    }).
                    when('/forgotpassword', {

                        templateUrl: 'Sections/forgotpassword.html',
                        controller: 'PasswordController'
                    }).
                    when('/', {

                        redirectTo: 'welcome'
                    });
            }]).run(function ($rootScope, $location) {
            // register listener to watch route changes
            $rootScope.$on("$routeChangeStart", function (event, next, current) {
                $rootScope.query = '';

                if (next.templateUrl === "Sections/forgotpassword.html") {
                    return;

                }
                ;

                if ($rootScope.loggedUser == null || $rootScope.loggedUser == 'undefined') {
                    // no logged user, we should be going to #login
                    if (next.templateUrl != "Sections/login.html") {
                        // only go to #login if not already there
                        if (next.templateUrl != "Sections/register.html") {
                            //not going to #login or #register, we should redirect now
                            $location.path("/login");
                        }
                    }
                    // } else {
                }

            });
        }).service('Global', ['$location', 'ngDialog', function ($location, ngDialog) {
            var global;

            return {
                showCurrentUser: function () {
                    return $rootScope.loggedUser;
                },
                showMessage: function (input) {
                    ngDialog.open({
                        template: '<p>' + input + '</p>',
                        className: 'ngdialog-theme-plain',
                        plain: true
                    });
                }

            }
        }]);


    app.controller('AppController', ['$scope', 'FileUploader', 'Restangular', function ($scope, FileUploader, db) {
        var uploader = $scope.uploader = new FileUploader({
            url: 'upload.php',
            queueLimit: 1
        });

        // FILTERS

        uploader.filters.push({
            name: 'imageFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });


        $scope.doUpload = function () {
            uploader.queue[0].file.name = Math.random().toString(36).substr(2, 9) + '_' + uploader.queue[0].file.name;
            uploader.queue[0].upload();
        };


        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function (fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function (addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function (item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function (fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function (progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function (fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function (fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function (fileItem, response, status, headers) {


            var processedFilename = uploader.queue[0].file.name;
            $scope.formData.url = '/uploads/' + processedFilename;
            var now = new Date();

            $scope.formData.dateAdded = now;
            $scope.formData.favourites = [];
            var loggedUser = JSON.parse($scope.loggedUser);
            $scope.formData.owner = loggedUser.username;

            var formData = new FormData();

            Notifier.success('Uploading content', 3000);

            db.all('content').post($scope.formData).then(function (response) {

                Notifier.success('Your content has been uploaded', 3000);
                window.location.href = '/';

            }).otherwise(function (response) {
                    $scope.message = 'An error occured. Please fix data and try again';
                });

//                    }).error(
//                    function (data, status, headers, config) {
//                        $scope.message = 'An error occured uploading image. Please fix data and try again';
//                    });


            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function () {
            console.info('onCompleteAll');
        };

        console.info('uploader', uploader);
    }]);


    app.controller('RegistrationController', ['$scope', 'Restangular', '$routeParams', '$http', 'Global',
        function RegistrationCtrl($scope, db, $routeParams, $http, Global) {


            $scope.searchHint = "search in " + $routeParams.tag;


            $scope.title = $routeParams.tag;
            $scope.register = function () {
                if ($scope.details.password !== $scope.details.confirmPassword) {
                    Global.showMessage('Passwords do not match.');
                    //alert("");
                    return;
                }

                $http({
                    method: 'POST',
                    url: 'http://moodyrest.azurewebsites.net/users',
                    headers: {'Content-Type': 'application/json'},
                    data: JSON.stringify($scope.details)})
                    .success(function (data) {
                        Global.showMessage('User created successfully');
                    })
                    .error(function (data) {
                        Global.showMessage(data.message);
                    });
            };
        }]);


    app.controller('TipsController', ['$scope', 'Restangular', '$routeParams', '$http',
        function TipsCtrl($scope, db, $routeParams, $http) {


        }]);


    app.controller('PasswordController', ['$scope', '$rootScope', 'Restangular', '$routeParams', '$http', '$cookies', 'Global',
        function LoginCtrl($scope, $rootScope, db, $routeParams, $http, $cookies, Global) {

            $scope.setUserProfileInViewsModel = function () {
                $scope.profile = angular.fromJson($cookies.UserCredential);
            };

            /*set defaults based on user credentials cookie*/
            if (angular.isUndefined($cookies.UserCredential) == false) {
//                $scope.setUserProfileInViewsModel();
                $rootScope.loggedUser = $cookies.UserCredential;
            } else {
                $rootScope.loggedUser = undefined;
                $scope.profile = undefined;
            }

            console.log($rootScope.loggedUser);
            $scope.showUserName = function () {
                if (!$rootScope.loggedUser) {

                    console.log($rootScope.loggedUser);

                    loggedUser = JSON.parse($rootScope.loggedUser);

                    return loggedUser.username;
                } else {
                    return 'Login';
                }
            };


            $scope.login = function () {


                $http({ method: 'GET', url: 'http://visualfacilitation.erni.ch/node/forgotpassword/' + $scope.credentials.username })
                    .success(function (data) {

                        Global.showMessage('An email has been sent to you with your credentials.');

                    })
                    .error(function (data) {
                        Global.showMessage('Your username could not be found in the system.');
//
                    });
            };


        }]);


    app.controller('LoginController', ['$scope', '$rootScope', 'Restangular', '$routeParams', '$http', '$cookies', 'Global',
        function LoginCtrl($scope, $rootScope, db, $routeParams, $http, $cookies, Global) {

            $scope.setUserProfileInViewsModel = function () {
                $scope.profile = angular.fromJson($cookies.UserCredential);
            };

            /*set defaults based on user credentials cookie*/
            if (angular.isUndefined($cookies.UserCredential) == false) {
//                $scope.setUserProfileInViewsModel();
                $rootScope.loggedUser = $cookies.UserCredential;
            } else {
                $rootScope.loggedUser = undefined;
                $scope.profile = undefined;
            }

            $scope.logout = function () {
                $scope.profile = undefined;
                $cookies.UserCredential = undefined;
                $rootScope.loggedUser = undefined;
                changeLocation('/', false);
            };

            $scope.showUserName = function () {
                console.log('value:' + $rootScope.loggedUser);

                console.log('test:');
                if ($rootScope.loggedUser != undefined) {

                    console.log('value:' + $rootScope.loggedUser);

                    var loggedUser = "Login";
                    try {

                        loggedUser = JSON.parse($rootScope.loggedUser);
                    }
                    catch (err) {
                        console.log('error');
                        return 'Login';
                    }

                    console.log('name:' + loggedUser.username);
                    return loggedUser.username;
                } else {
                    console.log('not null:');
                    return 'Login';
                }
            };

            //be sure to inject $scope and $location
            changeLocation = function (url, forceReload) {
                $scope = $scope || angular.element(document).scope();
                if (forceReload || $scope.$$phase) {
                    window.location.href = url;
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
                        var millisecondsToWait = 500;
                        setTimeout(function () {
                            window.location.href = '/';
                        }, millisecondsToWait);

                    })
                    .error(function (data) {
                        Global.showMessage('login error');
//
                    });
            };

            $scope.register = function () {
                if ($scope.details.password !== $scope.details.confirmPassword) {
//
                    Global.showMessage("Passwords do not match.");
                    return;
                }
                Notifier.success('Creating user...');
                $http({
                    method: 'POST',
                    url: 'http://moodyrest.azurewebsites.net/users',
                    headers: {'Content-Type': 'application/json'},
                    data: JSON.stringify($scope.details)})
                    .success(function (data) {
                        Notifier.success('Registration Complete.');
                        $cookies.UserCredential = JSON.stringify(data);
                        $scope.setUserProfileInViewsModel();
                        window.location.href = '/';
                        Notifier.success('Registration Complete.');

                    })
                    .error(function (data) {
                        Global.showMessage(data.message);
                    });
            };
        }]);

    app.controller('DisplayController', ['$scope', 'Restangular', '$routeParams', 'ngDialog', '$modal', '$http',
        function IndexCtrl($scope, db, $routeParams, ngDialog, $modal, $http) {

            Notifier.info('Loading content.');
            $scope.title = $routeParams.tag;
            var all = db.all('content');


            $scope.open = function (id) {
                var modalInstance = $modal.open({
                    templateUrl: 'modal',
                    windowClass: 'app-modal-window',
                    controller: EditDialogInstanceController,
                    resolve: {
                        selectedImage: function () {
                            return id;
                        },
                        db: function () {
                            return db
                        }
                    }
                });
            };


            $scope.searchFilter = function (item) {
                if ($scope.query == undefined || $scope.query == '') {
                    return true;
                }
                if (item.owner != undefined) {
                    if (item.owner.toLowerCase().indexOf($scope.query.toLowerCase()) > -1 || item.name.toLowerCase().indexOf($scope.query.toLowerCase()) > -1) {
                        return true;
                    }
                }

                if (item.tags != undefined && item.owner != undefined) {
                    if (item.tags.join().toLowerCase().indexOf($scope.query.toLowerCase()) > -1 || item.name.toLowerCase().indexOf($scope.query.toLowerCase()) > -1) {
                        return true;
                    }
                }
                return false;
            }

            $scope.addToFavourites = function (picture) {
                $scope.exists = true;
                Notifier.success('Adding to favourites.');
                var x = db.one('content', picture._id.$oid).get().then(function (obj) {
                    var copyObj = db.copy(obj);

                    var loggedUser = JSON.parse($scope.loggedUser);
                    if (copyObj.favourites.indexOf(loggedUser.username) > -1) {
                        return;
                    }

                    if (copyObj.favourites.length == 0) {
                        copyObj.favourites = [loggedUser.username];
                    } else {
                        copyObj.favourites.push(loggedUser.username);
                    }
                    //copyObj.put();
                    picture.favourites = copyObj.favourites;

                    $http({
                        method: 'POST',
                        url: 'http://visualfacilitation.erni.ch/node/save',
                        headers: {'Content-Type': 'application/json'},
                        data: JSON.stringify(copyObj)
                    })
                        .success(function (data) {
                            //alert(data);
                            picture.favourites = copyObj.favourites;
                        })
                        .error(function (data) {
                            alert(data.message);
                        });


                });
            }

            $scope.removeFromFavourites = function (picture) {
                Notifier.success('Removing from your favourites.');
                var x = db.one('content', picture._id.$oid).get().then(function (obj) {
                    var copyObj = db.copy(obj);
                    var loggedUser = JSON.parse($scope.loggedUser);
                    copyObj.favourites.splice(copyObj.favourites.indexOf(loggedUser.username), 1);


                    //copyObj.put();

                    $http({
                        method: 'POST',
                        url: 'http://visualfacilitation.erni.ch/node/save',
                        headers: {'Content-Type': 'application/json'},
                        data: JSON.stringify(copyObj)
                    })
                        .success(function (data) {
                            //(data);
                            picture.favourites = copyObj.favourites;
                        })
                        .error(function (data) {
                            alert(data.message);
                        });


                });
            }


            $scope.isInFavourites = function (picture) {
                var loggedUser = JSON.parse($scope.loggedUser);

                if (picture.favourites == undefined) {
                    picture.favourites = [];
                }

                if (picture.favourites.indexOf(loggedUser.username) > -1) {
                    return true;
                }
                return false;
            }

            $scope.previewDialog = function (input) {


                $scope.currentViewedImage = input;

                ngDialog.open({
                    template: 'Sections/dialog.html',
                    controller: 'PreviewDialogController',
                    className: 'ngdialog-theme-plain',
                    showClose: true,
                    closeByDocument: true,
                    closeByEscape: true,
                    scope: $scope
                });
            }

            if ($routeParams.tag == "all") {

                db.all('content').getList().then(function (tasks) {
                    tasks.splice(0, 1);

                    $scope.contacts = tasks;

                });

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
        }]);

    app.controller('FavouritesController', ['$scope', 'Restangular', '$routeParams', '$modal', '$http',
        function IndexCtrl2($scope, db, $routeParams, $modal, $http) {
            var all = db.all('content');

            var loggedUser = JSON.parse($scope.loggedUser);

            all.customGET('', {"q": {"favourites": loggedUser.username }}).then(function (data) {
                $scope.search = data;
                $scope.contacts = data;

            });

            $scope.isInFavourites = function (picture) {
                var loggedUser = JSON.parse($scope.loggedUser);

                if (picture.favourites == undefined) {
                    picture.favourites = [];
                }

                if (picture.favourites.indexOf(loggedUser.username) > -1) {
                    return true;
                }
                return false;
            }

            $scope.open = function (id) {
                var modalInstance = $modal.open({
                    templateUrl: 'modal',
                    windowClass: 'app-modal-window',
                    controller: EditDialogInstanceController,
                    resolve: {
                        selectedImage: function () {
                            return id;
                        },
                        db: function () {
                            return db
                        }
                    }
                });

                modalInstance.result.then(function (selectedImage) {

                }, function (selectedImage) {

                    if ($scope.isInFavourites(selectedImage) == false) {
                        $scope.contacts.splice($scope.contacts.indexOf(selectedImage), 1);
                    }


                });

            };

            $scope.searchFilter = function (item) {
                if ($scope.query == undefined || $scope.query == '') {
                    return true;
                }
                if (item.owner != undefined) {
                    if (item.owner.toLowerCase().indexOf($scope.query.toLowerCase()) > -1 || item.name.toLowerCase().indexOf($scope.query.toLowerCase()) > -1) {
                        return true;
                    }
                }

                if (item.tags != undefined && item.owner != undefined) {
                    if (item.tags.join().toLowerCase().indexOf($scope.query.toLowerCase()) > -1 || item.name.toLowerCase().indexOf($scope.query.toLowerCase()) > -1) {
                        return true;
                    }
                }
                return false;
            }


            $scope.removeFromFavourites = function (picture) {
                Notifier.success('Removing from your favourites.');
                var x = db.one('content', picture._id.$oid).get().then(function (obj) {
                    var copyObj = db.copy(obj)
                    var loggedUser = JSON.parse($scope.loggedUser);
                    copyObj.favourites.splice(copyObj.favourites.indexOf(loggedUser.username), 1);


                    $http({
                        method: 'POST',
                        url: 'http://visualfacilitation.erni.ch/node/save',
                        headers: {'Content-Type': 'application/json'},
                        data: JSON.stringify(copyObj)
                    })
                        .success(function (data) {
                            //alert(data);
                            $scope.contacts.splice($scope.contacts.indexOf(picture), 1);
                        })
                        .error(function (data) {
                            alert(data.message);
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
                Notifier.success('Uploading content', 3000);
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
                                Notifier.success('Your content has been uploaded', 3000);
                                window.location.href = '/';

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
        var loggedUser = JSON.parse($scope.loggedUser);

        if (loggedUser.username != 'daniela') {


            all.customGET('', {"q": {"owner": loggedUser.username }}).then(function (data) {
                $scope.search = data;
                $scope.contacts = data;

                // creating cached image list for modification
                for (var i = 0; i < data.length; i++) {
                    $scope.all.push({
                        id: i,
                        name: data[i].name,
                        section: data[i].section,
                        tags: data[i].tags,
                        owner: data[i].owner,
                        uid: data[i]._id.$oid,
                        url: data[i].url
                    });
                }
            });
        }
        ;

        if (loggedUser.username == 'daniela' || loggedUser.username == 'ContentAdmin') {


            all.customGET('', {}).then(function (data) {
                $scope.search = data;
                $scope.contacts = data;

                // creating cached image list for modification
                for (var i = 0; i < data.length; i++) {
                    $scope.all.push({
                        id: i,
                        name: data[i].name,
                        section: data[i].section,
                        tags: data[i].tags,
                        owner: data[i].owner,
                        uid: data[i]._id.$oid,
                        url: data[i].url
                    });
                }
            });
        }
        ;


    }]);

    app.controller('EditDialogController', ['$scope', '$modal', '$log', '$http', 'Restangular' ,
        function EditDialogController($scope, $modal, $log, $http, db) {


            $scope.searchFilter = function (item) {


                if (item.owner == undefined) {
                    return false;
                }

                if ($scope.query == undefined || $scope.query == '') {
                    return true;
                }
                if (item.tags.join().toLowerCase().indexOf($scope.query.toLowerCase()) > -1 || item.name.toLowerCase().indexOf($scope.query.toLowerCase()) > -1) {
                    return true;
                }
                return false;
            }
            // edit image function
            $scope.open = function (id) {
                var modalInstance = $modal.open({
                    templateUrl: 'modal',
                    controller: EditDialogInstanceController,
                    resolve: {
                        selectedImage: function () {
                            return id;
                        },
                        db: function () {
                            return db;
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

                    Notifier.success('Saving data...');
                    var x = db.one('content', selectedImage.uid).get().then(function (obj) {

                        var copyObj = db.copy(obj)
                        copyObj.name = selectedImage.name;
                        copyObj.tags = selectedImage.tags;
                        copyObj.section = selectedImage.section;
                        copyObj.url = selectedImage.url;


                        $http({
                            method: 'POST',
                            url: 'http://visualfacilitation.erni.ch/node/save',
                            headers: {'Content-Type': 'application/json'},
                            data: JSON.stringify(copyObj)
                        })
                            .success(function (data) {
                                //alert(data);
                                $scope.all[id] = selectedImage;
                            })
                            .error(function (data) {
                                alert(data.message);
                            });


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
                    Notifier.success('Content has been deleted');

                    console.log(content);


                    $http({
                        method: 'POST',
                        url: 'http://visualfacilitation.erni.ch/node/deleteRecord',
                        headers: {'Content-Type': 'application/json'},
                        data: JSON.stringify(content)
                    })
                        .success(function (data) {
                            var fileNameToDelete = String(content.url).replace('/uploads/', '');
                            console.log(fileNameToDelete);

                            $http.get('/delete_ajax.php?' + 'name=' + escape(fileNameToDelete))
                                .success(function () {
                                    console.log('delete success');
                                }).error(function () {
                                    console.log('delete fail');
                                });


                            $scope.all.splice(content.id, 1);
                        })
                        .error(function (data) {
                            alert(data.message);
                        });


                    // db.one('content', content.uid).remove().then(function (data) {


                    //});


                    /* $http.post('/delete_ajax.php', data,
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

    app.controller('PreviewDialogController', ['$scope', 'Restangular', 'Global', '$http',
        function ($scope, Restangular, Global, $http) {

        }
    ])
    var EditDialogInstanceController = function ($scope, $modalInstance, selectedImage, db, $http) {

        $scope.selectedImage = selectedImage;

        $scope.save = function () {
            $modalInstance.close(selectedImage);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss(selectedImage);
        };

        $scope.addToFavourites = function (picture) {
            $scope.exists = true;
            Notifier.success('Adding to favourites.');
            var x = db.one('content', picture._id.$oid).get().then(function (obj) {
                var copyObj = db.copy(obj)
                var loggedUser = JSON.parse($scope.loggedUser);
                if (copyObj.favourites.indexOf(loggedUser.username) > -1) {
                    return;
                }

                if (copyObj.favourites.length == 0) {
                    copyObj.favourites = [loggedUser.username];
                } else {
                    copyObj.favourites.push(loggedUser.username);
                }
                $http({
                    method: 'POST',
                    url: 'http://visualfacilitation.erni.ch/node/save',
                    headers: {'Content-Type': 'application/json'},
                    data: JSON.stringify(copyObj)
                })
                    .success(function (data) {
                        //(data);
                        picture.favourites = copyObj.favourites;
                    })
                    .error(function (data) {
                        alert(data.message);
                    });

            });
        }

        $scope.removeFromFavourites = function (picture) {
            Notifier.success('Removing from your favourites.');
            var x = db.one('content', picture._id.$oid).get().then(function (obj) {
                var copyObj = db.copy(obj)
                var loggedUser = JSON.parse($scope.loggedUser);
                copyObj.favourites.splice(copyObj.favourites.indexOf(loggedUser.username), 1);

                $http({
                    method: 'POST',
                    url: 'http://visualfacilitation.erni.ch/node/save',
                    headers: {'Content-Type': 'application/json'},
                    data: JSON.stringify(copyObj)
                })
                    .success(function (data) {
                        //(data);
                        picture.favourites = copyObj.favourites;
                    })
                    .error(function (data) {
                        alert(data.message);
                    });

            });
        }

        $scope.isInFavourites = function (picture) {
            var loggedUser = JSON.parse($scope.loggedUser);

            if (picture.favourites == undefined) {
                picture.favourites = [];
            }

            if (picture.favourites.indexOf(loggedUser.username) > -1) {
                return true;
            }
            return false;
        }

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
