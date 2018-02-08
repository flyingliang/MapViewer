/**
 * Created by Esri on 2015/4/15.
 */
require(["dojo/dom","dojo/on","dojo/request/iframe",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/_base/event",


        "esri/symbols/PictureMarkerSymbol",
        "esri/graphic",
        "esri/toolbars/draw",
        "esri/toolbars/edit",
        "esri/layers/GraphicsLayer",
        "viewer/ConfigManager",
        "dojo/domReady!"],
    function(dom,on,iframe,Array,domConstruct,Event,PictureMarkerSymbol,Graphic,Draw,Edit,GraphicsLayer,ConfigManager){
        //
        //
        var correctService="../../../upload.action?";

        var rightPicUrl="assets/images/correction/right.png";
        var errorPicUrl="assets/images/correction/wrong.png";

        var appEvent=null;
        var drawTool=null;
        //
        var editTool=null;
        var map=null;
        //
        var rightGeo=null;
        var wrongGeo=null;
        var pacCode="100010";
        //GEOMETRY  type
        var MAP_POINT="1";
        var POLYLINE="2";
        var  POLYGON="3";
        //var errorType="";
        var msgType="1";
        //
        var config=null;
        //
        var provinceNode=null;
        var cityNode=null;
        //
        var correctionLayer=null;
        var layerId="correctionLayer";
        //
        var layerClick=null;
        var layerDblClick=null;
        //
        /**init */
        (function(){
            //
            appEvent=window.parent.parent.appEvent;
            if(appEvent){
                //appEvent.dispatchAppEvent(appEvent.TAB_PAGE_CHANGED,"地图纠错");
                appEvent.addAppEventListener("graphicEditEnd",function(data){
                    //
                    if(data){
                        //
                        if(data.attributes["type"]===1){
                            rightGeo=data.geometry;
                        }else if(data.attributes["type"]===2){
                            wrongGeo=data.geometry;
                        }
                    }
                });
            }
            //
            //
            map=window.parent.parent.mainMap;
            //
            if(map){
                //
                //map.graphics.clear();
                //
                //editTool=new Edit(map);
                //
                //
                //editTool.on("deactivate",function(event){
                //    if(event.info.isModified){
                //
                //    }
                //});
                //
                //Activate the toolbar when you click on a graphic
                //on(map.graphics,"click", function(evt) {
                //    Event.stop(evt);
                //    activateToolbar(evt.graphic);
                //});
                ////
                ////deactivate the toolbar when you click outside a graphic
                //map.on("click", function(evt){
                //    editTool.deactivate();
                //});
                //
                //
                //correctionLayer=map.getLayer(layerId);
                //
                //var editTool=new Edit(map);
                //
                //var correctionLayer=new GraphicsLayer({id:"correctionLayer"});
                //map.graphics=new GraphicsLayer({id:"templayer"});
                //
                //Activate the toolbar when you click on a graphic
                //on(textLayer,"click", function(evt) {
                //
                //    Event.stop(evt);
                //    activateToolbar(evt.graphic);
                //
                //});
                //
                //deactivate the toolbar when you click outside a graphic
                //map.on("dbl-click", function(evt){
                //    editTool.deactivate();
                //});
                ////
                //function activateToolbar(graphic) {
                //    //
                //    editTool.activate(Edit.MOVE, graphic, {
                //        allowAddVertices:true,
                //        allowDeletevertices:true
                //    });
                //}
                //var editingEnabled=false;
                //on(correctionLayer,"click",function(event){
                //    //
                //    event.stop(event);
                //    if(editingEnabled===false){
                //        editingEnabled=true;
                //        editTool.activate(Edit.MOVE,event.graphic);
                //
                //    }else{
                //        editTool.deactivate();
                //        editingEnabled = false;
                //    }
                //});

            }
            //
            drawTool=new Draw(map,{
                tooltipOffset: 20,
                drawTime: 90,
                showTooltips:true
            });

            drawTool.on("draw-end",showDrawResults);
            //
            config=new ConfigManager(function(){

            },function(){

            });
            //
            //

            //correx


            //
            provinceNode=dom.byId("province-list");
            cityNode=dom.byId("city-list");
            //
            config.loadConfigWhitCallback("config.json",configLoadedHandler,configErrorHandler)
        })();
        //
        //function activateToolbar(graphic) {
        //    //
        //    editTool.activate(Edit.MOVE, graphic, {
        //        allowAddVertices:true,
        //        allowDeletevertices:true
        //    });
        //}
        //
        function layerClickHandler(event){
            //

            var gra=event.graphic;
            //
            editTool.activate(Edit.MOVE,gra,{});

        }
        //
        function layerDoubleClickHandler(event){
            //
            editTool.deactivate();
        }
        //
        var widgetConfig=null;
        function configLoadedHandler(data){

            //
            widgetConfig=data;
            var provinceInfos=widgetConfig.province;
            //
            createProvinceItems(provinceInfos,provinceNode);
            //
            // //
            var currentInfo=provinceInfos[0];
            //
            createCityItems(currentInfo.city,cityNode);
            //
        }
        //
        function createProvinceItems(infos,domNode){
            //
            //domConstruct.empty(domNode);
            //var currentItem=$(domNode).val();
            Array.forEach(infos,function(info){
                //
                var content=info.name;
                var itemProps={
                    innerHTML:content
                };
                var option=domConstruct.create("option",itemProps,domNode);

                on(domNode,"change",function(event){
                    //
                    var currentItem=$(domNode).val();
                    if(info.name===currentItem){
                        //
                        provinceInfo=info;
                        createCityItems(info.city,cityNode);
                    }
                });
            });
        }
        //
        //
        var cityInfo=null;
        //
        var provinceInfo=null;

        function createCityItems(infos,domNode){
            //
            domConstruct.empty(domNode);
            Array.forEach(infos,function(info){
                //
                var content=info.name;
                var itemProps={
                    innerHTML:content
                };
                var option=domConstruct.create("option",itemProps,domNode);
                on(domNode,"change",function(event){
                    //
                    var currentItem=$(domNode).val();
                    if(currentItem===info.name){
                        cityInfo=info;
                    }
                });
            });
        }
        //
        function configErrorHandler(error){
            //
            console.log("load config file occur error in input.js file.");
            console.log(error.toString());
        }
        //
        var graphicType=-1;
        //
        //
        var rightGra=null;
        var wrongGra=null;
        function showDrawResults(event){

            drawTool.deactivate();
            var geometry=event.geometry;
            //保存绘制的图形，该参数将会提交到数据库
            setDrawGeometry(graphicType,geometry);
            //
            var symbol=createDrawSymbol(graphicType);
            //
            if(graphicType===1){
                //if(rightGra){
                //    //
                //    map.graphics.remove(rightGra);
                //    correctionLayer.remove(rightGra);
                //    //
                //}
                rightGra=new Graphic(geometry,symbol,{type:1});
                //map.graphics.add(rightGra);
                //correctionLayer.add(rightGra);
                appEvent.dispatchAppEvent("drawGraphic",{type:1,graphic:rightGra});
            }else if(graphicType===2){
                //
                //if(wrongGra){
                //    map.graphics.remove(wrongGra);
                //    correctionLayer.remove(wrongGra);
                //}
                wrongGra=new Graphic(geometry,symbol,{type:2});
                //map.graphics.add(wrongGra);
                //correctionLayer.add(wrongGra);
                appEvent.dispatchAppEvent("drawGraphic",{type:2,graphic:wrongGra});
            }
            //var graphic = new Graphic(geometry,symbol);
            ////
            //map.graphics.add(graphic);
        }
        //
        function createDrawSymbol(type){
            //
            var symbol=null;
            switch(type){
                //
                case 1:
                    symbol=new PictureMarkerSymbol(rightPicUrl,20,24);
                    break;
                case 2:
                    symbol=new PictureMarkerSymbol(errorPicUrl,20,24);
                    break;
                default:break;
            }
            return symbol;
        }
        //
        function setDrawGeometry(type,geometry){
            //
            switch(type){
                case 1:
                    rightGeo=geometry;
                    break;
                case 2:
                    wrongGeo=geometry;
                    break;
                default:break;
            }
        }
        /**
         * @param type  参数类型,
         * */
        function createGeometries(type){
            //
            var results=[];
            results.push(MAP_POINT);
            switch(type){
                //名称错误
                case "1":
                    if(!rightGeo){
                        //alert("请在地图中标注位置点信息");
                    }else{
                        //
                        results.push(rightGeo.toJson());
                    }
                    //
                    break;
                case "2":
                    //
                    if(!wrongGeo||!rightGeo){
                        //
                        //alert("请在地图中标注正确和错误的位置点信息");
                    }else{
                        //
                        results.push(wrongGeo.toJson());
                        results.push(rightGeo.toJson());
                    }
                    break;

                default :break;
            }
            //
            var jsonStr= JSON.stringify(results);
            return jsonStr;
        }
        /**设置行政区划编码*/
        function setRegionPacCode(){
            //
            var result="";
            if(cityInfo){
                //
                result=cityInfo.code;
            }else{
                if(provinceInfo){
                    //
                    result=provinceInfo.code;
                }
            }
            return result;
        }
        //
        /**提交地图纠错信息*/
        function submitMapCorrectionInfo(){
            //
            var isVerify=setAndVerifyParameter();
            //
            if(isVerify){
                iframe(correctService,{

                    handleAs:"json",
                    method:"POST",
                    form:"correct-info",
                    data:{
                        command:"addMapCorrectionInfo",
                        commandId:"MapCorrectionCommand",
                        author:author,
                        description:description,
                        email:email,
                        errortype:errorType,
                        msgtype:msgType,
                        infoname:infoName,
                        state:"0",
                        telphone:tel,
                        pac:pacCode,
                        geometries:geometries
                    }
                }).then(function(data){
                    //提交成功即跳转到查询查询页面
                    //alert(data);
                    //
                    var exist=data.exist;
                    if(exist){
                        //
                        //alert("该标注信息已经存在");
                        appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"该标注信息已经存在"})
                    }else{
                        //
                        appEvent.dispatchAppEvent("showBackPanel",{});
                        window.open("result.html","container");

                    }
                    var json=JSON.stringify(data);
                    console.log(json);
                },function(error){
                    //
                    //alert("input.js 文件中出现错误，提交纠错信息失败!"+error.toString());
                    var msg="input.js 文件中出现错误，提交纠错信息失败!"+error.toString();
                    appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:msg})
                });
            }
            //
            //console.log("email\t"+email);
            //console.log("infoName\t"+infoName);
            //console.log("author\t"+author);
            //console.log("telphone\t"+tel);
            ////
            //console.log("geometries:\t"+geometries);

        }
        //
        var email="";
        var infoName="";
        var msgType="";
        var description="";
        var author="";
        var tel="";
        var geometries=[];
        //
        //验证邮箱
        var emailReg= /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        //验证手机
        var mobileReg=/^(((13[0-9]{1})|15[0-9]{1}|18[0-9]{1}|)+\d{8})$/;
        //验证固话
        var telReg=/^(([0\+]\d{2,3})?(0\d{2,3}))(\d{7,8})((\d{3,}))?$/;
        //var name=//
        //
        /**
         * <p>设置并验证参数</p>
         *
         * */
        function setAndVerifyParameter(){
            //
            email=$("#email").val();
            msgType="1";
            //infoName=$("#info-name").val();
            //
            //description=$("#description").val();
            author=$("#author").val();
            if(!author){
                //alert("请输入联系人姓名!");
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"请输入联系人姓名"});
                return false;
            }
            //
            tel=$("#telphone").val();
            //
            if(!telReg.test(tel)&&!mobileReg.test(tel)){
                //
                //appEvent.dispatchAppEvent()
                //alert("请输入有效的电话号码");
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"请输入有效的电话号码"});
                return false;
            }
            //
            if(!emailReg.test(email)){
                //
                //alert("请输入有效的邮箱地址.");
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"请输入有效的邮箱地址"});

                return false;
            }
            //pacCode=setRegionPacCode();
            //
            //if(errorType==="1"){
            //    if(!rightGeo){
            //        alert("当选择纠错类型为名称错误时,请在地图中标注名称错误的点");
            //        return false;
            //    }
            //}
            //if(errorType==="2"){
            //    //
            //    if(!wrongGeo||!rightGeo){
            //        //
            //        alert("当选择纠错类型为位置错误时,请在地图中标注正确和错误的位置点信息");
            //        //alert("请在地图中标注位置的点");
            //        return false;
            //
            //    }
            //}
            //
            //geometries=createGeometries(errorType);
            ///
            return true ;
        }
        //
        $("#btn-submit").click(function(){
            //
            submitMapCorrectionInfo();
        });
        //
        //function addEventListeners(){
        //    //
        //    layerClick=on(correctionLayer,"click",function(event){
        //        //
        //        layerClick.remove();
        //        //var gra=event.graphic;
        //        editTool.activate(Edit.MOVE,event.graphic);
        //    });
        //
        //    layerDblClick=on(correctionLayer,"dbl-click",function(event){
        //        //
        //        layerDblClick.remove();
        //        editTool.deactivate();
        //    });
        //}
        //
        //function removeEventListeners(){
        //    //
        //    if(layerClick){
        //        layerClick.remove();
        //    }
        //    if(layerDblClick){
        //        layerDblClick.remove();
        //    }
        //}

        $("#draw-wrong").click(function(){
            //
            graphicType=2;
            //
            drawTool.activate("point");
            //
            //addEventListeners();

        });
        $("#draw-right").click(function(){
            //
            graphicType=1;
            drawTool.activate("point");
            //drawTool.activate(Draw.POLYGON);
            //
            //addEventListeners();
        });
        //
        $("#input-panel").click(function(){
            //
            $("#result-panel").html("纠错历史");
            $("#input-panel").html("");
        });
        $("#result-panel").click(function(){
            //
            $("#result-panel").html("");
            $("#input-panel").html("返回纠错");
        });
        //
        $("#clear").click(function(){
            //
            $("#textfield").attr("innerHTML","");
            //console.log(" clear button is clicked...");
        });
        //
        //
        function checkParamValue(){
            //
            //
            if(errorType==="1"){
                if(!rightGeo){
                    //alert("当选择纠错类型为名称错误时,请在地图中标注名称错误的点");
                    appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"当选择纠错类型为名称错误时,请在地图中标注名称错误的点"});
                    return false;
                }
            }
            if(errorType==="2"){
                //
                if(!wrongGeo||!rightGeo){
                    //
                    //alert("当选择纠错类型为位置错误时,请在地图中标注正确和错误的位置点信息");
                    appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"标注位置未标全"});
                    //alert("请在地图中标注位置的点");
                    return false;

                }
            }
            //
            infoName=$("#info-name").val();
            //
            if(!infoName){

                //alert("请输入纠错点名称!")
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"请输入纠错点名称"});
                return false
            }
            //
            description=$("#description").val();
            if(!description){
                //
                //alert("请输入描述信息！");
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"请输入描述信息"});
                return false;
            }
            //
            pacCode=setRegionPacCode();
            //
            geometries=createGeometries(errorType);
            return true ;
        }
        /**点击下一步按钮*/
        $("#next").click(function(){
            //
            console.log("next button is clicked...");
            //
            if(checkParamValue()){
                //
                $("#adv-info").show();
                $("#info").hide();
            }
        });
        //
        $("#btn-back").click(function(){
            //
            $("#adv-info").hide();
            $("#info").show();
        });
        //
        var errorType="1";
        //
        var errorStyle="corr-type";
        var errorStyleClicked="corr-type-clicked";

        function changeRadioStyle(domNode,oldStyle,newStyle){
            $(domNode).removeClass(oldStyle);
            $(domNode).addClass(newStyle);
        }
        //
        $("#name-err").click(function(){
            //
            errorType="1";
            map.graphics.clear();
            changeRadioStyle($("#location-err"),errorStyleClicked,errorStyle);
            changeRadioStyle(this,errorStyle,errorStyleClicked);
            //
            changeCorrectionType(errorType);
        });

        $("#location-err").click(function(){
            //
            errorType="2";
            map.graphics.clear();
            //
            changeCorrectionType(errorType);
            changeRadioStyle($("#name-err"),errorStyleClicked,errorStyle);
            changeRadioStyle(this,errorStyle,errorStyleClicked);
        });
        //
        //
        function changeCorrectionType(type){
            //名称错误
            if(type==="1"){
                //
                //$("#draw-wrong").attr("src","../../assets/images/correction/wrong.png");
                $("#draw-wrong").hide();
            }else if(type==="2"){
                //位置错误
                //$("#draw-wrong").attr("src","../../assets/images/correction/wrong.png");
                //$("#draw-right").attr("src","../../assets/images/correction/right.png");
                //
                $("#draw-wrong").show();
            }
        }


});
//
//
//var errorType="1";
//function show_selected_item_val($item){
//    errorType=$item.value;
//}