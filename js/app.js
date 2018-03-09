//Global declaration

var map;
var service;
var currentlocation;
var infowindow;
var locationList;
var testLocation = [];
var homeicon;

// initial the value of variables that will be used in the next function
var initialGoogle = function(){
	infowindow = new google.maps.InfoWindow();
	
	// default icon for base location
	homeicon = {
	    url: 'images/homeicon.png',
		scaledSize: new google.maps.Size(25,40),
		origin: new google.maps.Point(0,0),
		anchor: new google.maps.Point(0,0)
	};

}

// function used to get the detail of the location by providing the lat ad lng values              
var FourSquareDetail = function(input_data){
	var self = this;	
	this.name = input_data.name;
	this.lat = Number(input_data.lat).toFixed(3);
	this.lng = Number(input_data.lng).toFixed(3);
	
	this.URL = "";
	this.formattedAddress = "";
	this.formattedPhone = "";
	this.photo = "";
	this.visible = ko.observable(true);
	// Foursquare API settings
	//var clientID = "V443OTCAQPJLCRY4QWBFYN3ZK5FDKGJOYDHLMI3O342IRVNN";
	//var clientSecret = "AK1JHLEG2D2KW14WF5HYVFNTUYFTBXYS4LDUUNRAHPR5URLB";
	
	//my Account
	var clientID = "MUCQRKE1FW0DVX40JUJJYSXXDPDNDKSVSZ3Q0AHVZDCTUGHT";
	var clientSecret = "GYAOVW2HGQT3HTHB2PQQC4EUS2Q00KHNRV2MTXYC0RFC0ZW0";
	
	// calling foursquare API for specific location with the lat and lng
	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&venuePhotos=1&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170801&limit=1';// + '&query=' + this.name;

	$.getJSON(foursquareURL).done(function(data) {
		var results = data.response.venues[0];
		
		// checking if url, address, and phone number is not undefined
		if (typeof(results.url) === 'undefined'){
			self.URL = "";
		}else{
			self.URL = results.url;
		}
				
		
		if (results.location.formattedAddress == 'undefined'){
			self.formattedAddress = "N/A";
		}else{
			self.formattedAddress = results.location.formattedAddress[0] + "<br>" + results.location.formattedAddress[1];
		}
		self.formattedPhone = results.contact.formattedPhone;
		if (typeof self.formattedPhone === 'undefined'){
			self.formattedPhone = "";
		}else{
			self.formattedPhone = results.contact.formattedPhone;
		}
	}).fail(function(){
		alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
	});
	
	// create marker on the map base on lat and lng
	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(self.lat, self.lng),
			map: map,
			title: self.name							
		});
	// toggle visibility of the marker on the map
	this.toggleMarker = ko.computed(function(){
		if (this.visible() === true){
			this.marker.setMap(map);
		}else{
			this.marker.setMap(null);
		}
		return true;
	}, this);
	
	// receiving the event when the user click on the marker
	this.marker.addListener('click', function() {							
		contentString = '<div><b>' + self.name + "</b></div>" +
			'<div>' + self.formattedAddress + '</b></div>' +
			'<div>' + self.formattedPhone + '</b></div>' +
			'<div><a href="' + ''+ self.URL + '" target="_blank">' + self.URL + '</a></div>';	
			
          infowindow.setContent(contentString);
          infowindow.open(map, this);
        });
    
    // link the event handler to the item list
    this.poiclick = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};	
	
	
};

// function use to convert the post office address to lat and lng value
// return value is format as myhome = {lat: latitude,lng: longitude};
var Location = function(home_address){
	var _self = this;
	this.address = home_address;
	var myhome;
	// start of sethomeAddress
	this.setHomeAddress = function(callback){
		//var address = home_address;
		//var myhome;	
		var geocoder = new google.maps.Geocoder();
			console.log('Address: ' + _self.address);
		
		 			geocoder.geocode({'address': _self.address}, function(results, status) {
			 			if (status === 'OK') {
			 				
			 				var latitude = results[0].geometry.location.lat();
			 				var longitude = results[0].geometry.location.lng();
			 				myhome = {lat: latitude,lng: longitude};
			 				
			 				map = new google.maps.Map(document.getElementById('map'),{
								center: myhome,
								zoom: 13
							});
		            		var marker = new google.maps.Marker({
								position: myhome,
								map: map,
								title: 'My Home',
								icon: homeicon
							});
							//searchNearBy(latitude,longitude);
							google.maps.event.addListener(marker, 'click', function() {
							
							contentString = '<div><b>' + 'My Home' + "</b></div>" +
								'<div><a href="' + '#">' + _self.address + '</a></div>';	
								
					          infowindow.setContent(contentString);
					          infowindow.open(map, this);
					        });
		            		console.log('Return my home lat: ' + myhome['lat']);
		            		callback(myhome);
		            		
		          		} else {
				  			alert('Could not find the address for the following reason: ' + status);
		          		}
			  		});
		
	}
	//end of setHomeAddress


	//this function use search near by POIs around the location for lat and lng provided
	//the type of location is 'park' for this exercise; there should be improvement by
	//adding other types of the location such as store, beach, and etc...
	
	 this.searchPOIs = function(latitude,longitude,POIs){
			  		currentlocation={lat: latitude, lng: longitude};
		  		console.log(currentlocation);
		  		service = new google.maps.places.PlacesService(map);
		  		map = new google.maps.Map(document.getElementById('map'),{
					center:currentlocation,
					zoom: 13
       			});
       			
       			var marker = new google.maps.Marker({
					position: currentlocation,
					map: map,
					title: 'My Location',
					icon: homeicon
       			});
       			google.maps.event.addListener(marker, 'click', function() {
							var address = document.getElementById('address').value;
							contentString = '<div><b>' + 'Base Location' + "</b></div>" +
								'<div>' + address + '</div>';	
								
					          infowindow.setContent(contentString);
					          infowindow.open(map, this);
					        });
		  		service.nearbySearch({
			  		location: currentlocation,
			  		radius: 5000,
			  		type: ['park']
			  		}, callback);	 
			  		
			  	function callback(results, status) {
		  		var listOfPOI = [];

	  			if (status === google.maps.places.PlacesServiceStatus.OK) {
	  				for (var i = 0; i < results.length; i++) {
		  				//createMarker(results[i]);
		  				var newplace = {name: results[i].name, lat: results[i].geometry.location.lat(), lng: results[i].geometry.location.lng()};
	  					
	  					listOfPOI.push(newplace);
	  					
          			}
          			console.log(listOfPOI.length);
          			POIs(listOfPOI);
          			
        		}else{
					alert('Place service error');
        		}
      		}
      		
      		// this function is used to create maker for the location
      		// in this function this marker is not used
      		function createMarker(place) {
	  			var placeLoc = place.geometry.location;
        
		        var marker = new google.maps.Marker({
		          map: map,
		          position: place.geometry.location
		        });

		        google.maps.event.addListener(marker, 'click', function() {
		          infowindow.setContent(place.name + "<br>" + place.vicinity);
		          
		          infowindow.open(map, this);
		        });
      }
    }               
// end search of POIs

}      		

// ViewModel      		
var ViewModel = function(){
	initialGoogle();
	var self = this;
	this.locationList = ko.observableArray([]);
	this.searchString = ko.observable("");
	
	// loading the list of POIs into locationList variable
	// while the user provided the base location
	document.getElementById('submit').addEventListener('click', function() {
		var address = document.getElementById('address').value;	
		var location = new Location(address).setHomeAddress(function(place){
			self.locationList([]);
			console.log(place['lat'] + ' and  ' + place['lng']);
			var poi = new Location(address).searchPOIs(place['lat'],place['lng'],function(listofpoi){
				listofpoi.forEach(function(locationItem){
					self.locationList.push( new FourSquareDetail(locationItem));
				});
			});
		});
	
	});
	
	// Loading the default location when the page is first started to 'Los Angeles, CA'
	var location = new Location("Los Angeles, CA").setHomeAddress(function(place){
		console.log(place['lat'] + ' and  ' + place['lng']);
		var poi = new Location("Los Angeles, CA").searchPOIs(place['lat'],place['lng'],function(listofpoi){
			listofpoi.forEach(function(locationItem){
			self.locationList.push( new FourSquareDetail(locationItem));
			})
		})
	});
	
	// Filter the POIs list when the user input the filter term on the textw box
	this.filteredResult = ko.computed(function(){
		var filtered = self.searchString().toLowerCase();
		if (!filtered){
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			})
			return self.locationList();
		}else{
			return ko.utils.arrayFilter(self.locationList(),function(locationItem){
				var str = locationItem.name.toLowerCase();
				var results = (str.search(filtered) >= 0);
				locationItem.visible(results);
				return results;
				
			})
		}
	}, self);	
				
	
};

// startup function
function startApp(){
	ko.applyBindings(new ViewModel());	
}
	
// Error handler function...	
function errorHandling() {
	alert("Google Maps has failed to load. Please check your internet connection and try again.");
}