/* Track Geo position with Geolocation watch */
// accuracy will narrow down after about 3-5 location scans
// devices need space (temporarely less accuracy) to filter and recover location data from switching networks, elektronic fields and other timeouts sometimes
// therefore minAccuracy is an average startingpoint, the real minimal accuracy is 1.5 * last recorded accuracy
// object.userLocations contains the last {maxSaves} locations with accuracy at least 1.5 * {minAccuracy}

window.onload = function(){
    var userLocation = new userPosition();
    // userLocation.message
    // userLocation.datahtml
    // array userLocation.userLocations
}

var userPosition = function(){

    var root = this;

    this.settings = {
        'minAccuracy': 30,
        'maxSaves' : 30,
        'maxTimeout' : 3000,
        'outputLog' : true
    }

    this.watcher; // geolocationWatch
	this.userLocations = []; // array of retrieved locations including timestamp

    this.locationCount = 0;
    this.errorCount = 0;
    this.accuracy = 0;
    this.datahtml = '';

    this.construct = function(){

        this.accuracy = this.settings.minAccuracy; // start accuracy amount
        this.watchUserPosition();

    }

    this.watchUserPosition = function(){

        if( navigator.geolocation ){
			root.watcher = navigator.geolocation.watchPosition( root.currentUserPosition, root.lostUserPosition, { enableHighAccuracy: true, distanceFilter: 1, maximumAge:0, timeout: root.settings.maxTimeout } );
		}else{
            root.lostUserPosition( { 'code': 1 } );
		}

    }

    this.currentUserPosition = function( position ){

            if( position.coords.accuracy <= (1.5 * root.accuracy) ){
                if( root.locationCount > 3 ){ // first tracked locations are not accurate enough to mirror (<=) next accuracies
                    root.accuracy = position.coords.accuracy;
                }

                position.timeview = Math.floor(Date.now()/1000); //retrieved time
                root.userLocations[root.locationCount] = position;

                var text = 'Latitude: '+position.coords.latitude+', Longitude: '+position.coords.longitude+', Altitude: '+position.coords.altitude+'<br/>';
                if( position.coords.heading != 0 && position.coords.heading != null && position.coords.speed != 0 ){
                    text += 'Heading: '+position.coords.heading+', Speed: '+position.coords.speed+'<br/>';
                }
                text += 'Location accuracy: ' + (Math.round( position.coords.accuracy * 100 ) / 100) + ' meters (Last Timestamp '+position.timestamp +')';
                root.datahtml = text;

                root.locationCount++;
                if( root.locationCount > 10 ){
                    root.locationCount = 0;
                }

                if(root.settings.outputLog){
                    console.log(root.datahtml);
                }

            }else{

                root.lostUserPosition( { 'code': 2 } );

            }


    }

    this.lostUserPosition = function( error ){

        root.errorCount++;

        if( error.code == error.PERMISSION_DENIED || error.code == 1 ){ // new browsers only
            root.datahtml = 'Geo Location not available, please check your network and allow location tracking';
        }else if( error.code == 2 ){
            root.datahtml = 'Location not found, recalculating..';
        }else if( error.code == 3 ){
            root.datahtml = 'Location track timeout, recalculating..';
        }else{
            root.datahtml = 'Location not found, recalculating..';
        }

        if( root.errorCount >= 10 ){

            if( navigator.geolocation ){
                navigator.geolocation.clearWatch(root.watcher);
                root.errorCount = 0;
                root.accuracy = root.settings.minAccuracy;
                root.datahtml = 'Please check your network connection! Recalculating in 10 seconds..';
                setTimeout(function(){
                    root.watchUserPosition();
                }, 10000 );
            }else{
                root.datahtml = 'Geo Location not available, please check your network and allow location tracking';
            }
        }

        if(root.settings.outputLog){
            console.log(root.datahtml);
        }

    }

    this.construct();

}
