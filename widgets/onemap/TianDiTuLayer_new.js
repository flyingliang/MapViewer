/**
 * Copyright (c) 2015, Jiang. All rights reserved.
 * Created by Jiang on 2015/12/20.
 */
define("widgets/onemap/TianDiTuLayer",["dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "esri/WKIDUnitConversion",
    "dojox/xml/parser",
    "esri/layers/TiledMapServiceLayer",
    "esri/layers/tiled",
    "esri/layers/agscommon"],
    function (dojo, declare, lang, array, WKIDUnitConversion, Parser, TiledMapServiceLayer) {
    
    return declare([TiledMapServiceLayer],{
        defaultOptions:{
            version:"1.0.0",
            displayLevels:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            opacity:1.0,
            visible:true,
            serviceMode:"KVP"

        },

        constructor:function(url, options) {
            var _options=lang.mixin({}, this.defaultOptions, options);
            if(!_options.url)
                console.error("TianDiTuLayer Error", "The url for TianDiTuLayer is undifined.");


            var wkid = mainMap.spatialReference;
            if (wkid == 900913 || wkid == 102100) {
                wkid = 3857;
            } else if (wkid == 4490) {
                wkid = 4326;
            }
            this.spatialReference = new esri.SpatialReference({
                "wkid": wkid
            });
        },
        getTileUrl:function(level, row, col) {

        }
    });
});