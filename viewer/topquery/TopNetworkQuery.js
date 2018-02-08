/**
 * Created by Esri on 2015/4/14.
 */
define(["dojo/dom","dojo/on",
        "dojo/dom-construct",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "dojo/_base/declare",
        "esri/urlUtils",
        "esri/graphic",
        "esri/layers/GraphicsLayer",

        "esri/tasks/RouteTask",
        "esri/tasks/RouteParameters",
        "esri/tasks/FeatureSet",
        "esri/SpatialReference",

        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/Color",

        "esri/tasks/NATypes",
        "esri/geometry/Polyline",
        "esri/renderers/SimpleRenderer",
        "esri/tasks/QueryTask",
        "esri/tasks/query",
        "esri/config",

        "viewer/ConfigManager",
        "viewer/SymbolManager"

       ],
    function(dom,on,domConstruct,Array,lang,string,declare,urlUtils,Graphic,GraphicsLayer,RouteTask,RouteParameters,FeatureSet,
             SpatialReference,SimpleMarkerSymbol,SimpleLineSymbol,Color,NATypes,Polyline,SimpleRenderer,
             QueryTask,Query,esriConfig,ConfigManager,SymbolManager){
        //
        var widgetConfig=null;
        var _map=null;
        var configManager=null;
        var routeTask=null;
        var symbolManager=null;

        /**途径点*/
        var stopGraphics=[];
        /**障碍点*/
        var barrierGraphics=[];
        //
        var appEvent=null;
        //symbols
        var startSymbol=null;
        var endSymbol=null;
        //
        var startGraphic=null;
        var endGraphic=null;
        //
        var graLayerId="networkLayer";
        //
        var urlPrefix="192.168.80.177:8080";
        var proxyUrl="../proxy2.jsp";
        //
        var queryTask=null;
        //
        var drivePointInfo=null;
        //
        var networkSelf=null;
        //
        var networkClass=declare([],{
            //
            constructor:function(map){
                //
               _map=map;
                networkSelf=this;
                symbolManager=new SymbolManager();
                //
                configManager=new ConfigManager(function(data){},function(error){});
                //
                configManager.loadConfigWhitCallback("widgets/network/config.json",lang.hitch(this,this._configLoadedHandler),lang.hitch(this,this._configLoadErrorHandler));
            },
            _configLoadedHandler:function(data){
                //
                widgetConfig=data;
                //
                if(symbolManager){
                    //
                    startSymbol=symbolManager.createPictureMarkerSymbol(widgetConfig.startsymbol);
                    endSymbol=symbolManager.createPictureMarkerSymbol(widgetConfig.endsymbol);
                }
                //
                queryTask=new QueryTask(widgetConfig.poi.url);
                //
                //
                //console.log(widgetConfig.poiUrl);
                //
                routeTask=new RouteTask(data.routeTaskURL);
                //
                routeTask.on("solve-complete",lang.hitch(this,this._showRouteAnalysisResults));
                routeTask.on("error",lang.hitch(this,this._routeErrorHandler));
            },
            _configLoadErrorHandler:function(error){

                console.log("load config.json failed. in network.js file\t"+error.toString());
            },
            //
            _setStartPointHandler:function(graphic){
                //
                startGraphic=graphic;
                startGraphic.setSymbol(startSymbol);
            },
            _setEndPointHandler:function(graphic){
                endGraphic= graphic;
                endGraphic.setSymbol(endSymbol);
            },
            _routeErrorHandler:function(error){
                //
                console.log("execute route analyst faild in network.js file.\t"+error.toString());
            },
            /**解析路径分析结果，并绘制UI元素*/
            _showRouteAnalysisResults:function(result){
                //
                //
                ;
                var data={
                    results:result
                };
                data.start=startGraphic;
                data.end=endGraphic;
                data.config=widgetConfig;
                data.type="drive";



                //window.extraData=data;
                //window.extraConfig=widgetConfig;
                //
                this._clearStopGraphics();
                window.clearQueryResultInMap(true);
                var container=dom.byId("widgetContainer").contentWindow.showResults(data);
                //不采用事件在在页面中传递数据，解决IE浏览器中报不能执行已释放Script问题
                //appEvent.dispatchAppEvent(appEvent.SHOW_INFO_QUERY_RESULTS,data);
                //

                //设置可返回页面
                //window.parent.backPageUrl="network.html";
                //
                //appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,{isClear:true});
                //window.open("widgets/network/result.html","widgetContainer");
            },
            //
            _executeNetworkAnalyst:function(){
                //
                //设置代理
                //urlUtils.addProxyRule({
                //    urlPrefix: urlPrefix,
                //    proxyUrl:proxyUrl
                //});
                esriConfig.defaults.io.proxyUrl = proxyUrl;
                esriConfig.defaults.io.alwaysUseProxy = false;
                //
                stopGraphics.unshift(startGraphic);
                // add end point
                stopGraphics.push(endGraphic);

                var routeParams = new RouteParameters();

                routeParams.stops = new FeatureSet();
                routeParams.outSpatialReference =_map.spatialReference;
                routeParams.returnDirections=true;

                routeParams.outputLines="esriNAOutputLineTrueShape";//NATypes.OutputLine.TRUE_SHAPE;
                console.log(NATypes.OutputLine.TRUE_SHAPE);
                //
                routeParams.stops.features=stopGraphics;

                routeParams.directionsLengthUnits="esriMeters";
                //
                if(barrierGraphics.length>0){
                    //
                    routeParams.barriers = new FeatureSet();
                    routeParams.barriers.features=barrierGraphics;
                }
                console.log("stops length:\t"+stopGraphics.length);
                routeTask.solve(routeParams);
            },
            _hideAndClearLayer:function(){
                //
                appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,{});
            },
            //
            _clearStopGraphics:function(){
                stopGraphics=[];
                barrierGraphics=[];
            },

            setAppEvent:function(event){
                appEvent=event;
            },
            /**
             * @param {Object}  data
             * @return {void}
             *@example:
             * data {
             *  "start":"",
             *  "end":""
             * }
             * */
            executeNetworkAnalyst:function(data){
                //
                drivePointInfo=data;


                var whereCause="";
                //
                /* var startCase="NAME LIKE '%"+lang.trim(data.start)+"%' OR ";
                 var endCause="NAME LIKE '%"+lang.trim(data.end)+"%'";*/
                var startCase=string.substitute(widgetConfig.poi.expression,{name:lang.trim(data.start)})+" OR ";
                var endCause=string.substitute(widgetConfig.poi.expression,{name:lang.trim(data.end)});

                whereCause=startCase+endCause;
                //
                var nameField=widgetConfig.poi.displayField;
                //
                var param=new Query();
                param.where=whereCause;
                //param.outFields=["NAME"];
                param.outFields=[nameField];
                param.returnGeometry=true;
                param.outSpatialReference=_map.spatialReference;
                //
                startGraphic=null;
                endGraphic=null;

                queryTask.execute(param,function(resultSet){
                    //
                    var features=resultSet.features;
                    //
                    Array.forEach(features,function(feature){
                        //
                        var graName=feature.attributes[nameField];
                        //var graName=feature.attributes["NAME"];
                        //
                        if(graName===drivePointInfo.start){
                            //
                            networkSelf._setStartPointHandler(feature);
                        }
                        if(graName===drivePointInfo.end){
                            //
                            networkSelf._setEndPointHandler(feature);
                        }
                    });
                    //执行路径分析
                    if(startGraphic&&endGraphic){
                        //
                        networkSelf._executeNetworkAnalyst();
                    }else{
                        //
                        if(!startGraphic){
                            //
                            networkSelf._hideAndClearLayer();
                            appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"您输入的起点【"+drivePointInfo.start+"】不存在！"});
                            //alert("您输入的起点【"+drivePointInfo.start+"】不存在！");
                            return ;
                        }
                        if(!endGraphic){
                            //
                            networkSelf._hideAndClearLayer();
                            //alert("您输入的终点【"+drivePointInfo.end+"】不存在！");
                            appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"您输入的终点【"+drivePointInfo.end+"】不存在！"});
                            return;
                        }
                    }

                },function(error){
                    //
                    //alert(error);
                    appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:error.toString()});
                    appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,"hideBusyIndicator");
                });
            }
        });
        //
        return networkClass;
});