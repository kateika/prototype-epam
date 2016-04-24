//Should be called after Google Maps API is loaded
function AddressPicker(input, select, map, callback) {
  this.callback = callback;
  
  //Create map with center in Minsk
  this.map = new google.maps.Map(map, {
    center: {lat: 53.9056591, lng: 27.5598183},
    zoom: 12
  });
  
  //This is for route
  this.directionsService = new google.maps.DirectionsService();
  this.directionsDisplay = new google.maps.DirectionsRenderer({draggable: true, suppressMarkers: true});
  this.directionsDisplay.setMap(this.map);
  
  this.map.addListener("click", this.markerHandler.bind(this));
  this.directionsDisplay.addListener("directions_changed", this.directionChanged.bind(this));
                                     
  //Use it later to fetch address
  this.geocoder = new google.maps.Geocoder;
  
  //Create object with offices latitude and longitude
  var officesOptions = select.getElementsByTagName("option");
  this.offices = {};

  for(var i = 0; i < officesOptions.length; i++) {
    this.offices[officesOptions[i].value] = {lat: +officesOptions[i].getAttribute("data-lat"), lng: +officesOptions[i].getAttribute("data-lng")};
  }

  //Place marker when office was chosen
  select.addEventListener("change", this.chooseOffice.bind(this));
  
  //This is for autocomplete address inside Minsk
  var ne = {lat: 53.966693, lng: 27.742595};
  var sw = {lat: 53.835620, lng: 27.406353};
  var minskBounds = new google.maps.LatLngBounds(sw, ne);
  this.autocomplete = new google.maps.places.Autocomplete(input, {bounds: minskBounds});
  this.autocomplete.addListener('place_changed', this.setHome.bind(this));
  
  //Create reusable markers
  this.homeMarker = new google.maps.Marker({position: {lng: 0, lat: 0}, map: this.map, visible: false, draggable: true});
  this.homeMarker.addListener("dragend", this.markerHandler.bind(this));
  
  this.officeMarker = new google.maps.Marker({position: {lng: 0, lat: 0}, map: this.map, visible: false});  
  
  this.input = input;
  var form = input.closest("form");
  if(form) form.addEventListener("submit", function() {
    event.preventDefault(); 
  });
  
  this.officeLocation = null;
  this.homeLocation = null;
}


//Handle click on map and drag on marker and updates home marker
AddressPicker.prototype.markerHandler = function(event) {
  var clickedLocation = event.latLng;
  var input = this.input;
  var geocodeSettings = {
    'location': clickedLocation
  };
  var self = this;
  this.geocoder.geocode(geocodeSettings, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      
      //NO RESCTRICTIONS FOR NOW
      
      // check is clicked place inside Minsk (if we want)
//      var foundMinsk = false;
//      for(var i = 0; i < results.length; i++) {
//        if (results[i].place_id === "ChIJ02oeW9PP20YR2XC13VO4YQs") {
//          foundMinsk = true;
//          break;
//        }
//      }
//      
//      if(foundMinsk) {
        input.value = results[0].formatted_address;
        self.setHomeLocation(event.latLng);
//      } else {
//        alert("Only Minsk supported");
//      }

    } else {
      console.warn("Geocode error", status);
    }
  });
}

//Get home location from the autocomplete
AddressPicker.prototype.setHome = function() {
  var place = this.autocomplete.getPlace();
  if(place.geometry == undefined) return;
  this.setHomeLocation(place.geometry.location);
};


//Remember location, set marker, fit bounds
AddressPicker.prototype.setHomeLocation = function(location) {
  this.homeLocation = location;
  this.setMarker(this.homeMarker, this.homeLocation);
  this.checkAddresses();
}

//Set marker for office
AddressPicker.prototype.chooseOffice = function(event) {
  var select = event.target;
  if(select.value == "") return;
  
  // wrap {lng:, lat:} LatLngLiteral into LatLng class for use in LatLngBounds
  this.officeLocation = new google.maps.LatLng(this.offices[select.value]);
  this.setMarker(this.officeMarker, this.officeLocation);
  this.checkAddresses();
}

//Set marker from coordinates object
AddressPicker.prototype.setMarker = function(marker, location) {
  this.map.setCenter(location);
  this.map.setZoom(17);
  marker.setVisible(true);
  marker.setPosition(location);
}

//Check if both addresses are selected
AddressPicker.prototype.checkAddresses = function() {
  if(this.homeLocation && this.officeLocation) {
    this.fitBounds();
    this.calcRoute();
  }
}

//Zoom to fit home and office addresses on the map
AddressPicker.prototype.fitBounds = function() {
  var bounds = new google.maps.LatLngBounds();
  
  //extend is for recognize sw and ne coords
  bounds.extend(this.homeLocation);
  bounds.extend(this.officeLocation);
  this.map.fitBounds(bounds);
}

//Route
AddressPicker.prototype.calcRoute = function() {
  var start = this.homeLocation;
  var end = this.officeLocation;
  var request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING
  };
  var self = this;
  this.directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      self.directionsDisplay.setDirections(result);
    }
  });
}

AddressPicker.prototype.directionChanged = function() {
  this.callback(this.homeLocation, this.officeLocation, this.directionsDisplay.getDirections());
}

//Example
//this function is set as callback on Google Maps API load
function init() {
  var input = document.getElementById("home");
  var select = document.getElementById("offices");
  var map = document.getElementById("map");
  var onAddressSelect = function(home, office, route) {
    console.log(home, office, route);
  }
  var addressPicker = new AddressPicker(input, select, map, onAddressSelect);
}
