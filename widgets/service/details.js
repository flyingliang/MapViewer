/**
 * Created by Esri on 2015/4/14.
 */

$(document).ready(function(){
    //
    var result=null;
    //init

    (function(){
        //
        result=window.parent.extraData;
        if(result){
            //
            $("#description").html(result.description);

            $("#create-time").html(result.dateString);

            $("#rest-url").html(result.resturl);
            $("#rest-url").attr("href",result.resturl);
            $("#rest-url").attr("target","_blank");
            //
            $("#soap-url").html(result.soapurl);
            //
            var snapUrl=result.snapurl;
            var thumbUrl="";
            //if(snapUrl){
            //    //
            //
            //}
            //
            var startIndex=snapUrl.indexOf("images");
            //加载默认缩略图
            if(startIndex!==-1){
                //
                thumbUrl="../../assets/"+snapUrl.substring(startIndex,snapUrl.length);
            }else{
                //
                thumbUrl=snapUrl;
            }

            $("#soap-url").attr("href",result.soapurl);
            $("#soap-url").attr("target","_blank");

            $("#thumb").attr("src",thumbUrl);
            $("#title").html(result.servicename);

            $("service-count").html(result.servicecount);
            //
            $("#service-title").html(result.servicefullname);
        }

    })();

});
