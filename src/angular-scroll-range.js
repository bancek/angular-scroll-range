angular.module('angularScrollRange', [])

.directive('scrollRange', ['$window', function ($window) {
  return function (scope, elm, attrs) {
    var rowHeight = 41;
    var range = null;
    var total = 0;
    var extra = 0.5;
    var wait = 20;

    var parent;

    if (attrs['scrollRangeContainer']) {
      parent = elm.closest(attrs['scrollRangeContainer']);
    } else {
      parent = angular.element($window);
    }

    attrs.$observe('scrollRangeRowHeight', function (attr) {
      rowHeight = scope.$eval(attr);
      update();
    });

    attrs.$observe('scrollRange', function (attr) {
      range = {
        from: 0,
        to: 0,
        scrollToIndex: function (index) {
          var top = elm.position().top + index * rowHeight - parent.innerHeight() / 2;
          top = Math.max(top, 0);
          parent.scrollTop(top);
        }
      };

      scope[attr] = range;
    });

    attrs.$observe('scrollRangeTotal', function (attr) {
      scope.$watch(attr, function (val) {
        total = val;
        elm.height(rowHeight * total);
        update();
      });
    });

    var child = elm.children();

    var timer = null;

    function update(e) {
      if (timer != null) {
        clearTimeout(timer);
      }

      timer = setTimeout(function () {
        if (timer != null) {
          timer = null;
        }

        scope.$apply(function () {
          if (range != null) {
            if (total) {
              var offset = elm.position().top - parent.scrollTop();
              var viewport = parent.innerHeight() - Math.max(offset, 0);

              var start = Math.min(offset, 0) * -1;

              var absFrom = (start / rowHeight) >> 0;
              var absTo = (((viewport / rowHeight) >> 0) + 1) + absFrom;

              var count = absTo - absFrom;

              var from = (absFrom - (count * extra)) >> 0;

              if (from % 2 !== 0) {
                from -= 1;
              }

              from = Math.max(from, 0);

              var to = (absTo + count * extra) >> 0;
              to = Math.min(to, total);

              var top = rowHeight * from;

              range.from = from;
              range.to = to;

              child.animate({
                top: top
              }, 0);
            } else {
              range.from = 0;
              range.to = 0;
            }
          }
        });
      }, wait);
    }

    parent.bind('scroll', update);
    parent.bind('resize', update);

    scope.$on('$destroy', function () {
      parent.unbind('scroll', update);
      parent.unbind('resize', update);
    });
  }
}]);
