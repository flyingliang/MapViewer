{
   //应用程序名称
  "name": "digitalmap",

//应用程序中地图对象参数
  "map":{
  //地图初始范围
    "initExtent":[112,33,44,5,2],
    //地图全图范围

    "fullExtent":[112,43,45,67],
//是否在地图中显示esri的logo字样
    "esrilogo":false,
//地图中的底图配置
    "layers":[
      {
        "nmae":"nihOMW/",//图层名称
        "type":"tiled",//图层类型
        "url":"",//地图服务URL地址
        "alpha":1.0,//图层透明度 ,取值在0到1之间
        "visible":true,//图层是否可见
        "displaylevels":[1,2,3,4,5],//配置瓦片图层的显示级别

//以下属性用于配置wmts图层
        "identifier":"",//配置wmts类型的图层
        "tileMatrixSet":"",//
        "format":"tiles"
      }
    ],
//地图中可选图层配置
    "opt_layers":[
      {
        "id":"hehe"
      }

    ],
//地图中插件配置，该部分功能用于在后期版本中实现
    "widgets":[

    ]
  }
}


,{
        "required":{
          "url":"",
          "type":"tiled",
          "label":"矢量电子地图标注"
        },
        "options":{
          "visible":true,
          "displayLevels":[6,7,8,9,10,11,12,13,14,15,16,17],
          "opacity":1.0,
          "id":"labelLayer"
        }
      }





[type] 取值说明
        值：tiled，    对应：ArcGISTiledMapServiceLayer
        值：dynamic，  对应：ArcGISDynamicMapServiceLayer
        值：image，    对应：ArcGISImageServiceLayer
        值：feature，  对应：FeatureLayer
        值：wms，      对应：WMSLayer
        值：wmts，     对应：WMTSLayer
        值：wmtsTDT，  对应：TianDiTuLayer
        值：agswmts，  对应：AgsWmtsLayer ArcGIS Server WMTS 服务

[basemaps] 取值说明
        visible       true || false 不能加引号,如果为true，则默认为初始显示图层
                                    只能有一个basemap为true

        [layers]
            id                                  Required For All.                       Unique.
            label                               Optional For All.
            type                                Required For All.
            visible                             Required For All.                       true || false 不能加引号
            opacity                             Optional,Default 1.0                    0-1 Number 不能加引号
            displayLevels(tiled or wmtsTDT)     Required For Tiled Layers(or wmtsTDT)   Array<Number> 不能加引号
            style(wmtsTDT)                      Optional For All.
            identifier(wmtsTDT)                  Optional.
            tileMatrixSet(wmtsTDT)              Required For wmtsTDT
            format(wmtsTDT)                     Optional.
            url                                 Required For All.




常见问题：
    1.配置文件中所有的ID 不能重复。
    2.search/config.json 属性名称敏感，根据服务信息字段名称去配置例，如“nameField”等。
    3.network/config.json 属性名称敏感，根据服务信息字段名称去配置.



map
 |
 |--assets          存放系统图片等资源文件目录
 |--css             存放css文件目录
 |--fonts           存放字体文件资源
 |--libs            存放第三方JS库
 |--viewer          存放系统控制文件
 |--widgets         存放系统小部件
 |--main.js         系统运行主文件
 |--config.json     系统主配置文件
 |--config-readme   系统配置说明文件