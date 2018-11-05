window.onload = function(){

    var userLocation = new userPosition();

}


var userPosition = function(){

    var root = this;
	this.userLocations = [];
    this.locationCount = 0;
    this.errorCount = 0;
    this.watchID;
    this.minaccuracy = 30;
    this.accuracy = this.minaccuracy;
    this.displayboxID = 'locationMessages';


    this.construct = function(){

        this.watchUserPosition();

    }

    this.watchUserPosition = function(){

        if( navigator.geolocation ){
			root.watchID = navigator.geolocation.watchPosition( root.currentUserPosition, root.lostUserPosition, { enableHighAccuracy: true, distanceFilter: 1, maximumAge:0, timeout: 6000 } );
		}else{
            root.lostUserPosition( { 'code': 1 } );
		}

    }

    this.currentUserPosition = function( position ){



            if( position.coords.accuracy <= root.accuracy + ( root.accuracy/2 ) ){
                if( root.locationCount > 3 ){ // first tracked locations are not accurate enough
                    root.accuracy = position.coords.accuracy;
                }

                position.timeview = Math.floor(Date.now()/1000); //retrieved time
                root.userLocations[root.locationCount] = position;

                var text = 'Latitude: '+position.coords.latitude+', Longitude: '+position.coords.longitude+', Altitude: '+position.coords.altitude+'<br/>';
                text += 'Location accuracy: ' + (Math.round( position.coords.accuracy * 100 ) / 100) + ' meters (Last update '+convertTimestamp( position.timestamp )+')';
                root.outputMsg( text );

                root.locationCount++;
                if( root.locationCount > 10 ){
                    root.locationCount = 0;
                }

            }else{

                root.lostUserPosition( { 'code': 2 } );

            }


    }

    this.lostUserPosition = function( error ){

        root.errorCount++;

        if( error.code == error.PERMISSION_DENIED || error.code == 1 ){ // new browsers only
            root.outputMsg('Geo Location not available, please check your network and allow location tracking');
        }else if( error.code == 2 ){
            root.outputMsg('Location not found, recalculating..');
        }else if( error.code == 3 ){
            root.outputMsg('Location track timeout, recalculating..');
        }else{
            root.outputMsg('Location not found, recalculating..');
        }

        if( root.errorCount >= 10 ){

            if( navigator.geolocation ){
                navigator.geolocation.clearWatch(root.watchID);
                root.errorCount = 0;
                root.accuracy = root.minaccuracy;
                root.outputMsg('Please check your network connection! Recalculating in 10 seconds..');
                setTimeout(function(){
                    root.watchUserPosition();
                }, 10000 );
            }else{
                root.outputMsg('Geo Location not available, please check your network and allow location tracking');
            }
        }
    }

    this.outputMsg = function( msg ){

        if( document.getElementById(root.displayboxID) == null ){
            var box = document.createElement('div');
            box.setAttribute('id', root.displayboxID);
            document.body.appendChild(box);
        }
        document.getElementById(root.displayboxID).innerHTML = msg;
    }

    this.construct();

}

function convertTimestamp( unixtimestamp ){


    // Months array
    var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    // Convert timestamp to milliseconds
    var date = new Date(unixtimestamp*1000);
    // Year
    var year = date.getFullYear();
    // Month
    var month = months_arr[date.getMonth()];
    // Day
    var day = date.getDate();
    // Hours
    var hours = date.getHours();
    // Minutes
    var minutes = "0" + date.getMinutes();
    // Seconds
    var seconds = "0" + date.getSeconds();
    // Display date time in MM-dd-yyyy h:m:s format
    var dataMMddyyyy = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

    return dataMMddyyyy;

}
