(function($) {
    'use strict';

    var defaultHandler = function () {
        var tar,
            cls = dvAttr(this, 'class') || 'active';

        for(var i = 0, l = arguments.length; i < l; i++) {
            tar = arguments[i];
            if (tar instanceof $) {
                tar.toggleClass(cls);
            } else {
                break;
            }
        }
    };

    function Diva(context) {
        this.ctx = $(context || document);
        this.fns = {
            'toggle': defaultHandler
        };
        this.started = false;
    }

    Diva.prototype = {

        init: function() {
            // static
            this.ctx.find('.dv-toggle').each(setupStatic);
            this.ctx.find('.dv-single').each(setupSingle);
            this.ctx.find('.dv-repeat').each(setupDynamic);
        },

        register: function(name, fn) {
            this.fns[name] = fn;
        },

        clean: function() {
            // remove handler
        }

    };

    function dvAttr($el, str) {
        var attr = 'dv-' + str;
        if ($el.is('[' + attr + ']')) {
            return $el.attr(attr) || true;
        }
        return false;
    }

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

        makeFn: function(name) {
            var args = this.target,
                that = this;
            return function() {
                var data = [dvAttr(that.element, 'data') || ''];
                that.diva.fns[name].apply(that.element, args.concat(data));
            };
        },

        bind: function() {
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

        clear: function () {

        },

        parseTargets: function() {
            var ele = this.element,
                tar = dvAttr(ele, 'target') || '',
                ex = dvAttr(ele, 'exclude'),
                ctx = this.diva.ctx,
                ret = [];
            if (!ex) {
                ret.push(ele);
            }
            $.each(tar.split('|'), function(i, e) {
                ret.push($(e, ctx));
            });
            return ret;
        }
    };


    function setupStatic() {}

    function setupDynamic() {}

    function setupSingle () {}


}(jQuery));
