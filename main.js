
var input = document.getElementById('home');
var map, autocomplete;

//Create map with center in Minsk
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 53.9056591, lng: 27.5598183},
    zoom: 10
  });
  
  //This is for autocomplete address
  autocomplete = new google.maps.places.Autocomplete(input);
  
  autocomplete.addListener('place_changed', setHome);
}

//Create object with offices latitude and longitude
var officesSelect = document.getElementById("offices");
var officesOptions = officesSelect.getElementsByTagName("option");
var offices = {};

for(var i = 0; i < officesOptions.length; i++) {
  offices[officesOptions[i].value] = {lat: +officesOptions[i].getAttribute("data-lat"), lng: +officesOptions[i].getAttribute("data-lng")};
}

//Place marker when office was chosen
officesSelect.addEventListener("change", chooseOffice);
function chooseOffice(event) {
  if(officesSelect.value == "") return;
  setMarker(offices[officesSelect.value]);
}


function setHome() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();
  if(place.geometry == undefined) return;
  
  setMarker(place.geometry.location);
}

function setMarker(location) {
  map.setCenter(location);
  map.setZoom(17);
  new google.maps.Marker({position: location, map: map}); 
}

var form = document.getElementsByTagName("form")[0];
form.addEventListener("submit", function() {event.preventDefault()})