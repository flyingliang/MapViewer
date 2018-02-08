/**
 * Created by Esri on 2015/4/8.
 */
/**
 * <pre></pre>
 *
 * */
define(["esri/geometry/Extent","esri/SpatialReference"],function(Extent,SpatialReference){
    //
    var mo={};
    //
    mo.createMapExtent=function(infos,srid){
        //
        if(infos.length<4){

            return null;
        }else{
            //
            var extent=new Extent();
            extent.xmin=infos[0];
            extent.ymin=infos[1];
            extent.xmax=infos[2];
            extent.ymax=infos[3];
            var spatial=new SpatialReference({wkid:srid});
            extent.setSpatialReference(spatial);
            return extent;
        }
    };
    return mo;
});
