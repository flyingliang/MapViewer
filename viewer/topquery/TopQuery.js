/**
 * Created by Esri on 2015/3/26.
 */
define(["dojo/dom","dojo/_base/declare","dojo/on",
        "dojo/_base/lang","dojo/_base/array",
        "dojo/dom-construct","dojo/string","dojo/json",

        "esri/tasks/query",
        "esri/tasks/QueryTask",

        "viewer/ConfigManager"
    ],
    function(dom,declare,on,lang,Array,domConstruct,string,JSON,Query,QueryTask,ConfigManager){

        var _widgetConfig=null;
        var _appEvent=null;
        //
        var QUERY_RESULT_KEY="queryResultKey";
        var QUERY_CONFIG_KEY="queryConfigKey";

        var queryClass=declare([],{
            //
            constructor:function(event){
                //configManager=config;
                _appEvent=event;
                var configMgr=new ConfigManager(function(){},function(){});
                //
                configMgr.loadConfigWhitCallback("widgets/search/config.json",lang.hitch(this,this._configLoaded),lang.hitch(this,this._configLoadError));
            },
            _configLoaded:function(data){
                //
                try{
                    //
                    _widgetConfig=data;
                    //var configJson=JSON.stringify(_widgetConfig);
                    //window.localStorage.setItem(QUERY_CONFIG_KEY,configJson);
                    //window.widgetData=_widgetConfig;
                }catch(error){
                    //
                    alert(error.toString());
                }
            },
            _configLoadError:function(){
                //
                alert(error.toString());
            },
            _executeQuery:function(whereCause){
                //
                var outfields=[];
                var queryTask=new QueryTask(_widgetConfig.url);

                Array.forEach(_widgetConfig.fields,function(field){
                    //
                    outfields.push(field.name);
                });
                //
                //alert(outfields);
                var param=new Query();
                param.where=whereCause;
                param.outFields=outfields;
                param.returnGeometry=true;

                //param.geometry=window.parent.mainMap.extent;
                param.outSpatialReference=window.mainMap.spatialReference;
                queryTask.execute(param,function(results){
                    //
                    if(results.features.length>0){
                        //
                        //window.queryData=results;
                        //var resultsJson=JSON.stringify(results);
                        //
                        //
                        window.clearQueryResultInMap(true);
                        var data={};
                        data.type="poi";
                        data.config=_widgetConfig;
                        data.results=results;
                        //
                        var container=dom.byId("widgetContainer").contentWindow;//.showResults(data);
                        //
                        var resultUrl="widgets/search/result.html";
                        var fullUrl=container.location.href;
                        //
                        var startIndex=fullUrl.indexOf("widgets");
                        var widgetUrl="";
                        if(startIndex!==-1){
                            //
                            widgetUrl=fullUrl.substr(startIndex,fullUrl.length);
                        }
                        //
                        if(resultUrl===widgetUrl){
                            //
                            container.showResults(data);
                        }else{
                            //
                            window.extraData=data;
                            window.open(resultUrl,"widgetContainer");
                        }
                        //window.localStorage.setItem(QUERY_RESULT_KEY,resultsJson);
                        ////window.queryFields=_widgetConfig.fields;
                        //window.open("widgets/search/result.html","widgetContainer");
                        //appEvent.dispatchAppEvent(appEvent.TAB_PAGE_CHANGED,"POI查询结果");
                        //
                        _appEvent.dispatchAppEvent(_appEvent.QUERY_COMPLETED,{tabName:"search"});
                    }
                    else{
                        //
                        _appEvent.dispatchAppEvent(_appEvent.SHOW_TOASTER,{info:"没有找到符合当前查询条件的POI点"});
                        _appEvent.dispatchAppEvent(_appEvent.HIDE_BUSY_INDICATOR,"hideBusyIndicator");
                    }
                },function(error){
                    //
                    //alert(error);
                    _appEvent.dispatchAppEvent(_appEvent.SHOW_TOASTER,{info:error.toString()});
                });
            },
            startTopPoiQuery:function(condition){
                //
                var template=_widgetConfig.expression;
                //
                var whereCause=string.substitute(template,{name:condition});
                //
                this._executeQuery(whereCause);
                //executeQuery(whereCause);
            }
        });
        return queryClass;
});