(function (global) {
    if (!global.talkUI) {
        global.talkUI = {};
    }

    global.talkUI.Chosen = Klass({
        constructor: function (option) {
            this.data = option.data;
            this.title = option.title;
            this.init();
            this.lastValue = '';
            this.root.title.innerText = this.title;
            this.dropListOpening = false;
            this.renderData(this.data);
        },
        confirm: function (item) {
            var needItem = this.data[item.value];
            this.root.title.innerText = needItem.text;
            this.toggleDropList();
            if (this.onSelectedListener) {
                this.onSelectedListener(needItem);
            }
        },
        onSelected: function (fn) {
            this.onSelectedListener = fn;
            return this;
        },
        renderData: function (data) {
            this.listBox.setData(data);
        },
        search: function () {
            var value = this.root.searchInput.value;
            if (this.lastValue == value) {
                return
            }
            var arr = [];
            if (value == '') {
                arr = this.data;
            } else {
                for (var i = 0; i < this.data.length; i++) {
                    var item = this.data[i];
                    var text = item.text;
                    if (text.indexOf(value) != -1) {
                        arr.push({
                            value: i,
                            text: text.replace(value, function (word) {
                                return "<em>" + word + "</em>"
                            })
                        });
                    }
                }
            }
            this.listBox.setData(arr);
            this.lastValue = value;
        },
        startTick: function () {
            if (this.tick) {
                clearInterval(this.tick)
            }
            this.tick = setInterval(this.search.bind(this), 500)
        },
        stopTick: function () {
            if (this.tick) {
                clearInterval(this.tick);
                this.tick = null;
            }
        },
        toggleDropList: function () {
            if (!this.dropListOpening) {
                this.container.classList.add('tui-opening');
                this.root.searchInput.focus();
                this.dropListOpening = true;

            } else {
                this.container.classList.remove('tui-opening');
                this.dropListOpening = false;
            }
        },
        init: function () {
            var prefix = "tui-chosen-";
            var root = {};
            this.root = root;
            var self = this;
            this.elm = talk.require('div', 'span', 'input', function (div, span, input) {
                return div().cls(prefix + 'container').is(self, 'container').has(
                    div().cls(prefix + 'show-box').has(
                        div().is(root, 'title').cls(prefix + 'title'),
                        div().cls(prefix + 'down-arrow')
                    ).on('click', self.toggleDropList.bind(self)),
                    div().cls(prefix + 'drop-list').has(
                        div().cls(prefix + 'search-box').has(
                            input().cls(prefix + 'input').is(root, 'searchInput').on('keydown', function (e) {
                                if (e.keyCode == 40) {
                                    self.listBox.next();
                                } else if (e.keyCode == 38) {
                                    self.listBox.prev();
                                } else if (e.keyCode == 13) {
                                    var a = self.listBox.selectItem();
                                    if (a !== false) {
                                        self.confirm(a)
                                    }
                                }
                            }).on('focus', self.startTick.bind(self)).on('blur', self.stopTick.bind(self))
                        ),
                        new global.talkUI.ChosenList().onConfirm(self.confirm.bind(self)).is(self, 'listBox')
                    ).is(self, 'dropList')
                )
            }).elm
        }
    });

    global.talkUI.ChosenListItem = Klass({
        constructor: function (index, item) {
            this.index = index;
            this.item = item.item;
            this.selected = item.selected;
            this.elm = this.init().elm;
        },
        setIndex: function (index) {
            this.index = index;
            this.view.setAttribute('data-index', index);
        },
        setData: function (item) {
            this.item = item.item;
            this.text.innerHTML = this.item.text;
            this.selected = item.selected;
            if (this.selected) {
                this.view.classList.add('selected')
            } else {
                this.view.classList.remove('selected')
            }
        },
        init: function () {
            var self = this;
            return talk.require('div', 'span', function (div, span) {
                return div().is(self, 'view').attr('data-index', self.index).has(
                    span().html(self.item.text).is(self, 'text')
                )
            })
        }
    });
    global.talkUI.ChosenList = Klass({
        constructor: function () {
            this.elm = this.init().elm;
        },
        onConfirm: function (fn) {
            this.onConfirmListener = fn;
            return this;
        },
        confirm: function (e) {
            var index = e.target.getAttribute('data-index');
            if (index && this.onConfirmListener) {
                this.onConfirmListener(this.data[index]);
            }
        },
        selectItem: function () {
            if (this.index == -1) {
                return false;
            }
            return this.data[this.index];
        },
        is: function (obj, name) {
            obj[name] = this;
            return this;
        },
        setData: function (data) {
            this.data = data;
            var arr = [];
            for (var i = 0; i < data.length; i++) {
                arr.push({item: this.data[i], selected: false});
            }
            this.repeat.setData(arr);
            this.index = -1;
        },
        next: function () {
            this.setIndex(this.index + 1)
        },
        prev: function () {
            this.setIndex(this.index - 1)
        },
        setIndex: function (index) {
            if (index == this.data.length || index == -1) {
                return
            }
            var lastIndex = this.index;
            this.index = index;
            if (lastIndex >= 0) {
                this.repeat.__change(lastIndex, {item: this.data[lastIndex], selected: false})
            }
            this.repeat.__change(index, {item: this.data[index], selected: true});
            var positionOfCurrentIndex = 20 * (index + 1);
            if (positionOfCurrentIndex >= this.box.scrollTop + 100) {
                this.box.scrollTop = positionOfCurrentIndex - 100;
            } else if (positionOfCurrentIndex <= this.box.scrollTop) {
                this.box.scrollTop = positionOfCurrentIndex - 20;
            }
        },
        init: function () {
            var self = this;
            return talk.require('div', 'text', 'repeatView', function (div, text, repeatView) {
                return div().cls('tui-chosen-list-box').on('click', self.confirm.bind(self)).has(
                    repeatView(global.talkUI.ChosenListItem).is(self, 'repeat')
                ).is(self, 'box')
            })
        }
    });
})(window);