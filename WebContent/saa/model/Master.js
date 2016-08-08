//some master data
saa.model.Master = {
		init: function() {
			this._aHobby = ["Badminton", "BasketBall", "Tennis", "Ping Pang",  "Swiming",  
			                "Reading",  "Movie", "Music", "Writing", "Yoga", "Run", "Gym",
			                "Drawing", "Cooking", "Travel"].sort();
			
			this._aExpertise = ['UI', 'SAPUI5', 'HANA','Modeling', 'ABAP', 'FIN Accounting','FIN Control', 'ERP', 'CRM',' HCM','SD', "MM" ].sort();
			
			this._aRole = ["Manager","PO","CPO","Arch","Scrum Master","QM", "KM","UID", "Developer", "Consultant", "Supporting"].sort();
			
		},
		
		getHobbyList: function() {
			return this._aHobby; 
		},
		
		getExpertiseList: function() {
			return this._aExpertise; 
		},
		
		getRoleList: function() {
			return this._aRole; 
		},
		
		_aHobby: null, 
		_aExpertise: null,
		_aRole: null
};