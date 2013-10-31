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
    attr = 'data-' + str;
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

    restart: function () {
      this.clear();
      this.init();
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

    purge: function () {
      // for garbage collection
      this.clear();
      this.fns = {};
      this.ctx = null;
      this.started = false;
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
    },

    setupRepeat: function () {
      var self = this;
      self.ctx.find('.dv-repeat').each(function (i, e){
        var dv = new DvRepeat(e, self);
        dv.bind();
        self.dvElements.push(dv);
      });
    }
  };



  function DvElement(ele, diva) {
    var self;
    self = this.element = $(ele);
    this.action = (dvAttr(self, 'action') || 'toggle').split(' ');
    this.diva = diva || new Diva();
    this.target = this.parseTargets();
    this.event = (dvAttr(self, 'event') || 'click').split(' ');
    this.handlers = [];
  }

  DvElement.prototype = {

    makeFn: function (name) {
      var args = this.target,
          that = this;
      return function (e) {
        var data = dvAttr(that.element, 'data') || '';
        $.extend(e, {'data': data});
        that.diva.fns[name].apply(that.element, args.concat([e]));
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
    },

    load: function (opt) {
      this.unbind();
      this.diva = opt.diva || this.diva;
      this.event = opt.event || this.event;
      this.action = opt.action || this.action;
      this.target = opt.target || this.target;
    }
  };


  function DvSingle (e, diva) {
    DvElement.call(this, e, diva);
    // override
    this.action = (dvAttr(this.element, 'action') || 'single').split(' ');
  }

  DvSingle.prototype = new DvElement();
  DvSingle.prototype.constructor = DvSingle;


  function DvRepeat(e, diva) {
    DvElement.call(this, e, diva);
  }

  DvRepeat.prototype = $.extend({}, DvElement.prototype);

  DvRepeat.prototype.bind = function () {
    var handler, i,
        ele = this.element,
        act = this.action,
        tar = this.target[0], // only bind the first
        evt = this.event;

    if (evt.length !== act.length) {
      handler = this.makeFn(act[0]);
      this.handlers.push(handler);
      ele.on(evt.join(' '), tar, handler);
    } else {
      i = evt.length;
      while (--i >= 0) {
        handler = this.makeFn(act[i]);
        this.handlers.push(handler);
        ele.on(evt[i], tar, handler);
      }
    }
  };

  DvRepeat.prototype.unbind = function () {
    if (this.handlers.length === 0) { return; }

    var handlers = this.handlers,
        evt = this.event,
        act = this.action,
        ele = this.element,
        tar = this.target[0],
        i;

    if (evt.length !== act.length) {
      ele.off(evt.join(' '), tar, handlers[0]);
    } else {
      for (i = handlers.length-1; i >= 0; i--) {
        ele.off(evt[i], tar, handlers[i]);
      }
    }
  };

  DvRepeat.prototype.makeFn = function (name) {
    var repeatDv = this;

    var handler = function (evt) {
      var repeatItem = new DvElement(this, repeatDv.diva),
          targets = repeatItem.parseTargets(),
          ele = repeatItem.element,
          data = dvAttr(ele, 'data') || '';
      $.extend(evt, {
        'container' : repeatDv.element,
        'data' : data
      });
      repeatItem.makeFn(name).apply(this, targets.concat(evt));
      repeatItem.clear();
    };

    repeatDv.handlers.push(handler);
    return handler;

  };

  DvRepeat.prototype.parseTargets = function () {
    var tar = dvAttr(this.element, 'target') || '';
    return tar.split('|');
  };

  window.Diva = Diva;
}(window.$));
