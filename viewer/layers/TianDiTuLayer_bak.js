/**
 * Created by Esri on 2015/4/1.
 */
//
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "esri/geometry/Point",
        "esri/SpatialReference",
        "esri/geometry/Extent",
        "esri/layers/TileInfo",
        "esri/layers/TiledMapServiceLayer"
    ],
    function(declare,lang,Point,SpatialReference,Extent,TileInfo,TiledMapServiceLayer)
    {
        var layer=declare([TiledMapServiceLayer],{

            style:"default",
            layer:"vec",
            tileMatrixSet:"c",
            format:"tiles",

            /**
             * @param {String} url
             * @param {Obejct} options  format{}
             * */
            constructor:function(url,options){
                //
                this.inherited(arguments);
                 //
                lang.mixin(this,options);

                this.baseUrl=url;
                //
                //
                //
                this.spatialReference=new SpatialReference({wkid:4326});
                //
                this.initialExtent = (this.fullExtent = new Extent(-180,-90,180,90, this.spatialReference));
                this._bindTileInfo();
                //
                this.loaded=true;
                this.onLoad(this);
            },
            //
            getTileUrl:function(level,row,col){

                var fullUrl=this.baseUrl+"?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile" + "&FORMAT=" +this.format
                    + "&TILEMATRIXSET=" + this.tileMatrixSet
                    + "&STYLE=" + this.style
                    + "&LAYER=" + this.layer
                    + "&TILEMATRIX=" + level
                    + "&TILEROW=" + row
                    + "&TILECOL=" + col;
                //
                return fullUrl;
            },
            //
            _bindTileInfo:function(){
                //
                var tileProps={
                    //
                    dpi:90.71428571427429,
                    format:"tiles",
                    height:256,
                    width:256,
                    "origin" : {
                        "x" : -180,
                        "y" : 90
                    },
                    "spatialReference" : {
                        "wkid" : 4326
                    },
                    lods:[
                        {"level" : 1, "resolution" : 0.703125, "scale" :2.9549759305875003E8},
                        {"level" : 2, "resolution" : 0.3515625, "scale" :1.4774879652937502E8},
                        {"level" : 3, "resolution" : 0.17578125, "scale" : 7.387439826468751E7},
                        {"level" : 4, "resolution" : 0.087890625, "scale" : 3.6937199132343754E7},
                        {"level" : 5, "resolution" : 0.0439453125, "scale" :1.8468599566171877E7},
                        {"level" : 6, "resolution" : 0.02197265625, "scale" : 9234299.783085939},
                        {"level" : 7, "resolution" :0.010986328125, "scale" : 4617149.891542969},
                        {"level" : 8, "resolution" :0.0054931640625, "scale" :2308574.9457714846},
                        {"level" : 9, "resolution" :0.00274658203125, "scale" :1154287.4728857423},
                        {"level" : 10, "resolution" :0.001373291015625, "scale" :577143.7364428712},
                        {"level" : 11, "resolution" : 6.866455078125E-4, "scale" :288571.8682214356},
                        {"level" : 12, "resolution" : 3.4332275390625E-4, "scale" :144285.9341107178},
                        {"level" : 13, "resolution" : 1.71661376953125E-4, "scale" :72142.9670553589},
                        {"level" : 14, "resolution" : 8.58306884765625E-5, "scale" :36071.48352767945},
                        {"level" : 15, "resolution" : 4.291534423828125E-5, "scale" : 18035.741763839724},
                        {"level" : 16, "resolution" : 2.1457672119140625E-5, "scale" :9017.870881919862},
                        {"level" : 17, "resolution" : 1.0728836059570312E-5, "scale" :4508.935440959931},
                        {"level" : 18, "resolution" : 0.536441802978516e-5, "scale" :2254.4677204799655},
                        {"level" : 19, "resolution" : 0.26822090148925781e-5, "scale" : 1127.2338602399827},
                        {"level" : 20, "resolution" : 1.3411045074462891e-6, "scale" :563.61693011999137}
                    ]
                };
                this.tileInfo=new TileInfo(tileProps);
            }
        });
        //
        return layer;
    });
