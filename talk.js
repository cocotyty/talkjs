(function (global) {

    function copyTo(a, b) {
        for (var k in b) {
            if (b.hasOwnProperty(k)) {
                a[k] = b[k];
            }
        }
        return a;
    }

    function HTMLViewFactory(name) {
        return function () {
            return new HTMLView(name);
        }
    }

    function is(object, name) {
        object[name] = this.elm;
        return this;
    }

    function TextView(text) {
        this.elm = document.createTextNode(text)
    }

    TextView.prototype = {is: is};
    function text(text) {
        if (!text) {
            text = '';
        }
        return new TextView(text)
    }

    function HTMLView(name) {
        this.elm = document.createElement(name)
    }

    HTMLView.prototype = {
        is: is,
        on: function (name, listener) {
            this.elm.addEventListener(name, listener);
            return this;
        },
        cls: function () {
            for (var i = 0; i < arguments.length; i++) {
                this.elm.classList.add(arguments[i])
            }
            return this;
        },
        style: function (style) {
            if (arguments.length == 2) {
                this.elm.style[arguments[0]] = arguments[1];
                return this;
            }
            copyTo(this.elm.style, style);
            return this
        },
        attr: function (name, value) {
            this.elm.setAttribute(name, value);
            return this;
        },
        has: function () {
            for (var i = 0; i < arguments.length; i++) {
                var node = arguments[i];
                if (typeof node === 'string' || node instanceof String) {
                    this.elm.appendChild(document.createTextNode(node))
                } else if (node.elm instanceof Array) {
                    for (var j = 0; j < node.elm.length; j++) {
                        appendChild(this.elm, node.elm[j])
                    }
                } else if (node !== null) {
                    appendChild(this.elm, node.elm)
                }
            }
            return this;
        },
        html: function (str) {
            this.elm.innerHTML = str;
            return this;
        }
    };
    function appendChild(parentNode, element) {
        if (typeof element === 'string' || element instanceof String) {
            parentNode.appendChild(document.createTextNode(element));
        } else if (element instanceof Array) {
            for (var j = 0; j < element.length; j++) {
                appendChild(parentNode, element[j])
            }
        } else {
            parentNode.appendChild(element)
        }
    }

    function SlowRepeatChild() {
    }

    SlowRepeatChild.prototype = {
        setIndex: function (index) {
            this.index = index;
            this.reRender();
        },
        setData: function (data) {
            this.data = data;
            this.reRender();
        },
        reRender: function () {
            var parentNode;
            var removeLater;
            if (this.elm instanceof Array) {
                parentNode = this.elm[0].parentNode;
                removeLater = this.elm[0];
                for (var i = 1; i < this.elm.length; i++) {
                    var node = this.elm[i]
                    parentNode.removeChild(node)
                }
            } else {
                removeLater = this.elm;
                parentNode = this.elm.parentNode;
            }
            if (removeLater.style) {
                removeLater.style.display = 'none';
            }
            var elm = this.render(this.index, this.data).elm;
            if (elm instanceof Array) {
                for (var i = 0; i < elm.length; i++) {
                    parentNode.insertBefore(elm[i], removeLater)
                }
            } else {
                parentNode.insertBefore(elm, removeLater)
            }
            parentNode.removeChild(removeLater)
            this.elm = elm;
        }
    }
    function repeat(renderFN) {
        var parentPrototype = new SlowRepeatChild();
        var temp = function (index, data) {
            this.index = index;
            this.data = data;
            this.elm = this.render(index, data).elm;
        }
        temp.prototype = parentPrototype;
        temp.prototype.render = renderFN;
        return new Repeat(temp);
    }

    function repeatView(repeatChild) {
        return new Repeat(repeatChild);
    }

    function Repeat(cls) {
        this.view = new RepeatView(cls);
        this.elm = this.view.getElements();
    }

    Repeat.prototype = {
        is: function (object, name) {
            object[name] = this.view;
            return this;
        },
        data: function (data) {
            this.view.setData(data)
            this.elm = this.view.getElements();
            return this;
        }
    }
    function RepeatView(creator) {
        this.data = [];
        this.creator = creator;
        this.start = document.createComment("repeat-start");
        this.end = document.createComment("repeat-end");
        this.children = [];
        this.elm = null;
    }

    RepeatView.prototype = {
        getElements: function () {
            var elems = [];
            elems.push(this.start)
            for (var i = 0; i < this.children.length; i++) {
                elems.push(this.children[i].elm)
            }
            elems.push(this.end)
            return elems;
        },
        setData: function (arr) {
            this.clear();
            var children = [];
            var hasRendered = this.start.parentNode ? true : false;
            for (var i = 0; i < arr.length; i++) {
                var child = new this.creator(i, arr[i]);
                children.push(child);
                var elms = child.elm;
                if (hasRendered) {
                    if (elms instanceof Array) {
                        for (j = 0; j < elms.length; j++) {
                            this.start.parentNode.insertBefore(elms[j], this.end);
                        }
                    } else {
                        this.start.parentNode.insertBefore(elms, this.end);
                    }
                }
            }
            this.data = arr;
            this.children = children;
        },
        __change: function (index, item) {
            this.data[index] = item;
            this.children[index].setData(item)
        },
        getItem: function (index) {
            return this.data[index];
        },
        insert: function (index, item) {
            index = parseInt(index);
            var children = this.children;
            var before = children[index].elm;
            if (before instanceof Array) {
                before = before[0];
            }
            var child = new this.creator(index, item);
            var elms = child.elm;
            if (elms instanceof Array) {
                for (var j = 0; j < elms.length; j++) {
                    this.end.parentNode.insertBefore(elms[j], before);
                }
            } else {
                this.end.parentNode.insertBefore(elms, before);
            }

            for (var i = index + 1; i <= children.length; i++) {
                var child = children[i - 1];
                children[i] = child;
                if (child.setIndex) {
                    child.setIndex(i)
                }
            }
            children[index] = child;
            this.data.splice(index, 0, item)
        },
        clear: function () {
            for (var i = 0; i < this.children.length; i++) {
                var elms = this.children[i].elm;
                if (elms instanceof Array) {
                    for (var j = 0; j < elms.length; j++) {
                        this.start.parentNode.removeChild(elms[j]);
                    }
                } else {
                    this.start.parentNode.removeChild(elms);
                }
            }
            this.data = [];
            this.children = [];
        },
        del: function (index) {
            index = parseInt(index);
            var children = this.children
            var elms = children[index].elm;
            if (elms instanceof Array) {
                for (var j = 0; j < elms.length; j++) {
                    this.start.parentNode.removeChild(elms[j]);
                }
            } else {
                this.start.parentNode.removeChild(elms);
            }
            for (var i = index; i < children.length - 1; i++) {
                children[i] = children[i + 1];
                if (children[i].setIndex) {
                    children[i].setIndex(i);
                }
            }
            this.data.splice(index, 1)
            children.pop();
        },
        append: function (item) {
            var child = new this.creator(this.children.length, item);
            var elms = child.elm;
            if (elms instanceof Array) {
                for (var j = 0; j < elms.length; j++) {
                    this.end.parentNode.insertBefore(elms[j], this.end);
                }
            } else {
                this.end.parentNode.insertBefore(elms, this.end);
            }
            this.children[this.children.length] = child;
            this.data.push(item)
        },
        prepend: function (item) {
            this.insert(0, item)
        }
    };
    function tags() {
        var tagImports = {};
        for (var i = 0; i < arguments.length; i++) {
            var current = arguments[i];
            if (current == 'repeat') {
                tagImports['repeat'] = repeat;
            } else if (current == 'repeatView') {
                tagImports['repeatView'] = repeatView;
            } else if (current == 'text') {
                tagImports['text'] = (text);
            } else {
                tagImports[current] = HTMLViewFactory(current);
            }
        }
        return tagImports;
    }

    function require() {
        var tagImports = [];
        for (var i = 0; i < arguments.length - 1; i++) {
            var current = arguments[i];
            if (current == 'repeat') {
                tagImports.push(repeat);
            } else if (current == 'repeatView') {
                tagImports.push(repeatView);
            } else if (current == 'text') {
                tagImports.push(text);
            } else {
                tagImports.push(HTMLViewFactory(current));
            }
        }
        return arguments[arguments.length - 1].apply(null, tagImports);
    }

    tags.require = require;
    tags.repeat = repeat;
    tags.repeatView = repeatView;
    global.talk = tags;
})(window)