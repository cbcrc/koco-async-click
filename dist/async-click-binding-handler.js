(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['knockout', 'jquery', 'async-click-state'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('knockout'), require('jquery'), require('async-click-state'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.knockout, global.jquery, global.asyncClickState);
    global.asyncClickBindingHandler = mod.exports;
  }
})(this, function (_knockout, _jquery, _asyncClickState) {
  'use strict';

  var _knockout2 = _interopRequireDefault(_knockout);

  var _jquery2 = _interopRequireDefault(_jquery);

  var _asyncClickState2 = _interopRequireDefault(_asyncClickState);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  //var handlerId = 0;

  //TODO: (?) Suporter scénario comme https://github.com/knockout/knockout/blob/master/src/binding/defaultBindings/event.js
  //http://knockoutjs.com/documentation/event-binding.html
  _knockout2.default.bindingHandlers['asyncClick'] = {
    'init': function init(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var handlerFunction = valueAccessor() || {};
      var $element = (0, _jquery2.default)(element);
      //var clickHandlerId = getClickHandlerId();
      var clickHandlerId = 'click';

      _knockout2.default.applyBindingsToNode(element, {
        safeClick: {}
      });

      $element.on(clickHandlerId, function (event) {
        var handlerReturnValue;

        if (!handlerFunction || _asyncClickState2.default.asyncTask()) return;

        try {
          // Take all the event args, and prefix with the viewmodel
          var argsForHandler = makeArray(arguments);
          viewModel = bindingContext['$data'];
          argsForHandler.unshift(viewModel);

          handlerReturnValue = handlerFunction.apply(viewModel, argsForHandler);

          if (handlerReturnValue !== null && (typeof handlerReturnValue === 'undefined' ? 'undefined' : _typeof(handlerReturnValue)) === 'object' && handlerReturnValue.hasOwnProperty('then')) {
            var originalHtml = $element.html();
            var asyncClickHtml = allBindings.get('asyncClickHtml');
            if (asyncClickHtml) {
              $element.html(asyncClickHtml);
            }
            _asyncClickState2.default.asyncTask(handlerReturnValue);

            handlerReturnValue.catch(function (ex) {}).then(function () {
              if (asyncClickHtml) {
                $element.html(originalHtml);
              }

              _asyncClickState2.default.asyncTask(null);
            });
          }
        } finally {
          //Par convention...
          event.preventDefault();
        }

        var bubble = allBindings.get('asyncClickBubble') !== false;

        if (!bubble) {
          event.cancelBubble = true;

          if (event.stopPropagation) {
            event.stopPropagation();
          }
        }
      });

      _knockout2.default.utils.domNodeDisposal.addDisposeCallback(element, function () {
        $element.off(clickHandlerId);
      });
    }
  };

  // function getClickHandlerId() {
  //     return 'click.ko.clickHandler' + (++handlerId);
  // }

  function makeArray(arrayLikeObject) {
    var result = [];

    for (var i = 0, j = arrayLikeObject.length; i < j; i++) {
      result.push(arrayLikeObject[i]);
    }

    return result;
  }
});