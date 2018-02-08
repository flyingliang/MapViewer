/**
 * Created by Esri on 2015/6/4.
 */
/**多时相业务逻辑类*/
define(["dojo/_base/declare",
        "dojo/dom",
        "dojo/query",
        "dojo/on",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/topic",
        "dijit/form/HorizontalSlider",
        "dijit/form/HorizontalRule",
        "dijit/form/HorizontalRuleLabels",

        "esri/map",
        "esri/graphic",
        "esri/layers/GraphicsLayer",
        "esri/symbols/PictureMarkerSymbol",

        "viewer/ConfigManager",
        "viewer/MapManager",
        "util/commonUtil"
    ],
    function (declare, dom, query, on, Array, lang, domConstruct,topic, HorizontalSlider, HorizontalRule, HorizontalRuleLabels,
              Map, Graphic, GraphicsLayer, PictureMarkerSymbol, ConfigManager, MapManager, Util) {

        var _configManager = null;
        var multiSelf = null;
        var multiClass = declare(null, {

            _mainMap: null,//AGS Map Object    :   Map on left side.
            _attachMap: null,//AGS Map Object  :   Map on right side.
            configData: null,//JS Object       :    多时相 配置 对象
            _mainMapLayers: [],//Array Object (Layer IDs)               :   保存进入多时相之前主地图中可见的图层(visible : ture)
            _mainMapMultLayers: [],//AGS Layer Object (Layer IDs)       :   添加到主地图中的多时相图层   For:Deactivate.
            _attachMapMultLayers: [],//AGS Layer Object (Layer IDs)     :   添加到主地图中的多时相图层   For:Deactivate.
            _currentShowLayersObj: null,//JS Object                      :   存储当前显示的图层id，{mainMap:[layerId1,layerId2],attachMap:[layerId1,layerId2]}
            _eventListeners : [],
            _whoseExtentChange: null,//String                           :   保存 extentChange事件的 地图ID，防止 事件 嵌套触发（死循环）
            _whoseMouseMove: null,//String                              :   保存 mouseMove事件的地图ID，防止 事件 嵌套触发（死循环）
            _mainCursorGraLayer: null,//AGS Object(Graphic)             :   附 鼠标 指针 所在GraphicsLayer
            _attachCursorGraLayer: null,//AGS Object(Graphic)           :   附 鼠标 指针 所在GraphicsLayer
            _multiMaps: [],//Array AGSMAP Object                        :    存放 地图对象
            _isFirstLoaded: true,
            /**
             * Constructor
             * @param mapDiv
             */
            constructor: function (configUrl, mainMap) {
                this._mainMap = mainMap;
                this._multiMaps.push(this._mainMap);

                //Initial _currentShowLayersObj.
                this._currentShowLayersObj = {
                    mainMap: [],
                    attachMap: []
                };

                //Create cursor layer hidden by default.
                this._mainCursorGraLayer = new GraphicsLayer({id: "mainCursorGraLayer", visible: false});
                this._attachCursorGraLayer = new GraphicsLayer({id: "attachCursorGraLayer", visible: false});

                //Create config manager.
                _configManager = new ConfigManager(function () {
                }, function () {
                });
                if (configUrl) {
                    _configManager.loadConfigWhitCallback(configUrl, lang.hitch(this, this._configLoaded), lang.hitch(this, this._configLoadedError));
                }

                //Add baseMapLayerChanged event listener.
                topic.subscribe("baseMapLayerChanged", lang.hitch(this,function(basemap){
                    console.log("MultiTool -- baseMapLayerChanged",basemap);
                    this._mainMapLayers = [];
                    for(var i=0;i<basemap.layers.length;i++) {
                        this._mainMapLayers.push(basemap.layers[i].id);
                    }

                }));
            },

            /**
             * Parse configuration.
             * @param data
             * @private
             */
            _configLoaded: function (data) {
                this.configData = data;
                if (this.configData) {
                    multiSelf = this;

                    this._parseLayersIds();//Collecting layer ids.

                    this._attachMap = new Map("map2", {extent: mainMap.extent, sliderStyle: "large", logo: false});
                    this._multiMaps.push(this._attachMap);
                    topic.subscribe("mainLayoutChange",lang.hitch(this,function(){
                        this._attachMap.resize();
                        this._attachMap.reposition();
                    }));

                    /*this._attachMap.on("load", lang.hitch(function (evt) {
                        console.log('AttachMap', "loaded.");
                    }));

                    this._attachMap.on("resize", lang.hitch(function (evt) {
                        console.log('AttachMap', "map's container has been resized.");
                    }));
                     this._attachMap.on("extent-change", lang.hitch(function (evt) {
                     console.log('AttachMap', "extent of the map has changed.");
                     }));
                     this._attachMap.on("layer-add", lang.hitch(function (evt) {
                     console.log('AttachMap', "a layer is added to the map.");
                     }));
                     this._attachMap.on("layers-add-result", lang.hitch(function (evt) {
                     console.log('AttachMap', "all layers are added to the map using the map.addLayers method.");
                     }));
                    this._attachMap.on("layer-resume", lang.hitch(function (evt) {
                        console.log('AttachMap', "map layer resumes drawing.");
                    }));*/

                    //Dom Structure.
                    //  Create multidate widget.
                    this._createWidget("left-slider", this._mainMap, this.configData.defaultLYear);//Widget Slider Left side.
                    this._createWidget("right-slider", this._attachMap, this.configData.defaultRYear);//Widget Slider Right side.

                    //Map Layers.
                    //  Load layers for mainMap.
                    this.changeLayerVisibleById(this._mainMap, this.configData.defaultLYear);
                    //  Load layers for getAttachMap.
                    this.changeLayerVisibleById(this._attachMap, this.configData.defaultRYear);
                    //Add cursor layer.
                    this._mainMap.addLayer(this._mainCursorGraLayer);
                    this._attachMap.addLayer(this._attachCursorGraLayer);

                    this._isFirstLoaded = false;
                    this.activate();
                }
            },
            _createWidget: function (domIdStr, mapObj, defaultYear) {
                var config = this.configData;
                var widgetRuleValues = [], widgetRuleLabels = [];
                for (var i = 0; i < config.basemaps.length; i++) {
                    widgetRuleValues.push(+config.basemaps[i].id);
                    widgetRuleLabels.push(config.basemaps[i].id + "年");
                }

                // Create the rules
                var rulesNode = domConstruct.create(
                    "div", {}, dom.byId(domIdStr), "first");
                var sliderRules = new HorizontalRule({
                    container: "bottomDecoration",
                    count: widgetRuleValues.length,
                    style: "height:5px;"
                }, rulesNode);

                // Create the labels
                var labelsNode = domConstruct.create(
                    "div", {}, dom.byId(domIdStr), "first");
                var sliderLabels = new HorizontalRuleLabels({
                    container: "topDecoration",
                    labels: widgetRuleLabels,
                    style: "height:1.5em;font-size:75%;color:gray;"
                }, labelsNode);

                // Create the Horizontal slider programmatically
                var horiSlider = new HorizontalSlider({
                    name: domIdStr,
                    value: +defaultYear,
                    minimum: widgetRuleValues[0],
                    maximum: widgetRuleValues[widgetRuleValues.length - 1],
                    discreteValues: widgetRuleValues.length,
                    intermediateChanges: true,
                    showButtons: false,
                    onChange: lang.hitch(this, function (value) {
                        var basemapId = value.toString();
                        this.changeLayerVisibleById(mapObj, basemapId);
                    })
                }, domIdStr);

                // Start up the widgets
                horiSlider.startup();
                sliderRules.startup();
                sliderLabels.startup();
            },
            /**
             * 添加初始化的图层
             * @param map
             * @param defaultYear
             * @returns {Array}
             * @private
             */
            _loadedConfigLayers: function (map, defaultYear) {
                var layers = this._getConfigLayersById(defaultYear);

                var cacheLayers = [];//AGS Layer object :
                if (map && layers) {
                    Array.forEach(layers, function (configLayer) {
                        var layer = MapManager.createSingleLayer(configLayer);
                        map.addLayer(layer);
                        cacheLayers.push(layer);
                    });
                }
                return cacheLayers;
            },
            //
            deactivate: function () {
                //
                //this._removeEventListeners(this._eventListeners);
                this._whoseExtentChange = null;
                this.toggleLayers(false);//show oraginal layer.
                this.resize();
            },
            /**激活地图对比工具*/
            activate: function () {
                //Add listeners.
                this._addEventListeners();
                this.toggleLayers(true);
                this.resize();
            },

            /**
             *
             * @param flag              true:multidataMap | false:normal
             */
            toggleLayers: function (flag) {
                //MainMap.
                //  Oraginal mainMap layers(ordinary layers and graphic layers).
                for (var i = 0; i < this._mainMapLayers.length; i++) {
                    var layer = this._mainMap.getLayer(this._mainMapLayers[i]);
                    if (layer)
                        flag ? layer.hide() : layer.show();
                }
                //  Default graphic layer.
                flag ? this._mainMap.graphics.hide() : this._mainMap.graphics.show();
                //  Infowindow.
                flag && this._mainMap.infoWindow.hide();

                //  Multidate ordinary layers.
                for (var j = 0; j < this._mainMapMultLayers.length; j++) {
                    var layer = this._mainMap.getLayer(this._mainMapMultLayers[j]);
                    if (layer)
                        flag && Util.isInArray(layer.id, this._currentShowLayersObj.mainMap, false) ? layer.show() : layer.hide();
                }

                //Attach map.
                //  Multidate ordinary layers.
                for (var k = 0; k < this._attachMapMultLayers.length; k++) {
                    var layer = this._attachMap.getLayer(this._attachMapMultLayers[k]);
                    if (layer)
                        flag && Util.isInArray(layer.id, this._currentShowLayersObj.attachMap, false) ? layer.show() : layer.hide();
                }

                // 主地图切换 部件 隐藏
                flag ? query(".switcher").style("display", "none") : dom.byId("switcher").style.display = "block";

            },
            _parseLayersIds: function () {
                //All layers.
                this._mainMapLayers = this._mainMapLayers.concat(this._mainMap.layerIds);
                //All graphicLayers.
                this._mainMapLayers = this._mainMapLayers.concat(this._mainMap.graphicsLayerIds);

                for (var i = 0; i < this.configData.basemaps.length; i++) {
                    for (var j = 0; j < this.configData.basemaps[i].layers.length; j++) {
                        var multiLayerId = this.configData.basemaps[i].layers[j].id;
                        this._mainMapMultLayers.push(multiLayerId);
                        this._attachMapMultLayers.push(multiLayerId);
                    }
                }
                this._mainMapMultLayers.push("mainCursorGraLayer");//Add Cursor graphic layer.
                this._attachMapMultLayers.push("attachCursorGraLayer");//Add cursor graphic layer.
            },
            /**
             * 显示/隐藏 mainmap 原来的图层
             * @param flag          true:显示
             * @private             false:隐藏
             */
            /*toggleMainMap: function (flag) {
             //TODO FIX
             if (flag) {//显示mainMap 原来的图层
             for (var i = 0; i < this._mainMapLayers.length; i++) {
             var layer = this._mainMapLayers[i];
             if (layer) {
             layer.show();
             }
             }
             } else {//隐藏mainMap 原来的图层
             //All layers.
             for (var i = 0; i < _mainMap.layerIds.length; i++) {
             var layer = _mainMap.getLayer(_mainMap.layerIds[i]);
             if (layer) {
             if (layer.visible) {
             this._mainMapLayers.push(layer);
             }
             layer.hide();
             }
             }

             //All graphicLayers.
             for (var j = 0; j < _mainMap.graphicsLayerIds.length; j++) {
             var layer = _mainMap.getLayer(_mainMap.graphicsLayerIds[j]);
             if (layer) {
             if (layer.visible) {
             this._mainMapLayers.push(layer);
             }
             layer.hide();
             }
             }

             //Default graphicLayer
             var graLayer = _mainMap.graphics;
             graLayer.hide();
             this._mainMapLayers.push(graLayer);

             //InfoWindow.
             _mainMap.infoWindow.hide();
             }
             },*/
            _removeEventListeners: function (listenters) {
                Array.forEach(listenters, function (handler) {
                    if (handler) {
                        handler.remove();
                    }
                });
                this._eventListeners = [];
            },
            //
            _addEventListeners: function () {
                if(this._eventListeners &&  this._eventListeners.length) {
                    return ;
                }
                var handler1 = this._mainMap.on("extent-change", lang.hitch(this, this.extentChangeHandler));
                var handler2 = this._attachMap.on("extent-change", lang.hitch(this, this.extentChangeHandler));
                var mouseMoveHandler1 = this._mainMap.on("mouse-move", lang.hitch(this, this.mouseMoveHander));
                var mouseMoveHandler2 = this._attachMap.on("mouse-move", lang.hitch(this, this.mouseMoveHander));
                this._eventListeners = [handler1, handler2, mouseMoveHandler1, mouseMoveHandler2];
            },

            mouseMoveHander: function (evt) {
                var cursorSymbol = new PictureMarkerSymbol("./widgets/multi/images/mousemove.png", 16, 24);
                cursorSymbol.setOffset(8, -12);
                var attachCursor = new Graphic(evt.mapPoint, cursorSymbol);

                this._mainCursorGraLayer.clear();
                this._attachCursorGraLayer.clear();

                if (evt.target.id.indexOf("map1") !== -1) {
                    this._attachCursorGraLayer.add(attachCursor);
                } else {
                    this._mainCursorGraLayer.add(attachCursor);
                }
            },

            extentChangeHandler: function (evt) {
                if (!this._whoseExtentChange) {
                    this._whoseExtentChange = evt.target.id;
                    if (evt.target.id === "map1") {
                        this._attachMap.setExtent(evt.extent);
                    } else {
                        this._mainMap.setExtent(evt.extent);
                    }
                } else {
                    this._whoseExtentChange = null;
                }
            },

            getAttachMap: function () {
                return this._attachMap;
            },
            //
            resize: function () {
                /*for (var i = 0; i < this._multiMaps.length; i++) {
                    var map = this._multiMaps[i];
                    //MapManager.resize(map);
                    map.resize();
                    map.reposition();
                }*/
                this._mainMap.resize();
                this._mainMap.reposition();
                //this._attachMap.resize();
                //this._attachMap.reposition();
                //this._attachMap.setExtent(mainMap.extent);
            },
            //
            _checkMapExtent: function (extent) {
                //
                var checkState = false;
                if (extent) {
                    //
                    if (!isNaN(extent.xmin) && !isNaN(extent.ymin) && !isNaN(extent.xmax) && !isNaN(extent.ymax)) {
                        //
                        checkState = true;
                    }
                }
                //
                return checkState;
            },
            _configLoadedError: function (error) {
                console.error("MultidateTool._configLoadedError   ", "Config loading error.", error.toString());
            },
            /**
             * 根据basemap ID 获得layer 配置数组
             * @param basemapId
             * @returns {Array}
             * @private
             */
            _getConfigLayersById: function (basemapId) {
                if (!basemapId || isNaN(basemapId)) {
                    console.error("MultidateTool._getConfigLayersById   ", "basemapId is null!");
                    return;
                }
                var layers = [];
                var basemaps = this.configData.basemaps;
                for (var i = 0; i < basemaps.length; i++) {
                    if (basemapId == basemaps[i].id) {
                        var basemap = basemaps[i];
                        layers = lang.clone(basemap.layers);
                        break;
                    }
                }
                if (!layers || !layers.length) {
                    console.warn("MultidateTool._getConfigLayersById   ", "Layers null!");
                }
                return layers;
            },

            /**
             *
             * @param map
             * @param layerId
             */
            changeLayerVisibleById: function (map, basemapId) {

                //Reset _currentShowLayersObj
                map.id === "map1" ? this._currentShowLayersObj.mainMap = ["mainCursorGraLayer"] : this._currentShowLayersObj.attachMap = ["attachCursorGraLayer"];

                var configLayers = this._getConfigLayersById(basemapId);
                var mapLayerIds = map.layerIds;

                //处理configLayers 已加载到地图的部分
                //Hide map layers.
                for (var j = 0; j < mapLayerIds.length; j++) {
                    var mapLayer = map.getLayer(mapLayerIds[j]);
                    //如果已经被地图加载，不隐藏，显示
                    if (Util.isInArrayObj(mapLayerIds[j], configLayers, "id", false)) {
                        mapLayer.show();
                        map.id === "map1" ? this._currentShowLayersObj.mainMap.push(mapLayer.id) : this._currentShowLayersObj.attachMap.push(mapLayer.id);
                    } else {
                        mapLayer.hide();
                    }
                }

                //处理configLayers 未加载到地图的部分
                //加载未加载到地图对象的图层
                for (var i = 0; i < configLayers.length; i++) {
                    var conLayer = configLayers[i];
                    if (!Util.isInArray(conLayer.id, mapLayerIds, false)) {//未加载到地图
                        var AGSLayer = MapManager.createSingleLayer(conLayer);
                        map.addLayer(AGSLayer);
                        AGSLayer.show();
                        map.id === "map1" ? this._currentShowLayersObj.mainMap.push(AGSLayer.id) : this._currentShowLayersObj.attachMap.push(AGSLayer.id);
                    }
                }
            },

            /**
             *隐藏多时相图层
             * */
            _removeConfigLayerInAttach: function (layers) {
                //var layers=this._attachMap.layerIds;
                Array.forEach(layers, function (layer) {
                    if (layer && layer.visible) {
                        //
                        multiSelf._attachMapMultLayers.push(layer);
                    }
                    layer.hide();
                });
            }
        });

        return multiClass;
    });