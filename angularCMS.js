(function (angular) {
    'use strict';
    
    /* ------------------------------------------------ */
    
    var CMSFieldTemplate = [
        '<cms-editor ng-if="field.data" ng-model="::field.data.content"></cms-field-editor>',
    ].join(''); 
    
    function CMSFieldController(CMS) {
        var field = this;
        
        field.data = undefined;
        
        field.$onInit = function () {
            CMS.get(field.slug)
                .then(function (data) {
                    field.data = data;
                });
        };
    }
    
    function cmsFieldDirective() {
        return {
            restrict: 'E',
            template: CMSFieldTemplate,
            controller: CMSFieldController,
            controllerAs: 'field',
            bindToController: {
                slug: '@'
            }      
        };
    }
    
    /* -------------------------------------- */
    
    var CMSEditorTemplate = [
        '<div class="cms-editor-wrapper">',
            '<div class="rendered-html-wrapper" ng-hide="editor.active" ng-click="editor.beginEditing()">',
                '<div ta-bind ng-model="editor.ngModel"></div>',
            '</div>',
            '<div class="ta-wrapper" ng-show="editor.active">',
                '<text-angular ng-model="editor.stagingModel"></text-angular>',
                '<div class="ta-action-buttons btn-group pull-right">',
                    '<button type="button" class="btn btn-warning" ng-click="editor.cancelEdit()">Cancel</button>',
                    '<button type="submit" class="btn btn-primary" ng-click="editor.saveEdit()">Save</button>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
    
    function CMSEditorController($scope) {
        var editor = this;
        
        editor.$onInit = function () {
            /*
             * @property: active, represents whether the rendered HTML or the editor is being displayed.
             * @type: boolean
             * @description: If a default value is provided, coerce to boolean. Otherwise, default to inactive.
             */
            editor.active = angular.isDefined(editor.active) ? Boolean(editor.active) : false;
            
            /*
             * @property: stagingModel, a staging area for the editor to make changes without affecting the source.
             * @type: string
             * @description: Clone of the source model.
             */
            editor.stagingModel = angular.copy(editor.ngModel);
        };
        
        editor.beginEditing = function () {
            editor.active = true;
        };
        
        editor.cancelEdit = function () {
            editor.stagingModel = angular.copy(editor.ngModel);
            editor.active = false;
        };
        
        editor.saveEdit = function () {
            editor.ngModel = angular.copy(editor.stagingModel);
            editor.active = false;  
        };
    }
    
    function cmsEditorDirective() {
        return {
            restrict: 'E',
            template: CMSEditorTemplate,
            controller: CMSEditorController,
            controllerAs: 'editor',
            bindToController: {
                ngModel: '=',
                active: '=?'
            }
        };
    }

    /* ---------------------------------- */
    
    function CMSService($q) {
        this.fields = [
            { id: 1, slug: 'sample_field', content: '<span>Sample Content</span>' }  
        ];
        
        this.get = function (fieldKey) {
            var matches = this.fields.filter(function (field) {
                if (field.id === fieldKey || field.slug === fieldKey) {
                    return true;
                } else {
                    return false;
                }
            });
            
            if (matches.length > 1) {
                throw new Error("Unexpected: Found two matches for specified CMS field key.");
            }
            
            var match = matches[0];
            return $q.resolve(match);
        }    
    }
    
    /* -------------------------------------------- */
    
    angular.module('AngularCMS', ['textAngular'])
        .directive('cmsField', cmsFieldDirective)
        .directive('cmsEditor', cmsEditorDirective)
        .service('CMS', CMSService);
        
}(window.angular));