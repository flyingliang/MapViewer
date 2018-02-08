/**
 * Created by Esri on 2015/6/4.
 */
/**地址分享逻辑类*/
define(["dojo/_base/declare",
        "dojo/on",
        //"dojo/dom",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/request/xhr",
        "dojo/string",

        "esri/toolbars/draw",
        "esri/graphic",
        "esri/InfoTemplate",
        "esri/geometry/Point",
        "esri/layers/GraphicsLayer",



        "viewer/SymbolManager"


        //"viewer/ConfigManager",
        //"viewer/MapManager"
    ],
    function(declare,on,Array,lang,xhr,string,Draw,Graphic,InfoTemplate,Point,GraphicsLayer,SymbolManager) {
        //c
        //
        var symbolConfig=(function(){
            //
            return{
                //
                "imageSym":{
                    "url":"assets/images/common/marker.png",
                    "height":36,
                    "width":26,
                    "type":"esriPMS",
                    "xoffset":0,
                    "yoffset": 0
                },
                lineSymbol:{

                },
                fillSymbol:{}
            };
        }());
        //
        //
        var _markerMap=null;
        var _drawTool=null;
        //
        var _symbolManager=null;
        //
        var markerSelf=null;
        //
        var infoTemplate=null;
        //
        var resultInfoTemplate=null;
        var markerLayer=null;
        //
        var _appEvent=null;
        //
        var _isMapLoaded=false;
        var layerId="markerLayer";
        var  markerClass=declare(null,{
            /**
             * @param { ESRI Map}
             *
             * */
            _drawType:"point",
            _eventHandlers:[],
            _markerSymbol:null,


            constructor:function(map){
                //
                markerSelf=this;
                _markerMap=map;
                //
                //var
                _drawTool=new Draw(_markerMap);
                _symbolManager=new SymbolManager();
                //
                markerLayer=new GraphicsLayer({id:layerId});
                //
                //
                //var handler=_markerMap.on("load",lang.hitch(this,this._baseMapLayerLoaded));
                //
                //this._eventHandlers.push(handler);
                //
                infoTemplate=new InfoTemplate();
                //
                resultInfoTemplate=new InfoTemplate();
                //_markerMap.addLayer(markerLayer);
                //
                //on(markerLayer,"click",lang.hitch(this,this._markerLayerClicked));

            },
            setAppEvent:function(event){
                //
                //if(mgr&&markerLayer){
                //    //
                //    mgr.addLayerToCache(markerLayer);
                //}
                _appEvent=event;
            },

            /*移除事件监听器*/
            _removeEventListeners:function(){
                //
                var handlers=this._eventHandlers;
                Array.forEach(handlers,function(handler){
                    //
                    if(handler){
                        handler.remove();
                    }
                });
                //
                this._eventHandlers=[];
            },
            _getAesKey:function(){
                //
                return "mapjs";
            },
            //
            isActive:false,
            /*添加事件监听器*/
            _addEventListeners:function(){
                //
                var handler1=_drawTool.on("draw-end",lang.hitch(this,this._drawGeometryCompleted));
                //
                //
                var handler2=on(markerLayer,"click",lang.hitch(this,this._markerLayerClicked));
                //
                this._eventHandlers.push(handler1);
                this._eventHandlers.push(handler2);
            },
            //
            _markerLayerClicked:function(event){
                //
                _markerMap.infoWindow.show();
                this._addInfoWindowButtons();
            },
            //
            //
            //_encrypted:null,
            //_encryptInfo:function(info){
            //    //
            //    this._encrypted=CryptoJS.AES.encrypt(info,this._getAesKey());
            //    return this._encrypted;
            //},
            //_decryptInfo:function(encryptInfo){
            //    //
            //    //
            //    var decrypted=CryptoJS.AES.decrypt(this._encrypted,this._getAesKey());
            //    //
            //    return CryptoJS.enc.Utf8.stringify(decrypted).toString();
            //
            //},
            markerService:"../../Portal/main/*.action?",
            //
            _getShortUrl:function(largeUrl){
                //
                xhr(this.markerService,{
                    //
                    query:{
                        commandId:"MarkerCommand",
                        command:"generateShortUrl",
                        url:largeUrl
                    },
                    method:"POST",
                    handleAs:"json"
                }).then(
                    function(data) {

                        var indexPath = markerSelf._getIndexUrl();//location.protocol+"//"+location.host+location.pathname;

                        var shortUrl = String(indexPath) + "/m/" + data.shortId;

                        //

                        //
                        console.log(shortUrl);
                        var options = {};
                        
                        if ($("#shareName").val() == 0 && $("#shareDes").val() == 0) {
                            $("#shareUrl").html("名称和备注不能都为空");
                        } else {
                            $("#shareUrl").html(shortUrl);
                            options.name = $("#shareName").val();
                            options.description = $("#shareDes").val();
                            options.share = shortUrl;
                            //
                            var content = markerSelf._createResultContent(options, true, false);
                            //markerSelf._setInfoTemplateContent(content);
                            //
                            _markerMap.infoWindow.setContent(content);
                            //
                            infoTemplate.setContent(content);
                            //
                            markerSelf._graphic.setInfoTemplate(infoTemplate);
                        }}
                        ,
                        function (error) {
                            //
                            console.log(error);
                        }
                    );

            },
            _setInfoTemplateContent:function(content){
                _markerMap.infoWindow.setContent(content);
                //
                infoTemplate.setContent(content);
                this._graphic.setInfoTemplate(infoTemplate);
            },
            //
            _graphic:null,
            /**
             * <p>设置底图加载状态</p>
             * @param {Boolean} 加载完成为true，否则为false.
             * @return {void}
             * */
            setMapState:function(isLoaded){
                //
                _isMapLoaded=isLoaded;
            },
            //
            _drawGeometryCompleted:function(event){
                //
                //_drawTool.deactivate();
                this.deactivate();
                var geo=event.geometry;
                var symbol=this._getSymbolBy(geo.type);

                this._setInfoTemplate(infoTemplate);
                //
                //this._setInfoTemplate(resultInfoTemplate);

                this._graphic=new Graphic(geo,symbol,{type:"marker","NAME":this.title},infoTemplate);
                //
                //_markerMap.graphics.add(gra);
                markerLayer.add(this._graphic);
                //
                this._showInfoWindow(this._graphic,null);
                //
                //this._graphic=gra;
                //
                this._resultGraphic=new Graphic(geo,symbol,{type:"marker","NAME":this.title},resultInfoTemplate);
            },
            //largeUrl:"",
            //
            title:"",
            //
            //
            _encryptInfo:null,
            showMarker:function(encryptInfo){
                //
                this._encryptInfo=encryptInfo;
                // 如果底图已经加载完成，则显示分享信息
                if(_isMapLoaded){
                    this._baseMapLayerLoaded(null);
                }else{
                    //
                    var handler= _markerMap.on("load",lang.hitch(this,this._baseMapLayerLoaded));
                    //this._baseMapLayerLoaded(null);
                    //
                    this._eventHandlers.push(handler);
                }

            },
            _baseMapLayerLoaded:function(event){
                //
                this._removeEventListeners();
                //
                var layer=_markerMap.getLayer(layerId);
                //
                if(!layer){
                    _markerMap.addLayer(markerLayer);
                }
                //
                ;
                if(this._encryptInfo){
                    //
                    var  decrypted=CryptoJS.AES.decrypt(this._encryptInfo,this._getAesKey());
                    //
                    var  infoString=CryptoJS.enc.Utf8.stringify(decrypted).toString();

                    var json=JSON.parse(infoString);
                    //
                    var infoTemplate=json.infoTemplate;
                    //
                    //console.log("marker::\t"+infoString);

                    var gra=new Graphic(json);
                    //
                    //_markerMap.graphics.add(gra);
                    markerLayer.add(gra);

                    this._showInfoWindow(gra,infoTemplate);
                    //_markerMap.centerAndZoom(gra.geometry);
                    //
                    //;
                    _markerMap.centerAndZoom(gra.geometry,15);
                    //_markerMap.centerAt(gra.geometry);
                    //_markerMap.setZoom(13);
                }
            },
            //
            //
            _getIndexUrl:function(){
                //
                var indexPath=location.protocol+"//"+location.host+location.pathname;
                return indexPath;
            },

            _showInfoWindow:function(graphic,contents){
                //
                var info=_markerMap.infoWindow;
                info.setGraphic(graphic);
                //
                if(contents){
                    //
                    info.setTitle(contents.title);
                    info.setContent(contents.content);
                }else{
                    //
                    var options={
                        name:"",
                        description:"",
                        share:""
                    };
                    var infoContent=this._createResultContent(options,true,false);
                    info.setTitle(this.title);
                    info.setContent(infoContent);
                }
                //info.setInfoType("marker");
                //
                info.setGraphic(graphic);
                info.show(graphic.geometry,{closestFirst: true, type: "left"});
                info.showExtendPanel(false);
                //
                this._addInfoWindowButtons();
            },
            /**
             *
             * 监听Infowindow中的按钮
             * */
            _addInfoWindowButtons:function(){
                var aesKey=this._getAesKey();
                //
                $("#shareInfo").click(function(event){

                    markerSelf._updateGraphicInfoContent();
                    var json=markerSelf._resultGraphic.toJson();
                    var info=JSON.stringify(json);
                    //
                    //console.log("result::\t"+info);
                    var encrypted=CryptoJS.AES.encrypt(info,aesKey);
                    //
                    var  fullUrl=markerSelf._getIndexUrl()+"?marker="+encrypted.toString();
                    //
                    markerSelf._getShortUrl(fullUrl);
                });

            },
            //
            _setInfoTemplate:function(infoTemplate){

                var options={
                    name:"",
                    description:"",
                    share:""
                };
                //
                var content=this._createResultContent(options,true,false);
                //infoTemplate.setTitle("<strong>名称：</strong>${NAME}");
                infoTemplate.setTitle("${NAME}");
                infoTemplate.setContent(content);
                this._addInfoWindowButtons();
            },
            _resultGraphic:null,
            /**更新Graphic中InfoTemplate的内容*/
            _updateGraphicInfoContent:function(graphic){
                //
                var options={};
                options.name=$("#shareName").val();
                options.description=$("#shareDes").val();
                options.share="";

                var content=this._createResultContent(options,false,true);
                //resultInfoTemplate.setTitle("<strong>名称：</strong>"+this.title);
                resultInfoTemplate.setTitle(this.title);
                resultInfoTemplate.setContent(content);
                this._resultGraphic.setInfoTemplate(resultInfoTemplate);
            },
            /**
             *
             * @param {Object}
             * @example {
             *      name:"",
             *      description:"",
             *      share:""
             * }
             *
             * @param {Boolean} isShowMore 显示更多信息
             * @param {Boolean} afterShare 是否是分享过后调用
             *
             * */
            _createResultContent:function(options,isShowMore,afterShare){
                //
                var start="<div class='marker'>";
                var end="</div>";
                //var normalContent="<div><label class='name'>你可以在地图上标注内容分享给好友</label></div>" +
                //    "<div>" +
                //    "<div><label>名称:</label><input id='shareName' value='${name}'><br>" +
                //    "<label>备注:</label><textarea id='shareDes'>${description}</textarea></div>" +
                //    "</div>" +
                //    "<div><label id='shareInfo' class='share'> 分享</label></div>";
                ////
                var normalContent="<div>" + "<label class='high-light'>你可以在地图上标注内容分享给好友</label></div>" +
                    "<div><div class='hor'>" +
                    "<span>名称</span><input id='shareName' value='${name}'><br><br>" +
                    "<span class='vec-lbl'>备注</span><textarea id='shareDes'>${description}</textarea>"+
                    "</div></div><div>";
                //
                var share="<label id='shareInfo' class='share'> 分享</label>";

                var moreContent="<div class='marker'>" +
                    "<div><p id='shareUrl'>${share}</p></div>" +
                    "</div>";

                if(afterShare){
                    //
                    normalContent=normalContent+"</div>";
                }else{
                    //
                    normalContent= normalContent+share+"</div>";
                }
                //
                var template="";
                if(isShowMore){
                    //
                    template=start+normalContent+moreContent+end;
                }else{
                    //
                    template=start+normalContent+end;
                }
                var info=string.substitute(template,options);
                //
                //console.log(info);
                return info;
                //

            },
            _getSymbolBy:function(type){
                //
                var symbol=null;
                switch(type){
                    //
                    case "point":
                    case "multipoint":
                        symbol=_symbolManager.createPictureMarkerSymbol(symbolConfig.imageSym);
                        break;
                    case "polyline":
                        symbol=_symbolManager.createSimpleLineSymbol(symbolConfig.lineSymbol);
                        break;
                    case "extent":
                    case "polygon":
                        symbol=_symbolManager.createSimpleFillSymbol(symbolConfig.fillSymbol);
                        break;
                    default :break;
                }
                //
                return symbol;
            },
            //
            setDrawType:function(type){
                //
                this._drawType=type;
            },
            activate:function(){
                //
                //
                var layer=_markerMap.getLayer(layerId);
                //
                if(!layer){
                    _markerMap.addLayer(markerLayer);
                }
                this.isActive=true;
                this._addEventListeners();
                _drawTool.activate(this._drawType);

            },
            deactivate:function(){
                this.isActive=false;
                this._removeEventListeners();
                //
                _drawTool.deactivate();
                markerLayer.clear();
            }

        });
        //
        return markerClass;

    });