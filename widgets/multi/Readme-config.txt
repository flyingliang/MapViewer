{
    "defaultLYear": 2012,//值 只能为 basemaps 中的id
    "defaultRYear": 2012,
    "basemaps": [
        {
            "id": "2012",
            "type": "vector",
            "layers": [
                {
                    "id": "2012_ArcGISOnlineCN",
                    "label": "ArcGIS Online CN",
                    "type": "tiled",
                    "displayLevels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                    "url": "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"
                }
            ]
        },
        {
            "id": "2013",
            "type": "image",
            "layers": [
                {
                    "id": "2013_tianDiTu_img",
                    "label": "天地图影像",
                    "type": "wmtsTDT",
                    "displayLevels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                    "style": "default",
                    "identifier": "img",
                    "tileMatrixSet": "w",
                    "format": "tiles",
                    "url": "http://t0.tianditu.com/img_w/wmts"
                },
                {
                    "id": "2013_tianDiTu_cia",
                    "label": "天地图影像注记",
                    "type": "wmtsTDT",
                    "displayLevels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                    "style": "default",
                    "identifier": "cia",
                    "tileMatrixSet": "w",
                    "format": "tiles",
                    "url": "http://t0.tianditu.com/cia_w/wmts"
                }
            ]
        },
        {
            "id": "2014",
            "type": "vec",
            "group": "影像",
            "icon": "assets/images/switcher/image_up.png",
            "layers": [
                {
                    "id": "2014_tianDiTu_img",
                    "label": "天地图影像",
                    "type": "wmtsTDT",
                    "displayLevels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                    "style": "default",
                    "identifier": "img",
                    "tileMatrixSet": "w",
                    "format": "tiles",
                    "url": "http://t0.tianditu.com/vec_w/wmts"
                },
                {
                    "id": "2014_tianDiTu_cia",
                    "label": "天地图影像注记",
                    "type": "wmtsTDT",
                    "displayLevels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                    "style": "default",
                    "identifier": "cia",
                    "tileMatrixSet": "w",
                    "format": "tiles",
                    "url": "http://t0.tianditu.com/cva_w/wmts"
                }
            ]
        },
        {
            "id": "2015",
            "type": "vec",
            "group": "影像",
            "icon": "assets/images/switcher/image_up.png",
            "layers": [
                {
                    "id": "2015_xuanyun",
                    "label": "天地图影像",
                    "type": "wmtsTDT",
                    "displayLevels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                    "style": "default",
                    "identifier": "img",
                    "tileMatrixSet": "w",
                    "format": "tiles",
                    "url": "http://t0.tianditu.com/ter_w/wmts"
                }
            ]
        }
    ],
    "layers": [

        {
            "id": "2013",
            "label": "全球影像地图服务",
            "type": "wmtsTDT",
            "visible": true,
            "opacity": 1,
            "displayLevels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            "identifier": "vec",
            "tileMatrixSet": "w",
            "format": "tiles",
            "url": "http://t0.tianditu.com/img_w/wmts"
        },
        {
            "id": "2014",
            "label": "全球地形晕渲地图服务",
            "type": "wmtsTDT",
            "visible": true,
            "opacity": 1,
            "displayLevels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            "identifier": "vec",
            "tileMatrixSet": "w",
            "format": "tiles",
            "url": "http://t0.tianditu.com/ter_w/wmts"
        },
        {
            "id": "2015",
            "label": "全球影像地图服务",
            "type": "wmtsTDT",
            "visible": true,
            "opacity": 1,
            "displayLevels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            "identifier": "vec",
            "tileMatrixSet": "w",
            "format": "tiles",
            "url": "http://t0.tianditu.com/img_w/wmts"
        }
    ]
}
