/**
 * Created by Esri on 2015/5/11.
 */
define([
        "dojo/mouse",
        "dojo/dom",
        "dojo/on",
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/dom-style",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/string",
        "dojo/topic",
        "dojo/dom-attr",
        "dojo/query"
    ],

    function (mouse, dom, on, lang, declare, domStyle, Array, domConstruct, string, topic, domAttr, query) {

        //底图切换事件
        var BASE_MAP_LAYER_CHANGED = "baseMapLayerChanged";
        var _basemaps = null;
        var _dropDownNode = null;
        var _normalNode = null;

        var VECTOR = "vector";
        var IMAGE = "image";

        var instance = declare(null, {
            timeoutHandler: null,
            constructor: function (basemaps, domNode, subNode) {
                _basemaps = basemaps;
                _normalNode = domNode;
                _dropDownNode = subNode;

                for (var i = 0; i < _basemaps.length; i++) {
                    var basemap = _basemaps[i];
                    _private_obj.createBasemapDom(basemap);
                }

                /* Event register: Map switch. */
                on(domNode, mouse.enter, lang.hitch(this, function (event) {
                    if (this.timeoutHandler)
                        clearTimeout(this.timeoutHandler);
                    domStyle.set("switcher-down", "display", "block");
                }));
                on(domNode, mouse.leave, lang.hitch(this, function (event) {
                    this.timeoutHandler = setTimeout(function (param) {
                        if (this.timeoutHandler)
                            clearTimeout(this.timeoutHandler);
                        domStyle.set("switcher-down", "display", "none");
                    }, 1000);
                }));
                on(subNode, mouse.enter, lang.hitch(this, function (event) {
                    if (this.timeoutHandler)
                        clearTimeout(this.timeoutHandler);
                    domStyle.set("switcher-down", "display", "block");
                }));
                on(subNode, mouse.leave, lang.hitch(this, function (event) {
                    this.timeoutHandler = setTimeout(function (param) {
                        if (this.timeoutHandler)
                            clearTimeout(this.timeoutHandler);
                        domStyle.set("switcher-down", "display", "none");
                    }, 1000);
                }));
            },
            addBaseMapLayerChanged: function (handler) {
                topic.subscribe(BASE_MAP_LAYER_CHANGED, handler);
            },

            setCurrentImage: function (basemap) {
                _private_obj.changeUIState(basemap);
            }
        });

        var _private_obj = {
            curBasemapIconId: null,

            /**
             * Create Dom node for basemaps.
             * @param basemap
             */
            createBasemapDom: function (basemap) {
                var container = null;
                if (!basemap.visible) {
                    container = _dropDownNode;
                } else {
                    this.curBasemapIconId = basemap.id;
                    container = _normalNode;
                }
                //Create map icon dom.
                var item = domConstruct.create("img", {id: basemap.id, src: basemap.icon}, container);
                on(item, "click", lang.hitch(this, function (event) {
                    //当点击图片item时，派发底图切换事件
                    if (this.curBasemapIconId != basemap.id)//如果点击的是非当前的basemap才publish
                        topic.publish(BASE_MAP_LAYER_CHANGED, basemap);
                }));
            },
            /**
             * 获得 Basemap 通过 Basemap 的type属性
             * @param type
             * @returns {*}
             */
            selectBasemapByType: function (type) {
                var basemap = null;
                for (var i = 0; i < _basemaps.length; i++) {
                    var _basemap = _basemaps[i];
                    if (_basemap.type === type) {
                        basemap = _basemap;
                        break;
                    }
                }
                return basemap;
            },

            /**
             * 根据basemap visible 属性控制basemap是否显示
             * @param type              basemap的type属性
             * @param isShow        是否显示
             */
            createBasemapUIItem: function (type, isShow) {
                var basemap = this.selectBasemapByType(type);
                if (basemap) {
                    basemap.visible = isShow;
                    this.createBasemapDom(basemap);
                }
            },

            /**
             *
             * @param basemap
             */
            changeUIState: function (basemap) {
                this.curBasemapIconId = basemap.id;
                //Modified to change Dom.
                var selectedDom = dom.byId(basemap.id);
                var lastDom = query("#switcher > img")[0];
                domConstruct.place(selectedDom, lastDom, "replace");
                domConstruct.place(lastDom, "switcher-down", "last");
            }
        };

        return instance;
    });
