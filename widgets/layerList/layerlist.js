/**
 * Created by Esri on 2015/3/24.
 */
//
require(["dojo/dom-construct",
    "dojo/_base/window","dojo/string",
    "dojo/dom",

    "dojo/domReady!"],
    function(domConstruct,win,string,dom){

        var appEvent=null;

        /**init */
        (function(){
            //
            appEvent=window.parent.appEvent;
            if(appEvent){
                appEvent.dispatchAppEvent(appEvent.TAB_PAGE_CHANGED,"图层管理");
                // clear option layers
                appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,"removeLayer");
            }
        })();

        function createLayerItemRenderer(layer,panel){
            //
            //var panel=domConstruct.create("div",{},win.body());
            //
            var panelContent="<label>"+"名称 ："+layer.id+"</label><br><label class='label label-primary'>透明度：</label>" +

                "<input id='${slId}' class='slider' type='text'><br><label class='label label-primary'>可见性：</label>" +
                "<input id='${chkId}' class='checkbox-inline' type='checkbox'";
            //
            var checkInfo="";
            var template="";
            if(layer.visible){
                //
                checkInfo="checked='${visible}'><hr>";
                panelContent=panelContent+checkInfo;ncs
                template=string.substitute(panelContent,{slId:"sl"+layer.id,chkId:"chk"+layer.id,visible:layer.visible});
            }
            else{
                checkInfo=">";
                panelContent=panelContent+checkInfo;
                template=string.substitute(panelContent,{slId:"sl"+layer.id,chkId:"chk"+layer.id});
            }
           //
            var panelBody=domConstruct.create("div",{class:"panel-body",innerHTML:template},panel);
            //
            var slid="#sl"+layer.id;
            var chkId="#chk"+layer.id;


            var sl= $(slid).slider({
                    min:0,
                    max:1,
                    step:0.1,
                    value:20,
                    orientation:"horizontal",
                    tooltip:"hide"
            }).on("slide",function(){
                var alpha= sl.getValue();
                layer.setOpacity(alpha);
                //console.log("layer id is : "+layer.id+"value"+ sl.getValue());
            }).data("slider");
            //
            //
            $(chkId).click(function(){
                if(layer.visible){
                    //
                    layer.hide();
                    $(this).removeAttr("checked");

                }else{
                    //
                    layer.show();
                    $(this).attr("checked","true");
                }
                //console.log("chk layer is "+layer.id+"checked is :"+$(this).attr("checked"));
            });
        }
        //
        function initilizeMapLayers(){
            //
            var map=window.parent.mainMap;
            //
            var layerIds=map.layerIds;
            //
            var layer=null;
            var panel=domConstruct.create("div",{},dom.byId("layers"));

            for(var i=0;i<layerIds.length;i++){
                //
                layer=map.getLayer(layerIds[i]);
                createLayerItemRenderer(layer,panel);
            }
        }
        //
        initilizeMapLayers();
});