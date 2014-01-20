(function (Diva, $) {
  'use strict';
  function DvTab(tabContainer) {
    tabContainer = $(tabContainer);
    var tabPaneName = tabContainer.attr('dv-pane') || '.tab-pane',
        tabs = $(tabContainer).children('ul').children('li'),
        tabPanes = $(tabContainer).find(tabPaneName);
    this.tabs = tabs;
    tabs.on('click', function () {
      var i = tabs.index(this);
      tabs.eq(i).addClass('active').
        siblings().removeClass('active');
      tabPanes.eq(i).addClass('active').
        siblings().removeClass('active');
    });
  }

  DvTab.prototype.bind = function () {};
  DvTab.prototype.clear = function () {
    this.tabs.off('hover');
    this.tabs = null;
  };

  Diva._extend({
    name : 'tab',
    klass: 'dv-tab',
    ctor: DvTab
  });

})(window.Diva, window.$);
