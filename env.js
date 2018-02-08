
/* Declaration of Enhanced functions  need to be executed at beginning. */
(function () {
    //To take care of IE8 and below-
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (what, i) {
            i = i || 0;
            var L = this.length;
            while (i < L) {
                if (this[i] === what) return i;
                ++i;
            }
            return -1;
        };
    }

    /**
     * Remove item from array by value
     *  e.g.
     *      var ary = ['three', 'seven', 'eleven'];
     *      ary.remove('seven');
     *      eturned value: (Array)  ['three','eleven']
     * @returns {Array}
     */
    Array.prototype.remove = function () {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };
})();

//Dojo global configuration.
var dojoConfig = (function (win) {
    var baseUrl = win.location.href.split("/");
    var hostIndex = 0;
    for (var i in baseUrl) {
        if (baseUrl[i] === win.location.host) {
            hostIndex = parseInt(i);
            break;
        }
    }
    //var appName = "/" + baseUrl[hostIndex + 2];
    var appName = "";
    baseUrl = win.location.protocol + "//" + win.location.host + "/" + baseUrl[hostIndex + 1];
    return {
        async: true,
        isDebug: false,
        parseOnLoad: true,
        packages: [{
            name: "core",
            location: baseUrl + appName + "/viewer/js/core"
        }, {
            name: "util",
            location: baseUrl + appName + "/viewer/js/util"
        }, {
            name: "viewer",
            location: baseUrl + appName + "/viewer"
        }, {
            name: "jq",
            location: baseUrl + appName + "/libs/jquery"
        }, {
            name: "widgets",
            location: baseUrl + appName + "/widgets"
        }, {
            name: "coms",
            location: baseUrl + appName + "/viewer/coms"
        }, {
            //Import the module from Portal.
            name: "custom",
            location: baseUrl + "/js/custom"
        }, {
            //Import the module from Portal.
            name: "mgr",
            location: baseUrl + "/js/mgr"
        }]
    };
})(window);
