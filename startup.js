/**
 * Created by Esri on 2015/3/20.
 */
var dojoConfig = (function(){
    var base = location.href.split("/");
    base.pop();
    //base.pop();
    base = base.join("/");
    //document.write(base);
    return {
        async: false,
        isDebug: false,
        parseOnLoad: true,
        packages: [{
            name: "core",
            location: base + "/viewer/js/core"
        }, {
            name: "util",
            location: base + "/viewer/js/util"
        }]
    };
})();
//
$(document).ready(function () {
    $("#slider").addClass("slider_open");
    $("#slider").click(function () {
        if ($("#left-container").css("width") == "342px") {
            $("#left-container").css("width", "0px");
            $("#slider").removeClass("slider_open");
            $("#slider").addClass("slider_close");
            $("#right-container").css("left", "0px");
            //
            $(".common-button").hide();
        } else {
            $("#left-container").css("width", "342px");
            $("#slider").removeClass("slider_close");
            $("#slider").addClass("slider_open");
            $("#right-container").css("left", "342px");
            $(".common-button").show();
        }
    });
});
//
//
var appUrl="http://localhost:8080/arcgis_js_api/library/3.15/3.15/init.js";
//
var map=null;
var configData={};
var widgets={};
var loginInfo={};
//
//
//


