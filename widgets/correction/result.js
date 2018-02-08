/**
 * Created by Esri on 2015/4/16.
 */

require(["dojo/dom","dojo/on","dojo/request/xhr","dojo/string","dojo/json",
        "dojo/dom-construct","dojo/_base/array",
        "dojo/dom-attr",

        "esri/geometry/Point","esri/graphic",
        "esri/symbols/PictureMarkerSymbol",
        "esri/layers/GraphicsLayer",
        "esri/graphicsUtils",
        "dojo/domReady!"],
    function(dom,on,xhr,string,JSON,domConstruct,Array,domAttr,Point,Graphic,
             PictureMarkerSymbol,GraphicsLayer,graphicsUtils){
        //
        var correctService="../../../upload.action?";
        var rightPicUrl="assets/images/correction/right.png";
        var errorPicUrl="assets/images/correction/wrong.png";
        var map=null;
        //
        var symbolManager=null;
        //
        var graphicLayer=null;
        //init
        (function(){
            //
            map=window.parent.parent.mainMap;
            //graphicLayer=new GraphicsLayer({id:""});
            if(map){
                //
                graphicLayer=map.graphics;
            }
        })();
        //
        function loadCorrectionInfos(){
            //
            xhr(correctService,{
                data:{
                    commandId:"MapCorrectionCommand",
                    command:"queryNewestInfos"
                },
                handleAs:"json",
                method:"POST"
            }).then(function(data){
                //
                createCorrrectResults(data);

            },function(error){
                //
                //alert(error);
                appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:error.toString()});
            });
        }
        /**load infos*/
        loadCorrectionInfos();
        //

        function formatErrorState(type){
             //
             var int_type=parseInt(type);
             var state="";
             switch(int_type){
                 case 0:
                     state="未审核";
                     break;
                 case 1:
                     state="审核通过";
                     break;
                 case 2:
                     state="审核未通过";
                     break;
                 default :break ;
             }
             return state;
         }
        //
        function formatErrorType(type){
            var location="";
            var int_type=parseInt(type);
            switch(int_type){
                case 1:
                    location="名称错误";
                    break;
                case 2:
                    location="位置错误";
                    break;
                default:break;
            }
            return location;
        }
        //
        function createCorrrectResults(infos){
            //
            var nodeDom=dom.byId("correct-list");
            Array.forEach(infos,function(info){
                //
                createCorrectResultItem(nodeDom,info);
            });
        }
        /**
         * @param nodeDom the value of tbody
         * @param info  map correction info
         *
         * return <tr></tr> dom
         * */
        function createCorrectResultItem( nodeDom,info){
            //<span class='badge'>12</span>
            //var template="${name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
            //    "${type}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>${state}</strong>";

            var template="<div>${name}</div>" +
                "<div>${type}</div><div>${state}</div>";

            var errorState=formatErrorState(info.state);

            var errorType=formatErrorType(info.errtype);
            //alert(errType+"--"+errState);
            var content=string.substitute(template,{
                name:info.name,
                type:errorType,
                state:errorState
            });
            //
            var liProps={
                //class:"list-group-item",
                innerHTML:content,
                style:" cursor: pointer;"
            };

            //var li=domConstruct.create("a",liProps,nodeDom);
            //
            var row=domConstruct.create("tr",{
                style:"cursor: pointer;"
            },nodeDom);
            //
            var infoName="";
            if(info.name.length>12){
                //
                infoName=info.name.substr(0,9)+"...";
            }else{
                infoName=info.name;
            }
            //
            var nameNode=domConstruct.create("td",{
                innerHTML:infoName

            },row);
            //
            if(info.name.length>12){
                $(nameNode).attr("title",info.name);
            }
            //
            var typeNode=domConstruct.create("td",{
                innerHTML:errorType
            },row);
            var stateNode=domConstruct.create("td",{
                innerHTML:errorState
            },row);
            //

            //

            //
            //domAttr.set(li,"class","list-group-item");
            //
            on(row,"click",function(event){
                //
                //alert(info.geometries);
                //alert(info.name);
                graphicLayer.clear();
                var geometries=JSON.parse(info.geometries);

                var rightGeoJson=null;
                var errorGeoJson=null;
                var rightGra=null;
                var errorGra=null;
                var mapExtent=null;
                if(geometries.length===2){
                    //
                    rightGeoJson=geometries[1];
                    rightGra=createGraphic(rightGeoJson,rightPicUrl);
                    graphicLayer.add(rightGra);
                    mapExtent=graphicsUtils.graphicsExtent([rightGra]);
                    map.setExtent(mapExtent);

                }else if(geometries.length>2){
                    //
                    rightGeoJson=geometries[1];
                    errorGeoJson=geometries[2];
                    rightGra=createGraphic(rightGeoJson,rightPicUrl);
                    errorGra=createGraphic( errorGeoJson,errorPicUrl);
                    graphicLayer.add(rightGra);
                    graphicLayer.add(errorGra);
                    mapExtent=graphicsUtils.graphicsExtent([rightGra,errorGra]);
                    //
                    //var center=mapExtent.getCenter();
                    //if(center){
                    //    //
                    //    mapcenterAndZoom(center);
                    //}expand
                    map.setExtent(mapExtent.expand(2));
                }
            });
        }
        //
        function createGraphic(geojson,symurl){
            //
            var gra=null;
            if(geojson&&symurl){
                //
                try{
                    var json=JSON.parse(geojson);
                    var point=new Point(json);
                    var symbol=new PictureMarkerSymbol(symurl,20,24);
                    gra=new Graphic(point,symbol);
                }catch(e){
                    console.log(e.toString());
                }
            }
            return gra;
        }
});