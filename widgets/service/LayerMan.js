/**
 * Created by Esri on 2015/3/24.
 */

define(["dojo/_base/declare","dojo/dom-construct",
    "dojo/string", "dojo/dom-attr","viewer/MapManager"
    ],
    function (declare,domConstruct,string,domAttr,MapManager){
        //
        var _map=null;
        var _domNode=null;
        //
        var _baseLayers=null;
        //
        var _appEvent=null;
        var layerModule=declare(null,{

            constructor:function(map,domNode){
                //
                _map=map;
                _domNode=domNode;

            },
            _isBaseLayer: function (layerId) {
                if (!_baseLayers)
                    return;
                var result = false;
                var layerCount = _baseLayers.length;
                for (var i = 0; i < layerCount; i++) {
                    var layer = _baseLayers[i];
                    if (layer.id === layerId) {
                        result = true;
                        break;
                    }
                }
                return result;
            },
            //
            setAppEvent:function(event){

                _appEvent=event;
            },
            _createLayerItemRenderer:function(layer,panel){
                //
                var panelContent="<div><label class='service-label'>"+layer.id+"</label>${layerVisible}</div>" +

                    "<div class='layer-inner-row'><label class='service-label'>透明度：</label><input id='${slId}' class='slider slider-custom' type='text'></div><hr>";

                var visibleContent="";
                var template="";
                if(layer.visible){
                    //
                    //checkInfo="checked='${visible}'><hr>";
                    visibleContent="<img class='layer-visible' id='${chkId}' src='../../assets/images/layer/visible.png'>";
                }
                else{
                    visibleContent="<img class='layer-visible' id='${chkId}' src='../../assets/images/layer/hide.png'>";
                }//

                //如果是底图，则不创建删除按钮
                var visibleTemplate="";

                if(top.mapManager.isInBasemapConfig(layer.id)){
                    //
                    visibleTemplate=string.substitute(visibleContent,{chkId:"chk"+layer.id});
                }else{
                    //
                    visibleContent+="<img id='${delId}' class='layer-visible' src='../../assets/images/layer/delete.png'>";

                   visibleTemplate=string.substitute(visibleContent,{delId:"del"+layer.id,chkId:"chk"+layer.id});
                }

                template=string.substitute(panelContent,{layerVisible:visibleTemplate,slId:"sl"+layer.id});
                //
                var panelBody=domConstruct.create("div",{innerHTML:template},panel);
                //
                domAttr.set(panelBody,"class","layer-item");
                //
                var slid="#sl"+layer.id;
                var chkId="#chk"+layer.id;
                //
                var delId="#del"+layer.id;
                //
                $(delId).click(function(evt){
                    //
                    domConstruct.destroy(panelBody);
                    if(layer){
                        _map.removeLayer(layer);
                        //更新服务列表中的按钮状态
                        $("#"+layer.id).html("添加到地图");
                    }
                });
              //调节透明度,slider插件
                var sl= $(slid).slider({
                    min:0,
                    max:1,
                    step:0.1,
                    value:layer.opacity,
                    orientation:"horizontal",
                    tooltip:"hide"
                }).on("slide",function(){
                    var alpha= sl.getValue();
                    layer.setOpacity(alpha);
                }).data("slider");
                //
                $(chkId).click(function(){
                    if(layer.visible){
                        //
                        layer.hide();
                        $(this).attr("src","../../assets/images/layer/hide.png");

                    }else{
                        //
                        layer.show();
                        $(this).attr("src","../../assets/images/layer/visible.png");
                    }
                });
            },
            loadLayers:function(){
                //
                var layerIds= _map.layerIds;
                //
                var layer=null;

                for(var i=0;i<layerIds.length;i++){
                    //
                    layer=_map.getLayer(layerIds[i]);
                    //
                    this._createLayerItemRenderer(layer,_domNode);
                }
            },
            setBaseLayers:function(layers){
                //
                _baseLayers=layers;
            }
        });
        //
        return layerModule;
});