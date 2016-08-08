var gm, gh;

var gaId=[];

saa.model.OrganizationMng = {
	
		init: function() {
			this._orgModelInfo = new saa.model.ModelInfo();
			
			this._orgSAPModel = new sap.ui.model.json.JSONModel();
			this._mEmployee = {};
			
			gm = this._mEmployee;
			gh = this._mHierRoot.children;
			
			var bus = sap.ui.getCore().getEventBus();
			bus.subscribe("main", "employPropChanged", this.onEmployPropChanged, this);
		},
		
		loadPicture : function( id, fnSucc, fnFail, context,cbData) {
			
		},
		
	  /**
	    * Call back for the employ property changed, now come from 'Edit Dialog'
	    * @param employ
	    */
	   onEmployPropChanged : function ( channel, event, employ) {
		   var id = employ.ID;
		   
		   $.extend(this._mEmployee[id], employ);
		   
		   //if address changed then the FullAddress need update also
		   if ( this._mEmployee[id].Address != "" &&  this._mEmployee[id].City !="" && this._mEmployee[id].Country!= "") {
			   this._mEmployee[id].FullAddress = this._mEmployee[id].Address + ", " + this._mEmployee[id].City + ", " + this._mEmployee[id].Country; 
			} else {
				this._mEmployee[id].FullAddress = "";
			}
	   },
		   
		
		getEmployById: function(id) {
			return this._mEmployee[id];
		},
		
		/*getManagerImageById: function(id) {
			var employ = this._mEmployee[id];
			
			if ( employ.ManagerID != "") {
				 //has name, then use name 
				 if ( employ.ManagerID in this._mEmployee ) {
					employ.ManagerName = this._mEmployee[ employ.ManagerID].Name;
				 } else {
					//just use id is ok
					 employ.ManagerName =  employ.ManagerID; 
				 }
			} else {
				employ.ManagerName = "";
			}
			
			return url; 
		},*/
		
		getEmployAsMap: function() {
			//Only for those have FullAddress
			for ( var k in this._mEmployee) {
				if ( this._mEmployee[k].FullAddress != "" )
				this._mEmployeeHasAddress[k] = this._mEmployee[k];
			}
			
			return this._mEmployeeHasAddress;
		},
		
		getEmailListForSelected: function() {
			var aSel = this.getCheckedList();
			var aEmail = [];
			for (var i=0; i<aSel.length; i++) {
				aEmail.push( this._mEmployee[ aSel[i] ].Email);
			}
			return aEmail;
		},
		
		/**
		 * @return:  the array of id which the row is selected
		 */
		getCheckedList: function() {
			var checkedList = [];
			function getOneLevel( node ) {
				for (var i=0; i<node.children.length; i++) {
					//first check it,
					if ( node.children[i].checked) {
						checkedList.push( node.children[i].ID );
					}
					
					//then the next level
					if ( 'children' in node.children[i]) {
						getOneLevel(node.children[i]);
					}
				}
			}
			getOneLevel(this._mHierRoot);
			
			return checkedList;
		},
		
		//??now just use ajax, later check whether need use the data.js
		/**
		 * Update employ property
		 * 
		 * @param fnSucc
		 * @param fnFail
		 * @param context
		 * @param cbData
		 * @return model info
		 */
		updateEmployProperty : function(employ, async, fnSucc, fnFail, context, cbData) {
			var map = {};
			
			var id = employ.ID;
			
			//here as the employ and cbData will needed in callback, so we clone it 
			map[id] = $.extend( {}, employ);
			
			//then add the keys 
			map[id][ 'keys'] = 'ID';
			
			
			//??If here update the name2 or address then need conver it into unicode otherwise will create problem
			if ( 'Name2' in map[id]) {
				map[id].Name2 = saa.util.Util.encodeToUnicode(employ.Name2);
			}
			if ( 'Address' in map[id]) {
				map[id].Address = saa.util.Util.encodeToUnicode(employ.Address);
			}
			
			//??now as we have the latlng cache, so if user update the address, then we need reset the latlng also
			if (  'Address' in map[id]) {
				map[id].Latlng = "";
			}
			
			var dataContent = JSON.stringify( map);
			
			console.error( " content is: ",dataContent );
			
			var url = saa.cfg.Cfg.getBaseServiceUrl() + 'logic/xsjs/employ.xsjs';
			
			jQuery.ajax({
				url: 	url,
				type:	"put",
				async:	async,
				data: 	dataContent,
				processData:false,
				username:  saa.cfg.Cfg.getUserName(),
				password: saa.cfg.Cfg.getPassword(),

				success:	function(data) {
					console.error("*********update ok");
					fnSucc.call( context, cbData);
				},
				
				error: function(httpRequest, err, obj) {
					console.error("*********update failed", err, obj);
					fnFail.call( context, err, cbData);
				}
			});

		},
		
		
		/**
		 * Load organization information
		 * @param fnSucc
		 * @param fnFail
		 * @param context
		 * @param cbData
		 * @return model info
		 */
		loadOrganization : function(fnSucc, fnFail, context, cbData) {
			
			this._orgModelInfo.startLoading(fnSucc,fnFail,context,cbData);
			
			
			//http://lt5037.wdf.sap.corp:8063/tmp/saa/saa/odata/myservice.xsodata/EmployeeResult?$filter=indexof(Organization, 'Dev-FGI-FIN') ne -1&format=json
			//AI Dev-FGI-SHG
			//$filter=(indexof(Organization, 'Dev-FGI-FIN') ne -1 ) or (indexof(Organization, 'Dev-FGI-SHG') ne -1)
			//http://lt5037.wdf.sap.corp:8063/tmp/saa/saa/odata/myservice.xsodata/EmployeeResult?$filter=(indexof(Organization, 'Dev-FGI-FIN') ne -1 ) or (indexof(Organization, 'Dev-FGI-SHG') ne -1)
			
			//http://lt5037.wdf.sap.corp:8063/tmp/saa/saa/odata/myservice.xsodata/EmployeeResult?$filter= ID eq 'I068108'
			
			//var aParam=[ "$filter=(indexof(Organization, 'Dev-FGI-FIN') ne -1 ) or (indexof(Organization, 'Dev-FGI-SHG') ne -1)"];
			
			var aParam = [];
			
			var orgs = saa.model.CompanyOrg.getSelectedOrg(); 
			if ( orgs.length >0) {
				//the first
				var str = '$filter=(indexof(Organization,\'' + orgs[0] +  '\') eq 0 )';
				
				for (var i=1; i<orgs.length; i++) {
					str += "or ( indexof(Organization,\'" + orgs[i] + '\') eq 0 )';
				}
				aParam.push(str);
			} 
			
			saa.model.ODataHelper.read('EmployResult', aParam, 
					this._onLoadOrganizationSucc,
					this._onLoadOrganizationFail,
					this);
			
			return this._orgModelInfo;
		},
		
		/**
		 * Some of its parent may already added, so just get the shortest list which wait add to hierarchy this time
		 * @param employ
		 * @returns {Array}
		 */
		_getPendingAddList: function (employ) {
			
			var mEmploy = this._mEmployee;
			
			var aPending = [employ.ID];
			var currentEmploy = employ;
			var parent;
			while (true) {
				//the topmost employee, so no manager
				if ( currentEmploy.ManagerID == "") 
					break;
				
				//check whether the parent is exists
				if ( ! (currentEmploy.ManagerID in mEmploy) ) {
					break;
				} else {
					parent = mEmploy[currentEmploy.ManagerID];
				}
				
				if ( parent.bAdded) {
					break;
				} else {
					aPending.push(currentEmploy.ManagerID);
					currentEmploy = parent;
				}
			}
			
			return aPending;
		},
		
		/*add the employ to hierarchy structure, and return the new added variable*/
		_addEmployToHierarchy: function( employ, parentNode) {
			
			//may be the first child, so need care whether children exists or not
			if ( 'children' in parentNode) {
				parentNode.children.push(this.clone(employ));
			} else {
				parentNode.children = [];
				parentNode.children.push(this.clone(employ));
			}
			employ.idxInParent = parentNode.children.length -1;
			employ.bAdded = true;
			
			return parentNode.children[ employ.idxInParent ];
		},
		
		/*Get the index array to it parent*/
		_getHierarchyPath: function( employ) {
			var array = [];
			var node = employ; 
			while(true) {
				array.push( node.idxInParent);
				if ( node.ManagerID == "" || ! (node.ManagerID in this._mEmployee )) {
					break;
				} else {
					node = this._mEmployee[ node.ManagerID  ];
				}
			}
			
			return array;
		},
		
		/**
		 * Get the node by the hierarchy path: for example [1,0] means  this._mHierRoot.children[0].children[1]
		 * @param array
		 * @returns
		 */
		_getNodeByHierarchyPath: function( array) {
			
			//need reverse it
			var topIdx = array[ array.length-1 ];
			var node = this._mHierRoot.children[ topIdx ];
			
			for (var i=array.length-2; i>=0;i--) {
				var idx = array[i];
				node = node.children[idx];
			}
			return node;
		},
		
		//just clone a new object
		clone: function( obj) {
			return $.extend({}, obj, {checked: false});
		},
		
		//After add it, return the just added node, so later can easily get from it
		_addTopmostPendingNodeToHierarchy: function(employ) {
			var ret;
			//case 1: itself is the topmost 
			if ( employ.ManagerID == "" || ! (employ.ManagerID in this._mEmployee )) {
				
				//just add it, here need close it
				this._mHierRoot.children.push( this.clone(employ));
				//also need set the index
				employ.idxInParent = this._mHierRoot.children.length -1;  
			
				ret = this._mHierRoot.children[ employ.idxInParent ];
			} else {
				//parent is there, so need get index from parent to the topmost, then add it
				var array = this._getHierarchyPath( this._mEmployee[ employ.ManagerID]);
				var parentNode = this._getNodeByHierarchyPath(array);
				
				//may be the first child, so need care whether children exists or not
				if ( 'children' in parentNode) {
					parentNode.children.push(this.clone(employ));
				} else {
					parentNode.children = [];
					parentNode.children.push(this.clone(employ));
				}
				employ.idxInParent = parentNode.children.length -1;
				
				ret = parentNode.children[ employ.idxInParent];
			}
			
			employ.bAdded = true;
			
			return ret; 
		},
		
		/**
		 * do some basic process: Name = First + last  FullAddress = 
		 * @param employ
		 */
		_basicProcessEmployInformation: function(employ) {
			//delete unneeded infor
			delete employ['__metadata'];
			delete employ['__proto__'];
		
			
			//as now if one data is null then it will create problem, so need replace all the null to ""
			for (var k in employ) {
				if (employ[k] == null)
					employ[k] = "";
			}
			
			employ.Name = employ.FirstName + ', ' + employ.LastName;
			
			//As the address and name2 may have unicode format,so need conver it here
			employ.Name2 = saa.util.Util.decodeFromUnicode(employ.Name2);
			employ.Address = saa.util.Util.decodeFromUnicode(employ.Address);
			
			//Only when address has set will create the FullAddress
			if ( employ.Address != "" &&  employ.City !="" && employ.Country!= "") {
				employ.FullAddress = employ.Address + ", " + employ.City + ", " + employ.Country; 
			} else {
				employ.FullAddress = "";
			}
			
		},
		
		_onLoadOrganizationSucc: function( data, response ) {
			
			for ( var i = 0; i < data.results.length; i++) {
				//first add to map
				var employ = data.results[i];
				
				this._basicProcessEmployInformation(employ);
				
				this._mEmployee[ employ.ID] = employ;
			}

			//first get the manager name, need do it first as otherwise some node can't get the manager name 
			for ( var i = 0; i < data.results.length; i++) {
				//get the Manager name and url
				var id = data.results[i].ID;
				var employ = this._mEmployee[id];
				
				if ( employ.ManagerID != "") {
					 //has name, then use name 
					 if ( employ.ManagerID in this._mEmployee ) {
						employ.ManagerName = this._mEmployee[ employ.ManagerID].Name;
						
						employ.ManagerImage = this._mEmployee[ employ.ManagerID].Image;
						
					 } else {
						//just use id is ok
						 employ.ManagerName =  employ.ManagerID;
						 employ.ManagerImage = "";
					 }
				} else {
					employ.ManagerName = "";
					employ.ManagerImage = "";
				}
			}
			
			for ( var i = 0; i < data.results.length; i++) {
				var id = data.results[i].ID;
				var employ = this._mEmployee[id];
				
				//maybe added previous 
				if ( employ.bAdded ) {
					continue;
				}
				
				//not added to hierarchy, so first need get the path
				var pendList = this._getPendingAddList(employ);
				
				//then add all the nodes from top to down --till this one, use reverse order
				var parentNode = null;
				for (var idx = pendList.length-1; idx>=0; idx--) {
					var curId = pendList[idx];
					if ( idx == pendList.length-1 ) {
						//for the topmost pending list, need first add or get from the parent list 
						parentNode = this._addTopmostPendingNodeToHierarchy( this._mEmployee[curId]);
					} else {
						parentNode = this._addEmployToHierarchy( this._mEmployee[curId], parentNode );	
					}
				}
				
			}
			
			//set the data and row
			this._orgSAPModel.setData( this._mHierRoot );
			this._orgModelInfo.setModel(this._orgSAPModel);
			this._orgModelInfo.setRowInfo("/");
			
			this._orgModelInfo.onSucc();
			
			
			//??tmp 
			$.each(  this._mEmployee, function(k) {
				gaId.push(k);
			});
		},
		
		_onLoadOrganizationFail: function( error ) {
			this._orgModelInfo.onFail( error );
		},

		_orgSAPModel : null,
		_orgModelInfo:  null,
		
		_mEmployeeHasAddress: {},
		_mEmployee: null,
		_mHierRoot: { children: []},  //here use children so can easy used for d3 lib
};