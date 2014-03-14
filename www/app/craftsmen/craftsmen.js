﻿(function () {
    'use strict';
    var controllerId = 'Craftsmen';
    angular.module('app').controller(controllerId, ['$scope', 'authService', 'datacontext', 'common', Craftsmen]);

    function Craftsmen($scope, authService, datacontext, common) {

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

       
        $scope.allCraftsmen = [];
        $scope.craftsmanCount = 0;
        $scope.filterCount = 0;
        $scope.craftsmanSearch = '';
        $scope.currentCraftsman = createCraftsmanModel($scope);
        $scope.backup = $scope.currentCraftsman;
        $scope.usr = authService.getUser();
        $scope.title = 'Craftsmen';
        $scope.CraftsmanList = CraftsmanList();
        $scope.ViewCraftsman = ViewCraftsman();
        

        //paging settings
    

        $scope.pageChanged = function(page) {
            if (!page) { return; }
            $scope.paging.currentPage = page;
            getAllCraftsmen;
        };

        $scope.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 15
        };

        Object.defineProperty($scope.paging, 'pageCount', {
            get: function () {
                return Math.floor($scope.filterCount / $scope.pageSize) + 1;
            },
            set: function (count) {
                return count;
            }
        });
        $scope.paging.pageCount = 3;


        $scope.getCraftsmenCount = function() {
            //TODO: create bla
            //return datacontext.getCraftsmenCount().then(function (data) {
            //    return $scope.craftsmanCount = data;
            //});
            return 10;
        }

        $scope.getCraftsmenFilterCount = function() {
            //$scope.filterCount = datacontext.getFilterCount($scope.craftsmanSearch);
            return 10;
        }

        function CraftsmanList() {
            return {
                getCraftsmen: function () {
                    return $scope.allCraftsmen;
                },
                showCraftsman: function (craftsmanIndex) {
                    $scope.rightPartial = "app/craftsmen/craftsmanProfile",
                    $scope.currentCraftsman.populate($scope.allCraftsmen[craftsmanIndex]);
                }
            }
        }

        $scope.search = function($event) {
            getAllCraftsmen();
        }

        function ViewCraftsman(craftsman) {
            return {
                rating: function () {
                    var modalScope = $scope;
                    modalScope.ok = function () {
                        $.post("job/" + $scope.currentCraftsman._id + "/bid")
                        .success(function (updateCraftsman) {
                            $scope.allJobs.filter(function (job) {
                                if (job._id === updatedCraftsman._id) {
                                    var ind = $scope.allJobs.indexOf(job)
                                    $scope.allJobs[ind] = updatedCraftsman;
                                }
                            });
                            $scope.currentCraftsman.populate(updatedCraftsman);
                            $rootScope.$digest();
                            log("You rated successfully");
                        });
                    };
                    dialogs
                    .confirmationDialog(
                        "Confirm",
                        "Are you sure you want to rate this craftsman?",
                        "Ok",
                        "Cancel",
                        modalScope
                    )
                }
            }
        }

        function createCraftsmanModel(scope) {
            var CraftsmanModel = function CraftsmanModel() {
                this.selectedCategories = [];
                this._id = "";
                this.city = "";
                this.description = "";
                this.address = "";

            }

            CraftsmanModel.prototype.populate = function (craftsmanData) {
                for (var key in craftsmanData) {
                    if (this.hasOwnProperty(key)) {
                        this[key] = craftsmanData[key]
                    }
                }
            }

            CraftsmanModel.prototype.isRater = function () {
                return this.raters.filter(function (rater) {
                    return (rater.id === $scope.user._id)
                }).length > 0
            }

            CraftsmanModel.prototype.changeCategory = function () {
                console.debug(this);
                attachSubcategories(this);
            }

            function resetModel() {
                $scope.currentCraftsman = createCraftsmanModel($scope);
                $scope.backup = $scope.currentCraftsman;
            }

            return new CraftsmanModel(scope);
        }

        function getAllCraftsmen() {
            
            return datacontext.getAllCraftsmen($scope.paging.currentPage, $scope.paging.pageSize, $scope.craftsmanSearch)
                .success(function (data) {
                    $scope.allCraftsmen = data;
                    $scope.getCraftsmenFilterCount();
                    if (!$scope.craftsmanCount) {
                        $scope.getCraftsmenCount();
                    }

                    //$scope.totalCraftsmen = $scope.allCraftsmen.length;
                    //$scope.filteredItems = $scope.allCraftsmen;
                    // console.debug(that.numPages());
                    $scope.$digest();
            });
        }

        activate();
        function activate() {
            common.activateController([getAllCraftsmen()], controllerId)
                .then(function () { log('Activated Craftsmen View'); });
        }

      
    }
})();