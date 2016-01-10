/**
 * ng-context-menu - v1.0.3 - An AngularJS directive to display a context menu
 * when a right-click event is triggered
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */
(function init(angular) {
  'use strict';

  angular
    .module('ng-context-menu', [])
    .factory('ContextMenuService', function contextMenuFactory() {
      var element = null;
      var menuElement = null;
      return {
        getElement: function getElement() {
          return element;
        },
        setElement: function setElement(newElement) {
          element = newElement;
        },
        getMenuElement: function getMenuElement() {
          return menuElement;
        },
        setMenuElement: function setMenuElement(newMenuElement) {
          menuElement = newMenuElement;
        },
      };
    })
    .directive('contextMenu', [
      '$document',
      'ContextMenuService',
      function contextMenuFactory($document, ContextMenuService) {
        return {
          restrict: 'A',
          scope: {
            callback: '&contextMenu',
            disabled: '&contextMenuDisabled',
            closeCallback: '&contextMenuClose',
            marginBottom: '@contextMenuMarginBottom',
          },
          link: function contextMenuLink($scope, $element, $attrs) {
            var opened = false;

            function open(event, menuElement) {
              var doc = $document[0].documentElement;
              var docLeft = (window.pageXOffset || doc.scrollLeft) -
                  (doc.clientLeft || 0);
              var docTop = (window.pageYOffset || doc.scrollTop) -
                  (doc.clientTop || 0);
              var elementWidth = menuElement[0].scrollWidth;
              var elementHeight = menuElement[0].scrollHeight;
              var pageX;
              var pageY;
              var docBody = $document[0].body;
              var docWidth = doc.clientWidth + docLeft;
              var docHeight = doc.clientHeight + docTop;
              var totalWidth;
              var totalHeight;
              var left;
              var top;
              var marginBottom = $scope.marginBottom || 0;

              menuElement.addClass('open');

              // browser compatibility fix for the click location
              if (event.pageX || event.pageY) {
                // use pageX and pageY when available (modern browsers)
                pageX = event.pageX;
                pageY = event.pageY;
              } else {
                // calculate pageX and pageY when they do not exist
                // (IE8 and generated events in later versions of IE)
                pageX = event.clientX + docBody.scrollLeft + doc.scrollLeft;
                pageY = event.clientY + docBody.scrollTop + doc.scrollTop;
              }

              totalWidth = elementWidth + pageX;
              totalHeight = elementHeight + pageY;
              left = Math.max(pageX - docLeft, 0);
              top = Math.max(pageY - docTop, 0);

              if (totalWidth > docWidth) {
                left = left - (totalWidth - docWidth);
              }

              if (totalHeight > docHeight) {
                top = top - (totalHeight - docHeight) - marginBottom;
              }

              menuElement.css('top', top + 'px');
              menuElement.css('left', left + 'px');
              opened = true;
            }

            function close(menuElement) {
              menuElement.removeClass('open');

              if (opened) {
                $scope.closeCallback();
              }

              opened = false;
            }

            $element.bind('contextmenu', function contextMenuBind(event) {
              if (!$scope.disabled()) {
                if (ContextMenuService.getMenuElement() !== null) {
                  close(ContextMenuService.getMenuElement());
                }
                ContextMenuService.setMenuElement(angular.element(
                  document.getElementById($attrs.target)
                ));
                ContextMenuService.setElement(event.target);

                event.preventDefault();
                event.stopPropagation();
                $scope.$apply(function callbackWithEvent() {
                  $scope.callback({ $event: event });
                });
                $scope.$apply(function openContextMenu() {
                  open(event, ContextMenuService.getMenuElement());
                });
              }
            });

            function handleKeyUpEvent(event) {
              if (!$scope.disabled() && opened && event.keyCode === 27) {
                $scope.$apply(function closeContextMenu() {
                  close(ContextMenuService.getMenuElement());
                });
              }
            }

            function handleClickEvent(event) {
              if (!$scope.disabled() &&
                opened &&
                (event.button !== 2 ||
                  event.target !== ContextMenuService.getElement())) {
                $scope.$apply(function closeContextMenu() {
                  close(ContextMenuService.getMenuElement());
                });
              }
            }

            $document.bind('keyup', handleKeyUpEvent);
            // Firefox treats a right-click as a click and a contextmenu event
            // while other browsers just treat it as a contextmenu event
            $document.bind('click', handleClickEvent);
            $document.bind('contextmenu', handleClickEvent);

            $scope.$on('$destroy', function removeBindings() {
              $document.unbind('keyup', handleKeyUpEvent);
              $document.unbind('click', handleClickEvent);
              $document.unbind('contextmenu', handleClickEvent);
            });
          },
        };
      },
    ]);
})(window.angular);
