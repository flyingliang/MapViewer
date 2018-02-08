/**
 * Created by Esri on 2015/4/1.
 */
//
require(["dojo/dom","dojo/on","dojo/topic","dojo/dom-construct","viewer/ConfigManager",
        "dojo/_base/array","dojo/string","util/extentUtil","dojo/domReady!"],
    function(dom,on,topic,domConstruct,ConfigManager,Array,string,extentUtil){
        //
        var map=window.parent.mainMap;
        var mapWkid=window.parent.wkid;

        var appEvent=null;
        //
        var widgetLayers=null;

        /**init */
        (function(){
            //
            appEvent=window.parent.appEvent;
            if(appEvent){
                appEvent.dispatchAppEvent(appEvent.TAB_PAGE_CHANGED,"行政区划导航");
                //
                appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER,"removeLayer");
            }
            //
        })();
        var _private={};
        //
        /**
         * <pre>create a table row</pre>
         *
         * <@param table html table element.
         *
         * @param cities
         * "cities":[
         *   {
               "name":"������",
              "code":"530100000",
         *   "extent":[102.168357971,24.388877993,103.668996297,26.5454066],
               "district":[
                 {
                   "name":"�廪��",
                   "code":"530102000",
                   "extent":[102.556367427,25.034479252,102.74696918,25.423273076]
                 }
               ]
             }
         * return <tr></tr>
         * */
        _private.createCityRow=function(table,cityies){
            //
            Array.forEach(cityies,function(city){
                var innerTable=_private.createDistrictCell(city.district);
                var template="";
                var content="";
                //
                var tdCode="#td"+city.code;

                template="<td><a id='${code}'>${name}</a></td><td id='${replace}'></td>";

                content=string.substitute(template,{code:city.code,name:city.name,replace:"td"+city.code});
                var rowId="#"+city.code;

                var rowProps={
                    innerHTML:content
                };
                //
                var row=domConstruct.create("tr",rowProps,table);

                $(tdCode).append(innerTable);
                //���¼�
                $(rowId).click(function(){
                    //
                    _private.setMapExtent(city.extent);
                });
            });
        };
        //
        _private.createDistrictCell=function(districts){
            //
            var i=0;
            var table=domConstruct.create("table");
            //
            var row=domConstruct.create("tr",{},table);
            //
            var districtCount=districts.length; var template="";
            Array.forEach(districts,function(district){
                //
                var cellContent="<a id='${code}'>${name}</a>";

                if(i%districtCount==0&&i>0){
                    row=domConstruct.create("tr",{},table);
                }
                //
                var cellProps={
                    //
                    innerHTML:string.substitute(cellContent,{code:district.code,name:district.name})
                };
                //
                i++;
                var cell=domConstruct.create("td",cellProps,row);
                on(cell,"click",function(event){
                    _private.setMapExtent(district.extent);
                });
            });
            //
            return table;
        };
        //
        _private.setMapExtent=function(infos){
            //
            var extent=extentUtil.createMapExtent(infos,mapWkid);
            map.setExtent(extent);
        };

        //
        _private.createProvinceRow=function(table){
            //
            var row=domConstruct.create("tr",{},table);
            return row;
        };

        //
        _private.createProvinceCell=function(row,info){
            //
            var template="<label>${content}</label>";
            //
            var content=string.substitute(template,{"content":info.name});
            var cellProps={
                innerHTML:content
            };
            var cell=domConstruct.create("td",cellProps,row);
            return cell;

        };
        //
        _private.createHotCityList=function(infos){
            //
            var table=dom.byId("hotCityList");
            var row=_private.createProvinceRow(table);

            var i=0;
            var infoCount=infos.length;
            Array.forEach(infos,function(info){
                //
                if(i%infoCount==0&&i>0){
                    row= _private.createProvinceRow(table);
                }
                //
                var cell= _private.createProvinceCell(row,info);

                on(cell,"click",function(event){

                    _private.setMapExtent(info.extent);
                });
                i++;

            });
        };
        //
        _private.createProvinceList=function(infos){
            //
            var table=dom.byId("provinceList");
            //
            var i=0;
            var row=_private.createProvinceRow(table);

            var infoCount=infos.length;
            Array.forEach(infos,function(info){
                //
                if(i%infoCount==0&&i>0){
                    row= _private.createProvinceRow(table);
                }
                //
                var cell= _private.createProvinceCell(row,info);

                on(cell,"click",function(event){
                    var innerTable=dom.byId("cityList");
                    //
                    domConstruct.empty("cityList");
                    _private.createCityRow(innerTable,info.city);

                });
                i++;

            });
        };

        //
        function configLoaded(data){
            //��ʼ�����ų����б�
            _private.createHotCityList(data.hotcities);
            //
            _private.createProvinceList(data.province);
        }
        //
        function configLoadedError(error){
            //
            console.log("region config loaded error : "+error);
        }
        //
        var config=new ConfigManager(configLoaded,configLoadedError);
        //
        config.loadConfig("config.json");

});