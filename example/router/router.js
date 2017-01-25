;(function (win) {

    function Activity() {

    }

    Activity.prototype = {
        onCreate: function () {
        },
        onWillMount: function () {

        },
        onMount: function () {

        },
        onWillUnmount: function () {

        },
        onUnmount: function () {

        }
    };
    function ActivityManager() {
        this._increse = 0;
        this.iocHashTable = {};
    }

    ActivityManager.prototype = {
        createOrGet: function (activityCls) {
            if (activityCls.__hashID == null) {
                this._increse++;
                activityCls.__hashID = this._increse + '';
            }
            var activity = this.iocHashTable[activityCls.__hashID];
            if (!activity) {
                activity = new activityCls();
                activity.onCreate();
                this.iocHashTable[activityCls.__hashID] = activity;
            }
            return activity;
        }
    };

    var listeners = [];

    function getHash() {
        var hash = win.location.hash;
        if (hash.length == 0) {
            hash = null;
        } else {
            hash = hash.substr(1, hash.length - 1);
        }
        return hash;
    }

    function Route() {
        this.ActivityManager = new ActivityManager();
        this.routeTree = {hash: {}, any: null, handle: null};
    }


    function historyChangeListener() {
        var hash = getHash();
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](hash);
        }
    }

    Route.prototype = {
        __change: function (handle, param, query) {
            if (this.currentActivity != null) {
                this.currentActivity.onWillUnmount();
                this.elm.removeChild(this.currentActivity.elm);
                this.currentActivity.onUnmount();
            }
            var activity = this.ActivityManager.createOrGet(handle);
            activity.onWillMount(param, query);
            this.elm.appendChild(activity.elm);
            activity.onMount(param, query);
            this.currentActivity = activity;
        },
        add: function (path, handle) {
            var paths = path.split("/");
            var currentNode = this.routeTree;
            for (var i = 0; i < paths.length; i++) {
                var p = paths[i];
                if (p.length == 0) {
                    continue
                }
                var next = {hash: {}, any: null, handle: null};
                if (p[0] == '{' && p[p.length - 1] == '}') {
                    currentNode.any = next;
                    currentNode.anyName = p.substr(1, p.length - 2);
                } else {
                    currentNode.hash[p] = next
                }
                currentNode = next;
            }
            currentNode.handle = handle;
        },
        start: function () {
            listeners.push(this.__exec.bind(this));
            this.__exec(getHash())
        },
        setHome: function (homePath) {
            this.home = homePath;
        },
        setNotFound: function (notFound) {
            this.notFound = notFound;
        },
        __exec: function (hash) {
            if (hash == null) {
                if (this.home == null) {
                    return
                }
                win.location.hash = "#" + this.home;
                return;
            }
            var pos = hash.indexOf('?');
            var query;
            var params = {};
            if (pos >= 0) {
                query = hash.substr(pos + 1, hash.length - pos);
                hash = hash.substr(0, pos);
            }
            var paths = hash.split("/");

            var currentNode = this.routeTree;
            for (var i = 0; i < paths.length; i++) {
                var p = paths[i];
                if (p.length == 0) {
                    continue
                }
                var node = currentNode.hash[p];
                if (node != null) {
                    currentNode = node
                } else if (currentNode.any != null) {
                    params[currentNode.anyName] = p;
                    currentNode = currentNode.any;
                } else {
                    if (this.notFound != null) {
                        this.notFound(hash);
                    }
                    return
                }
            }
            if (currentNode.handle == null) {
                if (this.notFound != null) {
                    this.notFound(hash);
                }
                return
            }
            this.__change(currentNode.handle, params, query);
        }
    };


    win.addEventListener("hashchange", historyChangeListener);
    Route.Activity = Activity;
    win.Route = Route;
})(window);