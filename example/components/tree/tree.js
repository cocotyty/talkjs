(function (win, talk, Klass) {
    talk.require('div', 'input', 'button', 'repeatView', function (div, input, button, repeatView) {
        var fn = function (originData) {
            var data = {text: originData.text, children: []};
            for (var i = 0; i < originData.children.length; i++) {
                data.children.push(fn(originData.children[i]))
            }
            return data;
        };
        win.Tree = Klass({
            getJSON: function () {
                return fn(this.data);
            },
            constructor: function (index, data) {
                if (arguments.length != 2) {
                    index = 0;
                    data = {text: '', children: [], parent: null}
                }
                this.index = index;
                this.data = data;
                this.container = null;
                this.elm = this.init().elm;
            },
            addChild: function () {
                var item = {text: '', children: [], parent: this};
                this.data.children.push(item);
                this.container.append(item);
            },
            removeChild: function (index) {
                this.data.children.splice(index, 1);
                this.container.del(index);
            },
            setIndex: function (index) {
                this.index = index;
            },
            setData: function () {
                this.data = data;
            },
            refreshText: function () {
                this.data.text = this.name.value;
            },
            removeSelf: function () {
                this.data.parent.removeChild(this.index)
            },
            init: function () {
                var deleteButton = button().has('删除').on('click', this.removeSelf.bind(this));
                if (!this.data.parent) {
                    deleteButton.style('display', 'none')
                }
                return div().cls('tui-tree').has(
                    div().cls('tui-tree-title').has(
                        div().cls('tui-tree-show-title').has(
                            input().cls('tui-tree-input').attr('placeholder', '填写').on('input', this.refreshText.bind(this)).is(this, 'name')
                        ),
                        button().has('+').on('click', this.addChild.bind(this)),
                        deleteButton
                    ),
                    div().cls('tui-tree-children').has(
                        repeatView(Tree).is(this, 'container')
                    )
                )
            }
        });
    });

})(window, window.talk, window.Klass);