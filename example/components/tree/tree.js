(function (win, talk, Klass) {
    talk.require('div', 'input', 'button', function (div, input, button) {
        var tree = Klass({
            constructor: function (parent) {
                this.parent = parent;
                this.elm = this.init().elm
            },
            addChild: function () {
                this.childrenContainer.appendChild(new tree(this).elm);
            },
            removeSelf: function () {
            },
            init: function () {
                var deleteButton = button().has('删除').on('click', this.removeSelf.bind(this));
                if (!this.parent) {
                    deleteButton.style('display', 'none')
                }
                return div().cls('tui-tree').has(
                    div().cls('tui-tree-title').has(
                        div().cls('tui-tree-show-title').has(
                            input().cls('tui-tree-input').attr('placeholder', '填写').bind(this, 'name')
                        ),
                        button().has('+').on('click', this.addChild.bind(this)),
                        deleteButton
                    ),
                    div().cls('tui-tree-children').bind(this, 'childrenContainer')
                )
            }
        });
        win.Tree = tree;
    });

})(window, window.talk, window.Klass);