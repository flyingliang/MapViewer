/**
 * Created by Esri on 2015/3/26.
 */
require(["dojo/dom","dojo/on","dojo/_base/lang","dojo/_base/array",
        "dojo/dom-construct","dojo/string","dojo/dom-attr","dojo/sniff",
        "dojo/cookie","dojo/json",

        "esri/tasks/query", "esri/tasks/QueryTask","esri/geometry/Extent","esri/SpatialReference",

        "./QueryResult.js",
        "widgets/network/RouteResult",
        "dojo/domReady!"
    ],
    function(dom,on,lang,Array,domConstruct,string,domAttr,sniff,cookie,JSON,Query,QueryTask,Extent,SpatialReference,
             QueryResult,
             RouteResult){

        //
        var QUERY_RESULT_KEY="queryResultKey";
        var QUERY_CONFIG_KEY="queryConfigKey";
        //var QUERY_FIELDS_KEY="queryFieldsKey";

        var widgetConfig=null;
        //
        var configManager=null;
        //
        var appEvent=null;
        //
        var map=null;
        //
        var zoomLevel=15;
        //
        var queryResult=null;
        //
        var routeResult=null;
        (function(){
            //
            ;
            appEvent=window.parent.appEvent;

            map=window.parent.mainMap;
            //if(map){
            //    //
            //    map.graphics.clear();
            //    map.infoWindow.hide();
            //}
            //
            //var testEvent=window.parent.appEvent;

            configManager=window.parent.configManager;
            if(configManager){
                //
                configManager.loadConfigWhitCallback("widgets/search/config.json",configLoaded,configLoadError);
                //
            }
            //
            if(appEvent){
                //
                //appEvent.addAppEventListener(appEvent.QUERY_POI_FROM_TOP_INPUT,startTopPoiQuery);
                //appEvent.addAppEventListener(appEvent.QUERY_POI_FROM_LEFT_INPUT,startLeftPoiQuery);
                //clear
                //appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,"removeLayer");
                //
                //appEvent.addAppEventListener(appEvent.SHOW_INFO_QUERY_RESULTS,function(data){
                //    //
                //    var config=data.config;
                //    var results=data.results;
                //    var type=data.type;
                //    ;
                //    //
                //    //map.graphics.clear();
                //    //
                //    if(type==="poi"){
                //        //
                //        $("#homes").hide();
                //        $("#info-results").hide();
                //        $("#results").show();
                //        //
                //        queryResult=new QueryResult(map);
                //        //
                //        queryResult.setConfig(config);
                //        queryResult.setPagers(dom.byId("pagers"));
                //        //
                //        queryResult.setContent(dom.byId("contents"));
                //        //
                //        queryResult.loadQueryResults(results.features);
                //        //
                //        queryResult.setAppEvent(appEvent);
                //        //
                //        queryResult.hideBusyIndicator();
                //    }else if(type==="drive"){
                //        //
                //        $("#homes").hide();
                //        $("#results").hide();
                //        $("#info-results").show();
                //        routeResult=new RouteResult(map);
                //
                //        routeResult.setConfig(config);
                //        routeResult.setContent(dom.byId("info-results"));
                //
                //        //routeResult.setAppEvent(appEvent);
                //        routeResult.setAppEvent(appEvent);
                //        routeResult.loadRouteResults(results);
                //        routeResult.addGraphic(data.start);
                //        routeResult.addGraphic(data.end);
                //        routeResult.hideBusyIndicator();
                //    }else{
                //        //
                //    }
                //});

            }
            //
            //window.parent.backPageUrl="widgets/search/query.html";

        })();
        //

        //
        function startTopPoiQuery(condition){
            //
            //
            var template=widgetConfig.expression;
            //
            var whereCause=string.substitute(template,{name:condition});
            //
            executeQuery(whereCause,false);

        }
        //
        function startLeftPoiQuery(info){
            //
            //
            //alert(info.code);
            var whereCause=string.substitute(widgetConfig.catalogmatch,{type:info.code});
            //alert(whereCause);

            executeQuery(whereCause,true);
            //
        }
        //
        function configLoaded(data){
            //
            try{
                //
                ;//02 存储数据
                widgetConfig=data;
                //
                //
                //
                var configJson=JSON.stringify(widgetConfig);
                window.localStorage.setItem(QUERY_CONFIG_KEY,configJson);

                //poi查询
                //queryResult=new QueryResult(map);
                //queryResult.setConfig(widgetConfig);
                //
                //
                //路径分析
                //routeResult=new RouteResult(map);
                //routeResult.setResultLayer(layer);
                //routeResult.setConfig(widgetConfig);
                //routeResult.setAppEvent(appEvent);
                //if(sniff("ie")){
                //    //
                //    //
                //    var configJson=JSON.stringify(widgetConfig);
                //    cookie(QUERY_CONFIG_KEY,configJson,{expires:1});
                //    //window.parent.widgetData= $.extend(true,{},widgetConfig);//lang.clone(widgetConfig);// widgetConfig;
                //}else{
                //    //
                //    window.parent.widgetData=widgetConfig;
                //}
                //window.parent.widgetData=lang.clone(widgetConfig);// widgetConfig;
                //window.parent.queryInfos.push({"config":widgetConfig});
               //queryInfos.push({"config":widgetConfig});

                var fun=lang.hitch(window,initPoiList);
                //alert(typeof fun==="function");
                fun(data.poicatalogs);
                //alert("heheh");
            }catch(error){
                //
                //alert(error.toString());
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:error.toString()});
            }
        }
        function configLoadError(error){
            //

            //alert(error.toString());
            appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:error.toString()});
        }

        //
        //var queryInfos=[];
        function executeQuery(whereCause,isFromLeft){
            //
            var outfields=[];
            var queryTask=new QueryTask(widgetConfig.url);

            Array.forEach(widgetConfig.fields,function(field){
                //
                outfields.push(field.name);
            });
            //
            //alert(outfields);
            var param=new Query();
            param.where=whereCause;
            param.outFields=outfields;
            param.returnGeometry=true;

            //param.outSpatialReference=window.parent.mainMap.spatialReference;
            var _srf = window.parent.mainMap.spatialReference;
            if (_srf) {
                param.outSpatialReference = new SpatialReference(_srf.wkid);
            }

            //从左侧面板执行查询需要限制查询范围，而从搜索框中不需要指定范围
            if (isFromLeft) {
                //param.geometry=window.parent.mainMap.extent;
                var ext = window.parent.mainMap.extent;
                if (ext)
                    param.geometry = new Extent(ext.xmin, ext.ymin, ext.xmax, ext.ymax, new SpatialReference(_srf.wkid));
            } else {
                param.geometry = null;
            }

            queryTask.execute(param,function(results){
                //
                if(results.features.length<1){
                    //
                    appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"没有找到指定条件的兴趣点."});
                    appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,{});
                }else{
                    //解决在IE8下出现  【不能执行已释放Script的代码】 BUG
                    //
                    //window.parent.queryInfos.push({"results":results});
                    //window.parent.queryInfos.push({"fields":widgetConfig.fields});
                    //
                    //queryInfos.push({"results":results});
                    //queryInfos.push({"fields":widgetConfig.fields});
                    //appEvent.dispatchAppEvent("testInfo",queryInfos);
                    //
                    //

                    //
                    $("#homes").hide();
                    $("#results").show();
                    //
                    queryResult=new QueryResult(map);
                    queryResult.setConfig(widgetConfig);
                    //
                    queryResult.setPagers(dom.byId("pagers"));
                    //
                    queryResult.setContent(dom.byId("contents"));
                    //
                    queryResult.loadQueryResults(results.features);
                    //
                    queryResult.setAppEvent(appEvent);
                    //
                    queryResult.hideBusyIndicator();
                    //
                    //
                    //var jsonResult=JSON.stringify(results);
                    //window.localStorage.setItem(QUERY_RESULT_KEY,jsonResult);
                    //if(sniff("ie")>7){
                    //    //
                    //    var resultsJson=JSON.stringify(results);
                    //    //
                    //    cookie(QUERY_RESULT_KEY,resultsJson,{expires:1});
                    //    //cookie();
                    //    //window.parent.queryData= $.extend(true,{},results);//lang.clone(results);
                    //    //window.parent.queryFields= $.extend(true,{},results);//lang.clone(widgetConfig.fields);
                    //}else{
                    //    //
                    //    window.parent.queryData=lang.clone(results);
                    //    window.parent.queryFields=lang.clone(widgetConfig.fields);
                    //}

                    //window.parent.queryData=lang.clone(results);
                    //window.parent.queryFields=lang.clone(widgetConfig.fields);

                    //window.parent.queryData=results;
                    //window.parent.queryFields=widgetConfig.fields;
                    //window.open("result.html","widgetContainer");
                    //
                    //appEvent.dispatchAppEvent(appEvent.TAB_PAGE_CHANGED,"POI查询结果");
                }
            },function(error){
                //
                //alert("查询兴趣点失败！");
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"查询兴趣点失败"});
                appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,"hideBusyIndicator");
            });
            //
        }

        /**
         *
         * {
              "name":"旅游",
              "code":"12",
              "icon":"",
         }*/
        //
        var lastCell=null;
        var lastConfig=null;
        function _createCell(info,row){
            //
            var template="<div class='image'><img id='${iid}' src='${icon}'></div><label>${name}</label>";

            var content=string.substitute(template,{iid:info.id,icon:info.icon,name:info.name});
            //alert(content);
            var cellPros={
                innerHTML:content
                //class:"cell-label"
            };

            var cell=domConstruct.create("td",cellPros,row,"last");
            //
            domAttr.set(cell,"class","cell-label");
            //
            on(cell,"click",function(e){
                //debugger;

                if(lastCell&&lastConfig){
                    //
                    var lastId="#"+lastConfig.id;
                    $(lastId).attr("src",lastConfig.icon);
                }
                //
                var imgId="#"+info.id;
                $(imgId).attr("src",info.icon2);
                //
                lastCell=cell;
                lastConfig=info;
                //
                ;//01
                startLeftPoiQuery(info);
                appEvent.dispatchAppEvent(appEvent.SHOW_BUSY_INDICATOR,"showBusyIndicator");
                //以下下发在IE中报Bug
                //appEvent.dispatchAppEvent(appEvent.QUERY_POI_FROM_LEFT_INPUT,info);
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
        var cellCount=3;
        //
        function initPoiList(infos){
            var infoCount=infos.length;
            var table=dom.byId("poilist");

            //var row=_createRow(table);
            var row=null;
            for(var i=0;i<infoCount;i++){
                //
                var info=infos[i];
                if(i%cellCount==0){
                    //
                   row=_createRow(table);
                }
                _createCell(info,row);
            }
        }
        //
       window.showResults=function(data){
           var config=data.config;
           var results=data.results;
           var type=data.type;
           ;
           //
           //map.graphics.clear();
           //
           if(type==="poi"){
               //
               $("#homes").hide();
               $("#info-results").hide();
               $("#results").show();
               //
               queryResult=new QueryResult(map);
               //
               queryResult.setConfig(config);
               queryResult.setZoomLevel(zoomLevel);
               queryResult.setBufferGraName(data.bufferGraName);
               queryResult.setPagers(dom.byId("pagers"));
               //
               queryResult.setContent(dom.byId("contents"));
               //
               queryResult.loadQueryResults(results.features);
               //
               queryResult.setAppEvent(appEvent);
               //
               queryResult.hideBusyIndicator();
           }else if(type==="drive"){
               //
               $("#homes").hide();
               $("#results").hide();
               $("#info-results").show();
               routeResult=new RouteResult(map);

               routeResult.setConfig(config);
               routeResult.setContent(dom.byId("info-results"));

               //routeResult.setAppEvent(appEvent);
               routeResult.setAppEvent(appEvent);
               routeResult.loadRouteResults(results);
               routeResult.addGraphic(data.start);
               routeResult.addGraphic(data.end);
               routeResult.hideBusyIndicator();
           }else{
               //
           }
       };
    });