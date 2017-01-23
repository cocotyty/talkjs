(function (global) {
    function klass(parent, name, proto) {
        if (arguments.length == 2) {
            proto = name;
            name = parent;
            parent = Object;
        } else if (arguments.length == 1) {
            proto = parent;
            name = null;
            parent = Object;
        }
        function cls() {
            var constructor = this['constructor'];
            return constructor && constructor.apply(this, arguments);
        }
        if (name) {
            global[name] = cls;
        }
        function Type() { }
        Type.prototype = parent.prototype;
        cls.prototype = new Type();
        for (var i in proto) {
            if (proto.hasOwnProperty(i) && typeof proto[i] == 'function') {
                cls.prototype[i] = proto[i];
            }
        }
        return cls;
    }
    global.Klass = klass;
})(this)