/**
 * Created by Esri on 2015/4/10.
 */

require(["dojo/request/xhr", "dojo/topic", "dojo/dom", "dojo/dom-construct",
        "dojo/json", "dojo/on", "dojo/string", "dojo/_base/array",
        "dojo/cookie",
        "dojo/request/script",
        "dojo/query",
        "widgets/service/LayerMan",

        "dojo/domReady!"],
    function (xhr, topic, dom, domConstruct, JSON, on, string, arrayUtil,
              cookie, script,query, LayerMan) {

        //var proxyUrl=null;
        var appEvent = null;
        var map = null;

        /**每一页显示的服务条数*/
        var pageCount = 5;
        /**当前页*/
        var currentPage = 0;

        /**服务条件的服务*/
        var queryServices = [];
        //
        //var queryLayers=[];
        //
        var server = "../../../service/*.action?";
        //
        var tokenKey = "";
        //
        var layerMan = null;
        /**初始化*/
        (function () {
            //
            //proxyUrl=window.parent.proxyUrl;
            ;
            appEvent = window.parent.appEvent;
            tokenKey = window.parent.ARCGIS_TOKEN_KEY;
            if (appEvent) {
                //
                //appEvent.dispatchAppEvent(appEvent.TAB_PAGE_CHANGED,"服务资源");
                appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER, "removeLayer");
            }
            //
            map = window.parent.mainMap;
            //console.log("map is :: "+map);
            var app = window.parent.appContext;
            //
            //
            if (app) {
                //
                layerMan = new LayerMan(map, dom.byId("layers"));
                layerMan.setAppEvent(appEvent);
            }
        })();
        ///
        function loadServiceInfos() {
            //
            showBusyIndicator();
            //window.parent.changeTabLabel("服务资源");
            xhr(server, {
                data: {
                    command: "getServices",
                    commandId: "servicecmd"
                },
                method: "POST",
                handleAs: "json"
            }).then(function (results) {
                //
                if (results) {
                    //
                    arrayUtil.forEach(results, function (result) {
                        //
                        var serviceType = result.servicetype;
                        //只加载Arcgis Server 发布的服务
                        if (serviceType === "010100" || serviceType === "021000" || serviceType === "080100" || serviceType === "080000") {
                            //
                            //
                            if (result.fullpermission === "0") {
                                //
                                queryServices.push(result);
                            } else if (result.fullpermission === "1") {
                                //当为安全服务时，只有该用户具备服务的访问权限时才加入服务列表
                                if (result.accessed) {
                                    //
                                    queryServices.push(result);
                                }
                            }
                            //queryServices.push(result);
                            //createServiceItem(tableBody,info);
                            /*console.log("service type::\t"+serviceType);
                             console.log("layer url::\t"+info.transferurl);*/
                        }

                    });
                    //queryServices=results;

                    hideBusyIndicator();
                    //启动分页
                    //
                    var totalServiceCount = queryServices.length;

                    if (totalServiceCount <= pageCount) {
                        //
                        $(".page-div").hide();

                    } else {
                        //
                        $(".page-div").show();
                        var totalPages = parseInt( totalServiceCount / pageCount);
                        //
                        var pageMod=totalServiceCount%pageCount;
                        if(pageMod!==0){
                            totalPages=totalPages+1;
                        }
                        createPages(totalPages, $("#pagers"));
                    }
                    //
                    var currentResults = queryServices.slice(currentPage, currentPage + pageCount);
                    parseServices(currentResults);
                    //

                }
            }, function (error) {
                //
                hideBusyIndicator();
                //alert(error);

                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:error.toString()});
            });
        }

        //
        function hideBusyIndicator() {
            appEvent.dispatchAppEvent(appEvent.HIDE_BUSY_INDICATOR, "hideBusyIndicator");
        }

        function showBusyIndicator() {
            //
            appEvent.dispatchAppEvent(appEvent.SHOW_BUSY_INDICATOR, "showBusyIndicator");
        }

        //
        function loadServiceDetails(serviceId) {
            //
            if (serviceId) {
                //
                xhr(server, {
                    data: {
                        command: "getServiceDetail",
                        serviceid: serviceId,
                        commandId: "servicecmd"
                    },
                    method: "POST",
                    handleAs: "json"
                }).then(function (result) {
                    //
                    window.parent.extraData = result;
                    //alert(result.servicename);
                    var param = {
                        url: "widgets/service/details.html",
                        title: "服务详情",
                        data: result
                    };
                    //
                    appEvent.dispatchAppEvent(appEvent.SHOW_LARGE_DIALOG, param);
                }, function (error) {
                    //
                    //alert("获取服务详情失败" + error.toString());
                    appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"获取服务详情失败"+error.toString()});
                });
            }
        }

        //;
        loadServiceInfos();
        //refreshServiceQueryParams();
        //
        function parseServices(infos) {
            //
            //;

            if (infos && infos.length > 0) {
                //
                //
                $("#page-group").show();
                var tableBody = dom.byId("service-list");
                //
                domConstruct.empty("service-list");
                //
                //var tableBody = domConstruct.create("tbody", {}, table);
                //
                arrayUtil.forEach(infos, function (info) {
                    createServiceItem(tableBody, info);
                });
            } else {
                //
                $("#page-group").hide();
            }
        }

        //
        //function refreshServiceQueryParams(){
        //    //
        //    xhr(server,{
        //        data:{
        //            command:"refreshServiceQueryParams",
        //            commandId:"servicecmd",
        //            "servicequeryname":"",
        //            servicefunctiontype:"",
        //            nodecodes:null,
        //            nodecode:-2,
        //            sortname:"time",
        //            sorttype:"desc"
        //        },
        //        method:"POST",
        //        handleAs:"json"
        //    }).then(function(result){
        //        //
        //        loadServiceInfos();
        //    },function(error){
        //        //
        //        alert("获取服务信息失败"+error.toString());
        //    });
        //}
        //
        //refreshServiceQueryParams();
        //
        function createServiceItem(table, info) {
            //
            var serviceId = info.serviceid;
            //
            //var btnAdd="add"+serviceId;

            var layerId = info.servicename + info.serviceid;

            var btnDetails = "details" + serviceId;
            var btnCollect = "collect" + serviceId;

            /*var template="<td><label class='service-label'>名称：${name}</label><br><label class='service-label'>描述：${description}</label><br><label class='service-label'>创建时间：${createtime}</label><br>" +
             "<div class='btn-panel'>" +
             "<label id='${add}' class='service service-add'>添加到地图</label>" +
             "<label id='${details}' class='service service-details'>详细信息</label>" +
             "<label id='${collect}' class='service service-favorite'>收藏</label>" +
             "</div>" +
             "</td>";*/

            var template = "<td><label class='service-label'>名称：${name}</label><br><label class='service-label'>描述：${description}</label><br><label class='service-label'>创建时间：${createtime}</label><br>" +
                "<div class='btn-panel'>" +
                "<label id='${add}' class='service service-add'>添加到地图</label>" +
                "<label id='${details}' style='padding-left: 27px;' class='service service-details'>详细信息</label>" +
                "<hr class='last-line'></div>" +
                "</td>";
            var content = string.substitute(template, {
                name: info.servicefullname,
                description: info.description,
                createtime: info.dateString,
                add: layerId,
                details: btnDetails,
                collect: btnCollect
            });
            //
            var rowProps = {
                innerHTML: content
            };

            //alert(template);
            var row = domConstruct.create("tr", rowProps, table);
            //

            //
            $("#" + layerId).click(function () {
                //
                var serviceUrl = setArcGisServiceUrl(info);
                if (serviceUrl !== "") {
                    //
                    var layerInfo = {
                        id: layerId,
                        label: layerId,
                        type: "dynamic",
                        visible: true,
                        opacity: 1.0,
                        url: serviceUrl
                    };
                    //
                    var node = dom.byId(layerId);
                    var data = {
                        layer: layerInfo,
                        domNode: node
                    };
                    appEvent.dispatchAppEvent(appEvent.ADD_LAYER, data);
                }
                //layerInfo=info;
                //checkSpatialRefOfService(info.transferurl);
                //var that=this;
            });
            //

            $("#" + btnDetails).click(function () {
                //
                //alert("details");
                //
                loadServiceDetails(info.serviceid);
            });
            //
            //$("#"+btnCollect).click(function(){
            //    //
            //    //
            //    var layer=map.getLayer(layerId);
            //    if(layer){
            //        //
            //        map.removeLayer(layer);
            //    }
            //});
        }

        //
        function setArcGisServiceUrl(info) {
            var resultUrl = "";
            //安全服务
            if (info.fullpermission === "1") {
                //
                var token = cookie(tokenKey);
                //
                if (token) {
                    resultUrl = info.transferurl + "?token=" + token;
                } else {
                    //显示登录框
                    //alert("您加载的服务为安全服务，请先登录后在打开");
                    var param = {
                        url: "widgets/login/login.html",
                        title: "用户登录",
                        data: info
                    };
                    //
                    appEvent.dispatchAppEvent(appEvent.SHOW_SMALL_DIALOG, param);
                    //
                }
            } else {
                //自由服务
                resultUrl = info.transferurl;
            }
            return resultUrl;
        }

        //
        //
        //function changePageContent(tag){
        //    //
        //    switch(tag){
        //        //
        //        case "prev":
        //            currentPage--;
        //            break;
        //        case "next":
        //            currentPage++;
        //            break;
        //        default :
        //            break;
        //    }
        //    //
        //    var startIndex=currentPage*pageCount;
        //
        //    var endIndex=startIndex+pageCount;
        //    //
        //    var infos=queryServices.slice(startIndex,endIndex);
        //    //
        //    parseServices(infos);
        //}
        //
        function createPages(total, domNode) {
            //
            var options = {
                bootstrapMajorVersion: 3,
                currentPage: 1,
                numberOfPages: 4,
                size: "small",
                totalPages: total,

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
                        //return "&gt;&gt;|";
                        case "page":
                            return page;
                    }
                },
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
                    }
                    return status;
                },
                tooltipTitles:function(type, page, current){
                    return "";
                },
                onPageChanged:function(event, oldPage, newPage){
                    //
                    query('#pagers > li:last-child')[0].style.display='none';
                },
                onPageClicked: function (e, originalEvent, type, page) {
                    //
                    //var features=queryServices//queryServices.features();
                    //if(page===parseInt(total)){
                    //    return;
                    //}else{
                    //    //
                    //    var startIndex = (page-1) * pageCount;
                    //    var endIndex = startIndex + pageCount;
                    //    //
                    //    var currentResults = queryServices.slice(startIndex, endIndex);
                    //    parseServices(currentResults);
                    //}
                    var startIndex = (page-1) * pageCount;
                    var endIndex = startIndex + pageCount;
                    //
                    var currentResults = queryServices.slice(startIndex, endIndex);
                    parseServices(currentResults);
                }
            };
            $(domNode).bootstrapPaginator(options);
            query('#pagers > li:last-child')[0].style.display='none';
        }

        //


        //
        //var layerInfo=null;
        //
        //function checkSpatialRefOfService(serverUrl){
        //    //
        //    if(serverUrl){
        //        //
        //        script.get(serverUrl,{
        //            jsonp: "callback",
        //            query:{
        //                f:"json"
        //            }
        //        }).then(function(data){
        //            //
        //            var layerWkid=data.spatialReference.wkid;
        //            var mapWkid=map.spatialReference.wkid;
        //            if(layerWkid!==mapWkid){
        //                //
        //                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"当前服务的坐标系与底图不一致，不能添加!"});
        //            }else{
        //                //
        //                addLayer(layerInfo);
        //            }
        //
        //        },function(error){
        //            //
        //            appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:"获取图层信息失败"+error.toString()});
        //        });
        //    }
        //    //xhr();
        //}
        //
        //$("#prev").click(function () {
        //    //
        //    changePageContent("prev");
        //});
        //
        //$("#next").click(function () {
        //    //
        //    changePageContent("next");
        //});
        ////$
        $("#tab-service").click(function () {
            //
            $("#services").show();
            $("#layers").hide();
            //
            $("#arrow-left").show();
            $("#arrow-right").hide();
            //
            changeStyle("service");
        });
        //
        $("#tab-layer").click(function () {
            //
            $("#services").hide();
            $("#layers").show();
            $("#arrow-left").hide();
            $("#arrow-right").show();
            changeStyle("layer");
            //
            //
            domConstruct.empty("layers");
            layerMan.loadLayers();
        });
        //
        var layerClicked = "tab-layer-clicked";
        var serviceClicked = "tab-service-clicked";
        var tabLayer = "tab-layer";
        var tabService = "tab-service";
        //
        function removeStyles() {
            //
            $("#tab-service").removeClass(serviceClicked);
            $("#tab-service").removeClass(tabService);
            $("#tab-layer").removeClass(tabLayer);
            $("#tab-layer").removeClass(layerClicked);
        }

        function changeStyle(type) {
            //
            removeStyles();
            if (type === "layer") {
                //removeStyles();
                $("#tab-layer").addClass(layerClicked);
                $("#tab-service").addClass(tabService);

            } else if (type === "service") {
                //
                $("#tab-layer").addClass(tabLayer);
                $("#tab-service").addClass(serviceClicked);

            }
        }
    });