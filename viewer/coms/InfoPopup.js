/**
 * Created by Esri on 2015/5/8.
 */

define(["dojo/dom","dojo/on","dojo/_base/declare","dojo/_base/lang",
    "dojo/query","dojo/dom-construct",
        "dojo/dom-attr","dojo/dom-style",
        "dojo/dom-class","dojo/topic",
        "esri/dijit/Popup"],
    function(dom,on,declare,lang,query,domConstruct,domAttr,domStyle,domClass,topic,
                Popup){
        //
        var actionsPanel=null;
        //
        var _btnGroup=null;
        var _detailsGroup=null;
        //
        var _inputBox=null;
        //
        var _imagePanel=null;
        var _image=null;
        //
        var imageUrl="";
        //
        var QueryType=(function(){
            //
            var o={
                FROM_HERE:"fromHere",
                TO_HERE:"toHere",
                BUFFER:"buffer"
            };
            return o;
        })();
        //
        var poiInfo=null;
        //
        var queryType=QueryType.FROM_HERE;
        //
        var _extraGraphic=null;
        //var contentPanel=null;
        //events
        /**
         *description:
         *
         * event data : {
         *  poiType:"",
         *  distance:500m
         * }
         * */
        var START_BUFFER_QUERY="startBufferQuery";
        /**
         *
         *description:"
         *
         * event data: {
         *  start:"",
         *  end:""
         * }
         * */
        var START_DRIVE_QUERY="startDriveQuery";
        //
        var popupSelf=null;

        var infoPopup=declare([Popup],{
            /**
             * 执行驾车回调函数
             * */
            driveHandler:null,
            /**
             * 周边查询回调函数
             * */
            bufferHandler:null,
            //
            constructor:function(parameters) {
                //
                this.inherited(arguments);

                lang.mixin(this,parameters);
                actionsPanel = query(".actionsPane", this.domNode)[0];
                //
                var contentPanel=query(".contentPane",this.domNode)[0];

                _imagePanel=domConstruct.create("div",{},contentPanel,"before");
                //var imagePanel=domConstruct.create("div",{},contentPanel,"before");
                //
                //_image=domConstruct.create("img",{},imagePanel);
                //
                //domClass.add(actionsPanel,"panel panel-default");
                domConstruct.destroy(this._actionList);
                //
               /* topic.subscribe(START_BUFFER_QUERY,lang.hitch(this,this._bufferQueryCompleted));
                topic.subscribe(START_DRIVE_QUERY,lang.hitch(this,this._driveQueryCompleted));
                //*/
                popupSelf=this;
            },
            //
            showImagePanel:function(isShowing){
                //
                if(isShowing){
                    //
                    $(_imagePanel).show();
                    if(!_image){
                        _image=domConstruct.create("img",{
                            src:imageUrl
                        },_imagePanel);
                    }else{
                        //
                        $(_image).attr("src",imageUrl);
                    }
                }else{
                    //
                    $(_imagePanel).hide();
                }
            },
            _createComponents:function(){
                //
                _btnGroup = domConstruct.create("div", {
                    //"class": "info"
                }, actionsPanel);
                //以下写法为了兼容ie8
                domAttr.set(_btnGroup,"class","info");
                //
                var btnStartPoint = domConstruct.create("a", {
                    //"class": "from-here clicked-border",
                    innerHTML: "从这里出发",
                    id:"from-here"
                }, _btnGroup);

                //
                domAttr.set(btnStartPoint,"class","from-here clicked-border");
                //
                var btnEndPoint = domConstruct.create("a", {
                    id:"to-here",
                    //"class":"to-here normal-border",
                    innerHTML: "到这里来"
                }, _btnGroup);

                domAttr.set(btnEndPoint,"class","to-here normal-border");
                //
                //
                var btnBuffer = domConstruct.create("a", {
                    id:"buffer",
                    innerHTML: "周边查询",
                    style:"border-right:0 none;"
                    //"class":"buffer normal-border"
                }, _btnGroup);
                //
                domAttr.set(btnBuffer,"class","buffer normal-border");

                _detailsGroup = domConstruct.create("div", {
                    //"class": "details"
                }, actionsPanel);
                //
                domAttr.set(_detailsGroup,"class","details");

                var labelInfo = domConstruct.create("label", {
                    innerHTML: "终点:"
                    //"class":"middle-ver"
                }, _detailsGroup);
                //
                domAttr.set(labelInfo,"class","middle-ver-label");
                _inputBox = domConstruct.create("input", {
                    //
                    //"class": "middle-ver",
                    id:"input-box",
                    type:"text",
                    "data-provide":"typeahead",
                    "autocomplete":"off"
                }, _detailsGroup);
                domAttr.set(_inputBox,"class","middle-ver-input");
                //
                domAttr.set(_inputBox, "placeholder", "请输入终点");

                var btnQuery = domConstruct.create("a", {
                    "class": "middle-ver-btn",
                    innerHTML: "驾车",
                    id:"info-query"
                }, _detailsGroup);

                domAttr.set(btnQuery,"class","middle-ver-btn");

                //add event handler
                on(btnStartPoint, "click", function (event) {
                    //
                    //domStyle.set(labelInfo,"");
                    domAttr.set(labelInfo, "innerHTML", "终点:");
                    domAttr.set(_inputBox, "placeholder", "请输入终点");
                    domAttr.set(btnQuery, "innerHTML", "驾车");
                    queryType=QueryType.FROM_HERE;
                    popupSelf._changeCurrentStyle(btnStartPoint);

                    //_private_obj.addInputTips();
                });
                //
                on(btnEndPoint, "click", function (event) {
                    //
                    domAttr.set(labelInfo, "innerHTML", "起点:");
                    domAttr.set(_inputBox, "placeholder", "请输入起点");
                    domAttr.set(btnQuery, "innerHTML", "驾车");
                    queryType=QueryType.TO_HERE;
                    popupSelf._changeCurrentStyle(btnEndPoint);
                    //_private_obj.addInputTips();
                });
                //
                on(btnBuffer, "click", function (event) {
                    //
                    domAttr.set(labelInfo, "innerHTML", "距离:");
                    domAttr.set(_inputBox, "placeholder", "请输入距离");
                    domAttr.set(btnQuery, "innerHTML", "查询");
                    //
                    queryType=QueryType.BUFFER;
                    popupSelf._changeCurrentStyle(btnBuffer);
                    //_private_obj.removeInputTips();
                });
                //
                on(btnQuery, "click", function (event) {
                    //
                    //alert(btnQuery.innerHTML);
                    //
                    //var info=JSON.stringify(window.tipsData);
                    ////
                    //alert(info);
                    //_this = this;
                    var param={};
                    /*var graphic=popupSelf.getSelectedFeature();
                    //当从结果列表中点击时，回去对应的graphic
                    if(!graphic){
                        //
                        graphic=_extraGraphic;
                    }*/
                    var graphic=popupSelf._getSelectedFeature();
                    //imageUrl=graphic.attributes["imgurl"];
                    //存在图片时,显示图片
                    /*if(imageUrl){
                       popupSelf.showImagePanel(true);
                    }else{
                        popupSelf.showImagePanel(false);
                    }*/
                    //popupSelf.showImagePanel(true);
                    /*//
                    if(graphic){
                        //
                        alert(graphic.attributes["NAME"]);
                    }*/
                    //
                    if(queryType===QueryType.FROM_HERE){
                        //
                        //
                        //query=graphic.attributes["NAME"];
                        //var endNane=$(_inputBox).val();
                        //
                        //param.start=graphic.attributes["NAME"];
                        param.start=graphic.attributes[popupSelf._titleField];
                        param.end=$(_inputBox).val();
                        popupSelf.executeDriveQuery(param);

                    }else if(queryType===QueryType.TO_HERE){
                        //
                        param.start=$(_inputBox).val();
                        //param.end=graphic.attributes["NAME"];
                        param.end=graphic.attributes[popupSelf._titleField];
                        //
                        popupSelf.executeDriveQuery(param);

                    }else if(queryType===QueryType.BUFFER){
                        //
                        var dist=parseInt($(_inputBox).val());
                        //
                        param.distance=dist;
                        //param.type="";
                        param.center=graphic;
                        //param.graphic=graphic;

                        popupSelf.executeBuffer(param);

                    }else{
                        //default
                    }
                });
            },
            _changeCurrentStyle:function(currentItem){
                //
                //
                var styles=$(".clicked-border");
                for(var i=0;i<styles.length;i++){
                    //
                    var info=styles[i];
                    //
                    $(info).removeClass("clicked-border");
                    //
                    $(info).addClass("normal-border");
                }
                //
                $(currentItem).addClass("clicked-border");

                /*switch(type){
                    case QueryType.BUFFER:
                        //
                        $("#from-here").removeClass("from-here-clicked");
                        $("from-here").addClass("from-hrer");
                        $("#to-here").removeClass("to-here-clicked");
                        $("#to-here").addClass("to-here");
                        //
                        $("#buffer").removeClass("buffer");
                        $("#buffer").addClass("buffer-clicked");
                        break;
                    case QueryType.FROM_HERE:
                        break;
                    case QueryType.TO_HERE:
                        break;
                }*/
            },
            //
            setPoiList:function(config){

            },
            /*
             * @param {Object} format:{
             *   distance:1000
             *   type:"" //poi type
             * }
             * */
            executeBuffer:function(param){
                //
                var isSuccess=this._checkBufferParam(param);
                if(isSuccess&&this.bufferHandler){
                    //
                    this.bufferHandler(param);
                    //topic.publish(START_BUFFER_QUERY,param);
                }
            },
            _checkBufferParam:function(param){
                var result=false;
                if(param.distance&&param.center){
                    result=true;
                }
                return result;
            },
            /**
             * @param {Object} format :{
             *
             *  start:"" //
             *  end:""
             *
             * }
             * */
            executeDriveQuery:function(param){
                //
                var state=this._checkDriveParam(param);
                if(state&&this.driveHandler){
                    //
                    this.driveHandler(param);
                    //topic.publish(START_DRIVE_QUERY,param);
                }
            },
            //
            _checkDriveParam:function(param){
                //
                var isState=false;
                if(param&&param.start&&param.end){
                    //
                    isState=true;
                }
                //
                return isState;
            },
            _removeInputTips:function(){
                //
                $(_inputBox).typeahead("destroy");
            },

            _addInputTips:function(){
                //
                $(_inputBox).typeahead({ source:window.tipsData ,items:12});
            },

            /**
             * 是否显示自定义面板
             * */
            isShowComponent:false,

            //_popupGraphic:null,
            startup:function(){
                //
                this.inherited(arguments);
                this._createComponents();
            },
            //
            _getSelectedFeature:function(options){
                //var graphic=_extraGraphic;//this.getSelectedFeature();
                //if(!graphic){
                //    graphic=this.getSelectedFeature();
                //}
                var graphic=null;
                //从左侧面板中点击显示InfoWindow
                if(options&&options.type==="left"){
                    //
                    graphic=_extraGraphic;
                    this.features=[graphic];
                }else{
                    graphic=this.getSelectedFeature();
                    if(!graphic){
                        //
                        if(this.features){
                            graphic=this.features[0];
                        }
                    }
                }
                return graphic;
            },

            show:function(type){
                //debugger;
                this.inherited(arguments);
                var options=arguments[1];
                //
                var graphic=this._getSelectedFeature(options);
                //
                if(graphic){
                    //
                    imageUrl=graphic.attributes["imageUrl"];
                    //imageUrl="assets/images/logo.png";
                    if(imageUrl){
                        this.showImagePanel(true);
                    }else{
                        this.showImagePanel(false);
                    }
                    /**如果是比标记弹出框，则不显示自定义容器*/
                    if(this._infoType==="marker"||graphic.attributes["type"]==="marker"){
                        //
                        this.showExtendPanel(false);
                    }else if(this._infoType==="poi"){
                        //
                        this.showExtendPanel(true);
                    }else{
                        //
                    }
                    //如果名称过长,则截断显示
                    var graName=graphic.attributes[this._titleField];
                    //
                    if(graName&&graName.length>20){

                        var subContent=graName.substring(0,17);
                        //this.setTitle("<strong>名称：</strong>"+subContent+"...");
                        this.setTitle(subContent+"...");
                        var titleDomNode = query(".title", this.domNode)[0];
                        //
                        domAttr.set(titleDomNode,"title",graName);
                    }else{
                        //this.setTitle("<strong>名称：</strong>"+graName);
                        this.setTitle(graName);
                    }
                }
                popupSelf._addInputTips();
            },
            //
            _titleField:"",
            setTitleField:function(title){
                //
                this._titleField=title;
            },
            _infoType:"",
            /**
             * set the type of info popup
             * @param {String} type vlaue is marker ,poi
             * */
            setInfoType:function(type){
                //
                this._infoType=type;
            },

            hide:function(){
                //
                this.inherited(arguments);
                $(_inputBox).val("");
                //this.setTitle("");
                //$(_inputBox).html("innerHTML","");
            },
            setGraphic:function(graphic){
                //
                _extraGraphic=graphic;
            },
            //
            showExtendPanel:function(isshow){
                //
              if(isshow){
                  $(actionsPanel).show();
              }else{
                  //
                  $(actionsPanel).hide();
              }
            }
        });
    //
        return infoPopup;
});