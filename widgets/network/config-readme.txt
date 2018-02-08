{
  //配置路网服务地址
  "routeTaskURL":"http://192.168.90.150:8080/OneMapServer/rest/services/CQ_all_network100_10/NAServer/Route",
  "costs":{
    "time":"Minutes",
    "distance":"Meters"
  },
  //配置转向字段
  "restrictions":{
    "oneway":"Oneway",
    "highway":"Highway",
    "turn":"Turn"
  },

  //配置POI服务,主要用于在驾车出行过程中搜索起点，途经点 ，终点等信息
  "poi":{
    "url":"http://192.168.90.150:8080/OneMapServer/rest/services/CQ_POI/MapServer/0",
    "displayfield":"NAME",
    "expression":"NAME LIKE '${name}%'"
  },

  //路网分析结构显示单位
  "distanceunit":{
    "scale":5000,
    "smallunit":{
      "label":"米",
      "conversion":"1",
      "precision":2
    },
    "largeunit":{
      "label":"公里",
      "precision":1,
      "conversion":1000
    }
  },
  //起点符号
  "startsymbol":{

    "url":"assets/images/common/start.png",
    "height":25,
    "width":21,
    "type":"esriPMS",
    "angle": -30,
    "xoffset":0,
    "yoffset":12
  },
  //终点符号
  "endsymbol":{

    "url":"assets/images/common/end.png",
    "height":25,
    "width":21,
    "type":"esriPMS",
    "angle": -30,
    "xoffset":0,
    "yoffset":12

  },
  //途径点符号
  "passsymbol":{
    "url":"assets/images/common/pass.png",
    "height":21,
    "width":17,
    "type":"esriPMS",
    "angle": -30,
    "xoffset":0,
    "yoffset":10
  },
  //当单击某段路径时显示的符号
  "segmentSymbol":{
    "type":"esriSLS",
    "style":"esriSLSSolid ",
    "color":[48,132,111,168],
    "width":8
  },
  //路径符号
  "routeSymbol":{

    "type":"esriSLS",
    "style":"esriSLSSolid",
    "color":[255,0,0,180],
    "width":4
  }

}
