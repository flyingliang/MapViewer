/**
 * Created by Esri on 2015/3/27.
 */
define(["dojo/string", "dojo/topic", "dojo/dom", "dojo/on",
        "dojo/dom-attr",
        "dojo/_base/lang", "dojo/dom-construct", "dojo/_base/array",
        "dojo/string","dojo/has", "dojo/sniff", "dojo/cookie", "dojo/json",
        "dojo/_base/declare",


        "esri/layers/GraphicsLayer",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/symbols/PictureMarkerSymbol",
        "esri/InfoTemplate", "dojo/dom-style", "esri/domUtils", "esri/graphicsUtils",
        "dojo/query",
        "dojo/mouse",
        "esri/graphic",
        "esri/tasks/FeatureSet",

        "viewer/SymbolManager",

        "dojo/domReady!"
    ],
    function (string, topic, dom, on, domAttr, lang, domConstruct, Array, string,has, sniff, cookie, JSON, declare, GraphicsLayer,
              SimpleMarkerSymbol, SimpleLineSymbol, Color, PictureMarkerSymbol, InfoTemplate, domStyle, domUtils,
              graphicsUtils, query, mouse, Graphic, FeatureSet, SymbolManager) {
        //
        //var _private={};
        //F
        var widgetConfig = null;
        //
        //var map=null;
        //
        var zoomLevel = 13;
        //
        var queryFeatures = [];
        var outFields = [];
        //
        var appEvent = null;
        //

        //
        var currentItems = [];
        //
        var currentLabels = [];

        //
        var pageCount = 10;
        //
        var currentPage = 0;
        //var backPageUrl=null;
        //var resultLayer=null;
        //
        var symbolManager = null;
        //
        var clickedSymbol = null;
        var highlightSymbol = null;
        var labelSymbol = null;
        //
        var infoWindow = null;
        //
        var moduleSelf = null;
        //
        //var QUERY_RESULT_KEY="queryResultKey";
        //var QUERY_CONFIG_KEY="queryConfigKey";

        /**init*/

        //
        var _labelKeyValue = {
            "A": 0,
            "B": 1,
            "C": 2,
            "D": 3,
            "E": 4,
            "F": 5,
            "G": 6,
            "H": 7,
            "I": 8,
            "J": 9
        };
        //
        var _map = null;
        var _contentNode = null;

        var _pageDomNode=null;
        //
        var centerSymbol=null;

        //
        var resultClass = declare(null, {
            //
            constructor: function (map) {
                _map = map;
                //
                if (_map) {
                    infoWindow = _map.infoWindow;
                    infoWindow.setInfoType("poi");
                }
                //_contentNode = domNode;
                //
                symbolManager = new SymbolManager();
                //
                moduleSelf = this;
            },
            //
            setPagers:function(node){
                //
                _pageDomNode=node;
            },
            //
            setContent:function(content){
                //
                _contentNode=content;
            },
            setConfig: function (config) {
                //
                widgetConfig = config;
                if (widgetConfig) {
                    //
                    clickedSymbol = symbolManager.createPictureMarkerSymbol(widgetConfig.clickedSymbol);
                    highlightSymbol = symbolManager.createPictureMarkerSymbol(widgetConfig.highlightSymbol);
                    labelSymbol = symbolManager.createTextSymbol(widgetConfig.textSymbol);
                    //
                    centerSymbol=symbolManager.createPictureMarkerSymbol(widgetConfig.centerSymbol);
                    //
                    outFields = widgetConfig.fields;
                }
            },
            //
            //
            loadQueryResults: function (features) {
                //
                //
                queryFeatures=features;
                //map.graphics.clear();
                //;//04 显示数据
                //var table=dom.byId("result");

                //var tableBody=domConstruct.create("tbody",{},table);
                var tableBody =_contentNode;
                domConstruct.empty(tableBody);
                //
                var symbol = this._normalSymbol();
                //var highlightSymbol=_private.highlightSymbol();
                var template = this._createInfoTemplate(outFields);
                //
                //var features = queryResult.features;
                //
                Array.forEach(features, function (gra) {
                    //
                    //template.setTitle("<strong>名称：</strong>"+gra.attributes["NAME"]);
                    //template.setTitle("<strong>名称：</strong>${NAME}");
                    template.setTitle("${"+widgetConfig.nameField+"}");
                    gra.setInfoTemplate(template);
                    //console.log(template.toJson());
                    gra.setSymbol(symbol);
                    //
                    if(gra.attributes[widgetConfig.nameField]!==moduleSelf._bufferGraName){
                        _map.graphics.add(gra);
                    }
                });
                //
                currentItems = [];
                currentLabels = [];
                //appEvent.dispatchAppEvent(appEvent.SHOW_GRAPHICS_TO_LAYER,graphics);
                var currents = features.slice(currentPage, currentPage + pageCount);
                //
                Array.forEach(currents, function (gra, iindex) {
                    //For reason of properties case sensitive in config ,
                    //  lowerCase and upperCase considered here.
                    if ((gra.attributes[widgetConfig.nameField.toLowerCase()] !== moduleSelf._bufferGraName)
                        || (gra.attributes[widgetConfig.nameField.toUpperCase()] !== moduleSelf._bufferGraName)) {

                        moduleSelf._createRow(tableBody, gra, outFields, iindex);
                        moduleSelf._createLabelSymbolByCopyGra(gra, iindex);
                    }
                });

                var resultCount = features.length;
                //如果查询结果小于当前页数量，则不显示分页控件
                if (resultCount < pageCount) {
                    //
                    $(".page-div").hide();
                } else {
                    //
                    $(".page-div").show();
                    //
                    var totalPages = resultCount / pageCount;
                    var pageMod=resultCount%pageCount;
                    if(pageMod!==0){
                        totalPages=totalPages+1;
                    }
                    this._createPages(totalPages,_pageDomNode);
                }

            },
            _findAliasByName: function (src, name) {
                //
                var result = {};
                for (var i = 0; i < src.length; i++) {
                    //
                    var item = src[i];
                    if (item.name.toLowerCase() === name.toLowerCase()) {
                        //
                        result = item;
                        break;
                    }
                }
                return result;
            },

            _getKeyByValue: function (value) {
                //
                var resultKey = "";
                for (var key in _labelKeyValue) {
                    //
                    var value1 = _labelKeyValue[key];
                    if (value1 === value) {
                        //
                        resultKey = key;
                        break;
                    }
                }
                //
                return resultKey;
            },
            /**
             * 创建列表项
             * */
            _createRow: function (table, gra, outfields, rowIndex) {
                //
                var start = "<table>";
                var end = "</table>";
                //

                var attributes = gra.attributes;
                //
                var innerContent = "";
                var keyCount=0;
                //
                for (var key in attributes) {
                    //
                    var item = this._findAliasByName(outfields, key);
                    //
                    if (item.isShow) {
                        var content = item["alias"] + ":" + attributes[key];
                        //
                        if (content.length > 20) {
                            //
                            var subContent = content.substring(0, 17) + "...";
                            //
                            if(keyCount===0){
                                content=attributes[key];
                                innerContent += "<tr title='" + content + "'><td class='td-name'>" + subContent + "</td></tr>";
                            }else{
                                content=item["alias"] + ":" + attributes[key];
                                innerContent += "<tr title='" + content + "'><td class='td-address'>" + subContent + "</td></tr>";
                            }

                        }
                        else {
                            //
                            if(keyCount===0){
                                content=attributes[key];

                                innerContent += "<tr><td class='td-name'>" + content + "</td></tr>";
                            }else{
                                content=item["alias"] + ":" + attributes[key];
                                innerContent += "<tr><td class='td-address'>" + content + "</td></tr>";
                            }

                        }
                    }
                    keyCount++;
                }
                var tableStr = start + innerContent + end;
                //
                var labelKey = this._getKeyByValue(rowIndex);
                var leftContent = "";
                var rowid = "row" + rowIndex;
                //
                var row = domConstruct.create("tr", {}, table);
                //
                var leftTd = null;
                if (rowIndex === 0) {
                    //
                    leftTd = domConstruct.create("td", {
                        id: rowid,
                        style:"padding-left:10px;",
                        innerHTML: "<label class='left-label'>" + labelKey + "</label>"
                    }, row);
                    //
                    domAttr.set(leftTd, "class", "left-img-start");
                }
                else {
                    leftTd = domConstruct.create("td", {
                        id: rowid,
                        style:"padding-left:10px;",
                        innerHTML: "<label class='left-label'>" + labelKey + "</label>"
                    }, row);

                    domAttr.set(leftTd, "class", "left-image");

                }
                //
                var template = "<tr>" + leftContent +
                    "<td>" + tableStr + "</td>" +
                    "</tr>";

                var info = string.substitute(template, {labelIndex: labelKey, rowIndex: rowid});
                //
                //
                var leftInfo = string.substitute(leftContent, {labelIndex: labelKey, rowIndex: rowid});
                //
                var rightTd = domConstruct.create("td", {
                    style:"padding-left:2px"
                }, row);
                //
                var innerTable = domConstruct.create("table", {
                    innerHTML: tableStr
                }, rightTd);
                //
                //
                domAttr.set(row, "class", "row-info");
                //
                on(row, "click", function (event) {
                    //
                    var infos = $(".row-info-clicked");
                    Array.forEach(infos, function (info) {
                        //
                        $(info).removeClass("row-info-clicked");
                        $(info).addClass("row-info");
                    });
                    //
                    var leftInfos = $(".left-img-start");
                    //
                    Array.forEach(leftInfos, function (leftInfo) {
                        //
                        $(leftInfo).removeClass("left-img-start");
                    });
                    //
                    $(row).addClass("row-info-clicked");
                    $("#" + rowid).addClass("left-img-start");
                    //

                    moduleSelf._showInfoWindow(gra);
                });
                //
                on(row, mouse.enter, function (event) {
                    //
                    $("#" + rowid).removeClass("left-image");
                    $("#" + rowid).addClass("left-img-start");
                });
                on(row, mouse.leave, function (event) {
                    //
                    $("#" + rowid).removeClass("left-img-start");
                    $("#" + rowid).addClass("left-image");
                });
                return row;
            },
            //_getOutFields:function(){
            //    return outFields;
            //},
            _normalSymbol: function () {
                return new SimpleMarkerSymbol(widgetConfig.normalSymbol);
            },

            _highlightSymbol: function () {
                //
                return new PictureMarkerSymbol(widgetConfig.highlightSymbol);
            },
            /**/
            _restoreItemSymbol: function (graphic) {
                //
                //titleField
                var nameField=widgetConfig.nameField;
                var graId = graphic.attributes[nameField];

                Array.forEach(currentItems, function (item, iindex) {
                    //
                    var id = item.attributes[nameField];
                    //
                    //
                    var symbol = symbolManager.createTextSymbol(widgetConfig.textSymbol);
                    //在IE浏览器中设置符号偏移量
                    var browser=moduleSelf._getBrowser();
                    if(browser.ie){
                        symbol.setOffset(0,1);
                    }
                    //
                    var label = moduleSelf._getKeyByValue(iindex);
                    //
                    if (graId === id) {
                        //
                        item.setSymbol(clickedSymbol);
                        //
                    } else {
                        //
                        item.setSymbol(highlightSymbol);
                    }
                    symbol.setText(label);
                    var gra = currentLabels[iindex];
                    gra.setSymbol(symbol);
                });
            },
            _showInfoWindow: function (data) {
                //
                if (data) {
                    //
                    var geo = data.geometry;
                    var attributes = data.attributes;
                    //
                    this._restoreItemSymbol(data);

                    //var infoWindow=map.infoWindow;
                    //
                    //infoWindow.setTitle("<strong>名称：</stront>${NAME}");
                    infoWindow.setTitle("${"+widgetConfig.nameField+"}");
                    var fields = outFields;
                    //
                    var content = "";
                    Array.forEach(fields, function (field) {
                        //
                        //
                        var subContent = "";
                        if (attributes[field.name]) {
                            subContent = attributes[field.name];
                        }
                        if (field.name.toLocaleLowerCase() !== widgetConfig.nameField.toLocaleLowerCase()) {
                            content += "<div class='info-div'><span>" + field.alias + "：</span>" + subContent + "</div>";
                        }
                    });
                    infoWindow.setContent(content);
                    //为弹出框设置当前点击的g.toLocaleLowerCaseraphic
                    infoWindow.setGraphic(data);
                    //
                    infoWindow.setTitleField(widgetConfig.nameField);
                    //
                    //infoWindow.showExtendPanel(true);
                    //
                    infoWindow.show(geo, {closestFirst: true, type: "left"});
                    //
                    _map.centerAndZoom(geo, zoomLevel);
                }
            },
            setZoomLevel: function (level) {
                //
                zoomLevel = level;
            },
            _createInfoTemplate: function (fields) {
                //
                var template = new InfoTemplate();
                //template.setTitle("名称");
                var content = "<div>";
                Array.forEach(fields, function (field) {
                    //
                    if (field.name.toLocaleLowerCase() !== widgetConfig.nameField.toLocaleLowerCase()) {
                        //
                        content += "<div class='info-div'><span>" + field.alias + "：</span>" + "${" + field.name + "}</div>";
                    }
                });
                //
                template.setContent(content + "</div>");
                //
                return template;

            },
            /**/
            _createPages: function (total, domNode) {
                //
                var options = {
                    bootstrapMajorVersion: 3,
                    currentPage: 1,
                    numberOfPages: 4,
                    size: "mini",
                    totalPages: total,
                    alignment:"center",
                    shouldShowPage:function(type,page,current){
                        var status=true;
                        //
                        var lis=$("#pagers > li");
                        if(current===1){
                            //
                            var actives=$(".active");
                            //
                            var count=actives.length;
                            for(var i=0;i<count-1;i++){
                                //
                                $(actives[i]).removeClass("active");
                            }
                           //
                            for(var i=0;i<2;i++){
                                //
                                $(lis[i]).hide();
                                //$(lis[i]).addClass("disabled");
                            }
                        }else if(current===this.totalPages){
                            //
                            var items=$(".active");
                            for(var j=1;j<items.length;j++){

                                $(items[j]).removeClass("active");
                                $(items[j]).addClass("disabled");
                            }
                            //
                            //for(var j=this.totalPages-2;j<this.totalPages;j++){
                            //
                            //    $(lis[j]).removeClass("active");
                            //    $(lis[j]).addClass("disabled");
                            //}
                        }
                        return status;
                    },
                    itemTexts: function (type, page, current) {
                        //
                        switch (type) {
                            //
                            case "first":
                                return "首页";
                            case "prev":
                                return "上一页";
                            case "next":
                                return "下一页";
                            case "last":
                            //return "最后一页";
                            case "page":
                                return page;
                        }
                    },
                    tooltipTitles:function(type, page, current){
                        return "";
                    },
                    onPageClicked: function (e, originalEvent, type, page) {
                        //
                        //
                        if(page===parseInt(total)){
                            //
                            return;
                        }else{
                            //
                            //map.infoWindow.hide();
                            var features = queryFeatures;
                            var startIndex = page * pageCount;
                            var endIndex = startIndex + pageCount;
                            var i = 0;
                            domConstruct.empty(_contentNode);
                            var tableBody = _contentNode;
                            //
                            var labelIndex = 0;
                            currentItems = [];
                            //
                            moduleSelf._clearLastPageContents();
                            //
                            if (features.length) {

                                Array.forEach(features, function (gra) {
                                    //
                                    if (i >= startIndex && i < endIndex) {

                                        moduleSelf._createRow(tableBody, gra, outFields, labelIndex);
                                        //
                                        moduleSelf._createLabelSymbolByCopyGra(gra, labelIndex);

                                        labelIndex = labelIndex + 1;
                                        //
                                    } else {
                                        //
                                        gra.setSymbol(moduleSelf._normalSymbol());
                                    }
                                    i++;
                                });
                                var mapExtent = graphicsUtils.graphicsExtent(currentItems);
                                //
                                if (mapExtent) {
                                    //
                                    //
                                    _map.setExtent(mapExtent);
                                }
                            }
                        }

                        //
                        //query('#pagers > li:last-child')[0].style.display='none';

                    },
                    onPageChanged:function(event, oldPage, newPage){
                        //
                        query('#pagers > li:last-child')[0].style.display='none';
                    }
                };
                //
                //paginator.bootstrapPaginator(options);
                $(domNode).bootstrapPaginator(options);
                //domNode.bootstrapPaginator(options);
                query('#pagers > li:last-child')[0].style.display='none';
            },

            _createLabelSymbolByCopyGra: function (gra, iindex) {
                //
                //
                if (iindex === 0) {
                    //

                    if(!moduleSelf._bufferGraName){
                        gra.setSymbol(clickedSymbol);
                        this._showInfoWindow(gra);
                    }else{
                        gra.setSymbol(highlightSymbol);
                        _map.centerAndZoom(gra.geometry, zoomLevel);
                    }
                } else {
                    //
                    gra.setSymbol(highlightSymbol);
                }

                var label = this._getKeyByValue(iindex);

                labelSymbol = symbolManager.createTextSymbol(widgetConfig.textSymbol);
                //
                var browser=moduleSelf._getBrowser();
                if(browser.ie){
                    labelSymbol.setOffset(0,1);
                }
                labelSymbol.setText(label);
                var labelGra = new Graphic(gra.geometry, labelSymbol, gra.attributes, gra.infoTemplate);
                //
                _map.graphics.add(labelGra);
                //
                currentItems.push(gra);
                currentLabels.push(labelGra);
            },
            _getBrowser:function(){
                var Sys = {};
                var ua = navigator.userAgent.toLowerCase();
                var s;
                (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
                    (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
                        (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
                            (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
                                (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
                                    (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
                //
                return Sys;
            },

            /**/
            _clearLastPageContents: function () {
                //
                Array.forEach(currentLabels, function (labelGra) {
                    //
                    _map.graphics.remove(labelGra);
                });
                currentLabels = [];
            },
            setAppEvent: function (event) {
                //
                appEvent = event;
            },
            setBufferGraName:function(name){
                //
                this._bufferGraName=name;
            },
            //
            hideBusyIndicator: function () {
                //
                appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR, "hideBusyIndicator");
            }
        });

        //
        return resultClass;
        /***
         * =======================================================================
         * 当页面卸载时清除localStorage中的缓存数据...
         * =======================================================================
         * */

    });
