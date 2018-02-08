/**
 * Created by Esri on 2015/4/15.
 */
$(document).ready(function(){
    //
    var appEvent=null;
    //
    function showBackPanel(){
        //
        $("#result-panel").html("");
        $("#input-panel").html("返回纠错");
        appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,{isClear:true});
    }

    (function(){
        //
        appEvent=window.parent.appEvent;
        if(appEvent){
            //clear layers
            //appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,"removeLayer");
            appEvent.addAppEventListener("showBackPanel",function(){
                //当提交成功进入结果面板时，顶部显示返回纠错菜单项
                showBackPanel();
            });
        }
    })();

    $("#input-panel").click(function(){
        //
        $("#result-panel").html("纠错历史");
        $("#input-panel").html("");
        appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,{isClear:true});
    });

    $("#result-panel").click(function(){
        //
       showBackPanel();
    });
});