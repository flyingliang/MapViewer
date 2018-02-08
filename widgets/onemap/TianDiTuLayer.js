/*© 2015 OneMap - Data © 天地图*/

define("widgets/onemap/TianDiTuLayer",
    ["dojo",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "esri/WKIDUnitConversion",
        "dojox/xml/parser",
        "esri/layers/TiledMapServiceLayer",

        "esri/layers/tiled",
        "esri/layers/agscommon"],
    function (dojo, declare, lang, array, WKIDUnitConversion, Parser, TiledMapServiceLayer) {

        return declare(TiledMapServiceLayer, {
            copyright: null,
            extent: null,
            tileUrl: null,
            layerInfo: null,
            spatialReference: null,
            tileInfo: null,
            displayLevels: null,
            constructor: function (url, options) {

                this.tileUrl = this._url = url;
                //this.tileUr = this._url = "http://t0.tianditu.com/" + type + "/wmts";
                if (!options) {
                    options = {};
                }
                this.id = options.id;
                this.version = options.version || "1.0.0";
                this.displayLevels = options.displayLevels || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
                this.opacity = options.opacity || 1.0;
                this.visible = options.visible && true;
                this.serviceMode = options.serviceMode || "KVP";
                this._identifier = options.identifier || 'vec';
                this._tileMatrixSetId = options.tileMatrixSet || 'c';
                this.format = options.format || 'tiles';
                this.wkid = options.wkid || 3857;
                this._style = options.style || 'default';

                this.layer = options.layer || '';
                this.showAttribution = false;//

                this._parseCapabilities = dojo.hitch(this, this._parseCapabilities);
                this._getCapabilitiesError = dojo.hitch(this, this._getCapabilitiesError);

                this.options = options;
                if (options.serviceMode) {
                    if (options.serviceMode === "KVP" || options.serviceMode === "RESTful") {
                        this.serviceMode = options.serviceMode;
                    } else {
                        console.error("WMTS mode could only be 'KVP' or 'RESTful'");
                        return;
                    }
                }

                this._getCapabilities();
                //this._parseCapabilities();

                this._formatDictionary = {
                    "image/png": ".png",
                    "image/png8": ".png",
                    "image/png24": ".png",
                    "image/png32": ".png",
                    "image/jpg": ".jpg",
                    "image/jpeg": ".jpg",
                    "image/gif": ".gif",
                    "image/bmp": ".bmp",
                    "image/tiff": ".tif"
                };
            },

            getTileUrl: function (level, row, col) {
                var tileUrl;
                if (this.serviceMode === "KVP") {
                    tileUrl = this._url + "SERVICE=WMTS&VERSION=" + this.version + "&REQUEST=GetTile" + "&LAYER=" + this._identifier + "&STYLE=" + this._style + "&FORMAT=" + this.format + "&TILEMATRIXSET=" + this._tileMatrixSetId + "&TILEMATRIX=" + level + "&TILEROW=" + row + "&TILECOL=" + col;
                } else if (this.serviceMode === "RESTful") {
                    var imagePostfix;
                    if (this._formatDictionary[this.format]) {
                        imagePostfix = this._formatDictionary[this.format];
                    }
                    tileUrl = this._url + this._identifier + "/" + this._style + "/" + this._tileMatrixSetId + "/" + level + "/" + row + "/" + col + imagePostfix;
                }
                return tileUrl;
            },

            _getCapabilities: function () {
                var capabilitiesUrl = 'config.json';
                esri.request({
                    url: capabilitiesUrl,
                    handleAs: "json",
                    preventCache: true,
                    load: this._parseCapabilities,
                    error: this._getCapabilitiesError
                });
            },

            _parseCapabilities: function (data) {
                console.log(data);
                this.wkid = data.map.initExtent.spatialReference.wkid;

                var tileUrl = this.tileUrl + '?';
                this._url = tileUrl;

                var rows, cols, origin, wkid, lod, lods = [];


                //TODO TEMPERAY
                if (this.wkid == 900913 || this.wkid == 102100 || this.wkid == 3857) {
                    wkid = 3857;
                } else if (this.wkid == 4490 || this.wkid == 4326) {
                    wkid = 4326;
                }
                this.spatialReference = new esri.SpatialReference({
                    "wkid": wkid
                });
                //due to a wrong order of the topleft point in some of openlayer sample services
                //it needs to hard code the origin point. The only way is to look at the wkid
                if (wkid == 3857 || wkid == 102113 || wkid == 102100) {
                    origin = {
                        "x": -20037508.342787,
                        "y": 20037508.342787
                    };
                } else if (wkid == 4326 || wkid == 4490) {
                    origin = {
                        "x": -180,
                        "y": 90
                    };
                }

                if (wkid == 3857 || wkid == 102113 || wkid == 102100) {
                    this.tileInfo = this.getTiledinfo("webMercator");
                    this.fullExtent = (this.initialExtent = new esri.geometry.Extent(-20037508.342787, -20037508.342787, 20037508.342787, 20037508.342787, new esri.SpatialReference({
                        wkid: 102100
                    })));

                } else if (wkid == 4490 || wkid == 4326) {
                    this.tileInfo = this.getTiledinfo("geographic");
                    this.fullExtent = (this.initialExtent = new esri.geometry.Extent(-180.0, -90.0, 180.0, 90.0, new esri.SpatialReference({
                        wkid: 4326
                    })));
                }
                this.loaded = true;
                this.onLoad(this);
            },

            getTiledinfo: function (type) {
                var tileInfo;
                var lodsArr = null;
                var self = this;

                if (type == "geographic") {
                    lodsArr = [
                        {"level": 1, "resolution": 0.703125, "scale": 295497593.05875003},
                        {"level": 2, "resolution": 0.3515625, "scale": 147748796.52937502},
                        {"level": 3, "resolution": 0.17578125, "scale": 73874398.264687508},
                        {"level": 4, "resolution": 0.087890625, "scale": 36937199.132343754},
                        {"level": 5, "resolution": 0.0439453125, "scale": 18468599.566171877},
                        {"level": 6, "resolution": 0.02197265625, "scale": 9234299.7830859385},
                        {"level": 7, "resolution": 0.010986328125, "scale": 4617149.8915429693},
                        {"level": 8, "resolution": 0.0054931640625, "scale": 2308574.9457714846},
                        {"level": 9, "resolution": 0.00274658203125, "scale": 1154287.4728857423},
                        {"level": 10, "resolution": 0.001373291015625, "scale": 577143.73644287116},
                        {"level": 11, "resolution": 0.0006866455078125, "scale": 288571.86822143558},
                        {"level": 12, "resolution": 0.00034332275390625, "scale": 144285.93411071779},
                        {"level": 13, "resolution": 0.000171661376953125, "scale": 72142.967055358895},
                        {"level": 14, "resolution": 8.58306884765625e-005, "scale": 36071.483527679447},
                        {"level": 15, "resolution": 4.291534423828125e-005, "scale": 18035.741763839724},
                        {"level": 16, "resolution": 2.1457672119140625e-005, "scale": 9017.8708819198619},
                        {"level": 17, "resolution": 1.0728836059570313e-005, "scale": 4508.9354409599309},
                        {"level": 18, "resolution": 5.3644180297851563e-006, "scale": 2254.4677204799655},
                        {"level": 19, "resolution": 2.6822090148925781e-006, "scale": 1127.2338602399827},
                        {"level": 20, "resolution": 1.3411045074462891e-006, "scale": 563.61693011999137}
                    ];
                    //Filter lods
                    var filteredArr = array.filter(lodsArr, function (item) {
                        return array.indexOf(self.displayLevels, item.level) != -1;
                    });
                    tileInfo = new esri.layers.TileInfo({
                        "dpi": 90.71428571428571,    //必须，否则图错
                        "rows": 256,
                        "cols": 256,
                        "compressionQuality": 0,
                        "origin": {
                            "x": -180,
                            "y": 90
                        },
                        "spatialReference": {
                            "wkid": 4326
                        },
                        "lods": filteredArr
                    });
                } else if (type == "webMercator") {
                    lodsArr = [
                        {"level": 1, "resolution": 78271.67350880534, "scale": 295829355.46},
                        {"level": 2, "resolution": 39135.83675440267, "scale": 147914677.73},
                        {"level": 3, "resolution": 19567.918377201335, "scale": 73957338.865},
                        {"level": 4, "resolution": 9783.959188600667, "scale": 36978669.4325},
                        {"level": 5, "resolution": 4891.979594300334, "scale": 18489334.71625},
                        {"level": 6, "resolution": 2445.989797150167, "scale": 9244667.358125},
                        {"level": 7, "resolution": 1222.9948985750834, "scale": 4622333.6790625},
                        {"level": 8, "resolution": 611.4974492875417, "scale": 2311166.83953125},
                        {"level": 9, "resolution": 305.7487246437696, "scale": 1155583.41976562},
                        {"level": 10, "resolution": 152.87436232188531, "scale": 577791.709882812},
                        {"level": 11, "resolution": 76.43718116094266, "scale": 288895.854941406},
                        {"level": 12, "resolution": 38.21859058047133, "scale": 144447.927470703},
                        {"level": 13, "resolution": 19.109295290235693, "scale": 72223.9637353516},
                        {"level": 14, "resolution": 9.554647645117846, "scale": 36111.9818676758},
                        {"level": 15, "resolution": 4.777323822558923, "scale": 18055.9909338379},
                        {"level": 16, "resolution": 2.3886619112794585, "scale": 9027.99546691894},
                        {"level": 17, "resolution": 1.1943309556397292, "scale": 4513.99773345947},
                        {"level": 18, "resolution": 0.597165477819866, "scale": 2256.99886672974},
                        {"level": 19, "resolution": 0.298582738909933, "scale": 1128.49943336487},
                        {"level": 20, "resolution": 0.1492913694549665, "scale": 564.249716682435}
                    ];
                    //Filter lods
                    var filteredArr = array.filter(lodsArr, function (item) {
                        return array.indexOf(self.displayLevels, item.level) != -1;
                    });
                    tileInfo = new esri.layers.TileInfo({
                        "dpi": 90.71428571428571,   //必须，否则图错
                        "rows": 256,
                        "cols": 256,
                        "compressionQuality": 0,
                        "origin": {
                            "x": -20037508.342787,
                            "y": 20037508.342787
                        },
                        "spatialReference": {
                            "wkid": 102100
                        },
                        "lods": filteredArr
                    });
                } else {
                    alert("WMTS服务解析错误");
                    return;
                }

                return tileInfo;
            }
        });
    });
