/**
 * Created by Esri on 2015/4/22.
 */
define(["dojo/dom","dojo/on","dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/_base/array",
        "dojo/dom-attr",
        "esri/graphic",
        "esri/layers/GraphicsLayer",
        "esri/symbols/SimpleLineSymbol",
        "esri/Color"],
    function(dom,on,declare,domConstruct,Array,domAttr,Graphic,GraphicsLayer,SimpleLineSymbol,Color){
    //
    //    var solveResult=null;
    //    var routeResult=null;
        //
        var _widgetConfig=null;
        //var routeLayer=null;
        //var map=null;
        //
        var _unitScale=5000;
        var _largeUnitLabel="";//公里
        var _smallUnitLabel="";//米

        //var appEvent=null;

        //
        //var backWidgetUrl="";
        //
        var _smallUnitConversion=1.0;
        var _largeUnitConversion=1000;
        //
        var _largeUnitPrecision;
        var _smallUnitPrecision;
        //symbols
        var segmentSymbol=null;
        //
        //var drawTool=null;
        //

        //
        var routeLayerId="networkLayer";
        var segmentLayerId="segmentLayerId";
        //var routeSymbol=null;

        //var _map=null;
        var _symbol=null;
        var _appEvent=null;
        var _domNode=null;
        //
        var moduleSelf=null;
        //

        var module=declare([],{
            //
            constructor:function(_map){
                //
                //_map=map;
                this.map=_map;
                //_domNode=domNode;
                moduleSelf=this;
                //
                _symbol=new SimpleLineSymbol().setColor(new Color([255,0,255,0.5])).setWidth(5);
            },
            setConfig:function(config){
                //
                _widgetConfig=config;
                if(_widgetConfig){
                    //
                    _unitScale=_widgetConfig.distanceunit.scale;
                    _largeUnitLabel=_widgetConfig.distanceunit.largeunit.label;
                    _largeUnitConversion=_widgetConfig.distanceunit.largeunit.conversion;
                    _largeUnitPrecision=_widgetConfig.distanceunit.largeunit.precision;
                    //
                    _smallUnitLabel=_widgetConfig.distanceunit.smallunit.label;
                    _smallUnitConversion=_widgetConfig.distanceunit.smallunit.conversion;
                    _smallUnitPrecision=_widgetConfig.distanceunit.smallunit.precision;
                }
            },
            //
            setAppEvent:function(event){
                //
                _appEvent=event;
            },
            //
            setContent:function(node){
                //
                _domNode=node;
            },
            hideBusyIndicator:function(){
                //
                _appEvent.dispatchAppEvent(_appEvent.HIDE_BUSY_INDICATOR, "hideBusyIndicator");
            },
            /**
             * <p>格式化显示距离</p>
             * @param distance:number
             * */
            _formatDistance:function(distance){
                //
                var result="";
                //
                if(distance>_unitScale){
                    //
                    result=(distance/_largeUnitConversion).toFixed(_largeUnitPrecision);
                    result=result+_largeUnitLabel;
                }else{
                    //
                    result=(distance/_smallUnitConversion).toFixed(_smallUnitConversion);
                    result=result+_smallUnitLabel;
                }
                return result;
            },

            /**
             * @param time:number
             * */
            _formatTime:function(time){
                //
                var result="";
                var hour=Math.floor(time/60);
                var min=Math.round(time%60);
                //
                if(hour<1&&min<1){
                    //
                    result="";
                }else if(hour<1&&min<2){
                    //
                    result=min+"分钟";
                }else if(hour<1){
                    //
                    result=min+"分钟";

                }else{
                    //
                    result=hour+"(小时)"+min+"(分钟)";
                }
                //
                return result;
            },
            //
            _createTotalPanel:function(directions){
                //
                //
                var content="<label>总路程：</label>"+this._formatDistance(directions.totalLength)+"<br>"+
                    "<label>总时间：</label>"+this._formatTime(directions.totalTime)+"<hr>";
                var totalProps={
                    innerHTML:content
                };
                //
                var totalDiv=domConstruct.create("div",totalProps,_domNode);
                //
                domAttr.set(totalDiv,"class","total-panel");
                //点击容器时缩放到总路线
                on(totalDiv,"click",function(event){
                    //
                    //alert("haha");
                    var routeGeo=directions.mergedGeometry;
                    var routeGraphic=new Graphic(routeGeo,_symbol);
                    //
                    moduleSelf._setMapExtent(routeGraphic);

                });

            },
            _writeDirections:function(directions){
                //
                ;
                this._createTotalPanel(directions);
                var features=directions.features;
                //

                //var domNode=dom.byId("results");

                var featureCount=features.length;
                //var iindex=1;
                Array.forEach(features,function(feature,iindex){

                    //this._createRouteResultItem(_domNode,feature,iindex);
                    moduleSelf._createRouteResultItem(_domNode,feature,iindex,featureCount);
                    //iindex++;
                });

                var routeGeo=directions.mergedGeometry;
                //
                var routeGraphic=new Graphic(routeGeo,_symbol);
                //
                var geoJson=routeGeo.toJson();// Convert to pure js object.
                var data={
                    layerId:routeLayerId,
                    geometryJson:geoJson,
                    symbol:_widgetConfig.routeSymbol
                };
                _appEvent.dispatchAppEvent(_appEvent.SHOW_GRAPHIC_RESULT,data);
                //var sh=JSON.stringify(routeSymbol.toJson());
                //
                this._setMapExtent(routeGraphic);
            },
            //

            _setMapExtent:function(graphic){
                //
                var geometry=graphic.geometry;
                //
                var extent=null;
                switch(geometry.type){
                    case "polyline":
                        extent=geometry.getExtent();
                        try{
                            this.map.setExtent(extent);
                        }catch(e){
                            console.error(e);
                        }

                        break;
                    default:break;
                }
            },
            _createRouteResultItem:function(domNode,graphic,iindex,lastIndex){
                //
                var container=domConstruct.create("div",{
                    //class:"horizontal-panel"
                },domNode);
                //
                //iindex+=1;
                //
                domAttr.set(container,"class","route-item");
                //
                var textG=graphic.attributes.text;
                //去掉文字中的逗号
                var text=textG.replace('，','');
                var timeString=this._formatTime(graphic.attributes.time);
                var distance=this._formatDistance(graphic.attributes.length);
                //
                var content="";
                //
                if(iindex===0||iindex===lastIndex-1){
                    //
                    iindex+=1;
                    content="<strong>"+iindex+"</strong>"+"<bold>.</bold>"+text;
                }else{
                    //
                    iindex+=1;
                    content="<strong>"+iindex+"</strong>"+"<bold>.</bold>"+text+"("+distance+timeString+")";
                }
                //var content="<strong>"+iindex+"</strong>"+"<bold>.</bold>"+text+"("+distance+timeString+")";
                var a=domConstruct.create("a",{
                    innerHTML:content
                },container);
                //
                //追加换行符
                //var br=domConstruct.create("br",{},container);

                /**在地图中显示当前线段*/
                on(a,"click",function(event){
                   ;
                    var data={
                        layerId:segmentLayerId,
                        geometryJson:graphic.geometry.toJson(),
                        symbol:_widgetConfig.segmentSymbol
                    };
                    _appEvent.dispatchAppEvent(_appEvent.SHOW_NETWORK_SEGMENT_GRAPHIC,data);
                    moduleSelf._setMapExtent(graphic);

                });
            },
            loadRouteResults:function(solveResult){
                //clear last query reuslt.
                //domConstruct.empty(_domNode);
                ;
                if(solveResult){
                    //
                    var routeResult=solveResult.result.routeResults[0];
                    if(routeResult){
                        //;
                        this._writeDirections(routeResult.directions);
                    }else{
                        //
                        console.log("no result to display..");
                    }
                }
            },
            addGraphic:function(gra){
                //
                var endData={
                    layerId:routeLayerId,
                    graphic:gra
                };
                //
                _appEvent.dispatchAppEvent(_appEvent.SHOW_GRAPHIC_RESULT,endData);
            }
        });
        return module;
});
