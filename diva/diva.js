(function ($) {
  'use strict';

  var defaultHandler = {
    toggle : function () {
      var tar, cls = dvAttr(this, 'class') || 'active';

      for (var i = 0, l = arguments.length; i < l; i++) {
        tar = arguments[i];
        if (tar instanceof $) {
          tar.toggleClass(cls);
        } else {
          break;
        }
      }
    },

    hover : function () {
      var tar, cls = dvAttr(this, 'class') || 'active';
      var l = arguments.length;
      var handler = arguments[l-1].type === 'mouseenter'
        ? 'addClass' : 'removeClass';

      for (var i = 0; i < l; i++) {
        tar = arguments[i];
        if (tar instanceof $) {
          tar[handler](cls);
        } else {
          break;
        }
      }
    },

    single : function () {
      var tar,
        cls = dvAttr(this, 'class') || 'active';

      for (var i = 0, l = arguments.length; i < l; i++) {
        tar = arguments[i];
        if (tar instanceof $) {
          // optimization : cache last active
          tar.siblings().removeClass(cls);
          tar.toggleClass(cls);
        } else {
          break;
        }
      }
    }

  };

  function dvAttr($el, str) {
    // get prefixed attributes
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

  function DvHoverElement(ele, diva) {
    DvElement.call(this, ele, diva);
    this.event = (dvAttr(this.element, 'event') || 'mouseenter mouseleave').split(' ');
    this.action = (dvAttr(this.element, 'action') || 'hover').split(' ');
  }

  DvHoverElement.prototype = new DvElement();
  DvHoverElement.prototype.constructor = DvHoverElement;

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
  DvRepeat.prototype.constructor = DvRepeat;

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
      var repeatItem = new DvElement(this, repeatDv.diva);
      $.extend(evt, {
        'container' : repeatDv.element
      });
      repeatItem.makeFn(name).apply(this, evt);
      repeatItem.clear();
    };

    repeatDv.handlers.push(handler);
    return handler;

  };

  DvRepeat.prototype.parseTargets = function () {
    var tar = dvAttr(this.element, 'target') || '';
    return tar.split('|');
  };


  // Facade Class
  function Diva(context) {
    if (! this instanceof Diva) {
      return new Diva(context);
    }
    this.ctx = $(context || document);
    this.fns = $.extend({}, defaultHandler);
    this.dvElements = [];
    this.started = false;
  }

  Diva.cfgs = [
    {
      name: 'static',
      klass: 'dv-toggle',
      ctor: DvElement
    },
    {
      name: 'single',
      klass: 'dv-single',
      ctor: DvSingle
    },
    {
      name: 'repeat',
      klass: 'dv-repeat',
      ctor: DvRepeat
    },
    {
      name: 'hover',
      klass: 'dv-hover',
      ctor: DvHoverElement
    }
  ];

  Diva._extend = function (cfg) {
    if (cfg &&
        typeof cfg.name  === 'string' &&
        typeof cfg.klass === 'string' &&
        typeof cfg.ctor  === 'function'
        ) {
      Diva.cfgs.push(cfg);
    }
  };

  Diva.prototype = {

    init: function () {
      // static
      var self = this;
      $.each(Diva.cfgs, function(i, cfg) {
        var setupName = self.setup(cfg);
        self[setupName]();
      });
      //this.setupStatic();
      //this.setupSingle();
      //this.setupRepeat();
    },

    restart: function () {
      this.clear();
      this.init();
    },

    register: function (name, fn) {
      if (typeof name === 'object') {
        $.extend(this.fns, name);
      } else {
        this.fns[name] = fn;
      }
    },

    drop: function ($ele) {
      // arg must be the reference
      var i = $.inArray($ele, this.dvElements);
      if (i !== -1) {
        var dv = this.dvElements.splice(i, 1);
        dv.clear();
      }
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

    setup: function (cfg) {
      // cfg: {name: blah, klass: blah, ctor: blah}
      var self = this,
          camelName = 'setup' + cfg.name.substr(0, 1).toUpperCase() + cfg.name.substr(1);

      self[camelName] = function () {
        self.ctx.find('.' + cfg.klass).each(function (i, e) {
          var dv = new cfg.ctor(e, self);
          dv.bind();
          self.dvElements.push(dv);
        });
      };
      return camelName;
    }

  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Diva;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return Diva;});
  } else {
    window.Diva = Diva;
  }

}(window.$));
