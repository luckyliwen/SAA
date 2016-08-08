/**
 * 
 */
saa.util.Util = {};

saa.util.Util.isFinishedLoad = function (sStatus) {
	return sStatus == saa.LoadStatus.Succ   ||  sStatus ==saa.LoadStatus.Fail;
};
/**
 * get current operation system
 */
saa.util.Util.detectOS = function() {    
	var sUserAgent = navigator.userAgent;   
	var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");    
	if (isMac) return "Mac OS";    
	var isUnix = (navigator.platform == "X11") && !isWin && !isMac;    
	if (isUnix) return "Unix";    
	var isLinux = (String(navigator.platform).indexOf("Linux") > -1);    
	if (isLinux) return "Linux";    
	var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows"); 
	if (isWin) {    
		var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;    
		if (isWin2K) return "Windows 2000";    
		var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 ||   
		sUserAgent.indexOf("Windows XP") > -1;    
		if (isWinXP) return "Windows XP";    
		var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;    
		if (isWin2003) return "Windows 2003";    
		var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;    
		if (isWinVista) return "Windows Vista";    
		var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;    
		if (isWin7) return "Windows 7";    
	}    
	return "other";    
};    

//from string 李  to like \u674e
saa.util.Util.encodeToUnicode = function( str ) {
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

//from string \u674e  to  李  
saa.util.Util.decodeFromUnicode = function( unistr ) {
	//first check whether like format, only check the first
	var pos = unistr.indexOf('\\u');
	if (pos != 0)
		return unistr;
	
	var ret = "";
	var arr = unistr.split("\\u");
	for (var i=0; i<arr.length; i++) {
		if (arr[i] != "") {
			ret += String.fromCharCode( parseInt(arr[i], 16) );
		}
	}
	
	return ret;
};




/**
 * get browser type
 */
saa.util.Util.detectBrowser = function() 
{ 
	if($.browser.chrome){
		return "Chrome";
	}
	if($.browser.opera){
		return "Opera";
	}
	if($.browser.msie) { 
		return "Internet Explorer";
	} 
	if($.browser.mozilla){ 
		return "Firefox";
	} 
	if($.browser.safari) { 
		return "Safari";
	} 
	return "othecm";
} ;
/**
 * support placeholder for IE9
 *  @param domObj		: the dom element textarea 
 */
saa.util.Util.addPlaceHolder = function(domObj){
		if(!domObj){
			return;
		}
		var placeholder = domObj.attr("placeholder");
		if(domObj.attr("value") == "" || domObj.attr("value") == placeholder){
			domObj.attr("value",placeholder);
			domObj.addClass("placeholder");
		}
	
		var onFocus = function(obj){
			if(obj.data.attr("class").indexOf("placeholder")!=-1)
			{
				obj.data.removeClass("placeholder");
				if(obj.data.attr("value") == obj.data.attr("placeholder")){
					obj.data.attr("value","");
				}
			}
		};
		
		var onBlur = function(obj){
			if(obj.data.attr("value") == ""){
				obj.data.attr("value", obj.data.attr("placeholder"));
				obj.data.addClass("placeholder");
			}
		};
	
		domObj.bind("focus",domObj,onFocus);
		domObj.bind("blur",domObj,onBlur);
};


/**
 * Some utils used to judge the type
 */
saa.util.Util.isSimpeJSType = function( v ) {
	var t= typeof(v);
	return t =='string' || t == 'number' || t== 'boolean';
};



/**
 * call the destroyContent if it already have content. As when call the destroyContent for an empty layout it still
 * trigger the invalidate 
 * @param {} ctrl
 */
saa.util.Util.destroyContentEffectively = function ( ctrl ) {
	if ( ctrl.getContent() && ctrl.getContent().length > 0 )
		ctrl.destroyContent();
};


/**
 * Add a value with the key to the data under the parentKey safely:
 *           If the parentKey exists,then add it directly
 *           Otherwise, ficmt create the parentkey
 * For example:
 *          data is {},  parentKey=member  key=name value=jack,
 *        After called:
 *                   data = { 'member': { 'name': 'jack'}}
 *                   
 * @param {} data
 * @param {} parentKey
 * @param {} key
 * @param {} value
 */
saa.util.Util.addKeyValueSafely = function(data, parentKey, key, value) {
	if ( !(parentKey in data) ) {
		data[parentKey] = {};
	}
	
	data[parentKey][key] = value;
};


/**
 * Here the error normally is the error return from OData
 */
saa.util.Util.getInforFromError =  function (error) {
	if ( 'message' in error) {
		return error.message;
	} else {
		return error.toString();
	}
};



	
/*************** Hijacking for Gold Reflection *************/
sap.ui.core.BusyIndicator.attachOpen(function(oEvent) {
	if (sap.ui.getCore().getConfiguration().getTheme() == "sap_goldreflection") { // this line is a hack, the rest of this coding is what a BusyIndicator hijacker could do
		saa.util.Util.BusyIndicator.$Busy = oEvent.getParameter("$Busy");
		saa.util.Util.BusyIndicator.iBusyPageWidth = jQuery(document.body).width();
		saa.util.Util.BusyIndicator.$Busy.css("top", "0").css("width", saa.util.Util.BusyIndicator.iBusyPageWidth + "px");
		saa.util.Util.BusyIndicator.bBusyAnimate = true;
		iBusyLeft = saa.util.Util.BusyIndicator.$Busy[0].offsetLeft;
		window.setTimeout(animationStep, saa.util.Util.BusyIndicator.iBusyTimeStep);
	}
});
sap.ui.core.BusyIndicator.attachClose(function(oEvent) {
	saa.util.Util.BusyIndicator.bBusyAnimate = false;
});

saa.util.Util.BusyIndicator = {
	bBusyAnimate : false,
	iBusyLeft : 0,
	iBusyDelta : 60,
	iBusyTimeStep : 50,
	iBusyWidth : 500,
	iBusyPageWidth: 0,
	$Busy:null		
};


function animationStep() {
	if (saa.util.Util.BusyIndicator.bBusyAnimate) {
		saa.util.Util.BusyIndicator.iBusyLeft += saa.util.Util.BusyIndicator.iBusyDelta;
		if (saa.util.Util.BusyIndicator.iBusyLeft > saa.util.Util.BusyIndicator.iBusyPageWidth) {
			saa.util.Util.BusyIndicator.iBusyLeft = -saa.util.Util.BusyIndicator.iBusyWidth;
		}
		saa.util.Util.BusyIndicator.$Busy.css("background-position", saa.util.Util.BusyIndicator.iBusyLeft + "px 0px");
		window.setTimeout(animationStep, saa.util.Util.BusyIndicator.iBusyTimeStep);
	}
}
/*************** END of Hijacking for Gold Reflection *************/

//As now three view will call this by consequence, so need use a count to avoid the shortest overwrite the longest time (just like the reference count)
saa.util.Util.gBusyCount = 0;

saa.util.Util.hideBusyIndicator = function() {
	saa.util.Util.gBusyCount --;
	if (saa.util.Util.gBusyCount == 0) {
		sap.ui.core.BusyIndicator.hide();
	}
},

saa.util.Util.showBusyIndicator = function() {
	if (saa.util.Util.gBusyCount == 0) {
		sap.ui.core.BusyIndicator.show(0);
	}
	saa.util.Util.gBusyCount ++;
},

saa.util.Util.showLoadingIndicator = function(parentId) {
	var div =document.createElement("div");
	div.id = parentId + "--loadingId";
	var ima = document.createElement("img");	
	ima.src="images/loading.gif";
	ima.alt = "loading data";
	div.appendChild(ima);
	
	var parentElement = document.getElementById(parentId);

	var popup = new sap.ui.core.Popup(div, false, false, false);	
	popup.open(0, sap.ui.core.Popup.Dock.CenterCenter, sap.ui.core.Popup.Dock.CenterCenter, parentElement, "-100 -100");
		
	return popup;
},

saa.util.Util.hideLoadingIndicator = function(popup) {	
	/*var parent = document.getElementById("data-view");	
	var div = document.getElementById(parentId + "--loadingId");

	document.getElementById(id).parentNode
	
	if(div != null)
		parent.removeChild(div);*/	
	if(popup)
	{
		popup.close();	
		popup = null;
	}		
	
},

saa.util.Util.commaSplit= function (num) {

    num = num || '',
    formatNum = '';

    formatNum = $.formatNumber(num.toString(), {
            format: '#,##0',
     });
    
    return formatNum;
},


saa.util.Util.toMenoyFormat = function(value) {
	return  saa.cfg.Cfg.getCurrency()+ saa.util.Util.numericPrecisonFormat(value);
},

saa.util.Util.numericPrecisonFormat = function(value) {

	var sValue = "";
	switch(saa.cfg.Cfg.getNumPrecision())
	{
		case saa.cfg.NumPrecision.Full:
			sValue = saa.util.Util.commaSplit(value);
			break;
		case saa.cfg.NumPrecision.Thousand:
			sValue = saa.util.Util.commaSplit(Math.round(value/1000)) ;
			break;
		
		case saa.cfg.NumPrecision.Million:
			sValue = saa.util.Util.commaSplit(Math.round(value/1000000)) ;
			break;
			
		default:
			saa.assert(false);
	}
	return sValue;
},

/*
 * convert "/Date1380000000/" and "2012-09-24T08:00:00" to date object
 */
saa.util.Util.getDateObjectByString = function(strDate) {

	var oDate = null;
	if(strDate)
	{
		var reg1 = /^\/date\(/i;
		var reg2 = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/gi;
		
		if(strDate.match(reg1))   //match "/Date1380000000/"
		{
			var nMilliSecond = pacmeInt(strDate.match(/[\d]+/));
			oDate = new Date;
			oDate.setTime(nMilliSecond);
		}
		else if(strDate.match(reg2))  //match "2012-09-24T08:00:00"
		{
			var dateArr = strDate.split(/[\-T:]/);
			oDate = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], dateArr[3], dateArr[4], dateArr[5]);
		}
	}
	return oDate;
},

/*
 * convert "PT09H28M44S" to "09:28:44".  
*/
saa.util.Util.getTimeStringByString = function(strTime) {

	var sTime = "";
	var reg = /^pt\d/i;
	if(strTime.match(reg))
	{
		var reg1 = /(h|m)/gi, reg2 = /(pt|s)/gi;
		sTime = (strTime.replace(reg1, ":")).replace(reg2, "");
	}
	return sTime;
},

/*
 * get MIME type by file extension.
 * will return  undefined if on corresponding MIME type for the  file extension
*/
saa.util.Util.getMimeByFileExtension = function(ext) {
	
    var extToMimes = 
    {
		'png': 'image/png',
		'bmp':	'image/bmp',
		'jpeg':	'image/jpeg',
		'jpg':	'image/jpeg',
		'gif':	'image/gif',
		
		'doc':	'application/msword',
		'docx':	'application/msword',
		'xls':	'application/excel',
		'xlsx':	'application/excel',
		'ppt':	'application/powerpoint',
		'pptx':	'application/powerpoint',
		
		'txt':	'text/plain',
		'mpeg':	'video/mpeg',
		'mpg':	'video/mpeg',
		
		'pdf':	'application/pdf'		       
       
    };		

	if (extToMimes.hasOwnProperty(ext)) 
	{
		return extToMimes[ext];
	}
	else
	{
		return undefined;
	}
	
},


sap.ui.model.SimpleType.extend("saa.util.numberFormat", {
    formatValue: function(oValue) {
    	
        return saa.util.Util.numericPrecisonFormat(oValue);
    },

});



/***** SAVE TO TEXT FILE help functions******************/
/****doesn't work in IE and safai*****/
var saveAs = saveAs||(function(h){"use strict";var r=h.document,l=function(){return h.URL||h.webkitURL||h;},e=h.URL||h.webkitURL||h,n=r.createElementNS("http://www.w3.org/1999/xhtml","a"),g="download" in n,j=function(t){var s=r.createEvent("MouseEvents");s.initMouseEvent("click",true,false,h,0,0,0,0,0,false,false,false,false,0,null);return t.dispatchEvent(s);},o=h.webkitRequestFileSystem,p=h.requestFileSystem||o||h.mozRequestFileSystem,m=function(s){(h.setImmediate||h.setTimeout)(function(){throw s;},0);},c="application/octet-stream",k=0,b=[],i=function(){var t=b.length;while(t--){var s=b[t];if(typeof s==="string"){e.revokeObjectURL(s);}else{s.remove();}}b.length=0;},q=function(t,s,w){s=[].concat(s);var v=s.length;while(v--){var x=t["on"+s[v]];if(typeof x==="function"){try{x.call(t,w||t);}catch(u){m(u);}}}},f=function(t,u){var v=this,B=t.type,E=false,x,w,s=function(){var F=l().createObjectURL(t);b.push(F);return F;},A=function(){q(v,"writestart progress write writeend".split(" "));},D=function(){if(E||!x){x=s(t);}w.location.href=x;v.readyState=v.DONE;A();},z=function(F){return function(){if(v.readyState!==v.DONE){return F.apply(this,arguments);}};},y={create:true,exclusive:false},C;v.readyState=v.INIT;if(!u){u="download";}if(g){x=s(t);n.href=x;n.download=u;if(j(n)){v.readyState=v.DONE;A();return;}}if(h.chrome&&B&&B!==c){C=t.slice||t.webkitSlice;t=C.call(t,0,t.size,c);E=true;}if(o&&u!=="download"){u+=".download";}if(B===c||o){w=h;}else{w=h.open();}if(!p){D();return;}k+=t.size;p(h.TEMPORARY,k,z(function(F){F.root.getDirectory("saved",y,z(function(G){var H=function(){G.getFile(u,y,z(function(I){I.createWriter(z(function(J){J.onwriteend=function(K){w.location.href=I.toURL();b.push(I);v.readyState=v.DONE;q(v,"writeend",K);};J.onerror=function(){var K=J.error;if(K.code!==K.ABORT_ERR){D();}};"writestart progress write abort".split(" ").forEach(function(K){J["on"+K]=v["on"+K];});J.write(t);v.abort=function(){J.abort();v.readyState=v.DONE;};v.readyState=v.WRITING;}),D);}),D);};G.getFile(u,{create:false},z(function(I){I.remove();H();}),z(function(I){if(I.code===I.NOT_FOUND_ERR){H();}else{D();}}));}),D);}),D);},d=f.prototype,a=function(s,t){return new f(s,t);};d.abort=function(){var s=this;s.readyState=s.DONE;q(s,"abort");};d.readyState=d.INIT=0;d.WRITING=1;d.DONE=2;d.error=d.onwritestart=d.onprogress=d.onwrite=d.onabort=d.onerror=d.onwriteend=null;h.addEventListener("unload",i,false);return a;}(self));

//for IE
var saveInIE = function(data, fileName) {
	if (document.execCommand) {
        var oWin = window.open("about:blank", "_blank");
        oWin.document.write(data);
        oWin.document.close();
        var success = oWin.document.execCommand('SaveAs', true, fileName);
        oWin.close();
        if (!success)
            alert("Sorry, your browser does not support this feature");
    } else {
    	alert("Sorry, your browser does not support save as command");
    }
};

//for Safari, the problem is fileName doesn't work
var saveInSafari = function(data, fileName) {
	//text/plain
	//application/octet-stream
	var uriContent = "data:application/octet-stream;filename=" + fileName + "," + encodeURIComponent(data);
	window.open(uriContent, fileName);
	//alert(newWindow);
};

/*! @source https://github.com/eligrey/Blob.js */
var BlobBuilder=BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||(function(j){"use strict";var c=function(v){return Object.prototype.toString.call(v).match(/^\[object\s(.*)\]$/)[1];},u=function(){this.data=[];},t=function(x,v,w){this.data=x;this.size=x.length;this.type=v;this.encoding=w;},k=u.prototype,s=t.prototype,n=j.FileReadecmync,a=function(v){this.code=this[this.name=v];},l=("NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR").split(" "),r=l.length,o=j.URL||j.webkitURL||j,p=o.createObjectURL,b=o.revokeObjectURL,e=o,i=j.btoa,f=j.atob,m=false,h=function(v){m=!v;},d=j.ArrayBuffer,g=j.Uint8Array;u.fake=s.fake=true;while(r--){a.prototype[l[r]]=r+1;}try{if(g){h.apply(0,new g(1));}}catch(q){}if(!o.createObjectURL){e=j.URL={};}e.createObjectURL=function(w){var x=w.type,v;if(x===null){x="application/octet-stream";}if(w instanceof t){v="data:"+x;if(w.encoding==="base64"){return v+";base64,"+w.data;}else{if(w.encoding==="URI"){return v+","+decodeURIComponent(w.data);}}if(i){return v+";base64,"+i(w.data);}else{return v+","+encodeURIComponent(w.data);}}else{if(real_create_object_url){return real_create_object_url.call(o,w);}}};e.revokeObjectURL=function(v){if(v.substring(0,5)!=="data:"&&real_revoke_object_url){real_revoke_object_url.call(o,v);}};k.append=function(z){var B=this.data;if(g&&z instanceof d){if(m){B.push(String.fromCharCode.apply(String,new g(z)));}else{var A="",w=new g(z),x=0,y=w.length;for(;x<y;x++){A+=String.fromCharCode(w[x]);}}}else{if(c(z)==="Blob"||c(z)==="File"){if(n){var v=new n;B.push(v.readAsBinaryString(z));}else{throw new a("NOT_READABLE_ERR");}}else{if(z instanceof t){if(z.encoding==="base64"&&f){B.push(f(z.data));}else{if(z.encoding==="URI"){B.push(decodeURIComponent(z.data));}else{if(z.encoding==="raw"){B.push(z.data);}}}}else{if(typeof z!=="string"){z+="";}B.push(unescape(encodeURIComponent(z)));}}}};k.getBlob=function(v){if(!arguments.length){v=null;}return new t(this.data.join(""),v,"raw");};k.toString=function(){return"[object BlobBuilder]";};s.slice=function(y,v,x){var w=arguments.length;if(w<3){x=null;}return new t(this.data.slice(y,w>1?v:this.data.length),x,this.encoding);};s.toString=function(){return"[object Blob]";};return u;}(self));

saa.util.Util.saveTable2CSV = function(table, indent) {
	var vIndent = indent || "    ";
	var targetTable = table;
	//build text
	var csv = "";
	var fileName = targetTable.getId();
	
	var bindingPath = targetTable.mBindingInfos.rows.path;
	if(bindingPath == null || bindingPath == "") {
		//do nothing without binding path
		return;
	}
	
	//get table data from model using binding path
	var tableData = targetTable.getModel().getData();
	$.each(bindingPath.split("/"), function(i, path) {
		//ignore empty string, split will return empty string if the Regx is the ficmt or last char
		if(path != "") {
			tableData = tableData[path];
		}
	});
	
	
	//check columns from table
	var colBindingInfo = [];
	$.each(targetTable.getColumns(), function(i, col) {
		var bindingInfo = {};
		//only handle TextView
		bindingInfo.label = col.getLabel() instanceof sap.ui.commons.Label ? col.getLabel().getText() : col.getLabel().toString();
		var template = col.getTemplate();
		
		
		if(template instanceof saa.cfg.Control.Text ){
			//Normal TextView
			bindingInfo.path = template.mBindingInfos.text.path;
			bindingInfo.formatter = template.mBindingInfos.text.formatter;
			bindingInfo.context = template;
			
		} else if (template instanceof saa.uilib.AttachmentNumber  || template instanceof saa.uilib.NoteNumber) {
			//For the NoteNumber and AttachmentNumber also need support
			bindingInfo.path = template.mBindingInfos.count.path;
			bindingInfo.formatter = template.mBindingInfos.count.formatter;
			bindingInfo.context = template;
			
		} else if(typeof template.getContent == "function") {
			//assume this is an container controller, like layout, then try to call getContent() to handle the ficmt TextView
			var subControls = template.getContent();
			for(var j = 0; j < subControls.length; j++) {
				if(subControls[j] instanceof saa.cfg.Control.Text) {
					bindingInfo.path = subControls[j].mBindingInfos.text.path;
					bindingInfo.formatter = subControls[j].mBindingInfos.text.formatter;
					bindingInfo.context = subControls[j];
					break;
				}
			}
		} else {
			//can't handle now
		}
		
		colBindingInfo[i] = bindingInfo;
	});
	
	//record column label
	for(var i = 0; i < colBindingInfo.length; i++) {
		var bf = colBindingInfo[i];
		if(i != 0) {
			//append an comma if this is not the ficmt column
			csv += ","; 
		}
		csv += bf.label;
	}
	
	/**
	 * Get the correct value by path: if the path is "" then it means the data object itself, otherwise use the path as key
	 */
	function getValueByPath(data, path) {
		if (path == "")
			return data;
		else {
			if (path == 'NoteCount')  {
				//!!For the Notes count, as now it use -1 for the grouping, so need a special handle for this, it is not good but is the most effect way here
				var value = data[path];
				if (value == -1)
					return "";
				else 
					return value;
			} else {
				return data[path];
			}
		}
	}
	
	//scan tableData and get corresponding value
	function scanValue(level, data) {
		//for level 0 row, still try to save it's properties, this may result in a empty line in scv.
		//if need to skip level 0 row, it depends, can support this on demand.
		
		//start in a new line
		csv += "\n";
		
		//retrieve values according to column binding info
		for(var i = 0; i < colBindingInfo.length; i++) {
			var bf = colBindingInfo[i];
			if(i == 0) {
				//column value will be put in a pair of quotes
				csv += "\""; 
				//put preceeding space to indicate level
				for(var k = 0; k < level; k++) {csv += vIndent;}
			} else {
				//append an comma if this is not the ficmt column
				csv += ",\""; 
			}
			var value;
			if(bf.formatter == null) {
				value = getValueByPath(data, bf.path);
				//here need use the === to check with "", otherwise the correct value 0 will == ""
				csv += ( value == null || value === "") ? "NA" : value;
			} else {
				//use context to call the formatter
				value = getValueByPath(data, bf.path);
				var raw_v = bf.formatter.call(bf.context, value);
				csv += (raw_v == null || raw_v === "") ?  "NA" : raw_v;
			}
			csv += "\"";
		}
		
		//handle sub rows
		for(var key in data) {
			//consider objects as sub rows
			//currently, doesn't handle the sequence according to key, IE, if key is numberic, then should sort by it. 
			//Will support it on demand
			if((typeof data[key]) == "object") {
				scanValue(level + 1, data[key]);
			}
		}
		
	}
	
	scanValue(1, tableData);
	
	if($.browser.msie) {
		saveInIE(csv, fileName+".csv");
	} else if($.browser.safari) {
		//there is a length limitation in URL
		saveInSafari(csv, fileName+".csv");
	} else {
		//try to save to text file
		var bb = new BlobBuilder();
		bb.append(csv);
		saveAs(bb.getBlob("text/plain;chacmet=utf-8"), fileName + ".csv");
	}
	
};


/*** group rows in table, experimental***/
saa.util.Util.groupRow = function(table) {
	var tableId = table.getId();
	var rows = table.getRows();
	$.each(rows, function(i, row) {
		var cells = row.getCells();
		//if all cells except the ficmt cell are all empty, consider this row as a group title row.
		var groupTitle = true;
		if(cells[0] != null &&  cells[0].mProperties.text == "") {
			groupTitle = false;
		}
		for(var j = 1; j < cells.length; j++) {
			if(cells[j] != null && cells[j].mProperties.text != "") {
				console.log("row: " + i + " cell: " +  j + "-", cells[j]);
				groupTitle = false;
				}
		}
		if(groupTitle) {
			console.log("this row is group title row : " + i, row);
			//do what have to do to customize this row
			var $row = row.$();
			$row.addClass("group-title");
			$row.hide();
			//console.log("jquery rolw", $row);
		}
	});
};


saa.util.Util.expandTreeNodes = function(oTreeTable, expand, maxLevel) 
{
	var i = 0;
	if (expand == true )
	{
		var slash = new RegExp("/","g"); // "g" for global search, str.match then yields an array of all occurrences
		while (oTreeTable.getContextByIndex(i) != null )
		{
			// count the number of slashes in the path (root node starting with "/root", level 0 top node "/root/0")\
			var level = (oTreeTable.getContextByIndex(i).toString().match(slash).length - 4)/2;
			if ( maxLevel == -1 || level < maxLevel ){
				oTreeTable.getBinding().expandContext(oTreeTable.getContextByIndex(i));
			};
			i++;
		};
	};
	if ( !expand)
	{
		while ( oTreeTable.getContextByIndex(i) != null )
		{
			 i++; 
		};
		while ( i >= 0 )
		{ 
			if ( oTreeTable.getContextByIndex(i) != null )
			{
				oTreeTable.getBinding().collapseContext(oTreeTable.getContextByIndex(i));
			};
			i--;
		};
	};
};




