/**
 * Created by Esri on 2015/3/26.
 */
require(["dojo/dom","dojo/on",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/topic",
        "dojo/dom-construct",
        "dojo/string",
        "viewer/ConfigManager",
        "esri/tasks/GeometryService",
        "esri/geometry/normalizeUtils",
        "esri/tasks/BufferParameters",
        "esri/SpatialReference",
        "esri/layers/GraphicsLayer",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
        "esri/graphic",

        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Color",
        "esri/config",
        "esri/geometry/geometryEngine",

        "dojo/domReady!"],
    function(dom,on,lang,Array,topic,domConstruct,string,ConfigManager,
             GeometryService,normalizeUtils,BufferParameters,SpatialReference,GraphicsLayer,Query,QueryTask,
             Graphic,SimpleLineSymbol,SimpleFillSymbol,Color,esriConfig,geometryEngine){
    //strin
    //    var poiCatalogs,city;
        var configData={};
        var appEvent=null;
        //var geometryService=null;
        var map=null;
        var configManager=null;
        //
        var symbolManager=null;

        var drawTool=null;
        //
        //var serviceUrl="http://ynmap.org.cn/OneMapServer/rest/services/Geometry/GeometryServer";
        //
        //var graphicsLayer=null;
        //代理地址
        var agsProxyUrl="../../../proxy2.jsp";
        //
        var queryTask=null;
        //缓冲距离 单位:米
        var  bufferRadius=500;
        //POI分类
        var poiCatalogType="01";
        //
        var bufferGeometry=null;

        /**初始化*/
        (function(){
            //
            //
            window.parent.backPageUrl="../buffer/buffer.html";
            appEvent=window.parent.appEvent;

            if(appEvent){
                //
                appEvent.dispatchAppEvent(appEvent.TAB_PAGE_CHANGED,"周边查询");
                //clear layers
                appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,"removeLayer");
            }
            map=window.parent.mainMap;
            /*if(map){
                //
                graphicsLayer=map.getLayer("buffer_layer");
                if(!graphicsLayer){
                    //
                    graphicsLayer=new GraphicsLayer({id:"buffer_layer"});
                    //map.addLayer(graphicsLayer);
                }
            }*/
            configManager=window.parent.configManager;
            if(configManager){
                //
                configManager.loadConfigWhitCallback("widgets/buffer/config.json",widgetConfigLoadHandler,widgetConfigError);
            }
            //
            drawTool=window.parent.drawTool;
            if(drawTool){
                //
                drawTool.on("draw-end",showDrawGeometry);
            }
            //
            //var serviceUrl=window.parent.geometryServiceUrl;
           /* if(serviceUrl){
                //
                geometryService=new GeometryService(serviceUrl);
                //
                geometryService.on("buffer-complete",executeBufferCompleted);
                geometryService.on("error",executeBufferError);
            }*/
            //
            symbolManager=window.parent.symbolManager;
        })();
        //
        function widgetConfigLoadHandler(data){
            //
            try{
                //
                configData=data;
                if(data.url){
                    //
                    queryTask=new QueryTask(data.url);
                    //
                    console.log(queryTask.url);
                }
                window.parent.widgetData=configData;
                var fun=lang.hitch(window,initPoiList);
                //alert(typeof fun==="function");
                fun(data.poicatalogs);
                //alert("heheh");
            }catch(error){
                //
                alert(error.toString());
            }
        }
        function widgetConfigError(error){
            //
            console.log("loaded widget config file error in buffer.js");
        }
        //
        function executeBufferCompleted(bufferGeo){
            //
            //var bufferedGeometries=bufferGeo;//event.geometries;
            //
            /*var symbol = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([255,0,0,0.65]), 2
                ),
                new Color([255,0,0,0.35])
            );*/
            var symbol=symbolManager.createSimpleFillSymbol(configData.bufferSymbol);
            //var geometry=bufferedGeometries[0];
            var graphic = new Graphic(bufferGeo, symbol);
            //map.graphics.add(graphic);

            window.parent.extraData=graphic;

            //设置代理
            esriConfig.defaults.io.proxyUrl = agsProxyUrl;
            esriConfig.defaults.io.alwaysUseProxy = false;

            var params=new Query();
            var whereCause=string.substitute(configData.catalogmatch,{type:poiCatalogType});
            //
            //queryParams.where=whereCause;
            params.geometry=bufferGeo;
            params.spatialRelationship=Query.SPATIAL_REL_CONTAINS;

            params.outFields=setOutFields(configData);
            params.returnGeometry=true;
            //
            //console.log("query url :"+queryTask.url);
            //console.log("cause: "+whereCause);
            //console.log("outfields: "+queryParams.outFields);
            //console.log("json: "+JSON.stringify(geometry.toJson()));
            //
            queryTask.execute(params,function(results){
                //
                //
                if(results.features.length>0){
                    window.parent.queryData=results;
                    window.parent.queryFields=configData.fields;
                    //
                    //显示查询结果面板
                    window.open("../search/result.html","widgetContainer");
                }else{
                    //
                    //alert("当前地图范围内不存在所查询的POI点");
                    appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"当前查询范围内没有指定类型的兴趣点"});
                }


            },function(error){
                //
                console.log("execute query task failed. in buffer.js file.\t"+error.toString());
            });
            //
        }
        //
        function executeBufferError(event){
            //
            console.log("execute buffer analyst fialed in buffer.js file. \t"+event.toString());
        }
        //
        function setOutFields(data){
            //
            var results=[];

            Array.forEach(data.fields,function(field){
                //
                results.push(field.name);
            });
            //
            return results;
        }
        //
        function showDrawGeometry(event){
            //
            //
            drawTool.deactivate();
            var geometry=event.geometry;
            //
            var symbol=createGraphicSymbol(geometry.type);

            var beforeBufferedGra=new Graphic(geometry,symbol);
            //
            map.graphics.add(beforeBufferedGra);
            //
            var geometries=geometryEngine.geodesicBuffer([geometry],[bufferRadius],9001,true);
            //
            //var bufferGeo=geometries[0];
            //
            bufferGeometry=geometries[0];
            //var geotext=JSON.stringify(bufferGeo);
            //
            //console.log(geotext);
            //
            //executeBufferCompleted(bufferGeo);
            //
            /*
            var params = new BufferParameters();
            params.distances = [bufferRadius];9001
            params.outSpatialReference = map.spatialReference;
            params.unit = GeometryService.UNIT_METER;
            //normalize the geometry
            normalizeUtils.normalizeCentralMeridian([geometry]).then(function(normalizedGeometries){
                var normalizedGeometry = normalizedGeometries[0];
                if (normalizedGeometry.type === "polygon") {
                    //if geometry is a polygon then simplify polygon.  This will make the user drawn polygon topologically correct.
                   geometryService.simplify([normalizedGeometry], function(geometries) {
                        params.geometries = geometries;
                        geometryService.buffer(params);
                    });
                } else {
                    params.geometries = [normalizedGeometry];
                    geometryService.buffer(params);
                }

            });*/

        }
        //
        function createGraphicSymbol(type){
            //
            var symbol=null;
            switch (type) {
                case "point":
                    //symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 1), new Color([0,255,0,0.25]));
                    symbol=symbolManager.createSimpleMarkerSymbol(configData.drawMarkerSymbol);
                    break;
                case "polyline":
                    //symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255,0,0]), 1);
                    symbol=symbolManager.createSimpleLineSymbol(configData.drawLineSymbol);
                    break;
                case "polygon":
                    //symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255,0,0]), 2), new Color([255,255,0,0.25]));
                    symbol=symbolManager.createSimpleFillSymbol(configData.drawFillSymbol);
                    break;
            }
            return symbol;
        }
        //
        //var cfg=new ConfigManager(function(data){
        //
        //},function(error){
        //    //
        //});
        ////
        //cfg.loadConfig("config.json");
        ////
       /* topic.subscribe("configLoaded",function(data){
            //
            try{
                //
                configData=data;
                if(data.url){
                    //
                    queryTask=new QueryTask(data.url);
                    //
                    console.log(queryTask.url);
                }
                window.parent.widgetData=configData;
                var fun=lang.hitch(window,initPoiList);
                //alert(typeof fun==="function");
                fun(data.poicatalogs);
                //alert("heheh");
            }catch(error){
                //
                alert(error.toString());
            }
        });*/
        //
        //topic.subscribe("startQueryPoi",function(info){
        //    //
        //    //
        //    //alert(info.code);
        //    var whereCause=string.substitute(configData.catalogmatch,{type:info.code});
        //    //alert(whereCause);
        //
        //    executeQuery(whereCause);
        //    //
        //});

        /**
         * {
         *     "name":"旅游",
         *    "code":"12",
         *    "icon":"",
         * }
         */
        function _createCell(info,row){
            //
            //var template="<img src='${icon}'><br><label>${name}</label>";

            var template="<a href='#'>${name}</a>";
            var content=string.substitute(template,{name:info.name});
            //alert(content);
            var cellPros={
                innerHTML:content
            };

            var cell=domConstruct.create("td",cellPros,row,"last");
            //
            on(cell,"click",function(e){

                 //topic.publish("startQueryPoi",info);
                poiCatalogType=info.code;
                executeBufferCompleted(bufferGeometry);

            });
            return cell;
        }
        //
        function _createRow(table){
            //
            var row=domConstruct.create("tr",{},table);

            return row;
        }
        //一行显示多少列
        var cellCount=5;
        //
        function initPoiList(infos){
            var infoCount=infos.length;
            var table=dom.byId("poilist");
            var row=_createRow(table);
            for(var i=0;i<infoCount;i++){
                //
                var info=infos[i];
                _createCell(info,row);

                if(i%cellCount==0&&i>0){
                    //
                   row=_createRow(table);
                }
            }
        }
        /**
         * 绘制几何图形
         * */
        $("#draw-point").click(function(){
            //
            drawTool.activate("point");
            //console.log(drawTool.POINT);
        });
        $("#draw-polyline").click(function(){
            //
            drawTool.activate("polyline");

        });
        $("#draw-polygon").click(function(){
            //
            drawTool.activate("polygon");
        });

});
//
$(document).ready(function(){
    //
    /**初始化滑块*/
    (function(){

        var sl= $("#query-radius").slider({
            min:100,
            max:3000,
            step:50,
            value:500,
            orientation:"horizontal",
            tooltip:"show"
        }).on("slide",function(){
            bufferRadius=sl.getValue();
        }).data("slider");
    })();
});