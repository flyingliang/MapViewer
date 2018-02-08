/**
 * Created by Esri on 2015/4/1.
 */
//
define(["dojo/_base/declare","dojo/_base/lang","dojo/dom","dojo/on","dojo/topic","dojo/dom-construct","viewer/ConfigManager",
        "dojo/_base/array","dojo/string","util/extentUtil","dojo/domReady!"],
    function(declare,lang,dom,on,topic,domConstruct,ConfigManager,Array,string,extentUtil){

        var _configManager=null;
        var  self=null;
        var _map=null;
        var _wikd=null;
        //
        var regionClass=declare(null,{

            /**
             *
             *@param {HTMLElement} div
             *@param {Object} {url:}
             * */
            constructor:function(node,options){
                //
                this.domNode=node;
                self=this;
                //_configManager=new ConfigManager(function(){},function(){});
                //_configManager.loadConfigWhitCallback("widgets/region/config.json",lang.hitch(this,this._configLoaded,lang.hitch(this,this._configLoadError)));
                //
            },
            //
            setConfig:function(manager){
                //
                if(manager){
                    //
                    manager.loadConfigWhitCallback("widgets/region/config.json",lang.hitch(this,this._configLoaded),lang.hitch(this,this._configLoadError));
                }
            },
            setWkid:function(wkid){

                _wikd=wkid;
            },
            regionNavigateExtentChanged:null,
            _configLoaded:function(data){
                //
                this._deepIndex=data.deepIndex;
                this._createDropListBy(this._deepIndex);
                //
                var firstList=this._horSelectItems[0];
                this._createCityItems(data.province,firstList);
                //
                this._showFirstDropList();
                //
                var firstItems=data.province[0].children;
                if(firstItems){
                    self._createCityItems(firstItems,this._horSelectItems[1]);
                    //
                    var current=firstItems[0];

                    //Avoid extending when initializing.
                    //this._navigateToExtent(current.extent);

                    this.regionNavigateExtentChanged(current.extent);
                }
            },
            //
            _configLoadError:function(error){
                //
                console.log("load config file error in region tool.js+\n"+error.toString());
            },
            //
            /***/
            _createDropListBy:function(deepIndex){
                //
                for(var i=0;i<deepIndex;i++){
                    //
                    var selectId="region"+i;
                    var itemProps={
                        id:selectId
                    };
                   var select= domConstruct.create("select",itemProps,this.domNode);
                    this._horSelectItems.push(select);
                }
            },
            //
            _showFirstDropList:function(){
                //
                var items=this._horSelectItems;
                Array.forEach(items,function(item,iindex){
                    //
                    if(iindex>1){
                        $(item).hide();
                    }
                });
                //
                //var current=items[0];
                ////
                //var children=current.children;
                //if(children){
                //    //
                //    self._createCityItems(children,self._horSelectItems[1]);
                //}
                //this._navigateToExtent(current.extent);
                //
            },
            //
            setMap:function(map){
                //
                _map=map;
            },
            _deepIndex:0,
            //
            _createCityItems:function(infos,domNode){
                //
                domConstruct.empty(domNode);
                Array.forEach(infos,function(info){
                    //
                    var content=info.name;
                    var itemProps={
                        innerHTML:content
                    };
                    //
                    var option=domConstruct.create("option",itemProps,domNode);
                    on(domNode, "change", function (event) {
                        //
                        var currentItem = $(domNode).val();
                        if (info.name === currentItem) {
                            //
                            var nextIndex = info.index + 1;
                            if (nextIndex < self._deepIndex) {
                                //
                                var subNode = self._horSelectItems[nextIndex];
                                $(subNode).show();
                                self._createCityItems(info.children, subNode);
                                //
                                //self._navigateToExtent(info.extent);
                            }
                            info.index < self._deepIndex && self._navigateToExtent(info.extent);
                            //当前组合框之后的
                            if (info.children) {
                                self._showDropDownList(nextIndex);
                            } else {
                                self._showDropDownList(nextIndex - 1);
                            }
                            /* var afters=self._horSelectItems.slice(nextIndex,self._deepIndex);
                             for(var i=0;i<afters.length;i++){
                             //
                             var hideItem=afters[i];
                             $(hideItem).hide();
                             }*/
                        }
                    });
                });
            },
            //
            //
            _showDropDownList:function(splitIndex){
                var items=this._horSelectItems;

                if(splitIndex&&splitIndex<items.length){
                    //
                    Array.forEach(items,function(item,iindex){
                        //
                        if(iindex<=splitIndex){
                            //
                            $(item).show();
                        }else{
                            $(item).hide();
                        }
                    });
                }
            },
            //
            _horSelectItems:[],
            /**
             * <description>导航到指定页面</description>
             *
             * @param {Array}  info format: [xmin,ymin,xmax,ymax]
             * */
            _navigateToExtent:function(info){
                //var
                var extent=extentUtil.createMapExtent(info,_wikd);
                //
                if(extent){
                    //
                    _map.setExtent(extent);
                }
            }
        });
        //
        return regionClass;

});