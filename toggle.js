(function ($) {
  'use strict';

  function Diva(context) {
    this.ctx = $(context || document);
    this.fns = {
      'toggle' : $.fn.toggleClass
    };
    this.started = false;
  }

  Diva.prototype = {

    init: function () {
      // static
      this.ctx.find('.dv-single').each(setupStatic);
      this.ctx.find('.dv-repeat').each(setupDynamic);
    },

    register: function (name, fn) {
      this.fns[name] = fn;
    },

    clean: function () {
      // remove handler
    }

  };

  function dvAttr ($el,str) {
    var attr = 'dv-' + str;
    if ($el.is('[' + attr + ']')) {
      return $el.attr(attr) || true;
    }
    return false;
  }

  function DvElement (ele, diva) {
    var self;
    self = this.element = $(ele);
    this.event = (dvAttr(self, 'event') || 'click').split(' ');
    this.action = (dvAttr(self, 'action') || 'toggle').split(' ');
    this.cls = dvAttr(self, 'class') || 'active';
    this.diva = diva || new Diva();
    this.data = (dvAttr(self, 'data') || '').split(' ');
    this.target = this.parseTargets();
  }

  DvElement.prototype = {

    makeFn: function(name) {
      var args = this.target.concat(this.data),
          that = this;
      return function() {
        that.diva.fns[name].apply(that.element, args);
      }
    },

    bind: function() {
      var i,
          evt = this.event,
          act = this.action,
          ele = this.element;

      if (evt.length !== act.length) {
        ele.on(evt.join(' '), this.makeFn(act[0]));
      } else {
        i = evt.length;
        while(--i >= 0) {
          ele.on(evt[i], this.makeFn(act[i]));
        }
      }
    },

    parseTargets: function () {
      var ele = this.element,
          tar = dvAttr(ele, 'target') || '',
          ex  = dvAttr(ele, 'exclude'),
          ret = [];
      if (!ex) { ret.push(ele);}
      $.each(tar.split('|'), function (i, e) {
        ret.push($(e));
      });
      return ret;
    }
  };


  function setupStatic () {
  }

  function setupDynamic () {

  }


}(jQuery));
