(function (global) {
    function klass(parent, name, proto) {
        if (arguments.length == 2) {
            if (typeof parent == "function") {
                proto = name;
                name = null;
            } else {
                proto = name;
                name = parent;
                parent = Object;
            }
        } else if (arguments.length == 1) {
            proto = parent;
            name = null;
            parent = Object;
        }
        function Type() {
            var constructor = this['constructor'];
            return constructor && constructor.apply(this, arguments);
        }

        if (name) {
            global[name] = Type;
        }
        function Temp() {
        }

        Temp.prototype = parent.prototype;
        Type.prototype = new Temp();
        for (var i in proto) {
            if (proto.hasOwnProperty(i) && typeof proto[i] == 'function') {
                Type.prototype[i] = proto[i];
            }
        }
        return Type;
    }

    global.Klass = klass;
})(this);