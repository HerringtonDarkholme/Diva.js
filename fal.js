(function () {
    'use strict';

    function Item (data, prev, next) {
        this.data = data;
        this.prev = prev || null;
        if (prev) { prev.next = this; }
        this.next = next || null;
        if (next) { next.prev = this; }
    }

    function Fal () {
        if (! this instanceof Fal) { return new Fal(); }
        this.head = null;
        this.tail = null;
        this.length = 0;
        this.index = 0;
        this.current = this.head;
        this.fns = [];
    }

    Fal.prototype = {

        push: function (data) {
            this.tail = new Item(data, this.tail, null);
            this.head = this.head || this.tail;
            this.current = this.head;
            this.length++;
        },

        pop: function () {
            if (this.length === 0) { return undefined; }
            var ret = this.tail;
            this.tail = ret.prev;
            if (--this.length === 0) {
                this.head = null;
            } else {
                this.tail.next = null;
            }
            this.current = this.head;
            return ret.data;
        },

        shift: function () {
           if (this.length === 0) { return undefined; }
           var ret = this.head;
           this.head = ret.next;
           if (--this.length === 0) {
               this.tail = null;
           } else {
               this.head.prev = null;
           }
           this.current = this.head;
           return ret.data;
        },

        unshift: function (data) {
            this.head = new Item(data, null, this.head);
            this.tail = this.tail || this.head;
            this.current = this.head;
            this.length++;
        },

        indexOf: function (data) {
            this.index = 0;
            this.current = this.head;
            while (this.current) {
                if (this.current.data === data) {
                    return this.index;
                } else {
                    this.index++;
                    this.current = this.current.next;
                }
            }
            this.index = 0;
            this.current = this.head;
            return -1;
        },

        slice: function (start, end) {
            var ret = new Fal ();
            var i = 0;
            start = start ? 0 : +start;
            if (start >= this.length || start === +end) {
                return ret;
            }
            if (start === this.index) {
                ret.head = this.current;
                i = start + 1;
            } else {
                ret.head = this.head;
                while(i++ <= start) {
                    ret.head = ret.head.next;
                }
            }
            end = +end || this.length;
            ret.tail = ret.current = ret.head;
            while (i++ < end && ret.tail.next) {
                ret.tail = ret.tail.next;
            }
            return ret;
        }
    };

    window.Fal = Fal;
})();
