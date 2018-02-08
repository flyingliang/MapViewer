/**
 * Created by Esri on 2015/4/14.
 */
require(["dojo/dom","dojo/on",
        "dojo/dom-construct",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "dojo/dom-attr",
        "dojo/sniff",
        "dojo/mouse",


        "esri/urlUtils",
        "esri/config",
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

        "widgets/network/RouteResult",

        "dojo/domReady!"],
    function(dom,on,domConstruct,Array,lang,string,domAttr,sniff,mouse,urlUtils,esriConfig,Graphic,GraphicsLayer,RouteTask,RouteParameters,FeatureSet,
             SpatialReference,SimpleMarkerSymbol,SimpleLineSymbol,Color,NATypes,Polyline,SimpleRenderer,
             QueryTask,Query,RouteResult){
        //golbal vars
        //var appEvent=null;
        //
        var widgetConfig=null;
        var map=null;
        var configManager=null;
        var routeLayer=null;
        var routeTask=null;
        var routes=[];
        //
        var passStops=[];
        //
        /**
         * 时间最短类型
         **/
        //var IMPEDANCETYPE_TIME="time";
        /**
         * 距离最短类型
         **/
        //var IMPEDANCETYPE_DISTANCE="distance";
        //
        var ImpedanceType=(function(){
            //
            return {
                //DIST
                DISTANCE:"distance",
                TIME:"time"
            };
        }());
        //
        var impedanceType=ImpedanceType.TIME;

        var symbolManager=null;
        //
        var addStopClickHandler=null;
        var addBarrierClickHandler=null;
        /**途径点*/
        var stopGraphics=[];
        /**障碍点*/
        var barrierGraphics=[];
        //
        //
        var appEvent=null;
        //symbols
        var startSymbol=null;
        var endSymbol=null;
        var passSymbol=null;
        //
        var startGraphic=null;
        var endGraphic=null;
        //
        var graphicIndex=-1;
        //
        var graLayerId="networkLayer";
        //
        var proxyUrl="../../../proxy2.jsp";
        //
        var queryTask=null;
        //
        var drivePointInfo=null;
        var  tipsData=null;
        //
        /**所有途径点名称*/
        var passPointNames=[];//

        var isPassNotInput=false;
        //
        var routeResult=null;
        //
        var _resultLayer=null;
        /**init */
        (function(){
            //
            map=window.parent.mainMap;
            symbolManager=window.parent.symbolManager;
            //
            configManager=window.parent.configManager;
            if(configManager){
                //loadConfigWhitCallback是一个请求配置文件，成功了执行configLoadedHandler
                configManager.loadConfigWhitCallback("widgets/network/config.json",configLoadedHandler,configLoadErrorHandler);
            }
            //
            //
            appEvent=window.parent.appEvent;
            if(appEvent){
                //
                //appEvent.addAppEventListener(appEvent.DRAW_START_POINT,setStartPointHandler);
                //appEvent.addAppEventListener(appEvent.DRAW_END_POINT,setEndPointHandler);
                //清空图层
                appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,"removeLayer");
                //
                //appEvent.addAppEventListener(appEvent.START_DRIVE_ANALYST,executeNetworkAnalystHandler)
            }
            //
            tipsData=window.parent.tipsData;
            //
            if(tipsData){
                //
                $("#drive-start").typeahead({ source:tipsData ,items:12});
                $("#drive-end").typeahead({ source:tipsData ,items:12});
            }
            //
            //if(sniff("chrome")||sniff("safari")){
            //    $("#drive-start").addClass("input-box-chrome");
            //    $("#drive-end").addClass("input-box-chrome");
            //}else{
            //    $("#drive-start").addClass("input-box");
            //    $("#drive-end").addClass("input-box");
            //}
            //
            //
           // var infoResult=window.parent.extraData;
           // //
           //if(infoResult){
           //    //
           //    routeResult=new RouteResult(map,dom.byId("results"));
           //    routeResult.setConfig(widgetConfig);
           //    routeResult.setAppEvent(appEvent);
           //    infoResult.loadRouteResults(infoResult);
           //}
            //
        })();
        //
        function getPassPoitsQuery(){
            //
            var result="";
            var passes=$(".passes");
            Array.forEach(passes,function(pass){
                //
                var passInfo=$(pass).val();
                if(passInfo){
                    //
                    result=result+string.substitute(widgetConfig.poi.expression,{name:lang.trim(passInfo)})+" OR ";
                    passPointNames.push(passInfo);
                }else{
                    //
                    isPassNotInput=true;
                }
            });
            //
            //if(isPassNotInput){
            //    //
            //    alert("请输入途经点名称!");
            //}
            //
            return result;
        }
        //
        //function isPassPointName(name){
        //    //
        //    //
        //    var nameCount=passPointNames.length;
        //    for(var i=0;i<nameCount;i++){
        //        //
        //
        //    }
        //    //Array.forEach(passPointNames,function(passName){
        //    //    //
        //    //    if(passName)
        //    //});
        //}


        //当点击交换时，起点和终点交换
        $("#driveChange").click(function (){
            startValue=$("#drive-start").val();
            endValue=$("#drive-end").val();
            $("#drive-start").val(endValue);
            $("#drive-end").val(startValue);
            })

        /**
         * 执行路径分析
         * */
        function executeQuery(){
            var startValue=$("#drive-start").val();
            var endValue=$("#drive-end").val();
            var startVal=startValue;
            var endVal=endValue;
            //
            var data={
                start:startVal,
                end:endVal

            };
            //
            stopGraphics=[];
            //
            appEvent.dispatchAppEvent(appEvent.SHOW_BUSY_INDICATOR,{});
            appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,{isClear:true});
            //
            domConstruct.empty("results");
            executeNetworkAnalystHandler(data);
        }

        /**执行驾车出行*/
        /* on(dom.byId("query"),"click",function(){
         //
         executeQuery();
         });*/
        //
        on(dom.byId("ctn-search"),"click",function(event){
            //
            executeQuery();
        });
        on(dom.byId("ctn-search"),mouse.enter,function(event){
            //
            $("#query").css("color","#ffffff")
        });
        on(dom.byId("ctn-search"),mouse.leave,function(event){
            //
            $("#query").css("color","#848484");
        });

        //
        function showInfoTips(message){
            //
            //alert(message);
            appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:message});
            appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,{});
        }
        /**
         * @param {Object}  data
         * @return {void}
         *@example:
         * data {
         *  "start":"",
         *  "end":""
         * }
         * */
        function executeNetworkAnalystHandler(data){
            //清除上一次查询参数
            clearStopGraphics();
            drivePointInfo=data;
            //
            isPassNotInput=false;
            passPointNames=[];
            //
            if(!data.start){
                //
                showInfoTips("请输入路径分析起点");
                return;
            }
            if(!data.end){
                //
                showInfoTips("请输入路径分析终点！");
                return;
            }

            var whereCause="";
            //
           /* var startCase="NAME LIKE '%"+lang.trim(data.start)+"%' OR ";
            var endCause="NAME LIKE '%"+lang.trim(data.end)+"%'";*/
            var startCase=string.substitute(widgetConfig.poi.expression,{name:lang.trim(data.start)})+" OR ";
            var endCause=string.substitute(widgetConfig.poi.expression,{name:lang.trim(data.end)});

            var passes=getPassPoitsQuery();
            //
            if(isPassNotInput){
                //
                //alert("请输入途径点");
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"请输入途径点"});
                appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,{});
            }else{
                //
                //
                var nameField=widgetConfig.poi.displayField;
                whereCause=startCase+passes+endCause;
                //
                var param=new Query();
                param.where=whereCause;
                param.outFields=[nameField];
                param.returnGeometry=true;

                //param.geometry=window.parent.mainMap.extent;
                param.outSpatialReference=map.spatialReference;
                //
                //var isPassPointExists=true;
                //
                //var noExists=[];
                //
                var resultNames=[];

                queryTask.execute(param,function(resultSet){
                    //
                    var features=unique(resultSet.features);
                    //

                    //
                    Array.forEach(features,function(feature){
                        //
                        var graName=feature.attributes[nameField];
                        //
                        resultNames.push(graName);
                        //
                        if(graName===drivePointInfo.start){
                            //
                            setStartPointHandler(feature);
                        }else if(graName===drivePointInfo.end){
                            //
                            setEndPointHandler(feature);
                        }else{
                            //为途径点
                            if(isPassPointName(graName)){
                                //
                                setPassPointHandler(feature);
                            }
                        }
                    });
                    //
                    //判断输入的途经点是否存在
                    var noExists=findDifferentPoints(passPointNames,resultNames);
                    if(noExists.length>0){

                        //alert("你输入的途经点【"+noExists.join(",")+"】不存在！");
                        var temp="你输入的途经点【"+noExists.join(",")+"】不存在！";
                        appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:temp});

                        appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,{});
                    }else{
                        //
                        executeNetworkAnalyst();
                    }

                },function(error){
                    //
                    //alert(error);
                    appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:error.toString()});

                    //
                    appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,"hideBusyIndicator");
                });
            }
        }
        /**获取不存在的途径点*/
        function findDifferentPoints(arr1,arr2){
            //
            var result=[];
           if(arr1&&arr2){
               //
               //
               var itemCount=arr1.length;
               for(var i=0;i<itemCount;i++){
                   //
                   var item=arr1[i];
                   if(!hasItem(arr2,item)){
                       //
                       result.push(item);
                   }
               }
           }
            //
            return result;
        }
        function hasItem(array,item){
            //
            var state=false;
            if(array&&item){
                //
                var itemCount=array.length;
                for(var i=0;i<itemCount;i++){
                    //
                    if(array[i]===item){
                        state=true;
                        break;
                    }
                }
            }
            return state;
        }
        //
        function isPassPointName(name){
            //
            var nameCount=passPointNames.length;
            var state=false;
            for(var i=0;i<nameCount;i++){
                //
                var passName=passPointNames[i];
                if(passName===name){
                    //
                    state=true;
                    break;
                }
            }
            return state;
        }
        /**可以添加途径点的数量*/
        var maxPassCount=5;
        var passIndex=0;
        //
        var passesNames=[];
        function setPassPointHandler(graphic){
            //
            var passGraphic=graphic;
            passGraphic.setSymbol(passSymbol);
            var data={
                layerId:graLayerId,
                graphic:passGraphic
            };
            //
            //

            //
            //if(!isGraIn(stopGraphics,graphic.attributes["NAME"])){
            //
            //    appEvent.dispatchAppEvent(appEvent.SHOW_GRAPHIC_RESULT,data);
            //    stopGraphics.push(passGraphic);
            //    passesNames.push(graphic.attributes["NAME"]);
            //}
            //
            //var name=getGraphicName(passesNames,graphic.attributes["NAME"]);
            ////
            //if(!name){
            //    appEvent.dispatchAppEvent(appEvent.SHOW_GRAPHIC_RESULT,data);
            //    stopGraphics.push(passGraphic);
            //    passesNames.push(graphic.attributes["NAME"]);
            //}
            appEvent.dispatchAppEvent(appEvent.SHOW_GRAPHIC_RESULT,data);
            stopGraphics.push(passGraphic);
            //
        }
        //
        function getGraphicName(source,graName){
            //
            var status=false;
            if(source&&source.length>1&&graName){
                //
                var itemCount=source.length;
                for(var i=0;i<itemCount;i++){
                    //
                    var  item=source[i];
                    if(item===graName){
                        status=true;
                        break;
                    }
                }
            }
            //
            return status;
        }
        /**设置路径分析起点*/
        function setStartPointHandler(graphic){
            startGraphic=graphic;
            startGraphic.setSymbol(startSymbol);
        }

        /**设置路径分析终点*/
        function setEndPointHandler(graphic){

            endGraphic= graphic;
            endGraphic.setSymbol(endSymbol);
            //console.log("add end point to analysis...");
        }
        //
        //
        function configLoadedHandler(data){
            //
            widgetConfig=data;
            //
            if(symbolManager){
                //
                startSymbol=symbolManager.createPictureMarkerSymbol(widgetConfig.startsymbol);
                endSymbol=symbolManager.createPictureMarkerSymbol(widgetConfig.endsymbol);
                passSymbol=symbolManager.createPictureMarkerSymbol(widgetConfig.passsymbol);
            }
            //
            queryTask=new QueryTask(widgetConfig.poi.url);
            //
            //
            //console.log(widgetConfig.poiUrl);
            //
            routeTask=new RouteTask(data.routeTaskURL);
            //
            routeTask.on("solve-complete",showRouteAnalysisResults);
            routeTask.on("error",routeErrorHandler);
            //
            //
            //var layer=new GraphicsLayer();
            routeResult=new RouteResult(map);
            //routeResult.setResultLayer(layer);
            routeResult.setConfig(widgetConfig);
            routeResult.setAppEvent(appEvent);
            //
            routeResult.setContent(dom.byId("results"));
        }

        /**解析路径分析结果，并绘制UI元素*/
        function showRouteAnalysisResults(result){
            //
            //clearStopGraphics();
            //
            if(result.routeResults&&result.routeResults.length<1){
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"没有找到合适的路线！"});
            }else{
                //
                domConstruct.empty("results");
                routeResult.loadRouteResults(result);
                //
                addGraphic(startGraphic);
                addGraphic(endGraphic);
            }
            appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,{});
            //clearStopGraphics();
        }
        /**添加Graphic到地图中*/
        function addGraphic(graphic){
            //
            var data={
                layerId:graLayerId,
                graphic:graphic
            };
            appEvent.dispatchAppEvent(appEvent.SHOW_GRAPHIC_RESULT,data);
        }
        //
        function routeErrorHandler(error){
            //
            appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,{});
            //alert("执行路径分析失败！");
            appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"执行路径分析失败"});

            console.log("execute route analyst faild in network.js file.\t"+error.toString());
        }

        function configLoadErrorHandler(error){
            //
            console.log("load config.json failed. in network.js file\t"+error.toString());
        }
        //
        /**add item */
        function addPassPointItem(domNode){
        //
        //    var iidd="container"+Math.round(Math.random()*100);
            var container=domConstruct.create("div",{
                //class:"hor-box"
            },domNode);

            //
            domAttr.set(container,"class","hor-box");

            //
            var passPoint=domConstruct.create("img",{
                src:"../../assets/images/drive/start.png"
            },container);
            //
            domAttr.set(passPoint,"class","pass-img");
            //
            var passInput=domConstruct.create("input",{
                //class:"input-box passes",
                type:"text",
                placeholder:"输入途径点",
                "data-provide":"typeahead",
                "autocomplete":"off"

            },container);
            //
            //domAttr.set(passInput,"class","input-box passes");
            //
            //on(passInput,"change",function(event){
            //    //
            //
            //    var startCase=string.substitute(widgetConfig.poi.expression,{name:lang.trim($(this).val())});
            //    var nameField=widgetConfig.poi.displayField;
            //    //whereCause=startCase+passes+endCause;
            //    //
            //    var param=new Query();
            //    param.where=startCase;
            //    param.outFields=[nameField];
            //    param.returnGeometry=false;
            //    param.num=12;
            //
            //    //param.geometry=window.parent.mainMap.extent;
            //    param.outSpatialReference=map.spatialReference;
            //    //
            //    queryTask.execute(param,function(resultSet){
            //        //
            //        var sources=[];
            //        Array.forEach(resultSet.features,function(feature){
            //            //
            //            sources.push(feature.attributes[nameField]);
            //        });
            //        $(passInput).typeahead({ source:sources,items:12});
            //    });
            //
            //});
            //
            $(passInput).typeahead({ source:tipsData,items:12});

            //console.log(window.tipsData);
            //移除途径点
            var imgMinus=domConstruct.create("img",{
                src:"../../assets/images/drive/minus.png",
                //class:"btn-minus",
                title:"删除途径点"
            },container);
            //
            //domAttr.set(imgMinus,"class","btn-minus");
            //
            //if(sniff("chrome")||sniff("safari")){
            //    domAttr.set(passInput,"class","input-box-chrome passes");
            //    domAttr.set(imgMinus,"class","btn-minus-chrome");
            //
            //}else{
            //    domAttr.set(passInput,"class","input-box passes");
            //    domAttr.set(imgMinus,"class","btn-minus");
            //}
            domAttr.set(passInput,"class","input-box passes");
            domAttr.set(imgMinus,"class","btn-minus");

            on(imgMinus,"click",function(event){
                //
                //console.log("img delete licked");
                domConstruct.destroy(container);
                passIndex=passIndex-1;
/*
                console.log("graphic index::\t"+graphicIndex);

                console.log("array length::\t "+stopGraphics.length);*/
            });
        }
        //
        //添加途径点
        on(dom.byId("add-point"),"click",function(event){
            //
            if(passIndex<maxPassCount){
                //
                var passesNode=dom.byId("passes");
                addPassPointItem(passesNode);
                passIndex=passIndex+1;
            }else{
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"添加的途经点数量已经超过限制的数量"});
            }
        });

        var multiPassPoints=[];
        /**
         * 先查询 地点，地点是模糊查询，可能查出多个起点 或 终点
         *  故而需要过滤，完全等于输入的查询信息。
         * @param origArr
         * @returns {Array}
         */
        function unique(origArr) {
            multiPassPoints=[];
            var newArr = [],
                origLen = origArr.length,
                isFound,
                x, y;

            for ( x = 0; x < origLen; x++ ) {
                isFound = undefined;
                for (y = 0;y < newArr.length; y++ ) {
                    if ( origArr[x].attributes[widgetConfig.poi.displayField] === newArr[y].attributes[widgetConfig.poi.displayField]) {
                        isFound = true;
                        //
                        multiPassPoints.push(origArr);
                        break;
                    }
                }
                if (!isFound){
                    newArr.push(origArr[x]);
                }
            }
            return newArr;
        }

        //
       /* function removeItem(items,item){
            //
            if(items&&item){
                //
                var itemCount=items.length;
                for(var i=0;i<itemCount;i++){
                    //
                    var element=items[i];

                    if(item===element){

                        items.splice(i,1);
                        break;
                    }
                }
            }
        }*/
        /**添加路径分析途径点*/
       /* function addStopForRoute(event){
            //
            removeEventHandlers();
            addGraphicTo(event,stopGraphics)
        }*/
        //
        /**添加障碍点*/
       /* function addBarrierForRoute(event){
            //
            addGraphicTo(event,barrierGraphics);
        }*/
        //
        //
        function clearDomNodeStyle(style){
            //$("#dist-short").removeClass("distance");

            var items=$(style);
            Array.forEach(items,function(item){
                //
                $(item).removeClass(style.substr(1,style.length));
            });
            //
        }
        //
        function replaceDomStyle(domNode,oldStyle,newStyle){
            //
            $(domNode).removeClass(oldStyle);
            $(domNode).addClass(newStyle)
        }
        //
        var  shortDistance=false;
        var  shortTime=false;
        //
        var distStyle="distance";
        var distClicked="distance-clicked";
        //
        $("#dist-short").click(function(){
            //
           /* clearDomNodeStyle(".distance");
            clearDomNodeStyle(".distance-clicked");*/
            //
            replaceDomStyle($(this),distStyle,distClicked);
            replaceDomStyle($("#time-short"),distClicked,distStyle);
            impedanceType=ImpedanceType.DISTANCE;
            //$(this).addClass("distance-clicked");
            //$("#time-short").addClass("distance");
        });

        $("#time-short").click(function(){
            //
            //clearDomNodeStyle(".distance");
            //clearDomNodeStyle(".distance-clicked");
            //
            //$(this).addClass("distance-clicked");
            //$("#dist-short").addClass("distance");
            replaceDomStyle($(this),distStyle,distClicked);
            replaceDomStyle($("#dist-short"),distClicked,distStyle);
            //
            impedanceType=ImpedanceType.TIME;
        });
        //
        //
        var speedStyle="speed";
        var speedStyleClicked="speed-clicked";

        $("#no-speed").click(function(){
            //
            var hasStyle=$(this).hasClass(speedStyle);
            if(hasStyle){
                //
                noHighWay=true;
                replaceDomStyle($(this),speedStyle,speedStyleClicked);
            }else{
                //
                noHighWay=false;
                replaceDomStyle($(this),speedStyleClicked,speedStyle)
            }
        });
        //
        var noHighWay=false;
        //
        function executeNetworkAnalyst(){
            //
            //设置代理
            //urlUtils.addProxyRule({
            //    urlPrefix: urlPrefix,
            //    proxyUrl:proxyUrl
            //});
            esriConfig.defaults.io.proxyUrl = proxyUrl;
            esriConfig.defaults.io.alwaysUseProxy = false;
            //add start
            //
            if(!startGraphic){
                //
                //alert("您输入的起点【"+$("#drive-start").val()+"】不存在");
                var msg="您输入的起点【"+$("#drive-start").val()+"】不存在";
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:msg});

                appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,{});
                return ;
            }
            if(!endGraphic){
                //
                var endInfo="您输入的终点【"+$("#drive-end").val()+"】不存在..";
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:endInfo});
                appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,{});
                return;
            }
            stopGraphics.unshift(startGraphic);//Add start point to stopGraphics(Array) as the first item.
            stopGraphics.push(endGraphic);//Add end point to stopGraphics(Array) as the last item.

            var routeParams = new RouteParameters();

            routeParams.stops = new FeatureSet();
            routeParams.outSpatialReference =map.spatialReference;

            routeParams.returnDirections=true;

            routeParams.outputLines="esriNAOutputLineTrueShape";//NATypes.OutputLine.TRUE_SHAPE;
            console.log(NATypes.OutputLine.TRUE_SHAPE);

            routeParams.stops.features=stopGraphics;

            routeParams.directionsLengthUnits="esriMeters";
            //
            if(barrierGraphics.length>0){
                //
                routeParams.barriers = new FeatureSet();
                routeParams.barriers.features=barrierGraphics;
            }
            //
             //时间最短
             if(impedanceType==ImpedanceType.TIME){
             //
                 var timeImpedance=widgetConfig.costs.time;
                 routeParams.impedanceAttribute=timeImpedance;

             }else if(impedanceType===ImpedanceType.DISTANCE){
                 //
                 //距离最短
                 var distanceImpedance=widgetConfig.costs.distance;
                 routeParams.impedanceAttribute=distanceImpedance;

             }
            //noHighWay=$("#no-speed").attr("highway");
            //
            var noHighWayAttrName=widgetConfig.restrictions.highway;
            if(noHighWay){
                //
                routeParams.restrictionAttributes=[noHighWayAttrName];
            }
            //
            //console.log("stops length:\t"+stopGraphics.length);
            routeTask.solve(routeParams);
        }
        //
        function clearStopGraphics(){
            //
            stopGraphics=[];
            barrierGraphics=[];
            startGraphic=null;
            endGraphic=null;

        }
       //
        $("#tab-bus").click(function(){
            //
            $("#bus").show();
            $("#drive").hide();
            //
            $("#arrow-left").show();
            $("#arrow-right").hide();
            //
            changeStyle("bus");

        });
        //
        $("#tab-drive").click(function(){
            //
            $("#bus").hide();
            $("#drive").show();
            $("#arrow-left").hide();
            $("#arrow-right").show();

            changeStyle("drive");
            //
            //domConstruct.empty("");
            //layerMan.loadLayers();
        });
        //
        var driveClicked="tab-drive-clicked";
        var busClicked="tab-bus-clicked";
        var tabDrive="tab-drive";
        var tabBus="tab-bus";
        //
        function removeStyles(){
            //
            $("#tab-bus").removeClass(busClicked);
            $("#tab-bus").removeClass(tabBus);
            $("#tab-drive").removeClass(tabDrive);
            $("#tab-drive").removeClass(driveClicked);
        }

        function changeStyle(type){
            //
            removeStyles();
            if(type==="drive"){
                //removeStyles();
                $("#tab-drive").addClass(driveClicked);
                $("#tab-bus").addClass(tabBus);

            }else if(type==="bus"){
                //
                $("#tab-drive").addClass(tabDrive);
                $("#tab-bus").addClass(busClicked);
            }
        }
    });
//
/**
 * 路网分析的决定类型，IMPEDANCETYPE_TIME（时间最短）和IMPEDANCETYPE_DISTANCE（距离最短）
 **/
/*
var impedanceType=null;
function networkAttributeSelected($item){

    impedanceType=$item.value;
}*/
