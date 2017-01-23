Klass('App', {
    constructor: function () {
        this.refs = {};
        this.init()
    },
    keyDown: function (e) {
        if (e.keyCode == 13) {
            this.refs.repeat.append(e.target.value);
            e.target.value = '';
        }
    },
    click: function (e) {
        var index = e.target.getAttribute('data-index')
        this.refs.repeat.del(index);
    },
    init: function () {
        const refs = this.refs;
        this.elm = talk.require(
            'div', 'repeatView', 'h1', 'input', 'button',
            (div, repeatView, h1, input, button) =>
                div().has(
                    h1().has('add Todo'),
                    input().attr('placeholder', 'todos').on('keyup', this.keyDown.bind(this)),
                    repeatView(Klass({
                        constructor: function (index, data) {
                            this.index = index;
                            this.data = data;
                            this.root = {};
                            this.elm = this.render().elm;
                        },
                        delete: function () {
                            refs.repeat.del(this.index)
                        },
                        setIndex: function (index) {
                            this.index = index;
                            this.showText()
                        },
                        setData: function (data) {
                            this.data = data;
                            this.showText()
                        },
                        showText: function () {
                            if (this.index % 2 == 0) {
                                this.root.text.innerText = '%index:' + this.index + '->data:' + this.data
                            } else {
                                this.root.text.innerText = '#index:' + this.index + '->data:' + this.data
                            }
                        },
                        render: function () {
                            var dom = div().has(
                                div().bind(this.root, 'text'),
                                button().has('fuck').on('click', this.delete.bind(this))
                            )
                            this.showText();
                            return dom;
                        }
                    })).bind(refs, 'repeat')
                )
        ).elm;
    }
})
var app = new App();
document.body.appendChild(app.elm);