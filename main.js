//Should be called after Google Maps API is loaded
function AddressPicker(input, select, map, callback) {
  this.callback = callback;
  
  //Create map with center in Minsk
  this.map = new google.maps.Map(map, {
    center: {lat: 53.9056591, lng: 27.5598183},
    zoom: 12
  });
  this.map.addListener("click", this.markerHandler.bind(this));
  
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
  
  //This is for autocomplete address
  this.autocomplete = new google.maps.places.Autocomplete(input);
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
  this.setHomeLocation(event.latLng);
  var input = this.input;
  this.geocoder.geocode({'location': this.homeLocation}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      input.value = results[0].formatted_address;
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
    this.callback(this.homeLocation, this.officeLocation);
  }
}

//Zoom to fit home and office addresses on the map
AddressPicker.prototype.fitBounds = function() {
  var bounds = new google.maps.LatLngBounds();
  //extend is for recogtize sw and ne coords
  bounds.extend(this.homeLocation);
  bounds.extend(this.officeLocation);
  this.map.fitBounds(bounds);
}


//Example
//this function is set as callback on Google Maps API load
function init() {
  var input = document.getElementById("home");
  var select = document.getElementById("offices");
  var map = document.getElementById("map");
  var onAddressSelect = function(home, office) {
    console.log(home, office);
  }
  var addressPicker = new AddressPicker(input, select, map, onAddressSelect);
}
