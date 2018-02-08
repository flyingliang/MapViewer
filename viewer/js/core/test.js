/**
 * Created by Esri on 2015/3/19.
 */

define(["dojo/_base/declare"],function(declare){
    //
    var _info="";
    var o=declare("Test",null,{
        constructor:function(me){
            _info=me;
        },
        //
        hi:function(){
            //
            alert("say hi to "+_info);
        }
    });
    return o;
});
