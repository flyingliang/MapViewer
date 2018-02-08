/**
 * Created by Esri on 2015/4/13.
 */

define(["dojo/dom",
        "dojo/on",
        "dojo/_base/declare",
        "dojo/json",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/number",

        "esri/map",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/ArcGISImageServiceLayer",
        "esri/layers/FeatureLayer",
        "esri/layers/WMSLayer",
        "esri/layers/WMTSLayer",
        "esri/layers/GraphicsLayer",
        "esri/InfoTemplate",
        "esri/geometry/Extent",

        "util/commonUtil",
        "viewer/AppEvent",
        "coms/InfoPopup",
        "widgets/onemap/TianDiTuLayer",
        "widgets/onemap/AgsWmtsLayer",

        "dojo/domReady!"
    ],
    function (dom, on, declare, JSON, lang, domConstruct, number,
              Map, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, FeatureLayer, WMSLayer, WMTSLayer, GraphicsLayer, InfoTemplate, Extent,
              Util, AppEvent, InfoPopup, TianDiTuLayer, AgsWmtsLayer) {

        var instance;
        //
        var map = null;
        //
        var cacheRemoveLayers = [];

        var moudle = declare(null, {
            //Config variable values.
            mapConfig: null,//Config Object  :   The config of map.
            initLayersConfig: null,//Config Array    :   Layers to be initialized. Reference shared with this.mapConfig
            restLayersConfig: null,//Config Array    :   The Rest of initial layers. Reference shared with this.mapConfig
            initLayersAgsobj: null,//ArcGIS Layer object  :   Initial layers Array.
            _customLods: null,//LOD object  :   LODs for tiled service.
            _loadCount: null,//Number   :   The count of service had been loaded.
            layerCount: null,//Number   :   The total count of service in map config.
            buildMapHander: null,//Function handler reference.

            /**
             *
             * @param mapDom        The Dom node of map container.
             * @param mapConfig     The config object of map.
             * @param buildMap      Function Handler.
             */
            constructor: function (mapDom, mapConfig, buildMap) {
                if (!mapDom || !mapConfig || !mapConfig.basemaps) {
                    alert("Config Error:    Main config is invalidated !");
                    return;
                }
                this.mapDom = mapDom;//Dom Node :   The dom node for map.
                this._convertWKID(mapConfig);//WKID Convert.
                this.mapConfig = lang.clone(mapConfig);//Config object  :   Config for map.
                this._parseLayerConfig(this.mapConfig);

                this.buildMapHander = buildMap;
                this.initLayersAgsobj = [];
                this._customLods = [];
                this._loadCount = 0;

                for (var i = 0; i < this.initLayersConfig.length; i++) {
                    this._loadLayer(this.initLayersConfig[i]);
                }

                this.layerCount = this.getLayerCount();
                this._addListeners();
            },

            /**
             * 解析 mapConfig 方便调用
             *  1.将 初始化的图层填充到this.initLayersConfig数组；
             *  2.将 剩下的图层填充到this.restLayersConfig数组；
             *  说明：没有clone，只是索引。
             * @param mapConfig
             * @private
             */
            _parseLayerConfig: function (mapConfig) {
                //初始化
                this.initLayersConfig = [];
                this.restLayersConfig = [];

                var tmpBasemaps = mapConfig.basemaps;
                for (var i = 0; i < tmpBasemaps.length; i++) {
                    var tmpBasemap = tmpBasemaps[i];
                    //根据 basemap 属性 visible 判断，true：初始化；false：余下的
                    if (tmpBasemap.visible) {//Initial basemap
                        for (var j = 0; j < tmpBasemap.layers.length; j++) {
                            this.initLayersConfig.push(tmpBasemap.layers[j]);
                        }
                    } else {
                        for (var k = 0; k < tmpBasemap.layers.length; k++) {
                            this.restLayersConfig.push(tmpBasemap.layers[k]);
                        }
                    }
                }
            },
            /**
             * Load layer
             * @param layer
             * @private
             */
            _loadLayer: function (layer) {
                //
                var layer = moudle.createSingleLayer(layer);
                if (layer) {
                    layer.on("load", lang.hitch(this, function (event) {
                            var loadedLayer = event.layer;
                            //AppEvent.dispatchAppEvent(AppEvent.LAYER_LOADED, loadedLayer);
                            console.log("Initial added Layer : " + loadedLayer.url);
                            if (loadedLayer instanceof ArcGISTiledMapServiceLayer || loadedLayer instanceof TianDiTuLayer) {
                                this._customLods = this._arrayUnique(this._customLods.concat(event.layer.tileInfo.lods));
                            }
                            this._loadCount++;

                            if (this._loadCount === this.initLayersConfig.length) {//判断初始basemap的图层是否加载完
                                this.initMap();
                            }
                        }
                    ));
                    this.initLayersAgsobj.push(layer);
                }
            },

            /**
             * 初始化地图
             */
            initMap: function initMap() {

                //Create a customized Popup object.
                var popup = new InfoPopup({
                    offsetX: 10,
                    offsetY: 10,
                    zoomFactor: 2
                }, domConstruct.create("div"));

                //Map object options.
                var options = {
                    logo: this.mapConfig.logo,
                    sliderStyle: "large",
                    infoWindow: popup,
                    extent: new Extent(this.mapConfig.initExtent)
                };

                //For tiled layer LODs.
                if (this._customLods && this._customLods.length) {
                    options.lods = this._customLods;
                }

                //For sliderZoom label
                var labels = this._getSliderZoomLabel();
                if (labels && labels.length)
                   // options.sliderLabels = labels;

                //Create a Map object.
                map = undefined;
                map = new Map(this.mapDom, options);
                var mapLoadedHandler = map.on("layers-add-result", lang.hitch(this, function () {
                    //All layers had been added to the map.
                    mapLoadedHandler.remove();
                    this.buildMapHander(map);
                }));
                map.addLayers(this.initLayersAgsobj);

               /* map.on("extent-change", function (evt) {
                    //console.log(evt.extent);
                    console.log("Extent    :   ", evt.extent.xmin + "," + evt.extent.ymin + "," + evt.extent.xmax + "," + evt.extent.ymax);
                });*/
            },
            createGraphicsLayer: function (layerId) {
                //
                var layer = map.getLayer(layerId);
                if (!layer) {
                    //
                    layer = new GraphicsLayer({id: layerId});
                    map.addLayer(layer);
                    cacheRemoveLayers.push(layer);
                }
                return layer;
            },

            removeGraphicsLayer: function (layerId) {
                //
                if (layerId) {

                    var layer = map.getLayer(layerId);
                    if (layer) {
                        map.removeLayer(layer);
                        removeElement(layer.id);
                    }
                }
            },
            addLayerToCache: function (layer) {
                cacheRemoveLayers.push(layer);
            },

            /**
             * 清除其他模块动态加入到Map中的Graphicslayer
             * */
            clearCacheLayers: function () {
                var layerCount = cacheRemoveLayers.length;
                for (var i = 0; i < layerCount; i++) {
                    //
                    var layer = cacheRemoveLayers[i];
                    map.removeLayer(layer);
                }
                //
                cacheRemoveLayers = [];
            },
            showSelectBaseMapLayer: function (basemap) {
                var selectedLayerIds = [], selectedLayerIdsClone;
                for (var j = 0; j < basemap.layers.length; j++) {
                    var configLayer = basemap.layers[j];
                    selectedLayerIds.push(configLayer.id);
                }
                selectedLayerIdsClone = lang.clone(selectedLayerIds);

                //0.线hide 所有
                //1.先判断 map object 中有没有 该图层，通过id，
                //2.没有就create、show，有就直接show。
                var layerIds = map.layerIds;
                for (var i = 0; i < layerIds.length; i++) {
                    var layerId = layerIds[i];

                    var layer = map.getLayer(layerId);
                    if (layer instanceof GraphicsLayer) {
                        continue;
                    }
                    layer.hide();

                    if (this.isInBasemapConfig(layerId)) {//只是属于配置的图层

                        //如果已经被加载到map，只需要show()
                        if (selectedLayerIdsClone.length && Util.isInArray(layerId, selectedLayerIds, false)) {
                            selectedLayerIdsClone.remove(layerId);
                            layer.show();
                        }
                    }
                }

                if (!selectedLayerIdsClone || !selectedLayerIdsClone.length) {
                    return;
                }
                var layerToBeAdded = [];
                for (var k = 0; k < basemap.layers.length; k++) {
                    if (Util.isInArray(basemap.layers[k].id, selectedLayerIdsClone, false)) {
                        basemap.layers[k].visible = true;//Map Switch option.
                        var layerAgsobj = moudle.createSingleLayer(lang.mixin(basemap.layers[k],{'wkid':map.spatialReference.wkid}));
                        layerToBeAdded.push(layerAgsobj);
                        console.log("Newlly added Layer :", layerAgsobj.url);
                    }
                }
                map.addLayers(layerToBeAdded);
            },
            /**
             * 判断 某个 图层 id（Ags layer object） 是否属于基本配置图层
             * @param layerId                          * @param layer
             * @returns {boolean}
             */
            isInBasemapConfig: function (layerId) {
                var flag = false;
                outer:for (var i = 0; i < this.mapConfig.basemaps.length; i++) {
                    var layers = this.mapConfig.basemaps[i].layers;
                    for (var j = 0; j < layers.length; j++) {
                        if (layers[j].id === layerId) {
                            flag = true;
                            break outer;
                        }
                    }
                }
                return flag;
            },
            /**
             * Get an Array of all layers from config.
             * @returns {Array}
             */
            getLayersArr: function () {
                var basemaps = this.mapConfig.basemaps;
                var layersArr = [];
                for (var i = 0; i < basemaps.length; i++) {
                    var layers = basemaps[i].layers;
                    for (var j = 0; j < layers.length; j++) {
                        var layer = layers[j];
                        layersArr.push(layer);
                    }
                }
                return layersArr;
            },
            /**
             * WKID 转换
             * @param mapConfig
             * @private
             */
            _convertWKID: function (mapConfig) {
                var wkid = mapConfig.initExtent.spatialReference.wkid;
                if (wkid === 900913) {
                    wkid = 3857;
                } else if (wkid === 4490) {
                    wkid = 4326;
                }
                mapConfig.initExtent.spatialReference.wkid = wkid;
            },

            /**
             * If exists a tiled Service in config.
             * @returns {boolean}
             * @private
             */
            _hasTiledLayer: function () {
                var flag = false;
                var basemaps = this.mapConfig.basemaps;

                for (var i = 0; i < basemaps.length; i++) {
                    var layers = basemaps[i].layers;
                    for (var j = 0; j < layers.length; j++) {
                        var type = layers[j].type;
                        if (type && (type === "tiled" || type === "wmtsTDT")) {
                            flag = true;
                            break;
                        }
                    }
                }
                return flag;
            }
            ,
            getLayerCount: function () {
                return this.getLayersArr().length;
            },
            _arrayUnique: function (array) {
                var a = array.concat();
                for (var i = 0; i < a.length; ++i) {
                    for (var j = i + 1; j < a.length; ++j) {
                        if (a[i].level === a[j].level)
                            a.splice(j--, 1);
                    }
                }
                return a;
            },
            /**
             * 添加监听
             * @private
             */
            _addListeners: function () {
                AppEvent.addAppEventListener(AppEvent.REMOVE_LAYER, function (layerid) {
                    moudle.removeLayer(layerid);
                    AppEvent.dispatchAppEvent(AppEvent.LAYER_REMOVED, {});
                    //console.log("layer removed")
                });

                AppEvent.addAppEventListener(AppEvent.ADD_LAYER, function (data) {
                    //
                    var layer = moudle.createSingleLayer(data.layer);
                    if (layer) {
                        layer.on("load", function (event) {
                            var layer = event.layer;
                            map.setExtent(layer.fullExtent);
                        });
                        map.addLayer(layer);
                        $(data.domNode).html("已添加");
                    }
                });
            },
            _getSliderZoomLabel: function () {
                var labels = [];
                if (!this._customLods || !this._customLods.length)
                    return labels;

                var lods = this._customLods;
                for (var i = 0, il = lods.length; i < il; i++) {
                    if (i % 2) {
                        labels.push(number.format(lods[i].level));
                    }
                }
                return labels;
            }

        });

        moudle.getInstance = function () {
            //
            if (instance === null) {
                //
                instance = new moudle();
            }
            //
            return moudle;
        };

        function removeElement(layerId) {
            //
            var layerIndex = 0;
            for (var i = 0; i < cacheRemoveLayers.length; i++) {
                //
                var layer = cacheRemoveLayers[i];
                if (layerId === layer.id) {
                    //
                    layerIndex = i;
                    break;
                }
            }
            //
            cacheRemoveLayers.splice(layerIndex, 1);
        }


        /**
         * Static functions
         *  Create a map Layer object.
         * @param layer     Config Object
         * @returns {*}
         */
        moudle.createSingleLayer = function (layer) {
            if (!layer)
                return;
            var url;
            if (layer.url) {
                url = layer.url;
            } else {
                alert("Configuration File Error: CreateSingleLayer failed, Attribute url is null!");
                return;
            }

            var options = {};
            //Common Attributes
            lang.mixin(options,layer);
            options.id = layer.id;
            layer.label && (options.label = layer.label);
            typeof(layer.visible) === "boolean" && (options.visible = layer.visible);
            layer.opacity && (options.opacity = layer.opacity);


            var _type = layer.type;
            var _singleLayer = null;

            try {
                switch (_type) {

                    case "tiled":
                        options.displayLevels = layer.displayLevels;
                        _singleLayer = new ArcGISTiledMapServiceLayer(url, options);
                        break;
                    case "dynamic":
                        //delete options.url;
                        //delete options.label;
                        //delete options.type;
                        //delete options.visible;
                        _singleLayer = new ArcGISDynamicMapServiceLayer(url, options);
                        break;
                    case "image":
                        _singleLayer = new ArcGISImageServiceLayer(url, options);
                        break;
                    case "feature":
                        _singleLayer = new FeatureLayer(url, options);
                        break;
                    case "wms":
                        _singleLayer = new WMSLayer(url, options);
                        break;
                    case "wmts":
                        _singleLayer = new WMTSLayer(url, options);
                        break;
                    case "wmtsTDT":
                        options.displayLevels = layer.displayLevels;
                        options.style = layer.style;
                        options.identifier = layer.identifier;
                        options.tileMatrixSet = layer.tileMatrixSet;
                        options.format = layer.format;
                        _singleLayer = new TianDiTuLayer(url, options);
                        break;
                    case "agswmts":
                        options.displayLevels = layer.displayLevels;
                        options.style = layer.style;
                        options.identifier = layer.identifier;
                        options.tileMatrixSet = layer.tileMatrixSet;
                        options.format = layer.format;
                        _singleLayer = new AgsWmtsLayer(url, options);
                        break;
                    default :
                        _singleLayer = new ArcGISDynamicMapServiceLayer(url, options);
                        break;
                }
            } catch (e) {
                console.error("Create Layer Failed! ", e);
                _singleLayer = undefined;
            }

            return _singleLayer;
        };

        /**
         * Static function
         *  Resize map.
         * @param map   A map to be resized.
         */
        moudle.resize = function (map) {
            if(map){
                map.resize();
                map.reposition();
            }else{
                console.warn("MapManager.resize ","Map resize failed!","Map Object is null.")
            }
        };

        /**
         * Static functions
         *  Remove a layer from map.
         * @param layerId
         */
        moudle.removeLayer = function (layerId) {
            if (layerId) {
                var layer = map.getLayer(layerId);
                if (layer) {
                    map.removeLayer(layer);
                }
            }
        };

        return moudle;

    });