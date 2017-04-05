var MapsGoogle = function () {

    var mapBasic = function () {
        map=new GMaps({
            div: '#gmap_basic',
            lat: -0.191611,
            lng:  -78.483574
        });
         map.setZoom(10);
    }

    return {
        //main function to initiate map samples
        init: function () {
            mapBasic();
        }

    };
}();

jQuery(document).ready(function() {
    MapsGoogle.init();
});

