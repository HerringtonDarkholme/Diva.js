(function() {
    'use strict';

    function Item(data, prev, next) {
        this.data = data;
        this.prev = prev || null;
        if (prev) {
            prev.next = this;
        }
        this.next = next || null;
        if (next) {
            next.prev = this;
        }
    }

    function Fal() {
        if (!this instanceof Fal) {
            return new Fal();
        }
        this.head = null;
        this.tail = null;
        this.length = 0;
        this.index = 0;
        this.current = this.head;
        this.fns = [];
    }

    Fal.prototype = {

        push: function(data) {
            this.tail = new Item(data, this.tail, null);
            this.head = this.head || this.tail;
            this.current = this.head;
            this.length++;
        },

        pop: function() {
            if (this.length === 0) {
                return undefined;
            }
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

        shift: function() {
            if (this.length === 0) {
                return undefined;
            }
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

        unshift: function(data) {
            this.head = new Item(data, null, this.head);
            this.tail = this.tail || this.head;
            this.current = this.head;
            this.length++;
        },

        indexOf: function(data) {
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

        _take: function(i) {
            // internal use: change current
            // return null if failed
            if (i >= this.length || -i > this.length) {
                return null;
            }
            if (i === this.current || this.current === i + this.length) {
                return this.current;
            }
            if (i >= 0) {
                this.index = 0;
                this.current = this.head;
                while (i-- > 0) {
                    this.current = this.current.next;
                    this.index++;
                }
            } else {
                this.index = this.length - 1;
                this.current = this.tail;
                while (++i < 0) {
                    this.current = this.current.prev;
                    this.index--;
                }
            }

            return this.current;
        },

        slice: function(start, end) {
            start = start ? +start : 0;
            end = end || this.length;

            // normalize negative
            start += (start < 0 ? this.length : 0);
            end += (end < 0 ? this.length : 0);

            var tmp = new Fal();
            tmp.length = end - start;
            tmp.head = this._take(start);
            this.current = this.head;
            this.index = 0;
            return tmp.toArray();
        },

        remove: function(i) {
            if (this._take(i) === null) {
                return;
            }
            var current = this.current;
            if (current.prev) {
                current.prev.next = current.next;
            } else {
                this.head = current.next;
            }
            if (current.next) {
                current.next.prev = current.prev;
            } else {
                this.tail = current.prev;
            }
            this.current = this.head;
            this.index = 0;
        },

        addArray: function(arr) {
            for (var i = arr.length - 1; i >= 0; --i) {
                this.push(arr[i]);
            }
        },

        toArray: function() {
            var ret = [], i = 0,
                current = this.head;
            while(i++ < this.length && current) {
              ret.push(current.data);
              current = current.next;
            }
            return ret;
        }
    };

    window.Fal = Fal;
})();
