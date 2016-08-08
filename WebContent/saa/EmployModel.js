	/**
	 * Encode string to unicode, so for string 李  then the output will be \u674e
	 * @param str
	 * @returns
	 */
	function encodeToUnicode( str ) {
	//Only when it have some string is not normal >127
	var isBig = false;
	for (var i=0; i<str.length; i++) {
		if ( str.charCodeAt(i) > 127) {
			isBig = true;
			break;
		}
	}
	
	if ( !isBig)
		return str;
	
	//one by one get the unicode, then convert to hex, then add it
	var ret = "";
	for (var i=0; i<str.length; i++) {
		var code = str.charCodeAt(i);
		var hex = code.toString(16);
		
		//as it it may be just normal string, so need add the missed 00 so a will like \u0061
		if ( hex.length != 4) {
			var prefix= "";
			for (var k=0;  k <(4- hex.length); k++) {
				prefix += '0';
			}
			hex = prefix + hex;
		}
		
		ret += "\\u" + hex;
	}

	return ret;
};

		/**
		 * Update employ property
		 * 
		 * @param employ:  The employ entry, one map, like
			{Address: "东方路环龙路"
			ID: "I068108"
			Mobile: "+86 13482788670"
			Name2: "李稳" }
		 * @param fnSucc   Call back function for success update
		 * @param fnFail   Call back function for failure
		 * @param context  The context (this pointer) of the call back
		 * @param cbData   The data which will pass back to the call back   
		 */
		function updateEmployProperty(employ, async, fnSucc, fnFail, context, cbData) {
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
			
			var url = "http://lt5037.wdf.sap.corp:8063/tmp/saa/saa/logic/xsjs/employ.xsjs";
			
			jQuery.ajax({
				url: 	url,
				type:	"put",
				async:	async,
				data: 	dataContent,
				processData: false,
				username:  "SYSTEM",
				password:  "Manager",

				success:	function(data) {
					console.error("*********update ok");
					fnSucc.call( context, cbData);
				},
				
				error: function(httpRequest, err, obj) {
					console.error("*********update failed", err, obj);
					fnFail.call( context, err, cbData);
				}
			});
		}
