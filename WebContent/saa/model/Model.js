/**
 * The general model loading information,
 */
saa.model.ModelInfo = function() {
	this.loadStatus = saa.LoadStatus.NotStart;
	this.model = null;
	this.rowInfo = null;
	this.error = null;
};

saa.model.ModelInfo.prototype = {
	// ==public function used by other module
	getLoadStatus : function() {
		return this.loadStatus;
	},

	getSAPModel : function() {
		return this.model;
	},

	getRowInfo : function() {
		return this.rowInfo;
	},
	getError : function() {
		return this.error;
	},

	// ====function used by model module internal
	startLoading : function(fnSucc, fnFail, context, cbData) {
		this.loadStatus = saa.LoadStatus.Pending;
		this._cbFnSucc = fnSucc;
		this._cbFnFail = fnFail;
		this._cbContext = context;
		this._cbData = cbData;
	},
	
	//==following function add only to debug and test the special delay condition, so later can remove 
	onDelayedSucc: function(ms) {
		console.log("!!Now delayed time " + ms + " over");
		if ( this.timeoutId != undefined ) {
			clearInterval(this.timeoutId);
			delete this.timeoutId;
		}
		
		this.loadStatus = saa.LoadStatus.Succ;
		if (this._cbFnSucc) {
			this._cbFnSucc.call(this._cbContext, this._cbData);
		}
	},
 	
	onSucc : function() {
		/*if ( saa.gaDelay.length !=0) {
			var that = this;
			console.log("!!Now start delay simulation for " + saa.gaDelay[ saa.gDelayIdx  % saa.gaDelay.length]);
			
			var ms = saa.gaDelay[ saa.gDelayIdx  % saa.gaDelay.length];
			this.timeoutId = setInterval( function() {
					that.onDelayedSucc( ms );
				},  saa.gaDelay[ saa.gDelayIdx  % saa.gaDelay.length]);
			
			saa.gDelayIdx++;
			return
		};*/
		
		this.loadStatus = saa.LoadStatus.Succ;
		if (this._cbFnSucc) {
			this._cbFnSucc.call(this._cbContext, this._cbData);
		}
	},
	
	onFail : function(error) {
		this.loadStatus = saa.LoadStatus.Fail;
		this.error = error;
		if (this._cbFnFail)
			this._cbFnFail.call(this._cbContext, error, this._cbData);
	},
	
	setModel : function(model) {
		this.model = model;
	},
	
	setRowInfo : function(row) {
		this.rowInfo = row;
	},
	
};

