/**
 * Created by Esri on 2015/4/1.
 */
//
define(["dojo/dom","dojo/on","dojo/_base/declare",
        "dojo/_base/array",
        "dojo/sniff",
        "esri/toolbars/draw",
        "esri/graphic",
        "esri/geometry/Point",
        "esri/SpatialReference",

        "esri/layers/GraphicsLayer",
        "esri/geometry/geometryEngine",
        "esri/geometry/Geometry",
        "viewer/ConfigManager",
        "viewer/SymbolManager",
        "esri/geometry/Polyline"
    ],
    function(dom,on,declare,Array,sniff,Draw,Graphic,Point,SpatialReference,
             GraphicsLayer,geometryEngine,Geometry,ConfigManager,SymbolManager,Polyline)
    {
        //
        var drawTool=null;
        var showPt=null;
        //
        var layer=null;
        var layerId="lineLayer";
        ////
        var symbolManager=null;
        var widgetConfig=null;
        //
        var unitScale=5000;
        var largeUnitLabel="公里";//公里
        var smallUnitLabel="米";//米

        var largeUnitConversion=1000;
        //
        var layerClickHandler=null;
        //
        var lastPoint=null;
        //
        //
        var _map=null;
        var mapClickHandler=null;
        //
        var lineSelf=null;
        var mapDoubleClickHandler=null;
        var graphicId=null;
        //
        var textSymbol=null;
        var totalSymbol=null;
        //
        var vertexGras=[];

        function getGeometrySymbol(type){
            //
            var symbol=null;
            switch(type){
                case "polyline":
                    symbol=symbolManager.createSimpleLineSymbol(widgetConfig.lineSymbol);
                    break;
                case "polygon":
                    //symbol=symbolUtil.simpleFillSymbol();
                    symbol=symbolManager.createSimpleFillSymbol(widgetConfig.fillSymbol);
                    break;
                default:
                    break;
            }
            return symbol;
        }
        //
        //
        function showMeasureResultByGraphic(symbol,distance,extraLabel){
            //
            //
            var info="";
            if(distance>unitScale){
                //
                var convertDis=distance/largeUnitConversion;
                //
                info=convertDis.toFixed(3)+largeUnitLabel;
            }else{
                //
                info=distance.toFixed(3)+smallUnitLabel;
            }
            //
            info=extraLabel+info;
            //
            symbol.setText(info);
            var attributes= {id:graphicId};
            var graphic=new Graphic(showPt,symbol,attributes);
            layer.add(graphic);
            vertexGras.push(graphic);
        }
        //
        //
        var totalDistance=0;
        function showMeasureResultInIE(distance,extraLabel){
            //
            var info="";
            if(distance>unitScale){
                //
                var convertDis=distance/largeUnitConversion;
                //
                info=convertDis.toFixed(3)+largeUnitLabel;
            }else{
                //
                info=distance.toFixed(3)+smallUnitLabel;
            }
            info=extraLabel+info;
            //
            return info;
        }
       //

        var module=declare(null,{
            //
            constructor:function(map){
                //
                drawTool=new Draw(map);
                //
                _map=map;
                //
                lineSelf=this;
                //
                var configManager=new ConfigManager(function(data){
                },function(error){
                });
                //
                configManager.loadConfigWhitCallback("widgets/measure/config.json",this._configLoadedHandler,this._configLoadErrorHandler);
                drawTool.on("draw-end",this._showMeasureResults);
            },
            //
            _showMeasureResults:function(event){
                //
                drawTool.deactivate();
                //
                lineSelf._executeChangeStyle();
                //
                lastPoint=null;
                lineSelf._removeEventListeners();
                _map.setMapCursor("default");
                var geometry = event.geometry;

                var length = geometry.paths[0].length;
                showPt = new Point(geometry.paths[0][length-1],mainMap.spatialReference);

                //Convert wkid:4490 to wkid:4326 For geometryEngine only support 4326 and 3857(100120)
                if(geometry.spatialReference.wkid == 4490) {
                    geometry.setSpatialReference(new SpatialReference(4326));
                }

                var distance=geometryEngine.geodesicLength(geometry,9001);

                showMeasureResultByGraphic(totalSymbol,distance,"总长度: ");
                //
                var attributes={id:graphicId};
                var graphic = new Graphic(geometry, getGeometrySymbol(geometry.type),attributes);

                layer.add(graphic);
                vertexGras.push(graphic);
                //
                totalDistance=distance;
                //
                //
                //if(sniff("ie")){
                //    showMeasureResultInIE(totalSymbol,distance,"总长度: ")
                //
                //}else{
                //    showMeasureResultByGraphic(totalSymbol,distance,"总长度: ");
                //}
            },
            _configLoadedHandler:function(data){

                symbolManager=new SymbolManager();
                widgetConfig=data;
                //
                textSymbol=symbolManager.createTextSymbol(widgetConfig.textSymbol);
                totalSymbol=symbolManager.createTextSymbol(widgetConfig.totalSymbol);
            },
            _configLoadErrorHandler:function(error){
                //
                console.log("read config file error in LineTool.js.");
            },
            //
            _setStartGraphic:function(geometry){
                //
                var symbol=symbolManager.createPictureMarkerSymbol(widgetConfig.startSymbol);
                //
                var attributes= {id:graphicId};
                var gra=new Graphic(geometry,symbol,attributes);
                //
                layer.add(gra);
                vertexGras.push(gra);
            },
            //
            _setEndGraphic:function(geometry){
                var symbol=symbolManager.createPictureMarkerSymbol(widgetConfig.endSymbol);

                var attributes= {id:graphicId,name:"close"};
                var gra=new Graphic(geometry,symbol,attributes);
                //
                layer.add(gra);
                vertexGras.push(gra);
            },
            //
            _setVertexGraphic:function(geometry){
                //
                var symbol=symbolManager.createSimpleMarkerSymbol(widgetConfig.vertexSymbol);
                var attributes= {id:graphicId};

                var gra=new Graphic(geometry,symbol,attributes);
                layer.add(gra);
                vertexGras.push(gra);
            },
            //
            _addEventListeners:function(){
                //
                mapClickHandler= _map.on("click",function(event){

                    var current=event.mapPoint;
                    //
                    if(!lastPoint){
                        // set start
                        lineSelf._setStartGraphic(current);
                    }
                    //
                    if(lastPoint&&current){
                        //
                        var distance=lineSelf._measurePartLength(lastPoint,current);
                        showPt=current;
                        lineSelf._setVertexGraphic(current);
                        //
                        showMeasureResultByGraphic(textSymbol,distance,"");
                    }
                    //
                    lastPoint=current;
                    //
                });
                //
                mapDoubleClickHandler=_map.on("dbl-click",function(event){
                    //
                    var geometry=event.mapPoint;
                    lineSelf._setEndGraphic(geometry);
                    lineSelf._setCloseGraphic(geometry);
                    //
                    //
                    if(sniff("ie")){
                        var info=showMeasureResultInIE(totalDistance,"总长度：");
                        alert(info);
                    }
                    mapDoubleClickHandler.remove();
                    //
                });
                layerClickHandler= on(layer,"click",function(event){
                    //
                    var gra=event.graphic;

                    if(gra&&gra.attributes){
                        //
                        if(gra.attributes["name"]==="close"){
                            //
                            //layer.remove(gra);
                            lineSelf._removeMeasureResult(gra.attributes["id"]);
                        }
                    }
                });

            },
            _setCloseGraphic:function(geometry){
                //
                var symbol=symbolManager.createPictureMarkerSymbol(widgetConfig.closeSymbol);
                var attributes={id:graphicId,name:"close"};
                var gra=new Graphic(geometry,symbol,attributes);
                //
                layer.add(gra);
                vertexGras.push(gra);
            },

            _removeMeasureResult:function(graphicId){
                //
               /* var gras=vertexGras;
                console.log(gras);*/
                Array.forEach(vertexGras,function(graphic,iindex){
                    //
                    var attributes=graphic.attributes;
                    if(attributes&&attributes["id"]===graphicId){
                        //
                        layer.remove(graphic);
                        //vertexGras.splice(iindex,1);
                    }
                });
                //
                this._executeChangeStyle();
            },
            _executeChangeStyle:function(){
                //
                if(this.changeItemStyle){
                    this.changeItemStyle();
                }
            },
            _removeEventListeners:function(){
                //
                /*if(layerClickHandler){
                    layerClickHandler.remove();
                }*/
                if(mapClickHandler){
                    //
                    mapClickHandler.remove();
                }
                /*if(mapDoubleClickHandler){
                    //
                    mapDoubleClickHandler.remove();
                }*/
            },
            /**修改工具UI图标状态回调函数*/
            changeItemStyle:null,

            activate:function(){
                //
                graphicId="gra"+Math.floor(Math.random()*500).toFixed(0);
                //
                //console.log("graphicId::\t"+graphicId);
                drawTool.activate(Draw.POLYLINE);
                this._createMeasureLayer(layerId);
                this._addEventListeners();
                //
                this.isActive=true;
            },

            deactivate:function(){

                this._removeEventListeners();
                this.isActive=false;
                if(layer){
                    //
                    _map.removeLayer(layer);
                }
                vertexGras=[];
                drawTool.deactivate();
            },

            _measurePartLength:function(startGeo,endGeo){

                var line=new Polyline(_map.spatialReference);
                /*var start=[startGeo.x,startGeo.y];
                //
                var end=[endGeo.x,endGeo.y];*/
                var path=[];
                path.push(startGeo);
                path.push(endGeo);
                //
                line.addPath(path);

                //Convert wkid:4490 to wkid:4326 For geometryEngine only support 4326 and 3857(100120)
                if(line.spatialReference.wkid == 4490) {
                    line.setSpatialReference(new SpatialReference(4326));
                }
                var distance=geometryEngine.geodesicLength(line,9001);
                return distance;
            },

            _createMeasureLayer:function(layerId){
                //
                if(layerId){
                    //
                    layer=_map.getLayer(layerId);
                    if(!layer){
                        //
                        layer=new GraphicsLayer({id:layerId});
                        _map.addLayer(layer);
                    }
                }
            }

        });
        //
        return module;
        //
});