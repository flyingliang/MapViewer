/**
 * Created by Esri on 2015/4/22.
 */
require(["dojo/dom",
        "./RouteResult.js",
        "dojo/domReady!"],
    function(dom,RouteResult){
    //
        var solveResult=null;
    //    //
        var widgetConfig=null;
    //    //var routeLayer=null;
        var graLayerId="networkLayer";
        var map=null;
    //
        var appEvent=null;
        /** init*/
        (function(){
            //
            map=window.parent.window.mainMap;
            var data=window.parent.window.extraData;
            //
            solveResult=data.results;
            //
            widgetConfig=window.parent.window.extraConfig;
            //
            appEvent=window.parent.window.appEvent;
            //

            if(appEvent){
                //
                appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR,"hideBusyIndicator");
                appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,{isClear:true});
            }
            //
            function addGraphic(gra){
                //
                var endData={
                    layerId:graLayerId,
                    graphic:gra
                };
                //
                appEvent.dispatchAppEvent(appEvent.SHOW_GRAPHIC_RESULT,endData);
                //map.graphics.add(gra);
            }
            //
            if(solveResult&&widgetConfig){
                //
                //appEvent.dispatchAppEvent(appEvent.SHOW_GRAPHIC_RESULT,endData);
                var routeResult=new RouteResult(map,dom.byId("info-results"));
                //
                routeResult.setConfig(widgetConfig);
                routeResult.setAppEvent(appEvent);
                routeResult.loadRouteResults(solveResult);
                //
                addGraphic(data.start);
                addGraphic(data.end);
            }
        })();
        //

});
