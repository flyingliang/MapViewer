/**
 * Created by Esri on 2015/3/20.
 */
/**
 *
 * 定义应用程序全局模块
 *
 * */
define([],function(){
    //
    var appModule=(function(){
        return{
            //
            proxyUrl:"",
            tips:null,
            oneMapServer:"",
            mapManager:null,
            configManager:null,
            symbolManager:null,
            AES_KEY:"aesKey",
            styleManager:null
            /**解析URL中附加的参数值*/
        };
    }());
    //
    appModule.config={};
    appModule.baseLayersObjs=[];
    //
    appModule.urlParser=(function(){
        //
        var result={};
        var url=location.search;
        if(url.indexOf("?")!==-1){
            var paramUrl=url.substr(1);
            var pairs=paramUrl.split("&");
            for(var i=0;i<pairs.length;i++){

                var keyValues=pairs[i].split("=");
                var key=keyValues[0];
                var value=keyValues[1];
                if(!result.hasOwnProperty(key)){
                    //re
                    result[key]=value;
                }
            }
        }
        return{
            getParameter:function(key){
                return result[key];
            }
        };
        //
    })();
    //
    //
    appModule.isMultiState=false;
    /*当左侧面板加载完成后监听移除图层事件*/
    appModule.isLeftPanelLoaded=false;

    appModule.aesKey=function(){
        //
        return "mapjs";
    };
    //
    //
    //
    return appModule;
});