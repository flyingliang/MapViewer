/**
 * Created by Esri on 2015/3/20.
 */

var proxyUrl = "";
//
var multiTool = null;
var tipsData = null;
var queryData = null;
var queryFields = [];
var mainMap = null;
var zoomLevel = 15;
//
////example : http://serverName:port/
var oneMapServer = "";

var sysRestBaseUrl = "";
//
/**系统事件对象*/
var appEvent = null;
//
/**地图管理器*/
var mapManager = null;
/**符号管理器*/
var symbolManager = null;
/*数据管理器*/
var dataManager = null;
/**系统配置管理器*/
var configManager = null;
//
var symbolManager = null;
/***/
var ARCGIS_TOKEN_KEY = "arcgis_token";
/**绘图工具*/
var drawTool = null;
//
//
var backPageUrl = "";
/**地图导航工具*/
var navigateTool = null;
/**
 * 用户登录信息
 * data format
 * {
     "username": "门户管理员",
      "ifmanager": "1",
      "iflogin": "login"
 *}
 * */
var userInfo = {};
//
/**用于保存应用程序中产生的中间结果数据*/
var extraData = null;
var extraConfig = null;
//
//
var wkid = null;
//需要删除的图层, 当有新页面加载时,会从地图中删除该集合中的图层
//element type : Layer
var cacheRemoveLayers = [];

var appData = {};
//
var appContext = null;
var queryInfos = [];
//
var loginService = "../main/*.action?";
//
require([
        /*Dojo*/
        "dojo/dom",
        "dojo/on",
        "dojo/parser",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/request/xhr",
        "dojo/topic",
        "dojo/json",
        "dojo/_base/lang",
        "dojo/_base/event",
        "dojo/_base/array",
        "dojo/cookie",
        "dojo/mouse",
        "dojo/sniff",
        "dijit/TooltipDialog",
        "dijit/popup",
        "dijit/registry",

        /*Esri*/
        "esri/map",
        "esri/config",
        "esri/toolbars/navigation",
        "esri/toolbars/draw",
        "esri/dijit/Scalebar",
        "esri/dijit/OverviewMap",
        "esri/dijit/Attribution",
        "esri/geometry/Extent",
        "esri/SpatialReference",
        "esri/urlUtils",
        "esri/geometry/Polyline",
        "esri/graphic",
        "esri/symbols/TextSymbol",
        "esri/symbols/Font",
        "esri/Color",
        "esri/toolbars/edit",
        "esri/layers/GraphicsLayer",
        "esri/layers/FeatureLayer",


        /*Customize*/
        "viewer/AppEvent",
        "viewer/SymbolManager",
        "viewer/MapManager",
        "viewer/ConfigManager",
        "viewer/app",
        "viewer/topquery/TopQuery",
        "viewer/topquery/TopBufferQuery",
        "viewer/topquery/TopNetworkQuery",

        "widgets/measure/PolylineTool",
        "widgets/measure/PolygonTool",
        "widgets/swipe/coms/SwipeTool",
        "widgets/multi/MultidateTool",
        "widgets/marker/MarkerTool",
        "widgets/basemap/MapSwitcher",
        "widgets/region/RegionTool",

        /*None vars*/
        "dijit/form/HorizontalSlider",
        "dijit/form/HorizontalRule",
        "dijit/form/HorizontalRuleLabels",
        "dijit/Dialog",
        "dojo/domReady!"],
    function (/*Dojo*/
              dom,
              on,
              parser,
              domConstruct,
              domStyle,
              xhr,
              topic,
              JSON,
              lang,
              Event,
              Array,
              cookie,
              mouse,
              sniff,
              TooltipDialog,
              dijitPopup,
              registry,
              /*Esri*/
              Map,
              esriConfig,
              Navigation,
              Draw,
              Scalebar,
              OverviewMap,
              Attribution,
              Extent,
              SpatialReference,
              urlUtils,
              Polyline,
              Graphic,
              TextSymbol,
              Font,
              Color,
              Edit,
              GraphicsLayer,
              FeatureLayer,
              /*Customize*/
              AppEvent,
              SymbolManager,
              MapManager,
              ConfigManager,
              app,
              TopQuery,
              TopBufferQuery,
              TopNetworkQuery,
              PolylineTool,
              PolygonTool,
              SwipeTool,
              MultidateTool,
              MarkerTool,
              MapSwitcher,
              RegionTool) {

        esriConfig.defaults.io.corsDetection=false;
        esriConfig.defaults.io.proxyUrl = "../proxy2.jsp";
        esriConfig.defaults.io.alwaysUseProxy = false;

        parser.parse();
        window.appEvent = AppEvent;
        var map;

        /* Layout */
        if (sniff("ie") < 9) {
            $("#full").hide();
        }
        var expandWidth = "380px";
        var hideWidth = "-3px";
        $("#slider").addClass("slider-open");
        $("#slider").click(function () {
            mainMap.resize();
            mainMap.reposition();
            topic.publish("mainLayoutChange","");

            if ($("#left-container").css("width") == expandWidth) {
                $("#left-container").css("width", hideWidth);
                $("#slider").removeClass("slider-open");
                $("#mapCopyright").css("display","none");
                $("#slider").addClass("slider-close");
                domStyle.set(dom.byId("right-container"), "left", hideWidth);
                domStyle.set(dom.byId("right-container"), "right", hideWidth);
            } else {
                $("#left-container").css("width", expandWidth);
                $("#slider").removeClass("slider-close");
                $("#mapCopyright").css("display","block");
                $("#slider").addClass("slider-open");
                domStyle.set(dom.byId("right-container"), "left", expandWidth);
            }
            if (multiTool) {

            }

            //多时相
            if (app.isMultiState) {
                reSetSplitContainer();
                multiTool.resize();
            } else {
                //普通
                domStyle.set(dom.byId("map1"), "width", "100%");
                domStyle.set(dom.byId("split"), "width", "0");
                domStyle.set(dom.byId("map2"), "width", "0");
            }
        });

        function reSetSplitContainer() {
            domStyle.set(dom.byId("map1"), "width", "50%");
            domStyle.set(dom.byId("split"), "width", "0.8%");
            domStyle.set(dom.byId("map2"), "width", "49.2%");
        }

        /***** Tooltips initialization. *****/
        $.get("tips.json", function (data) {
            /***** Fix the bug of typeahead for default highlight. *****/
            $.fn.typeahead.Constructor.prototype.render = function (items) {
                var that = this;
                items = $(items).map(function (i, item) {
                    i = $(that.options.item).attr('data-value', item);
                    i.find('a').html(that.highlighter(item));
                    return i[0];
                });
                this.$menu.html(items);
                return this;
            };
            $.fn.typeahead.Constructor.prototype.select = function (evt) {
                var val = this.$menu.find('.active').attr('data-value');
                if (val) {
                    this.$element
                        .val(this.updater(val))
                        .change();
                } else {
                    lang.trim(dom.byId('product_search').value) && executePoiQuery();
                }
                return this.hide()
            };

            /*Initial typeahead*/
            $("#product_search").typeahead({source: data, items: 12});
            $("#drive-start").typeahead({source: data, items: 12});
            $("#drive-end").typeahead({source: data, items: 12});

            tipsData = data;
        }, "json");


        /* Collection of toolbars */
        var toolItems = [];
        var markerTool;
        var editTool;
        var lineTool, polygonTool, swipeTool;

        /* Load Main configuration file. */
        var isMapLoad = false;
        var configMgr = new ConfigManager(function (configData) {
            //Added to global vars.
            app.config = configData;
            /***************/
            /* Map object initialize */
            mapManager = window.mapManager = new MapManager(dom.byId("map1"), configData.map, buildMap);
        });

        //Load main configration file.
        configMgr.loadConfig("config.json");

        function buildMap(map) {
            window.mainMap = map;
            isMapLoad = true;
            map.addLayer(editGraLayer);

            var popup = map.infoWindow;
            popup.highlight = false;
            popup.titleInBody = false;
            popup.domNode.className += " light";
            popup.startup();

            var correctionLayer = new GraphicsLayer({id: "correctionLayer"});

            var topBufferQuery = new TopBufferQuery(map);
            topBufferQuery.setAppEvent(AppEvent);
            popup.bufferHandler = function (param) {
                //执行周边查询
                AppEvent.dispatchAppEvent(AppEvent.SHOW_BUSY_INDICATOR, "showBusyIndicator");
                topBufferQuery.executeBufferQuery(param);
            };

            var topNetworkQuery = new TopNetworkQuery(map);
            topNetworkQuery.setAppEvent(AppEvent);

            popup.driveHandler = function (param) {
                //执行驾车出行
                AppEvent.dispatchAppEvent(AppEvent.SHOW_BUSY_INDICATOR, "showBusyIndicator");
                topNetworkQuery.executeNetworkAnalyst(param);
            };


            markerTool = new MarkerTool(map);
            toolItems.push(markerTool);
            markerTool.title = "标记";

            var scalebar = new Scalebar({
                map: map,
                // "dual" displays both miles and kilmometers
                // "english" is the default, which displays miles
                // use "metric" for kilometers
                scalebarUnit: "dual"
            });
            /***************/


            //Set global vars function.
            setGlobalDataValue();
            //deactivate the toolbar when you click outside a graphic
            map.on("click", function (evt) {
                editTool.deactivate();
            });


            //Create region selection box.
            var region = new RegionTool(dom.byId("region"));
            region.setMap(map);
            region.setConfig(configMgr);
            region.setWkid(map.spatialReference.wkid);
            /**当行政区划导航范围加载完成后检测是否有分享信息，有则显示*/
            region.regionNavigateExtentChanged = function (data) {
                /*如果URL中包含有分享信息,则显示当前位置*/
                var markerInfo = app.urlParser.getParameter("marker");
                if (markerInfo) {
                    markerTool.setMapState(isMapLoad);
                    markerTool.showMarker(markerInfo);
                }
            };

            //加载左侧面板
            window.open("widgets/search/query.html", "widgetContainer");

            /*Create overview box*/
            var overrideMap = new OverviewMap({
                baseLayer: MapManager.createSingleLayer(app.config.map.basemaps[0].layers[0]),
                map: map,
                visible: false,
                attachTo: "bottom-right",
                width: 300, height: 200
            });
            overrideMap.startup();


           /* var attribution = new Attribution({
                map: map
            }, domConstruct.create("div",{innerHTML:"© 2015 OneMap - Data © 天地图"}));
*/
            editTool = new Edit(map);

            editTool.on("graphic-move-stop", function (event) {
                //
                var gra = event.graphic;
                AppEvent.dispatchAppEvent("graphicEditEnd", gra);
            });


            /* PolylineTool */
            lineTool = new PolylineTool(map);
            lineTool.changeItemStyle = function () {

                changeToolBarItemStyleToNormal(dom.byId("distance"), toolBarConfig.distance);
                lineTool.isActive = false;
            };

            /* PolygonTool */
            polygonTool = new PolygonTool(map);
            polygonTool.changeItemStyle = function () {

                changeToolBarItemStyleToNormal(dom.byId("area"), toolBarConfig.area);
                polygonTool.isActive = false;
            };

            /* Added to toolbars collection. */
            toolItems.push(lineTool);
            toolItems.push(polygonTool);

            //以下代码修复在Chrome/Safari浏览器中,当鼠标移入左侧面板后,地图平移事件不会取消的问题.
            if (sniff("chrome") || sniff("safari")) {
                //
                //
                //alert("you are use safari browser...");
                map.on("mouse-down", function (event) {
                    //
                    isMapMouseDown = true;
                });
                //
                on(dom.byId("left-container"), mouse.leave, function (event) {
                    //
                    if (mapMouseDownHandler) {
                        //
                        mapMouseDownHandler.remove();
                    }
                    if (isMapMouseDown) {
                        map.isPan = false;
                        map.disablePan();
                        //
                        mapMouseDownHandler = map.on("mouse-down", function (event) {
                            //
                            map.isPan = true;
                            map.enablePan();
                            isMapMouseDown = true;
                        });
                    }
                });
                //
                map.on("mouse-up", function (event) {
                    //
                    isMapMouseDown = false;
                });
            }
        }

        /**
         * 设置全局变量
         * @param configData
         */
        var setGlobalDataValue = function () {
            var configData = app.config;
            app.info = "JavaScript Map";
            window.appContext = app;

            //window.mainMap = map;//Global map object.
            window.geometryServiceUrl = configData.geometryService;//Global geometry service url.
            window.configManager = configMgr;//Global config manager.
            if (configData.oneMapServer) {//Global OneMapServer url.
                window.oneMapServer = configData.oneMapServer;
            } else {
                window.oneMapServer = getServiceUrl();
            }
            window.sysRestBaseUrl = oneMapServer + "/SysRestServices/rest";//Global SysRestServices url.
            if (configData.proxyUrl) {//Global proxy file.
                window.proxyUrl = configData.proxyUrl + "?";
            } else {
                window.proxyUrl = "../proxy2.jsp?";
            }
            window.drawTool = new Draw(map, {//Global DrawTolls.
                tooltipOffset: 20,
                drawTime: 90
            });
            window.drawTool.on("draw-end", showResults);
            window.symbolManager = new SymbolManager();//Global SymbolManager.

            //创建地图切换对象
            var basemaps = configData.map.basemaps;
            var mapSwitcher = new MapSwitcher(basemaps, dom.byId("switcher"), dom.byId("switcher-down"));
            mapSwitcher.addBaseMapLayerChanged(function (basemap) {
                $("#switcher-down").hide();
                mapManager.showSelectBaseMapLayer(basemap);//Switch basemap.
                mapSwitcher.setCurrentImage(basemap);//Change switch image.
            });
            loadLoginInfo();//Check user login infomation.
        };

        /**
         * 检测用户是否登录
         */
        function loadLoginInfo() {
            xhr(loginService, {
                method: "POST",
                handleAs: "json",
                data: {
                    command: "getLoginUserInfo",
                    commandId: "PortalLoginCommand"
                }
            }).then(function (data) {
                /**
                 * data format
                 * {
                    "username": "门户管理员",
                    "ifmanager": "1",
                    "iflogin": "login"
                 }
                 * */
                if (data.username) {
                    appEvent.dispatchAppEvent(appEvent.USER_LOGIN, data);
                }
            }, function (error) {
                //appEvent.dispatchAppEvent(appEvent.USER_LOGIN_ERROR,error);
            });
        }

        /* Event register: Window resize Event. */
        on(window, 'resize', function (event) {
            AppEvent.dispatchAppEvent('windowResized', event);

            //dom.byId('innerContentPanel').css('height',)
        });

        /* Event register: Login. */
        on(dom.byId("lbl-login"), "click", function (event) {
            AppEvent.dispatchAppEvent(AppEvent.SHOW_SMALL_DIALOG, {url: "widgets/login/login.html"});
        });
        /* Event register: Menu(资源中心). */
        on(dom.byId("resource"), "click", function (event) {
            skipToPortalPage("resource");
        });
        /* Event register: Menu(专题应用). */
        on(dom.byId("app"), "click", function (event) {
            skipToPortalPage("application");
        });
        /* Event register: Menu(地图API). */
        on(dom.byId("api"), "click", function (event) {
            skipToPortalPage("help");
        });
        /* Event register: Footer(意见反馈). */
        on(dom.byId("suggest"), "click", function (event) {
            skipToPortalPage("callbacks");
        });
        /* Event register: Footer(帮助). */
        on(dom.byId("help"), "click", function (event) {
            AppEvent.dispatchAppEvent(AppEvent.SHOW_TOASTER, {info: "帮助文档正在完善中..."});
        });

        on(dom.byId("distance"), "click", function (event) {
            if (!lineTool.isActive) {
                changeToolBarItemStyle(this, toolBarConfig.distance);
                releaseOtherToolItems();
                lineTool.activate();
            } else {
                ///
                changeToolBarItemStyleToNormal(this, toolBarConfig.distance);
                lineTool.deactivate();
            }
        });

        on(dom.byId("area"), "click", function (event) {

            if (!polygonTool.isActive) {
                //
                releaseOtherToolItems();
                changeToolBarItemStyle(this, toolBarConfig.area);
                polygonTool.activate();
            } else {
                //
                changeToolBarItemStyleToNormal(this, toolBarConfig.area);
                polygonTool.deactivate();
            }
        });

        on(dom.byId("swipe"), "click", function (event) {

            if (!swipeTool) {
                swipeTool = new SwipeTool(mainMap);
                toolItems.push(swipeTool);
            }else{
                if (!swipeTool.isActive) {
                    releaseOtherToolItems();
                    swipeTool.activate();
                    changeToolBarItemStyle(this, toolBarConfig.swipe);
                } else {
                    swipeTool.deactivate();
                    changeToolBarItemStyleToNormal(this, toolBarConfig.swipe);
                }
            }
        });

        //
        //
        $("#main-dialog").on("hidden.bs.modal", function () {
            $(this).removeData("bs.modal");
        });

        $("#details-dialog").on("hidden.bs.modal", function () {
            $(this).removeData("bs.modal");
        });

        /** logout */
        on(dom.byId("lbl-logout"), "click", function (event) {
            //
            xhr(loginService, {
                data: {
                    command: "logOut",
                    commandId: "PortalLoginCommand"
                },
                method: "POST",
                handleAs: "json"
            }).then(function (data) {
                // data format: {"result":"ok"}
                //
                if (data.result) {
                    AppEvent.dispatchAppEvent(AppEvent.USER_LOGOUT, data);
                }
            }, function (error) {
                AppEvent.dispatchAppEvent(AppEvent.APPLICATION_ERROR, error);
            });
        });


        /**
         * ======================================================================================
         *  以下代码为工具条逻辑代码
         * ======================================================================================
         * **/
        //
        var toolBarConfig = {
            distance: {
                icon1: "assets/images/tools/distance1.png",
                icon2: "assets/images/tools/distance2.png"
            },
            area: {
                icon1: "assets/images/tools/area1.png",
                icon2: "assets/images/tools/area2.png"
            },
            mark: {
                icon1: "assets/images/tools/mark1.png",
                icon2: "assets/images/tools/mark2.png"
            },
            swipe: {
                icon1: "assets/images/tools/swipe1.png",
                icon2: "assets/images/tools/swipe2.png"
            },
            multi: {
                icon1: "assets/images/tools/mutil1.png",
                icon2: "assets/images/tools/mutil2.png"
            },
            tool: {
                icon1: "assets/images/tools/more.png",
                icon2: "assets/images/tools/more.png"
            },
            arrow: {
                icon1: "assets/images/tools/arrow1.png",
                icon2: "assets/images/tools/arrow2.png"
            },
            full: {
                icon1: "assets/images/tools/full1.png",
                icon2: "assets/images/tools/full1.png"
            }
        };

        /**
         * Deactive all toolbars.
         */
        function releaseOtherToolItems() {
            Array.forEach(toolItems, function (item) {
                if (item) {
                    item.deactivate();
                }
            });
            exitMultiMapState();
        }

        var lastTool = null;
        var lastToolConfig = null;

        function changeToolBarItemStyleToNormal(tool, config) {
            $(tool).attr("src", config.icon1);
        }

        function changeToolBarItemStyle(tool, toolConfig) {
            //
            if (lastTool && lastToolConfig) {
                //
                $(lastTool).attr("src", lastToolConfig.icon1);
            }
            $(tool).attr("src", toolConfig.icon2);
            //
            lastTool = tool;
            lastToolConfig = toolConfig;
        }

        /**显示弹出框*/
        AppEvent.addAppEventListener(AppEvent.SHOW_LARGE_DIALOG, function (data) {
            //
            $("#dialog-container").attr("src", data.url);
            $(".modal-title").html(data.title);
            $("#details-dialog").modal({
                show: true
                //remote:data.url
            });
        });

        /**显示小对话框*/
        var lastSmallUrl = "";
        AppEvent.addAppEventListener(AppEvent.SHOW_SMALL_DIALOG, function (data) {
            //
            if (data) {
                //
                if (data.url === lastSmallUrl) {
                    //
                    $("#small-popup").show();
                    //registry.byId("small-popup").show();
                } else {
                    lastSmallUrl = data.url;
                    window.open(data.url, "smallContainer");
                    //lastSmallUrl=data.url;
                    $("#small-popup").show();
                }
            }
        });
        //

        var logoutState = "退出";
        var loginState = "登录";

        /**用户登录*/
        AppEvent.addAppEventListener(AppEvent.USER_LOGIN, function (data) {
            //设置用户登录信息
            var loginInfo = "<strong>" + data.username + "</strong>&nbsp;&nbsp;|&nbsp;&nbsp;";

            $("#login-info").html(loginInfo);
            //
            //$("#lbl-login").html("");
            $("#lbl-login").hide();
            $("#lbl-logout").html(logoutState);

            $("#login-info").show();
            //
            //$("#lbl-login").html("");
            $("#lbl-login").hide();
            //$("#lbl-logout").show();
            $("#lbl-logout").css("display", "table-cell");

            if (data.id) {
                $(data.id).hide();
            }
            //
            userInfo = data;
            //如果用户登录成功，则获取Arcgis Token，用于加载系统中的安全服务
            getArcgisServiceToken();
        });

        /**用户退出*/
        AppEvent.addAppEventListener(AppEvent.USER_LOGOUT, function (data) {
            //清除用户登录信息
            $("#lbl-login").html(loginState);
            $("#lbl-login").show();
            $("#login-info").hide();
            $("#lbl-logout").hide();

            userInfo = null;
            cookie(ARCGIS_TOKEN_KEY, null, {expires: -1});
        });

        /**设置 arcgis service token*/
            //AppEvent.addAppEventListener(AppEvent.SET_ARCGIS_SERVICE_TOKEN,function(token){
            //    //
            //    cookie(ARCGIS_TOKEN_KEY,token,{expires:5});
            //});


            //
            //监听移除图层事件
        AppEvent.addAppEventListener(AppEvent.REMOVE_CACHE_LAYER, function (data) {

            //清除缓存图层
            mapManager.clearCacheLayers();
            //
            //app.isLeftPanelLoaded=data.isClear;
            var isClear = data.isClear;
            if (app.isLeftPanelLoaded || isClear) {
                //
                markerTool.deactivate();
                changeToolBarItemStyleToNormal($("#mark"), toolBarConfig.mark);
                mainMap.graphics.clear();
                //
                //var info=mainMap.infoWindow;
                mainMap.infoWindow.hide();
                //
                polygonTool.deactivate();
                lineTool.deactivate();
                editGraLayer.clear();
                $("#busy-indicator").hide();
            }
        });
        //
        window.clearQueryResultInMap = function (isClear) {
            //
            //清除缓存图层
            mapManager.clearCacheLayers();
            //
            if (app.isLeftPanelLoaded || isClear) {
                //
                markerTool.deactivate();
                changeToolBarItemStyleToNormal($("#mark"), toolBarConfig.mark);
                mainMap.graphics.clear();
                //
                mainMap.infoWindow.hide();
                //
                polygonTool.deactivate();
                lineTool.deactivate();
                editGraLayer.clear();
                $("#busy-indicator").hide();
            }
        };
        //
        AppEvent.addAppEventListener(AppEvent.ADD_EXTRA_LAYER_TO_CACHE, function (layer) {
            //
            if (layer) {
                //
                mapManager.addLayerToCache(layer);
            }
        });
        /**
         * @param {Object}  data formart:{
         *      "info":"无查询结果。"
         *
         * }
         * */
        AppEvent.addAppEventListener(AppEvent.SHOW_TOASTER, function (data) {
            //
            if (data) {
                //
                var info = data.info;
                $("#toastInfo").html(info);
                $("#toast-panel").show();
                setTimeout(function () {
                    //
                    $("#toast-panel").hide();
                }, 2000);
                //
            }
        });
        //

        AppEvent.addAppEventListener(AppEvent.HIDE_MODAL_DIALOG, function (data) {
            var modalId = data.id;
            if (modalId) {
                $(modalId).modal("hide");
                $(modalId).hide();
            }
        });
        //执行POI查询
        $("#btn-poi-query").click(function () {
            var whereCause = lang.trim(dom.byId('product_search').value);
            if (whereCause) {
                appEvent.dispatchAppEvent(appEvent.QUERY_POI_FROM_TOP_INPUT, whereCause);
                executePoiQuery();
            }
        });
        //点击回车键时执行查询
        $("#product_search").keypress(function (event) {
            if (event.which == 13) {
                event.preventDefault();
                executePoiQuery();
            }
        });

        var topQuery = new TopQuery(AppEvent);

        function executePoiQuery() {
            //
            var whereCause = $("#product_search").val();
            if (whereCause) {

                //清除上一次查询结果
                AppEvent.dispatchAppEvent(AppEvent.REMOVE_CACHE_LAYER, {isClear: true});
                //显示等待动画
                AppEvent.dispatchAppEvent(AppEvent.SHOW_BUSY_INDICATOR, "showBusyIndicator");
                topQuery.startTopPoiQuery(whereCause);
            } else {
                //alert("请您输入查询条件！");
            }
        }

        /**切换左侧tab页*/
        AppEvent.addAppEventListener(AppEvent.QUERY_COMPLETED, function (data) {
            //
            var tabName = data.tabName;
            if (tabName) {
                changeTabStyle(tabName);
            }
        });

        //
        //执行驾车出行
        function executeDriveAnalyst(param) {

            //清除上一次查询结果
            //AppEvent.dispatchAppEvent(AppEvent.REMOVE_CACHE_LAYER,{isClear:true});
            AppEvent.dispatchAppEvent(AppEvent.SHOW_BUSY_INDICATOR, "showBusyIndicator");
            AppEvent.dispatchAppEvent(AppEvent.START_DRIVE_ANALYST, param);
        }

        var drawStartPointEvent = null;
        var drawEndPointEvent = null;

        //
        function drawStartPointHandler(event) {

            removeEventHandlers();
            appEvent.dispatchAppEvent(AppEvent.DRAW_START_POINT, event);
            //console.log("draw start");
        }

        function drawEndPointHandler(event) {
            //
            appEvent.dispatchAppEvent(AppEvent.DRAW_END_POINT, event);
            removeEventHandlers();
            //console.log("draw end ");
        }

        //
        AppEvent.addAppEventListener(AppEvent.SHOW_GRAPHIC_RESULT, function (data) {
            //
            var layer = mapManager.createGraphicsLayer(data.layerId);
            if (data.graphic) {
                //
                //var layer=mapManager.createGraphicsLayer(data.layerId);
                layer.add(data.graphic);
                console.log("add graphic to layer::\t" + layer.id);
            }
            //dynamic load graphic
            if (data.geometryJson) {
                //
                //var symbol=new SimpleLineSymbol().setColor(new Color([255,0,255,0.5])).setWidth(5);
                var symbol = symbolManager.createSimpleLineSymbol(data.symbol);
                var polyline = new Polyline(data.geometryJson);
                //
                var graphic = new Graphic(polyline, symbol);
                layer.add(graphic);
                //console.log(data.geometryJson);
            }
            //起点
            if (data.isStartPoint) {

            }
            //end point
            if (data.isEndPoint) {

            }
            //
        });

        /**
         * ======================================================================================
         *  以下代码用于编辑几何图形
         * ======================================================================================
         * **/

        var editGraLayer = new GraphicsLayer({id: "editGraLayer"});

        var dialog = new TooltipDialog({
            id: "tooltipDialog",
            style: "position: absolute; width: 100px; font: normal normal normal 10pt Helvetica;z-index:100"
        });

        dialog.startup();
        //
        function closeDialog() {
            dijitPopup.close(dialog);
        }

        //
        var wrongGra = null;
        var rightGra = null;
        //
        AppEvent.addAppEventListener("drawGraphic", function (data) {
            //
            //window.drawTool.activate(Draw.POINT);
            if (data.type === 1) {
                if (rightGra) {
                    editGraLayer.remove(rightGra);
                }
                rightGra = data.graphic;
                editGraLayer.add(rightGra);
            } else if (data.type === 2) {
                //
                if (wrongGra) {
                    editGraLayer.remove(wrongGra);
                }
                //
                wrongGra = data.graphic;
                editGraLayer.add(wrongGra);
            }
            //textLayer.add(data);
        });
        //
        //
        function showResults(event) {
            //
            window.drawTool.deactivate();
            var textSymbol = new TextSymbol("");
            //
            var font = new Font();
            font.setDecoration("none");
            //
            textSymbol.setFont(font);
            textSymbol.setText("hello the world...");
            //
            var geometry = event.geometry;
            var gra = new Graphic(geometry, textSymbol, {});
            //
            editGraLayer.add(gra);
        }


        //Activate the toolbar when you click on a graphic
        on(editGraLayer, "click", function (evt) {

            Event.stop(evt);
            activateToolbar(evt.graphic);

        });
        //
        on(editGraLayer, "mouse-over", function (event) {
            var gra = event.graphic;
            if (gra.attributes["type"] === 1) {
                dialog.setContent("正确位置点");
            } else if (gra.attributes["type"] === 2) {
                //
                dialog.setContent("错误位置点");
            }
            //
            dijitPopup.open({
                popup: dialog,
                x: event.pageX - 10,
                y: event.pageY
            });
        });
        //
        on(editGraLayer, "mouse-out", function (event) {
            closeDialog();
        });

        function activateToolbar(graphic) {
            //
            editTool.activate(Edit.MOVE, graphic, {
                allowAddVertices: true,
                allowDeletevertices: true
            });
        }

        //
        /**
         * ======================================================================================
         *
         * ======================================================================================
         * **/

        AppEvent.addAppEventListener(AppEvent.REMOVE_GRAPHICS_LAYER, function (data) {
            //
            mapManager.removeGraphicsLayer(data.layerId);
        });

        AppEvent.addAppEventListener(AppEvent.SHOW_NETWORK_SEGMENT_GRAPHIC, function (data) {
            //
            var layer = mapManager.createGraphicsLayer(data.layerId);
            layer.clear();
            //
            var symbol = symbolManager.createSimpleLineSymbol(data.symbol);
            var geometry = new Polyline(data.geometryJson);
            var segmentGra = new Graphic(geometry, symbol);
            //
            layer.add(segmentGra);

        });
        //

        AppEvent.addAppEventListener(AppEvent.SHOW_GRAPHICS_TO_LAYER, function (data) {
            //
            var layer = mapManager.createGraphicsLayer(data.layerId);
            var graphics = data.graphics;
            Array.forEach(graphics, function (graphic) {
                //
                layer.add(graphic);
            });
        });
        /**显示或隐藏下拉列表*/
        var isDropDown = false;
        //
        on(dom.byId("arrow"), "click", function (event) {
            //
            showDropDownList();

        });
        on(dom.byId("tool"), "click", function (event) {
            //
            showDropDownList();
            exitMultiMapState();
        });
        //
        on(dom.byId("drop-down"), mouse.leave, function (event) {
            //
            $(this).hide();
        });
        //
        function showDropDownList() {
            $("#drop-down").show();
        }

        //

        on(dom.byId("book-mark"), "click", function (event) {
            //
            hideDropDownList();
            //
            window.clearQueryResultInMap(true);
            window.open("widgets/bookmark/bookmark.html", "widgetContainer");
            //
            AppEvent.dispatchAppEvent(AppEvent.QUERY_COMPLETED, {tabName: "tool"});
        });
        on(dom.byId("map-correct"), "click", function (event) {
            //
            hideDropDownList();
            window.clearQueryResultInMap(true);
            window.open("widgets/correction/correction.html", "widgetContainer");
            AppEvent.dispatchAppEvent(AppEvent.QUERY_COMPLETED, {tabName: "tool"});
        });
        //

        function hideDropDownList() {
            //
            $("#drop-down").hide();
        }

        //
        //
        //Stops listening for click events to add barriers and stops (if they've already been wired)
        function removeEventHandlers() {
            if (drawStartPointEvent) {
                drawStartPointEvent.remove();
            }
            if (drawEndPointEvent) {
                drawEndPointEvent.remove();
            }
        }

        /**
         * =========================================
         * 以下代码用于显示或隐藏等待界面
         * =========================================
         */
        AppEvent.addAppEventListener(AppEvent.SHOW_BUSY_INDICATOR, function (data) {
            //
            $("#busy-indicator").show();
        });
        //
        AppEvent.addAppEventListener(AppEvent.HIDE_BUSY_INDICATOR, function (data) {
            //
            $("#busy-indicator").hide();
        });

        //
        function clearResultLayers() {
            //
            mapManager.clearCacheLayers();
            //清除graphic
            if (mainMap && mainMap.graphics) {
                //
                var layer = mainMap.graphics;
                if (layer) {
                    //
                    layer.clear();
                }
                mainMap.infoWindow.hide();
            }
        }

        //以下代码用于控制左侧tab页面切换
        on(dom.byId("search"), "click", function (event) {
            //
            //;
            window.clearQueryResultInMap(true);
            changeTabStyle("search");
            //$("#widgetContainer").attr("src","widgets/search/query.html");
            window.open("widgets/search/query.html", "widgetContainer");
            clearResultLayers();
            exitMultiMapState();
            app.isLeftPanelLoaded = true;
        });
        //
        on(dom.byId("drive"), "click", function (event) {
            //
            changeTabStyle("drive");
            window.open("widgets/network/network.html", "widgetContainer");
            clearResultLayers();
            exitMultiMapState();
            app.isLeftPanelLoaded = true;
        });
        //
        on(dom.byId("service"), "click", function (event) {
            //
            app.isLeftPanelLoaded = true;
            changeTabStyle("service");
            window.open("widgets/service/servicelist.html", "widgetContainer");
            clearResultLayers();
            //
            exitMultiMapState();
        });
        //
        function changeTabStyle(tabName) {
            //
            if (tabName === "search") {
                //
                $("#drive").removeClass("drive-clicked");
                $("#service").removeClass("service-clicked");
                $("#search").removeClass("search");

                $("#search").addClass("search-clicked");
                $("#drive").addClass("drive");
                $("#service").addClass("service");

                //
            } else if (tabName === "drive") {
                $("#drive").removeClass("drive");
                $("#service").removeClass("service-clicked");
                $("#search").removeClass("search-clicked");

                $("#search").addClass("search");
                $("#drive").addClass("drive-clicked");
                $("#service").addClass("service");
                //
            } else if (tabName === "service") {
                //
                $("#drive").removeClass("drive-clicked");
                $("#service").removeClass("service");
                $("#search").removeClass("search-clicked");

                $("#service").addClass("service-clicked");
                $("#search").addClass("search");
                $("#drive").addClass("drive");
            } else {
                //
                $("#drive").removeClass("drive-clicked");
                $("#service").removeClass("service-clicked");
                $("#search").removeClass("search-clicked");

                $("#service").addClass("service");
                $("#search").addClass("search");
                $("#drive").addClass("drive");
            }
        }

        /**=======================================================
         *
         *
         * 以下代码设置多时相窗口
         *
         * =============================================================
         * */
        var startPoint = null;
        var currentPoint = null;
        //
        var mouseMoveHandler = null;

        /*on(dom.byId("split"), "mousedown", function (event) {
            //
            startPoint = getMousePosition(event);
            addEventListeners();
            $("#mask").show();
        });*/
        //
        function addEventListeners() {
            //
            mouseMoveHandler = on(dom.byId("mask"), "mousemove", function (event) {
                //
                var hasSliderOpen = $("#slider").hasClass("slider-open");
                //
                currentPoint = getMousePosition(event);
                if (hasSliderOpen) {
                    //
                    $("#split").css("left", currentPoint.x + 380 + "px");
                    $("#map1").css("width", currentPoint.x - 380 + "px");
                    //
                    var maskPx = $("#mask").css("width");
                    //
                    var maskWidth = parseInt(maskPx);
                    //
                    var splitPx = $("#split").css("width");
                    //
                    var splitWidth = parseInt(splitPx);
                    //
                    //var screenWidth= $("#mask").css("width");-currentPoint.x;
                    var map2Width = maskWidth - currentPoint.x - splitWidth - 0.3 + 380;
                    //
                    $("#map2").css("width", map2Width + "px");
                } else {
                    //
                    $("#split").css("left", currentPoint.x + "px");
                    $("#map1").css("width", currentPoint.x + "px");
                    //
                    var maskPx = $("#mask").css("width");
                    //
                    var maskWidth = parseInt(maskPx);
                    //
                    var splitPx = $("#split").css("width");
                    //
                    var splitWidth = parseInt(splitPx);
                    //
                    //var screenWidth= $("#mask").css("width");-currentPoint.x;
                    var map2Width = maskWidth - currentPoint.x - splitWidth - 0.3;
                    //
                    $("#map2").css("width", map2Width + "px");
                }
            });
        }

        //
        function removeEventListeners() {
            if (mouseMoveHandler) {
                //
                mouseMoveHandler.remove();
            }
        }

        on(dom.byId("mask"), "mouseup", function (event) {
            //
            removeEventListeners();
            $("#mask").hide();
            multiTool.resize();
        });
        //
        function getMousePosition(event) {
            var e = event || window.event;
            var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
            var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
            var x = e.pageX || e.clientX + scrollX;
            var y = e.pageY || e.clientY + scrollY;
            return {'x': x, 'y': y};
        }

        //var isMultiClicked=false;
        on(dom.byId("multi"), "click", function (event) {
            releaseOtherToolItems();

            if (app.isMultiState) {
                exitMultiMapState();
                app.isMultiState = false;
            } else {
                changeToolBarItemStyle(this, toolBarConfig.multi);
                domStyle.set(dom.byId("map1"), "width", "50%");
                domStyle.set(dom.byId("split"), "display", "block");
                domStyle.set(dom.byId("map2"), "width", "49.2%");
                domStyle.set(dom.byId("mainSlider"), "display", "block");
                domStyle.set(dom.byId("attachSlider"), "display", "block");

                app.isMultiState = true;
                //load multidate layers
                loadMultiLayers();
            }
        });

        //
        var multiTool = null;

        //Initialize MulidateTool.
        function loadMultiLayers() {
            //
            if (!multiTool) {
                multiTool = new MultidateTool("widgets/multi/config.json",mainMap);
                toolItems.push(multiTool);
                window.multiTool = multiTool;
            }else{
                multiTool.activate();
            }
        }

        /* Exit MultiDate Map. */
        function exitMultiMapState() {
            if (app.isMultiState) {
                changeToolBarItemStyleToNormal(dom.byId("multi"), toolBarConfig.multi);
                domStyle.set(dom.byId("map1"), "width", "100%");
                domStyle.set(dom.byId("split"), "display", "none");
                domStyle.set(dom.byId("map2"), "width", "0");
                domStyle.set(dom.byId("mainSlider"), "display", "none");
                domStyle.set(dom.byId("attachSlider"), "display", "none");

                multiTool.deactivate();
            }

            if (swipeTool) {
                swipeTool.deactivate();
                changeToolBarItemStyleToNormal(dom.byId("swipe"), toolBarConfig.swipe);
            }
        }

        //Set the value of slider widget.
        function setSliderValue(year, slider) {
            if (year < slider.minimum) {
                slider.set("value", slider.minimum);
            } else if (year > slider.maximum) {
                slider.set("value", slider.maximum);
            } else {
                slider.set("value", year);
            }
        }

        on(dom.byId("yearMinus"), "click", function (event) {
            var leftSlider = registry.byId("left-slider");
            var lastYear = leftSlider.value;

            if (lastYear > leftSlider.minimum && lastYear <= leftSlider.maximum) {
                lastYear--;
                setSliderValue(lastYear, leftSlider);//Change Slider value.
                multiTool.changeLayerVisibleById(mainMap, lastYear);//Change map layer.
            }
        });
        //
        on(dom.byId("yearIncrease"), "click", function (event) {
            var leftSlider = registry.byId("left-slider");
            var lastYear = leftSlider.value;
            //
            if (lastYear >= leftSlider.minimum && lastYear < leftSlider.maximum) {
                lastYear++;
                setSliderValue(lastYear, leftSlider);
                multiTool.changeLayerVisibleById(mainMap, lastYear);
            }
        });

        on(dom.byId("attachMinus"), "click", function (event) {
            var rightSlider = registry.byId("right-slider");
            var lastYear = rightSlider.value;
            if (lastYear > rightSlider.minimum && lastYear <= rightSlider.maximum) {
                lastYear--;
                setSliderValue(lastYear, rightSlider);
                multiTool.changeLayerVisibleById(multiTool.getAttachMap(), lastYear);
            }
        });
        //
        on(dom.byId("attachIncrease"), "click", function (event) {
            var rightSlider = registry.byId("right-slider");
            var lastYear = rightSlider.value;
            if (lastYear >= rightSlider.minimum && lastYear < rightSlider.maximum) {
                lastYear++;
                setSliderValue(lastYear, rightSlider);
                multiTool.changeLayerVisibleById(multiTool.getAttachMap(), lastYear);
            }
        });

        var lastImages = [dom.byId("attachMinus"), dom.byId("yearMinus")];
        //
        function addLastYearFocusState() {
            //
            Array.forEach(lastImages, function (item) {
                //
                on(item, mouse.enter, function (event) {
                    //
                    $(item).attr("src", "assets/images/multi/last2.png");
                });
                on(item, mouse.leave, function (event) {
                    //
                    $(item).attr("src", "assets/images/multi/last1.png");
                });
            });
        }

        //MultiDate Map last year.
        addLastYearFocusState();
        //MultiDate Map next year.
        addNextYearFocusState();
        var nextYears = [dom.byId("yearIncrease"), dom.byId("attachIncrease")];

        function addNextYearFocusState() {
            Array.forEach(nextYears, function (year) {
                on(year, mouse.enter, function (event) {
                    $(year).attr("src", "assets/images/multi/next2.png");
                });
                on(year, mouse.leave, function (event) {
                    $(year).attr("src", "assets/images/multi/next1.png");
                });
            });
        }

        /* Event register: ToolItems(标记). */
        on(dom.byId("mark"), "click", function (event) {
            //退出多时相地图
            exitMultiMapState();
            if (markerTool.isActive) {
                //
                markerTool.deactivate();
                changeToolBarItemStyleToNormal(this, toolBarConfig.mark);
            } else {
                //
                changeToolBarItemStyle(this, toolBarConfig.mark);
                releaseOtherToolItems();
                markerTool.activate();
            }
        });


        /**
         * 如果URL中包含有分享信息,则显示当前位置
         * */
        /**==================================================
         *以下代码用于实现全屏功能
         * =====================================================
         * */
        //
        var isFullActive = false;
        /* Event register: 全屏. */
        on(dom.byId("full"), "click", function (event) {
            //var item=null;
            if (!isFullActive) {
                changeToolBarItemStyle(this, toolBarConfig.full);
                isFullActive = true;
            } else {
                changeToolBarItemStyleToNormal(this, toolBarConfig.full);
                isFullActive = false;
                //enterFullScreen(isFullActive);
                //window.open(document.location,"big","fullscreen=no");
            }
            toggleFullScreen();
        });

        function toggleFullScreen() {
            if (sniff("ie") < 9) {
                //
                //var WsShell = new ActiveXObject('WScript.Shell')
                //WsShell.SendKeys('{F11}');
            } else {
                //
                if (!document.fullscreenElement &&    // alternative standard method
                    !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                    // current working methods
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen();
                    } else if (document.documentElement.msRequestFullscreen) {
                        document.documentElement.msRequestFullscreen();
                    } else if (document.documentElement.mozRequestFullScreen) {
                        document.documentElement.mozRequestFullScreen();
                    } else if (document.documentElement.webkitRequestFullscreen) {
                        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
            }

        }

        //
        /**==================================================
         *以下代码用于移除地图平移事件
         * =====================================================
         * */
        var mapMouseDownHandler = null;
        //var mapUpHandler=null;
        //var mapOutHandler=null;
        //
        var isMapMouseDown = false;
        //

        //获取服务器地址ַ
        function getServiceUrl() {
            var url = location.protocol + "//" + location.host;
            return url;
        }

        /**
         * Jump to the Portal system of OneMap.
         * @param pageid
         * @param appid
         */
        function skipToPortalPage(pageid, appid) {
            if (pageid != "index") {
                setSubMainCookie(pageid, appid);
                window.open("../main/subPageMain.html", "_blank");
            } else {
                window.open("../main/main.html", "_blank");
            }
        }

        /**
         * Function of Cookie operation : Add.
         * @param menuId
         * @param appid
         */
        function setSubMainCookie(menuId, appid) {
            removeAllCookie();
            if (menuId) {
                dojo.cookie("subMainId", menuId, {path: '/', expires: 1});//Write cookie
            }
            if (appid) {
                dojo.cookie("appid", appid, {path: '/', expires: 1});//Write cookie
            }
        }

        /**
         * Function of Cookie operation : Remove.
         */
        function removeAllCookie() {
            dojo.cookie("subMainId") && dojo.cookie("subMainId", null, {path: '/', expires: -1});
            dojo.cookie("appid") && dojo.cookie("appid", null, {path: '/', expires: -1});
        }

        /**
         * 获取ArcgisToken,用于加载安全服务.
         */
        function getArcgisServiceToken() {
            xhr(loginService, {
                data: {
                    commandId: "PortalLoginCommand",
                    command: "getArcgisToken"
                },
                method: "POST",
                handleAs: "json"
            }).then(
                function (data) {
                    //AppEvent.dispatchAppEvent(AppEvent.SET_ARCGIS_SERVICE_TOKEN,data.token);
                    cookie(ARCGIS_TOKEN_KEY, data.token, {expires: 5});
                },
                function (error) {
                    console.log(error);
                }
            );
        }
    });