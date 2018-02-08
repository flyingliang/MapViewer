/*© 2015 OneMap - Data © 天地图*/

define("widgets/onemap/AgsWmtsLayer",
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

        return declare([TiledMapServiceLayer], {
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
                this._tileMatrixSetId = options.tileMatrixSet || "w";
                this.serviceMode = options.serviceMode || "KVP";
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

                if (options.layerInfo) {
                    this.layerInfo = options.layerInfo;
                    this._identifier = options.layerInfo.identifier;
                    this._tileMatrixSetId = options.layerInfo.tileMatrixSet;
                    this.format = "image/" + options.layerInfo.format;
                    this._style = options.layerInfo.style;
                    this.title = options.layerInfo.title;
                }

                if (options.resourceInfo) {
                    this.version = options.resourceInfo.version;
                    if (options.resourceInfo.getTileUrl) {
                        this._url = this.tileUrl = options.resourceInfo.getTileUrl;
                    }
                    this.copyright = options.resourceInfo.copyright;
                    this.layerInfos = options.resourceInfo.layerInfos;
                    this._parseResourceInfo();
                    this.loaded = true;
                    this.onLoad(this);
                } else {
                    this._getCapabilities();
                }

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

            setActiveLayer: function (layerInfo) {
                this.layerInfo = layerInfo;
                this._identifier = layerInfo.identifier;
                this._tileMatrixSetId = layerInfo.tileMatrixSet;
                if (layerInfo.format) {
                    this.format = "image/" + layerInfo.format;
                }
                this._style = layerInfo.style;
                this.title = layerInfo.title;
                this._parseResourceInfo();
                this.refresh(true);
            },

            getTileUrl: function (level, row, col) {
                level--;//For arcgis level
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

            _parseResourceInfo: function () {
                var layerInfos = this.layerInfos;
                if (this.serviceMode === "KVP") {
                    this._url += (this._url.substring(this._url.length - 1, this._url.length) == "?") ? "" : "?";
                }

                for (var i = 0; i < layerInfos.length; i++) {
                    if ((!this._identifier || layerInfos[i].identifier === this._identifier) && (!this.title || layerInfos[i].title === this.title) && (!this._tileMatrixSetId || layerInfos[i].tileMatrixSet === this._tileMatrixSetId) && (!this.format || "image/" + layerInfos[i].format === this.format) && (!this._style || layerInfos[i].style === this._style)) {
                        dojo.mixin(this, {
                            "description": layerInfos[i].description,
                            tileInfo: layerInfos[i].tileInfo,
                            spatialReference: layerInfos[i].tileInfo.spatialReference,
                            fullExtent: layerInfos[i].fullExtent,
                            initialExtent: layerInfos[i].initialExtent,
                            _identifier: layerInfos[i].identifier,
                            _tileMatrixSetId: layerInfos[i].tileMatrixSet,
                            format: "image/" + layerInfos[i].format,
                            _style: layerInfos[i].style
                        });
                        break;
                    }
                }
            },

            _getCapabilities: function () {
                var capabilitiesUrl;
                if (this.serviceMode === "KVP") {
                    capabilitiesUrl = this._url + "?request=GetCapabilities&service=WMTS&version=" + this.version;
                } else if (this.serviceMode === "RESTful") {
                    capabilitiesUrl = this._url + "/" + this.version + "/WMTSCapabilities.xml";
                }

                esri.request({
                    url: capabilitiesUrl,
                    handleAs: "text",
                    load: this._parseCapabilities,
                    error: this._getCapabilitiesError
                });
            },

            _parseCapabilities: function (xmlText) {
                xmlText = xmlText.replace(/ows:/gi, "");
                var xml = Parser.parse(xmlText);
                //copryright is AccessConstraints
                //find the url for getTile operation
                var metaData = dojo.query("OperationsMetadata", xml)[0];
                var getTile = dojo.query("[name='GetTile']", metaData)[0];
                var tileUrl = this.tileUrl;
                /*if (this._getAttributeValue("Get", "xlink:href", getTile)) {
                    tileUrl = this._getAttributeValue("Get", "xlink:href", getTile);
                }*/
                if (tileUrl.indexOf("/1.0.0/") === -1 && this.serviceMode === "RESTful") {
                    tileUrl += "/1.0.0/";
                }
                if (this.serviceMode === "KVP") {
                    tileUrl += (tileUrl.substring(tileUrl.length - 1, tileUrl.length) == "?") ? "" : "?";
                }
                this._url = tileUrl;

                var contents = dojo.query("Contents", xml)[0];
                var rows, cols, origin, wkid, lod, lods = [];
                //find the layer
                if (!this._identifier) {
                    this._identifier = this._getTagValues('Capabilities>Contents>Layer>Identifier', xml)[0];
                }
                //find copyright info according to AccessConstraints
                this.copyright = this._getTagValues('Capabilities>ServiceIdentification>AccessConstraints', xml)[0];
                var layer = this._getTagWithChildTagValue("Layer", "Identifier", this._identifier, contents);
                //find the description
                this.description = this._getTagValues("Abstract", layer)[0];
                this.title = this._getTagValues("Title", layer)[0];
                //find the style
                if (!this._style) {
                    var styleTag = dojo.query("[isDefault='true']", layer)[0];
                    if (styleTag) {
                        this._style = this._getTagValues("Identifier", styleTag)[0];
                    }
                    this._style = this._getTagValues("Identifier", dojo.query("Style", layer)[0])[0];
                }
                //check if the format is supported
                var formats = this._getTagValues("Format", layer);
                if (!this.format) {
                    this.format = formats[0];
                }
                if (dojo.indexOf(formats, this.format) === -1) {
                    console.error("The format " + this.format + " is not supported by the service");
                }
                //if user doesn't provide tileMatrixSetId, search for "GoogleMapsCompatible",
                //then, use the first one.
                var layerMatrixSetIds = this._getTagValues("TileMatrixSet", layer);
                if (!this._tileMatrixSetId) {
                    if (dojo.indexOf(layerMatrixSetIds, "GoogleMapsCompatible") !== -1) {
                        this._tileMatrixSetId = "GoogleMapsCompatible";
                    } else {
                        this._tileMatrixSetId = layerMatrixSetIds[0];
                    }
                }

                var matrixSetLink = this._getTagWithChildTagValue("TileMatrixSetLink", "TileMatrixSet", this._tileMatrixSetId, layer);
                var layerMatrixIds = this._getTagValues("TileMatrix", matrixSetLink);
                var tileMatrixSet = this._getTagWithChildTagValue("TileMatrixSet", "Identifier", this._tileMatrixSetId, contents);
                var crs = this._getTagValues("SupportedCRS", tileMatrixSet)[0];

                //TODO TEMPERAY
                if (crs) {
                    wkid = crs.split(":").pop();
                } else {
                    wkid = 4490;
                }
                if (wkid == 900913) {
                    wkid = 3857;
                }
                if (wkid == 4490) {
                    wkid = 4326;
                }
                this.spatialReference = new esri.SpatialReference({
                    "wkid": wkid
                });
                /*var firstTileMatrix = dojo.query("TileMatrix", tileMatrixSet)[0];
                rows = parseInt(this._getTagValues("TileWidth", firstTileMatrix)[0], 10);
                cols = parseInt(this._getTagValues("TileHeight", firstTileMatrix)[0], 10);
                var topLeft = this._getTagValues("TopLeftCorner", firstTileMatrix)[0].split(" ");
                var top = topLeft[0],
                    left = topLeft[1];
                if (top.split("E").length > 1) {
                    var topNumbers = top.split("E");
                    top = topNumbers[0] * Math.pow(10, topNumbers[1]);
                }
                if (left.split("E").length > 1) {
                    var leftNumbers = left.split("E");
                    left = leftNumbers[0] * Math.pow(10, leftNumbers[1]);
                }
                origin = {
                    "x": parseInt(top, 10),
                    "y": parseInt(left, 10)
                };
*/
                //due to a wrong order of the topleft point in some of openlayer sample services
                //it needs to hard code the origin point. The only way is to look at the wkid
                if (wkid == 3857 || wkid == 102113 || wkid == 102100) {
                    origin = {
                        "x": -20037508.342787,
                        "y": 20037508.342787
                    };
                } else if (wkid == 4326) {
                    origin = {
                        "x": -180,
                        "y": 90
                    };
                }
               /* var matrixWidth = this._getTagValues("MatrixWidth", firstTileMatrix)[0];
                var matrixHeight = this._getTagValues("MatrixHeight", firstTileMatrix)[0];
                //find lod information, including level, scale and resolution for each level
                if (layerMatrixIds.length === 0) {
                    var tileMatrixes = dojo.query("TileMatrix", tileMatrixSet);
                    for (var j = 0; j < tileMatrixes.length; j++) {
                        lod = this._getLodFromTileMatrix(tileMatrixes[j], wkid);
                        lods.push(lod);
                    }
                } else {
                    for (var i = 0; i < layerMatrixIds.length; i++) {
                        var tileMatrix = this._getTagWithChildTagValue("TileMatrix", "Identifier", layerMatrixIds[i], tileMatrixSet);
                        lod = this._getLodFromTileMatrix(tileMatrix, wkid);
                        lods.push(lod);
                    }
                }*/

               /* var xmin = origin.x;
                var ymax = origin.y;
                //due to a bug in ArcGIS Server WMTS, always pick the larger one as horizontal number of tiles
                var horizontalTileNumber = matrixWidth > matrixHeight ? matrixWidth : matrixHeight;
                var verticalTileNumber = matrixWidth > matrixHeight ? matrixHeight : matrixWidth;
                var xmax = xmin + horizontalTileNumber * cols * lods[0].resolution;
                var ymin = ymax - verticalTileNumber * rows * lods[0].resolution;
                var extent = new esri.geometry.Extent(xmin, ymin, xmax, ymax);
                this.fullExtent = this.initialExtent = extent;*/


                if (wkid == 3857 || wkid == 102113 || wkid == 102100) {
                    this.tileInfo = this.getTiledinfo("webMercator");
                    this.fullExtent = this.initialExtent = new esri.geometry.Extent(-20037508.342787, -20037508.342787, 20037508.342787, 20037508.342787, new esri.SpatialReference({
                        wkid: 102100
                    }))

                } else if (wkid == 4490 || wkid == 4326) {
                    this.tileInfo = this.getTiledinfo("geographic");
                    this.fullExtent = this.initialExtent = new esri.geometry.Extent(-180.0, -90.0, 180.0, 90.0, new esri.SpatialReference({
                        wkid: 4326
                    }));
                }
                //手动增加了几个参数
                // if(this.options.addedParameters){
                // this.fullExtent = this.initialExtent = this.options.addedParameters.fullExtent;
                // }
                // this.spatialReference = this.fullExtent.spatialReference;
//	     
//	     
                // this.tileInfo = new esri.layers.TileInfo({
                // "dpi": 90.71428571428571
                // });
                // dojo.mixin(this.tileInfo, {
                // "spatialReference": this.spatialReference
                // }, {
                // "format": this.format
                // }, {
                // "height": rows
                // }, {
                // "width": cols
                // }, {
                // "origin": origin
                // }, {
                // "lods": lods
                // });
//	     
                // //手动增加了几个参数
                // if(this.options.addedParameters.tiledInfo){
                // this.tileInfo = this.options.addedParameters.tiledInfo;
                // }
                this.loaded = true;
                this.onLoad(this);
            },

            _getCapabilitiesError: function (err) {
                console.error("Module TianDiTuLayer : ", err);
                throw err;
            },

            _getLodFromTileMatrix: function (tileMatrix, wkid) {
                var id = this._getTagValues("Identifier", tileMatrix)[0];
                var matrixScale = this._getTagValues("ScaleDenominator", tileMatrix)[0];
                if (matrixScale.split("E").length > 1) {
                    var scaleNumbers = matrixScale.split("E");
                    matrixScale = scaleNumbers[0] * Math.pow(10, scaleNumbers[1]);
                } else {
                    matrixScale = parseFloat(matrixScale);
                }
                var unitConversion;
                if (esri._isDefined(WKIDUnitConversion[wkid])) {
                    unitConversion = WKIDUnitConversion.values[WKIDUnitConversion[wkid]];
                } else {
                    //1 degree equals to a*2*PI/360 meters
                    unitConversion = 111194.6519066546;
                }
                var resolution = matrixScale * 7 / 25000 / unitConversion;
                //var resolution = matrixScale /420735083.3208889;
                var lod = {
                    "level": id,
                    "scale": matrixScale,
                    "resolution": resolution
                };
                return lod;
            },

            _getTag: function (tagName, xml) {
                var tags = dojo.query(tagName, xml);
                if (tags && tags.length > 0) {
                    return tags[0];
                } else {
                    return null;
                }
            },

            _getTagValues: function (tagTreeName, xml) {
                var tagValues = [];
                var tagNames = tagTreeName.split(">");
                var tag, values;
                tag = dojo.query(tagNames[0], xml)[0];
                if (tagNames.length > 1) {
                    for (var i = 1; i < tagNames.length - 1; i++) {
                        tag = dojo.query(tagNames[i], tag)[0];
                    }
                    values = dojo.query(tagNames[tagNames.length - 1], tag);
                } else {
                    values = dojo.query(tagNames[0], xml);
                }

                if (values && values.length > 0) {
                    dojo.forEach(values, function (value) {
                        if (dojo.isIE) {
                            tagValues.push(value.childNodes[0].nodeValue);
                        } else {
                            tagValues.push(value.textContent);
                        }
                    });
                }
                return tagValues;
            },

            _getAttributeValue: function (tagName, attrName, xml, defaultValue) {
                var value = dojo.query(tagName, xml);
                if (value && value.length > 0) {
                    return value[0].getAttribute(attrName);
                } else {
                    return defaultValue;
                }
            },

            _getTagWithChildTagValue: function (parentTagName, childTagName, tagValue, xml) {
                //find the immediate children with the name of parentTagName
                var children = xml.childNodes;
                var childTagValue;
                for (var j = 0; j < children.length; j++) {
                    if (children[j].nodeName === parentTagName) {
                        //tags.push(children[j]);
                        if (dojo.isIE) {
                            if (esri._isDefined(dojo.query(childTagName, children[j])[0])) {
                                childTagValue = dojo.query(childTagName, children[j])[0].childNodes[0].nodeValue;
                            }
                        } else {
                            if (esri._isDefined(dojo.query(childTagName, children[j])[0])) {
                                childTagValue = dojo.query(childTagName, children[j])[0].textContent;
                            }
                        }
                        if (childTagValue === tagValue) {
                            return children[j];
                        }
                    }
                }
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
