/**
 * Created by Esri on 2015/3/27.
 */
define([
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/PictureFillSymbol",
    "esri/symbols/TextSymbol","esri/Color"],
    function(SimpleMarkerSymbol,SimpleLineSymbol,
             SimpleFillSymbol,PictureMarkerSymbol,PictureFillSymbol,
             TextSymbol,Color){

        var module={
            //
            setConfig:function(symbolConfig){
                this.symConfig=symbolConfig;
            },
            simpleMarkerSymbol:function(){
                //
                return new SimpleMarkerSymbol(this.symConfig.simpleMarkerSymbol);
            },
            //
            simpleLineSymbol:function(){
                //
                //var color=new Color([12,33,22,0.8]);
                //var sls=new SimpleLineSymbol();
                ////
                //sls.setStyle(SimpleLineSymbol.STYLE_SOLID);
                //sls.setColor(color);
                //return sls;
                return new SimpleLineSymbol(this.symConfig.simpleLineSymbol);
            },
            simpleFillSymbol:function(){
                //
                return new SimpleFillSymbol(this.symConfig.simpleFillSymbol);
            },
            pictureMarkerSymbol:function(){
                //
                return new PictureMarkerSymbol(this.symConfig.pictureMarkerSymbol);
            },
            pictureFillSymbol:function(){
                //
                return new PictureFillSymbol(this.symConfig.pictureFillSymbol);
            },
            textSymbol:function(){
                //
                return new TextSymbol(this.symConfig.textSymbol);
            },
            /**
             * 点符号信息 json 描述
             *
             * */
            createSimpleMarkerSymbol:function(symInfo){
                //
                return new SimpleMarkerSymbol(symInfo);
            },

            /**
             * 创建点图片符号
             * @param sysInfo 图片符号信息json描述, 详情参见arcgis server rest api .
             * */
            createPictureMarkerSymbol:function(symInfo){
                //
                return new PictureMarkerSymbol(symInfo);
            }
        };
        return module;
});