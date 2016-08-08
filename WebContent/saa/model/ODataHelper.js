jQuery.sap.require("sap.ui.thirdparty.datajs");

saa.model.ODataHelper = {

	/**
	 * convert the map { key/values} to array, the value will add '' to both
	 * side { HierarchyNodeID: 'CCGH5000' } ==> "HierarchyNodeID='CCGH5000'"
	 */
	createArrayFromMap : function(oMap) {
		var ret = [];
		for ( var key in oMap) {

			// oMap maybe is a complex object (has fuction, or nested obj), only
			// the simple key used for param
			if (saa.util.Util.isSimpeJSType(oMap[key])) {

				var str = key + "=";
				var val = oMap[key];

				// the val if is string, then need add '', other no need
				if (typeof (val) == 'string') {
					str += "'" + val + "'";
				} else {
					str += val;
				}
				ret.push(str);
			}
		}
		return ret;
	},

	/**
	 * 
	 */
	init : function() {
		// ??Even has the metadata, it still return the string (need more
		// investigate, but for the xml format, the DateTime is still string)
		// ??so now manually do the parseInt
		// return;

		// set the the header for the accepted content types

		if (this.bJSON) {
			this._oHeaders["Accept"] = "application/json";
			this._oHandler = OData.jsonHandler;
		} else {
			this._oHeaders["Accept"] = "application/atom+xml,application/atomsvc+xml,application/xml,text/xml";
			
			if (!this._bAddODataBSPSupported) {
				this._bAddODataBSPSupported = true;
				
				//Old is accept: "application/atom+xml,application/atomsvc+xml,application/xml"
				OData.atomHandler.accept += ",text/xml";
			}
			
			this._oHandler = OData.atomHandler;
		}

		// the max version number the client can accept in a response
		this._oHeaders["MaxDataServiceVersion"] = "2.0";

		// set version to 2.0 because 1.0 does not support e.g. skip/top,
		// inlinecount...
		// states the version of the Open Data Protocol used by the client to
		// generate the request.
		this._oHeaders["DataServiceVersion"] = "2.0";

		// need CSRF token for post/delete operation
		this._oHeaders["x-csrf-token"] = "Fetch";

		//this._loadMetadata();
	},

	/**
	 * 
	 * @param sPath
	 *            the path after base url, such as HierarchyNodes, or
	 *            GeneralParameters('US01')
	 * @param aParams
	 *            the extra param after ?
	 * @param fnSucc
	 * @param fnErr
	 * @param context
	 *            the owner of the fnSucc. So in the call back, the
	 *            this==context
	 * @param [cbData]
	 *            (optional) the extra param will pass to the call back after
	 *            the normal Data.js
	 */
	read : function(sPath, aParams, fnSucc, fnErr, context, cbData) {
		var that = this;
		var oReq = this._createRequest(sPath, aParams);
					OData.read(oReq, function(data, response) {
				fnSucc.call(context, data, response, cbData);
		}, function(error) {
				if (fnErr) {
					fnErr.call(context, error, cbData);
				}
		}, this._oHandler, // for the handler
			undefined, // for the client,
			this._oMetadata // for the first time is undefined, but for later it
			// will has the metadata
		);
		
	},

	update : function(sPath, oData, oContext, fnSucc, fnErr, context, cbData) {
		var oRequest, sUrl;

		sUrl = this._getChangeUrl(sPath, oContext);

		oRequest = this._createChangeRequest(sUrl, oData, "PUT", false);

		this._submitChange(oRequest, fnSucc, fnErr, context, cbData);
	},

	remove : function(sPath, oContext, fnSucc, fnErr, context, cbData) {
		var oRequest, sUrl;

		sUrl = this._getChangeUrl(sPath, oContext);

		oRequest = this._createChangeRequest(sUrl, null, "DELETE", false);

		this._submitChange(oRequest, fnSucc, fnErr, context, cbData);
	},

	create : function(sPath, oData, oContext, fnSucc, fnErr, context, cbData) {
		var oRequest, sUrl;

		sUrl = this._getChangeUrl(sPath, oContext);

		oRequest = this._createChangeRequest(sUrl, oData, "POST", false);

		if (saa.cfg.Cfg.isDemoMode()) {
			saa.DemoData.Transform.createNote(oData,fnSucc,fnErr,context,cbData);
		}else{
			this._submitChange(oRequest, fnSucc, fnErr, context, cbData);
		}
	},

	login:function(fnSucc, fnErr, context, cbData)
	{
		oRequest = this._createLoginRequest();
		
		OData.read(oRequest, function(data, response) {
				fnSucc.call(context, data, response, cbData);
			}, function(error) {
				if (fnErr) {
					fnErr.call(context, error, cbData);
				}
			}, this._oHandler, // for the handler
			undefined, // for the client,
			undefined // metadata
		);		
	},

	// ===========private function

	_createLoginRequest : function(bAsync, bCache) {
		// create the url for the service
		var sUrl;

		sUrl = saa.cfg.Cfg.getBaseUrl();

		if (bAsync == undefined) {
			bAsync = true;
		}
		if (bCache === undefined) {
			bCache = true;
		}
		if (bCache === false) {
			var timeStamp = jQuery.now();
			// try replacing _= if it is there
			var ret = sUrl.replace(/([?&])_=[^&]*/, "$1_=" + timeStamp);
			// if nothing was replaced, add timestamp to the end
			sUrl = ret
					+ ((ret === sUrl) ? (/\?/.test(sUrl) ? "&" : "?") + "_="
							+ timeStamp : "");
		}

		// create a request object for the url, url params and async option
		return {
			requestUri : sUrl,
			headers : this._oHeaders,
			async : bAsync,
			user : saa.cfg.Cfg.getUserName(),
			password : saa.cfg.Cfg.getPassword(),
		};

	},

	_submitChange : function(oRequest, fnSucc, fnErr, context, cbData) {

		var that = this;

		function _handleSuccess(oData, oResponse) {
			if (fnSucc) {
				fnSucc.call(context, oData, oResponse, cbData);
			}

		}

		function _handleError(oError) {
			var mParameters = {}, sErrorMsg = "The following problem occurred: "
					+ oError.message;

			mParameters.message = oError.message;
			if (oError.response) {
				// if XSRFToken is not valid we get 403 with the x-csrf-token
				// header : Required.
				// a new token will be fetched in the refresh afterwards.
				if (oError.response.statusCode == '403'
						&& oError.response.headers["x-csrf-token"]) {
					that._oHeaders["x-csrf-token"] = oError.response.headers["x-csrf-token"];
					that._refreshXSRFToken();
				}
				sErrorMsg += oError.response.statusCode + ","
						+ oError.response.statusText + ","
						+ oError.response.body;
				mParameters.statusCode = oError.response.statusCode;
				mParameters.statusText = oError.response.statusText;
				mParameters.responseText = oError.response.body;
			}
			jQuery.sap.log.fatal(sErrorMsg);

			if (fnErr) {
				fnErr.call(context, oError, cbData);
			}
		}

		OData.request(oRequest, _handleSuccess, _handleError, this._oHandler,
				undefined, this._oMetadata);
	},

	_refreshXSRFToken : function() {
		if (this._oHeaders["x-csrf-token"] == "Required") {
			var oHeadersClone = {};
			jQuery.extend(oHeadersClone, this.oHeaders);
			this._oHeaders = {};
			this._oHeaders["x-csrf-token"] = "Fetch";
			this._loadMetadata();
			oHeadersClone["x-csrf-token"] = this._oHeaders["x-csrf-token"];
			jQuery.extend(this._oHeaders, oHeadersClone);
		}
	},

	_getChangeUrl : function(sPath, oContext) {
		var sUrl, sKey;

		if (oContext) {
			sKey = oContext.getPath();
			sKey = sKey.replace(/^\/|\/$/g, "");
		}

		sPath = sPath.replace(/^\/|\/$/g, "");

		if (oContext && sPath) {
			sUrl = saa.cfg.Cfg.getBaseUrl() + sKey + '/' + sPath;
		} else if (!oContext && sPath) {
			sUrl = saa.cfg.Cfg.getBaseUrl() + sPath;
		} else {
			sUrl = saa.cfg.Cfg.getBaseUrl() + sKey;
		}
		return sUrl;
	},

	/**
	 * creation of a request object for changes
	 * 
	 * @return {Object} request object
	 * @private
	 */
	_createChangeRequest : function(sUrl, oPayload, sMethod, bAsync) {

		var oChangeHeader = {};
		jQuery.extend(oChangeHeader, this._oHeaders);

		// make sure to set content type header for POST/PUT requests when using
		// JSON format to prevent datajs to add "odata=verbose" to the
		// content-type header
		if (this.bJSON && sMethod != "DELETE") {
			oChangeHeader["Content-Type"] = "application/json";
		}

		if (sMethod == "MERGE") {
			oChangeHeader["x-http-method"] = "MERGE";
			sMethod = "POST";
		}

		return {
			headers : oChangeHeader,
			requestUri : sUrl,
			method : sMethod,
			data : oPayload,
			async : bAsync
		};
	},

	/**
	 * creates a request object
	 * 
	 * @private
	 */
	_createRequest : function(sPath, aUrlParams, bAsync, bCache) {
		// create the url for the service
		var sUrl;

		sUrl = saa.cfg.Cfg.getBaseUrl() + sPath;

		if ( this.bJSON) {
			if (aUrlParams == null)
				aUrlParams = [];
			aUrlParams.push("$format=json"); 	
		}
		
		if (aUrlParams && aUrlParams.length > 0) {
			sUrl += "?" + aUrlParams.join("&");
		}
		
		if (bAsync == undefined) {
			bAsync = true;
		}
		if (bCache === undefined) {
			bCache = true;
		}
		if (bCache === false) {
			var timeStamp = jQuery.now();
			// try replacing _= if it is there
			var ret = sUrl.replace(/([?&])_=[^&]*/, "$1_=" + timeStamp);
			// if nothing was replaced, add timestamp to the end
			sUrl = ret
					+ ((ret === sUrl) ? (/\?/.test(sUrl) ? "&" : "?") + "_="
							+ timeStamp : "");
		}

		// create a request object for the url, url params and async option
		return {
			requestUri : sUrl,
			headers : this._oHeaders,
			async : bAsync,
			user : saa.cfg.Cfg.getUserName(),
			password : saa.cfg.Cfg.getPassword(),
		};

	},

	_loadMetadata : function() {
		//for demo mode, just ignore it
		if (saa.cfg.Cfg.isDemoMode()) 
			return;
			
		// create a sychronous request object for the metadata request
		var oRequest = this._createRequest("$metadata", null, false, false);

		// request the metadata of the service (currently this is done
		// synchronously)
		var that = this;

		function _handleSuccess(oMetadata, oResponse) {
			if (oResponse) {
				that._oHeaders["x-csrf-token"] = oResponse.headers["x-csrf-token"];
			}
			that._oMetadata = oMetadata;

		}

		function _handleError(oError) {
			var sErrorMsg = "The following problem occurred: " + oError.message;
			if (oError.response) {
				sErrorMsg += oError.response.statusCode + ","
						+ oError.response.statusText + ","
						+ oError.response.body;
			}
			jQuery.sap.log.fatal(sErrorMsg);
		}

		// execute the request
		OData.read(oRequest, _handleSuccess, _handleError,
				OData.metadataHandler);
	},

	_oMetadata : null,
	_oHeaders : {},
	_oHandler : null,
	bJSON : true,
	
	_bAddODataBSPSupported: false

};

