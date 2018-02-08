/**
 * Created by Esri on 2015/3/26.
 */
define(["dojo/_base/lang", "dojo/dom",
        "dojo/_base/array",
        "dojo/_base/declare",
        "dojo/string", "dojo/json",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
        "esri/graphic",

        "esri/config",
        "esri/geometry/Circle",

        "viewer/ConfigManager",
        "viewer/SymbolManager"

    ],
    function (lang,dom, Array, declare, string, JSON,
              Query, QueryTask,
              Graphic, esriConfig, Circle, ConfigManager, SymbolManager) {
        //strin
        //    var poiCatalogs,city;
        //
        var QUERY_RESULT_KEY = "queryResultKey";
        var QUERY_CONFIG_KEY = "queryConfigKey";

        var configData = {};

        var configManager = null;
        //
        var symbolManager = null;

        //代理地址
        var agsProxyUrl = "../proxy2.jsp";
        //
        //
        var queryTask = null;
        //缓冲距离 单位:米
        //var  bufferRadius=500;
        //POI分类
        //var poiCatalogType="01";
        var _map = null;
        //
        var _appEvent=null;
        //
        var centerSymbol=null;
        var bufferClass = declare([], {
            //
            constructor: function (map) {

                _map = map;
                //
                symbolManager = new SymbolManager();
                configManager = new ConfigManager(function (data) {
                }, function (error) {
                });
                //
                configManager.loadConfigWhitCallback("widgets/buffer/config.json", lang.hitch(this, this._configLoadedHandler), lang.hitch(this, this._configLoadErrorHandler));
            },
            _configLoadedHandler: function (data) {
                //
                try {

                    configData = data;
                    //
                    //var configJson = JSON.stringify(configData);
                    centerSymbol=symbolManager.createPictureMarkerSymbol(configData.centerSymbol);
                    //
                    //window.localStorage.setItem(QUERY_CONFIG_KEY, configJson);
                    if (data.url) {
                        //
                        queryTask = new QueryTask(data.url);
                    }
                } catch (error) {
                    //
                    //alert(error.toString());
                    _appEvent.dispatchAppEvent(_appEvent.SHOW_TOASTER,{info:error.toString()});
                }
            },
            //
            _configLoadErrorHandler: function (error) {
                //
                console.log(error.toString());
            },
            _setOutFields: function (data) {
                //
                var results = [];

                Array.forEach(data.fields, function (field) {
                    //
                    results.push(field.name);
                });
                //
                return results;
            },
            //
            setAppEvent:function(event){
                //
                _appEvent=event;
            },
            //
            executeBufferQuery: function (param) {
                //

                var centerGra=param.center;
                var circle = new Circle(centerGra.geometry, {
                    geodesic: true,
                    radius: param.distance
                });
                //
                //
                centerGra.setSymbol(centerSymbol);
                //;
                _map.graphics.clear();
                var symbol = symbolManager.createSimpleFillSymbol(configData.bufferSymbol);

                var geometry = circle;//bufferedGeometries[0];
                var graphic = new Graphic(geometry, symbol);

                //
                //window.extraData = graphic;

                //设置代理
                esriConfig.defaults.io.proxyUrl = agsProxyUrl;
                esriConfig.defaults.io.alwaysUseProxy = false;

                var params = new Query();
                //var whereCause=string.substitute(configData.catalogmatch,{type:poiCatalogType});
                //
                //queryParams.where=whereCause;
                params.geometry = geometry;
                params.spatialRelationship = Query.SPATIAL_REL_CONTAINS;

                params.outFields = this._setOutFields(configData);
                params.returnGeometry = true;
                //
                queryTask.execute(params, function (results) {
                    //
                    //window.parent.queryData=results;
                    //window.parent.queryFields=configData.fields;
                    //;
                    //var resultsJson = JSON.stringify(results);
                    //
                    //console.log("before::\t\n"+resultsJson);
                    //
                    window.clearQueryResultInMap(true);
                    //
                    _map.graphics.add(graphic);
                    _map.graphics.add(centerGra);
                    var data={};
                    data.config=configData;
                    data.results=results;
                    data.type="poi";
                    data.bufferGraName=centerGra.attributes[configData.nameField];

                    var container=dom.byId("widgetContainer").contentWindow.showResults(data);
                    //
                    //var json=JSON.stringify(data);
                    //window.localStorage.setItem(QUERY_RESULT_KEY,json);
                    //

                    //_appEvent.dispatchAppEvent(_appEvent.SHOW_INFO_QUERY_RESULTS,data);


                    //window.localStorage.setItem(QUERY_RESULT_KEY, resultsJson);
                    //
                    //显示查询结果面板
                    //window.open("widgets/search/result.html", "widgetContainer");

                }, function (error) {
                    //
                    console.log("execute query task failed. in buffer.js file.\t" + error.toString());
                });
            }

        });
        //
        return bufferClass;
    });