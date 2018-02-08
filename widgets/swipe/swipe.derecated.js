/**
 * Created by Esri on 2015/3/26.
 */
//
require(["dojo/dom","dojo/on",
        "widgets/swipe/coms/SwipeTool",
        "dojo/domReady!"],
    function(dom,on,SwipeTool){

        var widgetConfig={};

        var appEvent=null;
        var mapManager=null;

        var map=null;
        var configManager=null;
        var swipeLayer=null;
        //
        var zoomSize=40;
        //
        //var widgetLayers=null;
        //
        /**初始化*/
        (function(){
            appEvent=window.parent.appEvent;
            mapManager=window.parent.mapManager;
            if(appEvent){
                //
                appEvent.dispatchAppEvent(appEvent.TAB_PAGE_CHANGED,"卷帘/放大镜");
                //清空图层
                appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,"removelayer");
            }
            map=window.parent.mainMap;
            configManager=window.parent.configManager;

            if(configManager){
                //
                configManager.loadConfigWhitCallback("widgets/swipe/config.json",configLoadedHandler,configLoadErrorHandler);
            }
            //
            //widgetLayers=window.parent.cacheRemoveLayers;
            //
        })();
        //
        var swipeTool=null;
        function configLoadedHandler(data){
            //
            var layerInfo=data.layer;
            if(layerInfo){
                //
               var layer= mapManager.createSingleLayer(layerInfo);
                //
                swipeTool=new SwipeTool(map);
                //
                swipeTool.setSwipeLayer(layer);
                //
                appEvent.dispatchAppEvent(appEvent.ADD_EXTRA_LAYER_TO_CACHE,layer);
                //widgetLayers.push(layer);
            }
        }
        function configLoadErrorHandler(error){
            //
            console.log("loaded config error in swipe.js file.\t\t"+error.toString());
        }
        //
        var sl= $("#zoom-radius").slider({
            min:25,
            max:200,
            step:25,
            value:50,
            orientation:"horizontal",
            tooltip:"hide"
        }).on("slide",function(){
            var alpha= sl.getValue();
            //console.log("layer id is : "+layer.id+"value"+ sl.getValue());
        }).data("slider");
        //
        $("#btn-swipe").click(function(){
            //
            swipeTool.activate();
            //swipeLayer.visible=true;
        });
        //
        $("#btn-zoom").click(function(){
            //
            zoomSize=sl.getValue();
            //
        });
        //
        $("#btn-clear").click(function(){
            //
            swipeTool.deactivate();
        });
        //

       /* baseUnload.addOnUnload(window,function(event){
            //
            var layer=map.getLayer(widgetConfig.layer.options.id);
            //
            if(layer){
                //
                map.removeLayer(layer);
            }
        });*/


});