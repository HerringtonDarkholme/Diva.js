(function ($) {
  'use strict';

  var defaultHandler = {
    toggle : function () {
      var tar, cls = dvAttr(this, 'class') || 'active';

      for (var i = 0, l = arguments.length; i < l; i++) {
        tar = arguments[i];
        if (tar instanceof $) {
          tar.toggleClass(cls);
        } else { break; }
      }
    },

    single : function () {
      var tar,
        cls = dvAttr(this, 'class') || 'active';

      for (var i = 0, l = arguments.length; i < l; i++) {
        tar = arguments[i];
        if (tar instanceof $) {
          tar.siblings().removeClass(cls);
          tar.toggleClass(cls);
        } else { break; }
      }
    }

  };

  function dvAttr($el, str) {
    var attr = 'dv-' + str;
    if ($el.is('[' + attr + ']')) {
      return $el.attr(attr) || true;
    }
    return false;
  }

  function Diva(context) {
    this.ctx = $(context || document);
    this.fns = $.extend({}, defaultHandler);
    this.dvElements = [];
    this.started = false;
  }

  Diva.prototype = {

    init: function () {
      // static
      this.setupStatic();
      this.setupSingle();
    },

    register: function (name, fn) {
      this.fns[name] = fn;
    },

    clear: function () {
      // remove handler
      $.each(this.dvElements, function (i, dv){
        dv.clear();
      });
      this.dvElements = [];
    },

    setupStatic: function () {
      var self = this;
      self.ctx.find('.dv-toggle').each(function (i, e) {
        var dv = new DvElement(e , self);
        dv.bind();
        self.dvElements.push(dv);
      });
    },

    setupSingle: function () {
      var self = this;
      self.ctx.find('.dv-single').each(function (i, e) {
        var dv = new DvSingle(e , self);
        dv.bind();
        self.dvElements.push(dv);
      });
    }
  };



  function DvElement(ele, diva) {
    var self;
    self = this.element = $(ele);
    this.event = (dvAttr(self, 'event') || 'click').split(' ');
    this.action = (dvAttr(self, 'action') || 'toggle').split(' ');
    this.diva = diva || new Diva();
    this.target = this.parseTargets();
    this.handlers = [];
  }

  DvElement.prototype = {

    makeFn: function (name) {
      var args = this.target,
          that = this;
      return function () {
        var data = [dvAttr(that.element, 'data') || ''];
        that.diva.fns[name].apply(that.element, args.concat(data));
      };
    },

    bind: function () {
      var i, handler,
        evt = this.event,
        act = this.action,
        ele = this.element;

      if (evt.length !== act.length) {
        handler = this.makeFn(act[0]);
        this.handlers.push(handler);
        ele.on(evt.join(' '), handler);
      } else {
        i = evt.length;
        while (--i >= 0) {
          handler = this.makeFn(act[i]);
          this.handlers.push(handler);
          ele.on(evt[i], handler);
        }
      }
    },

    unbind: function () {
      if (this.handlers.length === 0) { return; }
      var handlers = this.handlers,
          evt = this.event,
          act = this.action,
          ele = this.element,
          i;
      if (evt.length !== act.length) {
        ele.off(evt.join(' '), handlers[0]);
      } else {
        for (i = handlers.length-1; i >= 0; i--) {
          ele.off(evt[i], handlers[i]);
        }
      }
    },

    clear: function () {
      this.unbind();
      this.event    = [];
      this.action   = [];
      this.diva     = [];
      this.target   = [];
      this.handlers = [];
    },

    parseTargets: function () {
      var ele = this.element,
        tar = dvAttr(ele, 'target') || '',
        ex = dvAttr(ele, 'exclude'),
        ctx = this.diva.ctx,
        ret = [];
      if (!ex) {
        ret.push(ele);
      }
      $.each(tar.split('|'), function (i, e) {
        ret.push($(e, ctx));
      });
      return ret;
    }
  };

  function DvSingle (e, diva) {
    DvElement.call(this, e, diva);
    // override
    this.action = (dvAttr(this.element, 'action') || 'single').split(' ');
  }

  DvSingle.prototype = new DvElement();
  DvSingle.prototype.constructor = DvSingle;

  window.Diva = Diva;
}(window.$));
