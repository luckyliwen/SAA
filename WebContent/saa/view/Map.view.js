jQuery.sap.declare("saa.view.Map");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

var gmLatlng = {};

sap.ui.core.mvc.JSView.extend("saa.view.Map", {
	metadata : {
		properties : {
			
		}
	},

	getControllerName: function() {
		return "saa.controller.Map";
	},	
	
	createContent : function(oController) {
		   return null;
	}, 

	   
	// Just reuse the JSView is enough
	renderer : 'sap.ui.core.mvc.JSViewRenderer',
	
	doInit: function() {
		var toolBar = this.createToolbar();
		
		
		var div =  new sap.ui.core.HTML('GoogleMapContainer',
				
				//{content: "<div id='GoogleMapDiv' style='width:96%; height:90%;margin:auto'></div>"}
				{content: "<div id='GoogleMapDiv' style='margin: auto;'></div>"}
					//{content: "<div id='GoogleMapDiv' style='margin: auto;'></div>"}
				);

		var that=this;
		div.attachAfterRendering( function() {
			if (that._map == null) {
				that._map = that.createGoogleMap();
				
				//now know the size, so can set it
				var width = saa.OrgTreeTableWidth; //$('OrgTreeTable').width();
				var height = $(window).height() - 150;
				//console.error("******", width, height);
				
				$('#GoogleMapDiv').css('width', width +'px');
				$('#GoogleMapDiv').css('height', height +'px');
				
				if (! that._bCreateMarker) {
					//perhaps switch to here later
					that.onFinishedGetAllLatlng();
				}
			}
		});
		
		//toolBar
		var layout = new sap.ui.commons.layout.VerticalLayout({
			content : [ div]
		});
		
				
		//
		this.addContent(layout);
		
		
		// subscribe to event bus
		var bus = sap.ui.getCore().getEventBus();
		bus.subscribe("main", "loadOrganizationSucc", this.onLoadOrganizationSucc, this);
		bus.subscribe("main", "showSelectedOnMap", this.showSelectedOnMap, this);
		
	},
	
	showSelectedOnMap: function() {
		var aSel = saa.model.OrganizationMng.getCheckedList();	
		
		//only for those will show
		for (var id in this._mMarkers) {
			if ( aSel.indexOf(id) == -1) {
				this._mMarkers[id].setMap(null);
			} else {
				this._mMarkers[id].setMap(this._map);
			}
		}
	},
	
	/**
	 * Now the organization information load successful, so can show them on map
	 */
	onLoadOrganizationSucc: function() {
		this._mEmploy = saa.model.OrganizationMng.getEmployAsMap();
		for (var id in this._mEmploy ) {
			
			//only check those no latlng 
			if ( this._mEmploy[id].Latlng == "") {
				this._aNoLatlngEmployId.push(id);
			}
		}
		
		if (this._aNoLatlngEmployId.length>0) {
			this._geocoder = new google.maps.Geocoder();
		
			//start get latLng from address
			this.getLatLngFromAddress();
		} else {
			//all have the latlng, so try to show it
			this._bFinishedGetAllLatlng = true;
			this.onFinishedGetAllLatlng();
		}
	},
	
	/**
	 * After get the latlng from google, then save it back in order to save time to next resolve
	 */
	updateEmployLatlng : function(id, latlng) {
	    var newProp = {};
	    
	    newProp.ID = id;
		newProp.Latlng = latlng;
		
		saa.model.OrganizationMng.updateEmployProperty( newProp, true, this.onUpdateLatlngSucc, this.onUpdateLatlngFail, this, newProp );
	},	   
	
	onUpdateLatlngSucc: function(prop) {
		//console.error(" Update latlng succ for ", prop.ID);
	},
	
	onUpdateLatlngFail: function(prop) {
		//console.error(" ^^^Update latlng fail for ", prop.ID);
	},
	
	
	getLatLngFromAddress: function  ( ) {
		var addr = this._mEmploy[ this._aNoLatlngEmployId[0]].FullAddress;
		var id = this._aNoLatlngEmployId[0];
		var that = this;
		
		this._geocoder.geocode( { address: addr}, 
			function geoResult(results, status) {
				if ( status == google.maps.GeocoderStatus.OK) {
					//only one is enough
					that._mEmploy[ id  ].Latlng = results[0].geometry.location;
					
					//Only used for later
					that._mResolvedAddr[id] = results[0].geometry.location.jb + ":" + results[0].geometry.location.kb;
					
					
					that.updateEmployLatlng( id, that._mResolvedAddr[id]);
					
					//??tmp
					gmLatlng[ id ] = results[0].geometry.location.jb + ":" + results[0].geometry.location.kb;
					
					//console.error('<<< ok for ' + id);
					
				} else {
					//console.error('???? get result error ' + status);
					
					//?? later need choose action be error type
					
					that._mEmploy[ id  ].latLng = ":";
					
					that._mResolvedAddr[id] = ":";
				}
				
				//start next
				that._aNoLatlngEmployId.shift();
				if ( that._aNoLatlngEmployId.length>0) {
					//As now one second only allow 1 request, so use a timeout to slow the request
					setTimeout( function() {
						that.getLatLngFromAddress();	
					}, 1000);
					
				} else {
					//now finished all
					that._bFinishedGetAllLatlng = true;
					that.onFinishedGetAllLatlng();
				}
		});
	},
	
	/**
	 * From the saved latlng ( '31.2891821:121.49079059999997' ) create corresponding latlng
	 * @param employ
	 */
	createLatlng: function(employ) {
		var str = employ.Latlng;
		var aDouble = str.split(":");
		
		return  new google.maps.LatLng( parseFloat(aDouble[0]), parseFloat(aDouble[1]));
	},
	
	createInfoWindowContent: function(employ) {
		
		
		var html = ' <div style="float:left" class="UserImageDiv" style="display:inline;margin-right:5px" > <img width="100" height="130" src=\'{0}\' ></img> </div> '.sapFormat( employ.Image );
        //html += "<table style='border-collapse:collapse;'><tbody>";
        html += "<div style='margin-right:10px;display:inline-block;'><table style='border-collapse:collapse;'><tbody>";
		html += "<tr><td>{0}</td>  <td> <b>{1}</b></tr>".sapFormat('ID',  employ.ID);
		html += "<tr><td>{0}</td>  <td>{1}</td></tr>".sapFormat('Name', employ.Name);
		html += "<tr><td>{0}</td>  <td>{1}</td></tr>".sapFormat('Manager', employ.ManagerName);
		html += "<tr><td>{0}</td>  <td><a href='mailto:{1}'>{1}</a></td></tr>".sapFormat('Email', employ.Email);
		html += "<tr><td>{0}</td>  <td>{1}</td></tr>".sapFormat('Phone', employ.Phone);
		html += "<tr><td>{0}</td>  <td>{1}</td></tr>".sapFormat('Mobile', employ.Mobile);
		//html += '<tr><td> <div class="UserImageDiv" > <img width="100" height="130" src=\'{0}\' ></img> </div> </td></tr>'.sapFormat( employ.Image );
		html += '</tbody></table></div>';
		
		
		
		return html;
	},
	
	
	getEmployIDByMark: function(marker) {
		for (var k in this._mMarkers) {
			if (this._mMarkers[k] == marker)
				return k;
		}
		return "";
	},
	
	/*it can happens either finished get all latlng or first time map page view*/
	onFinishedGetAllLatlng: function() {
		var that = this;
		
		this._inforWindow = new google.maps.InfoWindow();
		
		if ( this._bFinishedGetAllLatlng && this._map!=null ) {
			for (var id in this._mEmploy) {
				
				//only for those have successful latlng
				var employ = this._mEmploy[id];
				
				if (employ.Latlng != "") {
					var latlng = this.createLatlng(employ);
					
					var marker = new google.maps.Marker({
						  position:   	latlng,
						  map: 			this._map,
						  title: 		employ.Name
					  });
					this._mMarkers[ employ.ID] = marker;
					
					google.maps.event.addListener(marker, 'click', function(event) {
						/*var inforWindow = new google.maps.InfoWindow();
						
						//
						//??here can just use table
						var theId = that.getEmployIDByMark(this);
						if (theId != "") {
							
							var content = that.createInfoWindowContent(that._mEmploy[theId]);
							//
					        //inforWindow.setContent("<h1>Contact to lucky?<h1><input type=button value='haha'></input>");
							
							inforWindow.setContent(content);
							
					        //?? can't use marker as it is the last marker
					        //inforWindow.open(that._map, marker);
					        inforWindow.open(that._map, this);
						}*/
						
						
						var theId = that.getEmployIDByMark(this);
						if (theId != "") {
							
							var content = that.createInfoWindowContent(that._mEmploy[theId]);
							//
					        //inforWindow.setContent("<h1>Contact to lucky?<h1><input type=button value='haha'></input>");
							
							that._inforWindow.setContent(content);
							
					        //?? can't use marker as it is the last marker
					        //inforWindow.open(that._map, marker);
							that._inforWindow.open(that._map, this);
						}
						
					});
					
				}
			}
			this._bCreateMarker = true;
		}
	},
	
	
	
	
	onShowMarker: function() {
		for (var id in this._mMarkers) {
			this._mMarkers[id].setMap(this._map);
		}
	},
	
	onHideMarker: function() {
		for (var id in this._mMarkers) {
			this._mMarkers[id].setMap(null);
		}
	},
	
	createToolbar: function() {
		var that = this;
		var oButtonShow = new sap.ui.commons.Button({
			text : "Show Marker",
			press: function() 
			{
				that.onShowMarker();
			}
		});
		
		var oButtonHide = new sap.ui.commons.Button({
			text : "Hide Marker",
			press: function() 
			{
				that.onShowMarker();
			}					
		});

		var toolbar = new sap.ui.commons.Toolbar("MapToolBar",{
			items: [oButtonShow, oButtonHide ]
		}).addStyleClass("MapToolbar");		
		
		return toolbar;
	},
	
	createGoogleMap: function() {
		var mapOptions = {
		          center: new google.maps.LatLng(31.20117497860831, 121.52539730072021),
		          zoom: 14,
		          mapTypeId: google.maps.MapTypeId.ROADMAP
		        };
		 var map = new google.maps.Map(document.getElementById("GoogleMapDiv"),
		            mapOptions);
		 return map;
	},
	
	_map:  null,
	
	//All the marks
	_mMarkers: {},
	_bFinishedGetAllLatlng: false,
	_bCreateMarker: false,
	_mEmploy: null,
	
	_geocoder: null,
	
	//those don't have the corresponding latlng
	_aNoLatlngEmployId: [],
	
	
	//as some address don't have the corresponding latlng, so need query it from GoogleService, after done, then save back 
	_mResolvedAddr: {},
	
});