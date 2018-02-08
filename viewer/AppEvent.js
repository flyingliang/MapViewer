/**
 * Created by Esri on 2015/3/26.
 */
//
define(["dojo/topic","dojo/_base/array"],
    function(topic,Array){
        //
        //
        var _eventListeners=[];
        var module={
            CONFIG_LOADED:"configLoaded",
            CONFIG_LOADED_ERROR:"configLoadedError",
            START_LOAD_BASEMAP_LAYER:"startLoadBaseMapLayer",
            DATA_PUBLISH:"dataPublish",
            //START_QUERY_POI:"startQueryPoi",
            //从顶部文本框中执行POI查询
            QUERY_POI_FROM_TOP_INPUT:"queryPoiFromTopInput",
            //从左侧面板执行POI查询
            QUERY_POI_FROM_LEFT_INPUT:"queryPoiFromLeftInput",
            BASE_MAP_LAYER_LOADED:"baseMapLayerLoaded",
            /**派发系统事件*/
            dispatchAppEvent:function(eventName,data){
                //
                topic.publish(eventName,data);
            },

            /**监听系统事件*/
            addAppEventListener:function(eventName,handler){
                //
                var handle= topic.subscribe(eventName,handler);
                //
                var data={type:eventName,handler:handler};
                _eventListeners.push(data);
            },

            removeAppEventListener:function(eventName){
                //
                var listeners=_eventListeners;
                var wantDeletes=[];
                Array.forEach(listeners,function(item,iindex){
                    //
                    if(item.type===eventName){
                        //
                        var handle=item.handler;
                        handle.remove();
                        wantDeletes.push(iindex);
                    }
                });
                //
                Array.forEach(wantDeletes,function(index){
                    _eventListeners.slice(index,1);
                });
            },
            /**
             *<p> 绘制驾车出行起点</p>
             * data :Graphic
             * */
            DRAW_START_POINT:"drawStartPoint",
            /**
             *<p> 绘制驾车出行终点</p>
             * data :Graphic
             * */
            DRAW_END_POINT:"drawEndPoint"
        };
        /**/
        module.TAB_DATA_CHANGED="tabDataChanged";
        module.SHOW_INFO_WINDOW="showInfoWindow";
        /**
         * <strong>显示结果面板</strong>
         * data:{
         *  title:"",
         *
         * }
         * */
        module.TAB_PAGE_CHANGED="showResultPanel";

        /**
         *<strong>显示主程序弹出框</strong>
         * data format{
         *  url:"widgets/search/search.html",
         *  title:""
         *  data:{
         *  }
         * }
         * */
        module.SHOW_LARGE_DIALOG="showLargeDialog";

        /** 用户登录*/
        module.USER_LOGIN="userLogin";
        /**用户退出*/
        module.USER_LOGOUT="userLogout";
        //
        module.USER_LOGIN_ERROR="userLoginError";
        module.APPLICATION_ERROR="applicationError";
        /**
         * 移除图层事件
         * @ data：string
         * */
        module.REMOVE_CACHE_LAYER="removeCacheLayers";
        /**
         * 显示在地图中绘制的几何图形。
         * @param  data format.
         *
         * {
         *      layerId:""
         *      data:graphic
         * }
         * */
        module.SHOW_GRAPHIC_RESULT="showGraphicResult";

        /**
         * 从地图中移除GraphicsLayer
         *
         * @param data format :{
         *      layerId:""
         * }
         *
         * @example  data：“routeLayer”
         * */

        module.REMOVE_GRAPHICS_LAYER="removeGraphicsLayer";
        /**
         * 批量添加graphics 到图层中
         *
         * @param data format
         *
         * {
         *      layerId:"",
         *      graphics:[Graphic,Graphic,.....]
         * }
         *
         * */
        module.SHOW_GRAPHICS_TO_LAYER="showGraphicsToLayer";
        /**
         *清除GraphicsLayer中的几何图形
         *
         *@param data format {
         *      layerId:""
         * }
         * */
        module.CLEAR_GRAPHICS="clearGraphic";
        /**
         * 显示驾车出行中当前路段图形
         * @param data format
         *
         * {
         *     layerId:"",
         *     geometry:{},
         *     symbol:{}
         * }
         * */
        module.SHOW_NETWORK_SEGMENT_GRAPHIC="showNetworkSegmentGraphic";
        /**
         * 改变当前页的几何图形符号
         * @param data format
         * {
         *      layerId:"",
         *      graphics:[],
         *      symbol:{json format.}
         * }
         * */
        module.CHANGE_PAGE_GRAPHICS_SYMBOL="changePageGraphicsSymbol";
        /**
         * 显示首页面板，用于在POI查询结果中点击返回按钮时执行
         *
         * */
        module.SHOW_HOME_TAB_PAGE="showHomeTabPage";
        /**
         * 显示等待动画
         *
         * */
        module.SHOW_BUSY_INDICATOR="showBusyIndicator";
        /**
         * 隐等待动画
         *
         * */
        module.HIDE_BUSY_INDICATOR="hideBusyIndicator";
        /**
         * <p>添加其他图层到缓存集合</p>
         * @param {Layer}
         * */
        module.ADD_EXTRA_LAYER_TO_CACHE="addExtraLayerToCache";
        /**
         * <p>执行驾车路线分析</p>
         *
         *@param {Object} formart
         *
         * data:{
         * "start":"",
         * "end":""
         * }
         * */
        module.START_DRIVE_ANALYST="startDriveAnalyst";

        /**
         * 执行周边查询
         * @param {Object} format:{
         *  distance:1000,
         *  center:MapPoint
         * }
         * */
        module.START_BUFFER_ANALYST="startBufferAnalyst";
        /**
         * 显示提示框
         * */
        module.SHOW_TOASTER="showToaster";
        /**
         * 设置Arcgis Token
         * */
        module.SET_ARCGIS_SERVICE_TOKEN="setArcgisServiceToken";
        /**
         * 隐藏模态对话框
         * */
        module.HIDE_MODAL_DIALOG="hideModalDialog";


        module.SHOW_SMALL_DIALOG="showSmallDialog";
        //
        module.ADD_LAYER="addLayer";
        module.REMOVE_LAYER="removeLayer";
        //图层已加载
        module.LAYER_LOADED="layerLoaded";
        //removelayer
        module.LAYER_REMOVED="layerRemoved";
        /**执行POI查询完成时派发事件*/
        module.QUERY_COMPLETED="poiQueryCompleted";
        /*
        * 退出多时相地图对比视图
        * */
        module.EXIT_MUTIL_MAP_STATE="exitMultiMapState";
        //
        module.SHOW_INFO_QUERY_RESULTS="showInfoQueryResults";


    return  module;
});

