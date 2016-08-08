saa.model.CompanyOrg = {
		
		init: function() {
			this._oModel = new sap.ui.model.json.JSONModel();
			this._oModel.setData( this._data);
			
		},
		
		getModel: function () {
			return this._oModel;
		},
		
		getOrganizationData: function() {
			return this._data.organization;
		},
		
		getOrganizationPath: function() {
			return "organization";
		},
		
		//
		setSelectedOrg: function( org) {
			this._selectedOrgIdx = org;
		},
		
		//As an array
		getSelectedOrg: function() {
			return this._data.organization[ this._selectedOrgIdx ].orgs;
		},
		
				
		_oModel: null,
		
		
		//??
		_data: {
			organization: [
			      {name: "FIN",  	orgs: ["AI Dev-FGI-FIN", 'AI Dev-FGI-SHG' ] },
			      //{name: "AGS",  orgs: ""  },
			      {name: "GS",   	orgs: ["GS"]  },
			      {name: "GRC",   	orgs: ["AI Dev-FGI-GRC"]  },
			      {name: "IMS",  	orgs: ["IMS"] },
			      {name: "DNA",  	orgs: ["TIP DNA"] },
			      {name: 'SAP China All', orgs: []}
			     ]
		},
		
		_selectedOrgIdx: 0,
};