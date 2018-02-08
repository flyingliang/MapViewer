define(["dojo/_base/declare",
        "dojo/dom",
        "dojo/query",
        "dojo/on",
        "dojo/mouse",
        "dojo/_base/lang",
        "dojo/dom-style",
        "dojo/topic",

        "viewer/ConfigManager",
        "viewer/MapManager",
        "widgets/swipe/js/LayerSwipe",
        "dojo/domReady!"],
    function (declare, dom, query, on, mouse, lang, domStyle, topic, ConfigManager, MapManager, LayerSwipe) {

        var swipeClass = declare(null, {

            _mainMap: null,//AGS Map Object    :   Map on left side.
            _swipeWidget: null,//LayerSwipe Object    :   自定义的 卷帘 部件

            _mainMapLayers: [],//Array of layer ids (Layer IDs)           :   保存进入卷帘之前主地图中可见的图层(visible : ture)
            _basemapLayers: [],//Array of layer ids (Layer IDs)       :   添加到主地图中的卷帘 basemap图层
            _swipemapLayers: [],//Array of layer ids (Layer IDs)      :   添加到主地图中的卷帘 swipemap图层

            configData: null,//JS Object       :    多时相 配置 对象
            isActive: false,
            constructor: function (map) {
                this._mainMap = map;

                var configManager = new ConfigManager(function (data) {
                }, function (error) {
                });
                configManager.loadConfigWhitCallback("widgets/swipe/config.json", lang.hitch(this, this._configLoadedHandler), lang.hitch(this, this._configLoadErrorHandler));

                //Add baseMapLayerChanged event listener.
                topic.subscribe("baseMapLayerChanged", lang.hitch(this, function (basemap) {
                    this._mainMapLayers = [];
                    for (var i = 0; i < basemap.layers.length; i++) {
                        this._mainMapLayers.push(basemap.layers[i].id);
                    }

                }));

                on(dom.byId("swipeVertical"), "click", lang.hitch(this, this.setVertical));
                on(dom.byId("swipeHorizontal"), "click", lang.hitch(this, this.setHorizontal));
                on(dom.byId("swipeScope"), "click", lang.hitch(this, this.setScope));
                on(dom.byId("swipeInvert"), "click", lang.hitch(this, this.setInvertPlacement));
            },
            _configLoadedHandler: function (data) {
                this.configData = data;
                this._parseLayersIds();
                this._loadSwipeLayer();
            },
            _configLoadErrorHandler: function (error) {
                console.error("SwipeTool", "Config loading error.", error.toString());
            },
            _parseLayersIds: function () {
                //All layers.
                this._mainMapLayers = this._mainMapLayers.concat(this._mainMap.layerIds);
                //All graphicLayers.
                this._mainMapLayers = this._mainMapLayers.concat(this._mainMap.graphicsLayerIds);

                //Swipe basemap layers.
                for (var i = 0; i < this.configData.basemap.layers.length; i++) {
                    this._basemapLayers.push(this.configData.basemap.layers[i].id);
                }
                //Swipe swipemap layers.
                for (var j = 0; j < this.configData.swipemap.layers.length; j++) {
                    this._swipemapLayers.push(this.configData.swipemap.layers[j].id);
                }
            },
            //激活卷帘工具
            activate: function () {
                this.toggleDomEffect(true);
                this.toggleLayers(true);//Change to swipe state.
                this._swipeWidget && !this._swipeWidget.get("enabled") && this._swipeWidget.set("enabled", true);
                this.isActive = true;
            },
            //释放卷帘工具
            deactivate: function () {
                this.toggleDomEffect(false);
                this.toggleLayers(false);//Change to normal state.
                this._swipeWidget && this._swipeWidget.get("enabled") && this._swipeWidget.set("enabled", false);
                this.isActive = false;
            },
            _loadSwipeLayer: function () {
                var layers = [];//AGS Layer Object Array.

                //Swipe basemap layers.
                for (var i = 0; i < this.configData.basemap.layers.length; i++) {
                    var conLayer = this.configData.basemap.layers[i];
                    conLayer.visible = true;//Set true.
                    var layer = MapManager.createSingleLayer(conLayer);
                    layers.push(layer);
                }
                //Swipe swipemap layers.
                for (var j = 0; j < this.configData.swipemap.layers.length; j++) {
                    var conLayer = this.configData.swipemap.layers[j];
                    conLayer.visible = true;//Set true.
                    var layer = MapManager.createSingleLayer(conLayer);
                    layers.push(layer);
                }

                //Fired onece.
                this.handler_temp = this._mainMap.on("layers-add-result", lang.hitch(this, function () {
                    this.handler_temp.remove();
                    this._initLayerSwipe();
                    this.activate();
                }));

                this._mainMap.addLayers(layers);
            },

            _initLayerSwipe: function () {
                var swipeAGSLayers = [];//AGS layer object array.
                for (var i = 0; i < this._swipemapLayers.length; i++) {
                    var layer = this._mainMap.getLayer(this._swipemapLayers[i]);
                    if (layer)
                        swipeAGSLayers.push(layer);
                }

                if (!this._swipeWidget) {
                    this._swipeWidget = new LayerSwipe({
                        type: "vertical",
                        map: this._mainMap,
                        layers: swipeAGSLayers
                    }, "LayerSwipe");
                    this._swipeWidget.startup();
                }
            },

            /**
             *
             * @param flag              true:Swipemap | false:normal
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

                //  base swipe layers.
                for (var j = 0; j < this._basemapLayers.length; j++) {
                    var layer = this._mainMap.getLayer(this._basemapLayers[j]);
                    if (layer)
                        flag ? layer.show() : layer.hide();
                }

                //  swipe layers.
                for (var k = 0; k < this._swipemapLayers.length; k++) {
                    var layer = this._mainMap.getLayer(this._swipemapLayers[k]);
                    if (layer)
                        flag ? layer.show() : layer.hide();
                }

                // 主地图切换 部件 隐藏
                flag ? query(".switcher").style("display", "none") : dom.byId("switcher").style.display = "block";
            },
            //  垂直
            setVertical: function () {
                this._swipeWidget && this._swipeWidget.set("type", "vertical");
            },
            //  水平
            setHorizontal: function () {
                this._swipeWidget && this._swipeWidget.set("type", "horizontal");
            },
            //  放大镜
            setScope: function () {
                this._swipeWidget && this._swipeWidget.set("type", "scope");
            },
            //  位置互换
            setInvertPlacement: function () {
                this._swipeWidget && this._swipeWidget.set("invertPlacement", !this._swipeWidget.get("invertPlacement"));
            },
            timeoutHandler: null,
            swipeDomEnter: null,
            swipeDomLeave: null,
            swipeMenuDomEnter: null,
            swipeMenuDomLeave: null,
            /**
             * 当flag==true，表示处于卷帘状态，此时给swipeDom添加hover效果；
             * 当flag==false，表示处于非卷帘状态，此时移除swipeDOM的hover效果
             *
             * @param flag          true:Swipe state    |   false: normal state
             */
            toggleDomEffect: function (flag) {
                var swipeDom = dom.byId("swipe"), swipeMenuDom = dom.byId("swipeMenu");
                domStyle.set("swipeMenu", "display", "none");
                //Clear all event handlers.
                if (this.timeoutHandler)
                    clearTimeout(this.timeoutHandler);
                if (this.swipeDomEnter)
                    this.swipeDomEnter.remove();
                if (this.swipeDomLeave)
                    this.swipeDomLeave.remove();
                if (this.swipeMenuDomEnter)
                    this.swipeMenuDomEnter.remove();
                if (this.swipeMenuDomLeave)
                    this.swipeMenuDomLeave.remove();

                if (flag) {
                    domStyle.set("swipeMenu", "display", "block");
                    /* Event register: Map switch. */
                    this.swipeDomEnter = on(swipeDom, mouse.enter, lang.hitch(this, function (event) {
                        if (this.timeoutHandler)
                            clearTimeout(this.timeoutHandler);
                        domStyle.set("swipeMenu", "display", "block");
                    }));

                    this.swipeDomLeave = on(swipeDom, mouse.leave, lang.hitch(this, function (event) {
                        this.timeoutHandler = setTimeout(function (param) {
                            if (this.timeoutHandler)
                                clearTimeout(this.timeoutHandler);
                            domStyle.set("swipeMenu", "display", "none");
                        }, 500);
                    }));

                    this.swipeMenuDomEnter = on(swipeMenuDom, mouse.enter, lang.hitch(this, function (event) {
                        if (this.timeoutHandler)
                            clearTimeout(this.timeoutHandler);
                        domStyle.set("swipeMenu", "display", "block");
                    }));

                    this.swipeMenuDomLeave = on(swipeMenuDom, mouse.leave, lang.hitch(this, function (event) {
                        this.timeoutHandler = setTimeout(function (param) {
                            if (this.timeoutHandler)
                                clearTimeout(this.timeoutHandler);
                            domStyle.set("swipeMenu", "display", "none");
                        }, 500);
                    }));
                }
            }
        });

        return swipeClass;
    });