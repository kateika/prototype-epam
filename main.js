//Should be called after Google Maps API is loaded
function AddressPicker(input, select, map, callback) {
  this.callback = callback;
      
  //Create object with offices latitude and longitude
  var officesOptions = select.getElementsByTagName("option");
  this.offices = {};

  for(var i = 0; i < officesOptions.length; i++) {
    this.offices[officesOptions[i].value] = new google.maps.LatLng({lat: +officesOptions[i].getAttribute("data-lat"), lng: +officesOptions[i].getAttribute("data-lng")});
  }

  //Place marker for chosen office
  select.addEventListener("change", this.officeSelectHandler.bind(this));

  this.officeLocation = this.offices["K1/1"];
  this.homeLocation = new google.maps.LatLng({lat: 53.9056591, lng: 27.5598183});
  
  //Create map with center in Minsk
  this.map = new google.maps.Map(map, {
    center: this.homeLocation,
    zoom: 12
  });
  
  //This is for route
  this.directionsService = new google.maps.DirectionsService();
  this.directionsDisplay = new google.maps.DirectionsRenderer({draggable: true, suppressMarkers: true});
  this.directionsDisplay.setMap(this.map);
    
  this.directionsDisplay.addListener("directions_changed", this.directionChanged.bind(this));
  this.map.addListener("click", this.homeMarkerHandler.bind(this));
                                     
  //Use it later to fetch address
  this.geocoder = new google.maps.Geocoder;
  
  //This is for autocomplete address inside Minsk
  var ne = {lat: 53.966693, lng: 27.742595};
  var sw = {lat: 53.835620, lng: 27.406353};
  var minskBounds = new google.maps.LatLngBounds(sw, ne);
  this.autocomplete = new google.maps.places.Autocomplete(input, {bounds: minskBounds});
  this.autocomplete.addListener('place_changed', this.homeAutocompleteHandler.bind(this));
  
  //Create reusable markers
  var homeMarkerImage = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  this.homeMarker = new google.maps.Marker({map: this.map, visible: true, draggable: true, icon: homeMarkerImage });
  this.homeMarker.addListener("dragend", this.homeMarkerHandler.bind(this));
  this.setHome(this.homeLocation);
  
  var officeMarkerImage = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  this.officeMarker = new google.maps.Marker({map: this.map, visible: true, icon: officeMarkerImage });
  this.setOffice(this.officeLocation);
  
  this.input = input;
  var form = input.closest("form");
  if(form) form.addEventListener("submit", function() {
    event.preventDefault(); 
  });
}

// update input with address for home location
AddressPicker.prototype.setHome = function(latLng) {
  var geocodeSettings = {
    "location": latLng
  };
  var self = this;
  this.geocoder.geocode(geocodeSettings, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      
      //NO RESCTRICTIONS FOR NOW
      
      // check is clicked place inside Minsk (if we want). You can just delete it and nothing change
//      var foundMinsk = false;
//      for(var i = 0; i < results.length; i++) {
//        if (results[i].place_id === "ChIJ02oeW9PP20YR2XC13VO4YQs") {
//          foundMinsk = true;
//          break;
//        }
//      }
//      
//      if(foundMinsk) {
        var input = self.input;
        input.value = results[0].formatted_address;
        self.setHomeLocation(latLng);
//      } else {
//        alert("Only Minsk supported");
//      }

    } else {
      console.warn("Geocode error", status);
    }
  });
}

//Handle click on map and drag on marker and updates home marker
AddressPicker.prototype.homeMarkerHandler = function(event) {
  this.setHome(event.latLng);
}

//Get home location from the autocomplete
AddressPicker.prototype.homeAutocompleteHandler = function() {
  var place = this.autocomplete.getPlace();
  if(place.geometry == undefined) return;
  this.setHomeLocation(place.geometry.location);
};

//Remember location, set marker, show route
AddressPicker.prototype.setHomeLocation = function(latLng) {
  this.homeLocation = latLng;
  this.homeMarker.setPosition(latLng);
  this.showRoute();
}

AddressPicker.prototype.setOffice = function(latLng) {
  this.officeLocation = latLng;
  this.officeMarker.setPosition(latLng);
  this.showRoute();
}

//Set marker for office
AddressPicker.prototype.officeSelectHandler = function(event) {
  var select = event.target;
  if(select.value == "") return;
  this.setOffice(this.offices[select.value]);
}

//Route
AddressPicker.prototype.showRoute = function() {
  var start = this.homeLocation;
  var end = this.officeLocation;
  if(!start && !end) return;
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
