/**
 * Created by Esri on 2015/3/24.
 */
//
define(["dojo/dom","dojo/request/xhr","dojo/json",
        "dojo/topic","dojo/_base/declare",
        "dojo/_base/lang"],
function(dom,xhr,JSON,topic,declare,lang){
    //
    var _instance=null;
    /**配置文件加载完成时派发*/
    var CONFIG_LOADED="configLoaded";
    //配置文件加载失败时派发
    var CONFIG_LOADED_ERROR="configLoadedError";
    var o=declare(null,{
        //
        constructor:function(fnRight,fnError){
            //
            this.configLoaded=fnRight;
            this.configError=fnError;

            topic.subscribe(CONFIG_LOADED,lang.hitch(this,this.configLoaded));
            topic.subscribe(CONFIG_LOADED_ERROR,lang.hitch(this,this.configError));
            //
        },
        loadConfig:function(configUrl) {
            //
            xhr(configUrl,{handleAs:"json"}).then(
                function(data){
                    //
                    topic.publish(CONFIG_LOADED,data);
                    //alert(data);
                },function(err){
                    //
                    topic.publish(CONFIG_LOADED_ERROR,err);
                }
            );
        },
        loadConfigWhitCallback:function(configUrl,rightCallback,wrongCallbck){
            //
            xhr(configUrl,{
                handleAs:"json"
            }).then(rightCallback,wrongCallbck);
        }
    });
    return o;
});
