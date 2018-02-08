/**
 * Created by Esri on 2015/3/27.
 */
require(["dojo/dom",
        "./QueryResult.js",
        "widgets/network/RouteResult",
        "dojo/domReady!"
    ],
    function (dom, QueryResult, RouteResult) {

        var map = null;
        //
        var zoomLevel = 15;
        var appEvent = null;

        //
        var infoWindow = null;
        var queryResult = null;
        var routeResult = null;
        /**
         * <p>显示查询结果</p>
         *
         * */
        window.showResults = function (data) {
            var config = data.config;
            var results = data.results;
            var type = data.type;
            if (type === "poi") {
                //
                //$("#homes").hide();
                $("#info-results").hide();
                $("#results").show();
                //
                queryResult = new QueryResult(map);
                queryResult.setConfig(config);
                queryResult.setZoomLevel(zoomLevel);
                queryResult.setBufferGraName(data.bufferGraName);
                queryResult.setPagers(dom.byId("pagers"));
                queryResult.setContent(dom.byId("contents"));
                queryResult.loadQueryResults(results.features);
                queryResult.setAppEvent(appEvent);
                queryResult.hideBusyIndicator();
            } else if (type === "drive") {
                //
                //$("#homes").hide();
                $("#results").hide();
                $("#info-results").show();
                routeResult = new RouteResult(map);

                routeResult.setConfig(config);
                routeResult.setContent(dom.byId("info-results"));
                //routeResult.setAppEvent(appEvent);
                routeResult.setAppEvent(appEvent);
                routeResult.loadRouteResults(results);
                routeResult.addGraphic(data.start);
                routeResult.addGraphic(data.end);
                routeResult.hideBusyIndicator();
            } else {
                //
            }
        };

        /**init*/
        (function () {
            //
            map = window.parent.mainMap;
            appEvent = window.parent.appEvent;
            //
            if (map) {
                //
                infoWindow = map.infoWindow;
                infoWindow.setInfoType("poi");
            }
            var data = window.parent.extraData;
            if (data) {
                //
                //window.parent.clearQueryResultInMap(true);
                window.showResults(data);
            }
        })();
    });
