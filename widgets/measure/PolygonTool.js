/**
 * Created by Esri on 2015/4/1.
 */
//
define(["dojo/dom","dojo/on","dojo/_base/declare",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/string",
        "dojo/_base/lang",
        "dojo/sniff",

        "esri/toolbars/draw",
        "esri/graphic",
        "esri/SpatialReference",
        "esri/geometry/Point",
        "esri/layers/GraphicsLayer",
        "esri/geometry/geometryEngine",
        "esri/symbols/Font",
        "viewer/ConfigManager",
        "viewer/SymbolManager"
    ],
    function(dom,on,declare,Array,domConstruct,string,lang,sniff,Draw,Graphic,SpatialReference,Point,GraphicsLayer,
             geometryEngine,Font,ConfigManager,SymbolManager)
    {
        //
        var drawTool=null;
        var showPt=null;
        //
        var layer=null;
        var layerId="polygonLayer";
        ////
        var symbolManager=null;
        var widgetConfig=null;
        //
        var unitScale=5000000;
        var largeUnitLabel="平方公里";//公里
        var smallUnitLabel="平方米";//米

        var largeUnitConversion=1000000;
        //
        var layerClickHandler=null;
        //
        var lastPoint=null;
        //
        var _map=null;
        //
        var polySelf=null;
        var graphicId=null;
        //
        var textSymbol=null;
        var totalSymbol=null;
        //
        var vertexGras=[];

        var module=declare(null,{
            //
            constructor:function(map){
                //
                drawTool=new Draw(map);
                //
                _map=map;
                //
                polySelf=this;
                //
                var configManager=new ConfigManager(function(data){
                },function(error){
                });
                //
                configManager.loadConfigWhitCallback("widgets/measure/config.json",this._configLoadedHandler,this._configLoadErrorHandler);
                drawTool.on("draw-end",lang.hitch(this,this._showMeasureResults));
            },
            //
            _getGeometrySymbol:function(type){
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
            },
            _showMeasureResultByGraphic:function(symbol,distance,extraLabel){
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
                //
                symbol.setFont(new Font().setDecoration("none"));
                //
                info=extraLabel+info;
                ////
                symbol.setText(info);
                //
                //var wgsGeo=showPt.geometry;
                //
                //var webGeo=webMercatorUtils.geographicToWebMercator(showPt);
                //
                //var item=this.domNode;
                //var screenPoint=_map.toScreen(showPt);
                //var left=screenPoint.x;
                //var top=screenPoint.y;
                //
                //<rect x="20" y="20" width="250" height="250"
                //style="fill:blue;stroke:pink;stroke-width:5;
                //opacity:0.9"/>
                //
                //var resultDiv=domConstruct.create("div",{
                //    left:left,top:top,
                //    innerHTML:info
                //},this.domNode);
                //var resultDiv=domConstruct.create("rect",{
                //    x:left,
                //    y:top,
                //    width:120,
                //    height:60,
                //    opacity:0.8
                //},this.domNode);
                //
                var attributes= {id:graphicId};
                var graphic=new Graphic(showPt,symbol,attributes);
                //
                layer.add(graphic);
                vertexGras.push(graphic);
            },
            _showMeasureResultInIE:function(distance,extraLabel){
                //
                var info="";
                if(distance>unitScale){
                    //
                    var convertDis=distance/largeUnitConversion;
                    info=convertDis.toFixed(3)+largeUnitLabel;
                }else{
                    //
                    info=distance.toFixed(3)+smallUnitLabel;
                }
                info=extraLabel+info;
                //
                alert(info);

            },
            //
            _showMeasureResults:function(event){
                //
                drawTool.deactivate();
                polySelf._executeChangeStyle();
                //
                lastPoint=null;
                polySelf._removeEventListeners();
                _map.setMapCursor("default");
                var geometry = event.geometry;
                //
                var attributes={id:graphicId};

                var graphic = new Graphic(geometry, this._getGeometrySymbol(geometry.type),attributes);

                layer.add(graphic);

                vertexGras.push(graphic);
                //
                showPt=geometry.getExtent().getCenter();

                //Convert wkid:4490 to wkid:4326 For geometryEngine only support 4326 and 3857(100120)
                if(geometry.spatialReference.wkid == 4490) {
                    geometry.setSpatialReference(new SpatialReference(4326));
                }
                var area=geometryEngine.geodesicArea(geometry);

                polySelf._setCloseGraphic(showPt);
                //
                if(sniff("ie")){
                   this._showMeasureResultInIE(area,"总面积: ")
                }else{
                    this._showMeasureResultByGraphic(textSymbol,area,"总面积: ");
                }

                //this._showMeasureResultByGraphic(textSymbol,area,"总面积: ");
                ////
                //polySelf._setCloseGraphic(showPt);
                //
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
                console.log("read config file error in Measure.js.");
            },

            _executeChangeStyle:function(){
                //
                if(this.changeItemStyle){
                    //
                    this.changeItemStyle();
                }
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

                layerClickHandler= on(layer,"click",function(event){
                    //
                    var gra=event.graphic;

                    if(gra&&gra.attributes){
                        //
                        if(gra.attributes["name"]==="close"){
                            //
                            //layer.remove(gra);
                            polySelf._removeMeasureResult(gra.attributes["id"]);
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
            /**
             * 用于修改该按钮在工具条中的状态
             * */
            changeItemStyle:null,

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
                this._executeChangeStyle();

            },
            _removeEventListeners:function(){
                //
                /*if(layerClickHandler){
                    layerClickHandler.remove();
                }*/
               /* if(mapClickHandler){
                    //
                    mapClickHandler.remove();
                }*/
            },
            //
            isActive:false,

            activate:function(){
                //
                graphicId="gra"+Math.floor(Math.random()*500).toFixed(0);
                //
                //console.log("graphicId::\t"+graphicId);
                drawTool.activate(Draw.POLYGON);
                this._createMeasureLayer(layerId);
                this._addEventListeners();
                this.isActive=true;
            },

            deactivate:function(){
                this._removeEventListeners();
                this.isActive=false;
                drawTool.deactivate();

                if(layer){
                    //
                    _map.removeLayer(layer);
                }
                vertexGras=[];
            },
            domNode:null,
            _createMeasureLayer:function(layerId){
                //
                if(layerId){
                    //
                    layer=_map.getLayer(layerId);
                    if(!layer){
                        //
                        layer=new GraphicsLayer({id:layerId});
                        _map.addLayer(layer);
                        //
                        this.domNode=layer.getNode();
                    }
                }
            }

        });
        //
        return module;
});