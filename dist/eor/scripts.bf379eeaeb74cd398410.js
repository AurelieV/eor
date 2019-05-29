!function(e,t){"function"==typeof define&&define.amd?define([],t):"object"==typeof module&&"undefined"!=typeof exports?module.exports=t():e.Papa=t()}(this,function(){"use strict";function e(e){this._handle=null,this._paused=!1,this._finished=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(e){var t=f(e);t.chunkSize=parseInt(t.chunkSize),e.step||e.chunk||(t.chunkSize=null),this._handle=new s(t),this._handle.streamer=this,this._config=t}).call(this,e),this.parseChunk=function(e){if(this.isFirstChunk&&l(this._config.beforeFirstChunk)){var t=this._config.beforeFirstChunk(e);void 0!==t&&(e=t)}this.isFirstChunk=!1;var i=this._partialLine+e;this._partialLine="";var n=this._handle.parse(i,this._baseIndex,!this._finished);if(!this._handle.paused()&&!this._handle.aborted()){var r=n.meta.cursor;this._finished||(this._partialLine=i.substring(r-this._baseIndex),this._baseIndex=r),n&&n.data&&(this._rowCount+=n.data.length);var s=this._finished||this._config.preview&&this._rowCount>=this._config.preview;if(g)p.postMessage({results:n,workerId:y.WORKER_ID,finished:s});else if(l(this._config.chunk)){if(this._config.chunk(n,this._handle),this._paused)return;n=void 0,this._completeResults=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(n.data),this._completeResults.errors=this._completeResults.errors.concat(n.errors),this._completeResults.meta=n.meta),!s||!l(this._config.complete)||n&&n.meta.aborted||this._config.complete(this._completeResults,this._input),s||n&&n.meta.paused||this._nextChunk(),n}},this._sendError=function(e){l(this._config.error)?this._config.error(e):g&&this._config.error&&p.postMessage({workerId:y.WORKER_ID,error:e,finished:!1})}}function t(t){var i;(t=t||{}).chunkSize||(t.chunkSize=y.RemoteChunkSize),e.call(this,t),this._nextChunk=_?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(e){this._input=e,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(i=new XMLHttpRequest,this._config.withCredentials&&(i.withCredentials=this._config.withCredentials),_||(i.onload=d(this._chunkLoaded,this),i.onerror=d(this._chunkError,this)),i.open("GET",this._input,!_),this._config.downloadRequestHeaders){var e=this._config.downloadRequestHeaders;for(var t in e)i.setRequestHeader(t,e[t])}this._config.chunkSize&&(i.setRequestHeader("Range","bytes="+this._start+"-"+(this._start+this._config.chunkSize-1)),i.setRequestHeader("If-None-Match","webkit-no-cache"));try{i.send()}catch(e){this._chunkError(e.message)}_&&0===i.status?this._chunkError():this._start+=this._config.chunkSize}},this._chunkLoaded=function(){if(4==i.readyState){if(i.status<200||i.status>=400)return void this._chunkError();this._finished=!this._config.chunkSize||this._start>function(e){var t=i.getResponseHeader("Content-Range");return null===t?-1:parseInt(t.substr(t.lastIndexOf("/")+1))}(),this.parseChunk(i.responseText)}},this._chunkError=function(e){this._sendError(i.statusText||e)}}function i(t){(t=t||{}).chunkSize||(t.chunkSize=y.LocalChunkSize),e.call(this,t);var i,n,r="undefined"!=typeof FileReader;this.stream=function(e){this._input=e,n=e.slice||e.webkitSlice||e.mozSlice,r?((i=new FileReader).onload=d(this._chunkLoaded,this),i.onerror=d(this._chunkError,this)):i=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var e=this._input;if(this._config.chunkSize){var t=Math.min(this._start+this._config.chunkSize,this._input.size);e=n.call(e,this._start,t)}var s=i.readAsText(e,this._config.encoding);r||this._chunkLoaded({target:{result:s}})},this._chunkLoaded=function(e){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(e.target.result)},this._chunkError=function(){this._sendError(i.error)}}function n(t){var i;e.call(this,t=t||{}),this.stream=function(e){return i=e,this._nextChunk()},this._nextChunk=function(){if(!this._finished){var e=this._config.chunkSize,t=e?i.substr(0,e):i;return i=e?i.substr(e):"",this._finished=!i,this.parseChunk(t)}}}function r(t){e.call(this,t=t||{});var i=[],n=!0;this.stream=function(e){this._input=e,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._nextChunk=function(){i.length?this.parseChunk(i.shift()):n=!0},this._streamData=d(function(e){try{i.push("string"==typeof e?e:e.toString(this._config.encoding)),n&&(n=!1,this.parseChunk(i.shift()))}catch(e){this._streamError(e)}},this),this._streamError=d(function(e){this._streamCleanUp(),this._sendError(e.message)},this),this._streamEnd=d(function(){this._streamCleanUp(),this._finished=!0,this._streamData("")},this),this._streamCleanUp=d(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function s(e){function t(){if(v&&u&&(s("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+y.DefaultDelimiter+"'"),u=!1),e.skipEmptyLines)for(var t=0;t<v.data.length;t++)1===v.data[t].length&&""===v.data[t][0]&&v.data.splice(t--,1);return i()&&function(){if(v){for(var e=0;i()&&e<v.data.length;e++)for(var t=0;t<v.data[e].length;t++)m.push(v.data[e][t]);v.data.splice(0,1)}}(),function(){if(!v||!e.header&&!e.dynamicTyping)return v;for(var t=0;t<v.data.length;t++){for(var i=e.header?{}:[],n=0;n<v.data[t].length;n++){var a=n,o=v.data[t][n];e.header&&(a=n>=m.length?"__parsed_extra":m[n]),o=r(a,o),"__parsed_extra"===a?(i[a]=i[a]||[],i[a].push(o)):i[a]=o}v.data[t]=i,e.header&&(n>m.length?s("FieldMismatch","TooManyFields","Too many fields: expected "+m.length+" fields but parsed "+n,t):n<m.length&&s("FieldMismatch","TooFewFields","Too few fields: expected "+m.length+" fields but parsed "+n,t))}return e.header&&v.meta&&(v.meta.fields=m),v}()}function i(){return e.header&&0===m.length}function n(t){return e.dynamicTypingFunction&&void 0===e.dynamicTyping[t]&&(e.dynamicTyping[t]=e.dynamicTypingFunction(t)),!0===(e.dynamicTyping[t]||e.dynamicTyping)}function r(e,t){return n(e)?"true"===t||"TRUE"===t||"false"!==t&&"FALSE"!==t&&function(e){return d.test(e)?parseFloat(e):e}(t):t}function s(e,t,i,n){v.errors.push({type:e,code:t,message:i,row:n})}var o,h,u,d=/^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i,c=this,p=0,_=!1,g=!1,m=[],v={data:[],errors:[],meta:{}};if(l(e.step)){var k=e.step;e.step=function(n){if(v=n,i())t();else{if(t(),0===v.data.length)return;p+=n.data.length,e.preview&&p>e.preview?h.abort():k(v,c)}}}this.parse=function(i,n,r){if(e.newline||(e.newline=function(e){var t=(e=e.substr(0,1048576)).split("\r"),i=e.split("\n");if(1===t.length||i.length>1&&i[0].length<t[0].length)return"\n";for(var n=0,r=0;r<t.length;r++)"\n"===t[r][0]&&n++;return n>=t.length/2?"\r\n":"\r"}(i)),u=!1,e.delimiter)l(e.delimiter)&&(e.delimiter=e.delimiter(i),v.meta.delimiter=e.delimiter);else{var s=function(t,i,n){for(var r,s,o,h=[",","\t","|",";",y.RECORD_SEP,y.UNIT_SEP],u=0;u<h.length;u++){var f=h[u],d=0,l=0,c=0;o=void 0;for(var p=new a({delimiter:f,newline:i,preview:10}).parse(t),_=0;_<p.data.length;_++)if(n&&1===p.data[_].length&&0===p.data[_][0].length)c++;else{var g=p.data[_].length;l+=g,void 0!==o?g>1&&(d+=Math.abs(g-o),o=g):o=g}p.data.length>0&&(l/=p.data.length-c),(void 0===s||d<s)&&l>1.99&&(s=d,r=f)}return e.delimiter=r,{successful:!!r,bestDelimiter:r}}(i,e.newline,e.skipEmptyLines);s.successful?e.delimiter=s.bestDelimiter:(u=!0,e.delimiter=y.DefaultDelimiter),v.meta.delimiter=e.delimiter}var d=f(e);return e.preview&&e.header&&d.preview++,o=i,h=new a(d),v=h.parse(o,n,r),t(),_?{meta:{paused:!0}}:v||{meta:{paused:!1}}},this.paused=function(){return _},this.pause=function(){_=!0,h.abort(),o=o.substr(h.getCharIndex())},this.resume=function(){_=!1,c.streamer.parseChunk(o)},this.aborted=function(){return g},this.abort=function(){g=!0,h.abort(),v.meta.aborted=!0,l(e.complete)&&e.complete(v),o=""}}function a(e){var t=(e=e||{}).delimiter,i=e.newline,n=e.comments,r=e.step,s=e.preview,a=e.fastMode,o=e.quoteChar||'"';if(("string"!=typeof t||y.BAD_DELIMITERS.indexOf(t)>-1)&&(t=","),n===t)throw"Comment character same as delimiter";!0===n?n="#":("string"!=typeof n||y.BAD_DELIMITERS.indexOf(n)>-1)&&(n=!1),"\n"!=i&&"\r"!=i&&"\r\n"!=i&&(i="\n");var h=0,u=!1;this.parse=function(e,f,d){function c(e){C.push(e),S=h}function p(t){return d?g():(void 0===t&&(t=e.substr(h)),E.push(t),h=v,c(E),w&&m(),g())}function _(t){h=t,c(E),E=[],T=e.indexOf(i,h)}function g(e){return{data:C,errors:R,meta:{delimiter:t,linebreak:i,aborted:u,truncated:!!e,cursor:S+(f||0)}}}function m(){r(g()),C=[],R=[]}if("string"!=typeof e)throw"Input must be a string";var v=e.length,k=t.length,y=i.length,b=n.length,w=l(r);h=0;var C=[],R=[],E=[],S=0;if(!e)return g();if(a||!1!==a&&-1===e.indexOf(o)){for(var x=e.split(i),O=0;O<x.length;O++){if(h+=(E=x[O]).length,O!==x.length-1)h+=i.length;else if(d)return g();if(!n||E.substr(0,b)!==n){if(w){if(C=[],c(E.split(t)),m(),u)return g()}else c(E.split(t));if(s&&O>=s)return C=C.slice(0,s),g(!0)}}return g()}for(var I=e.indexOf(t,h),T=e.indexOf(i,h),D=new RegExp(o+o,"g");;)if(e[h]!==o)if(n&&0===E.length&&e.substr(h,b)===n){if(-1===T)return g();T=e.indexOf(i,h=T+y),I=e.indexOf(t,h)}else if(-1!==I&&(I<T||-1===T))E.push(e.substring(h,I)),I=e.indexOf(t,h=I+k);else{if(-1===T)break;if(E.push(e.substring(h,T)),_(T+y),w&&(m(),u))return g();if(s&&C.length>=s)return g(!0)}else{var L=h;for(h++;;){if(-1===(L=e.indexOf(o,L+1)))return d||R.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:C.length,index:h}),p();if(L===v-1)return p(e.substring(h,L).replace(D,o));if(e[L+1]!==o){if(e[L+1]===t){E.push(e.substring(h,L).replace(D,o)),I=e.indexOf(t,h=L+1+k),T=e.indexOf(i,h);break}if(e.substr(L+1,y)===i){if(E.push(e.substring(h,L).replace(D,o)),_(L+1+y),I=e.indexOf(t,h),w&&(m(),u))return g();if(s&&C.length>=s)return g(!0);break}R.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:C.length,index:h}),L++}else L++}}return p()},this.abort=function(){u=!0},this.getCharIndex=function(){return h}}function o(e){var t=e.data,i=v[t.workerId],n=!1;if(t.error)i.userError(t.error,t.file);else if(t.results&&t.results.data){var r={abort:function(){n=!0,h(t.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:u,resume:u};if(l(i.userStep)){for(var s=0;s<t.results.data.length&&(i.userStep({data:[t.results.data[s]],errors:t.results.errors,meta:t.results.meta},r),!n);s++);delete t.results}else l(i.userChunk)&&(i.userChunk(t.results,r,t.file),delete t.results)}t.finished&&!n&&h(t.workerId,t.results)}function h(e,t){var i=v[e];l(i.userComplete)&&i.userComplete(t),i.terminate(),delete v[e]}function u(){throw"Not implemented."}function f(e){if("object"!=typeof e)return e;var t=e instanceof Array?[]:{};for(var i in e)t[i]=f(e[i]);return t}function d(e,t){return function(){e.apply(t,arguments)}}function l(e){return"function"==typeof e}var c,p="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==p?p:{},_=!p.document&&!!p.postMessage,g=_&&/(\?|&)papaworker(=|&|$)/.test(p.location.search),m=!1,v={},k=0,y={parse:function(e,s){var a=(s=s||{}).dynamicTyping||!1;if(l(a)&&(s.dynamicTypingFunction=a,a={}),s.dynamicTyping=a,s.worker&&y.WORKERS_SUPPORTED){var h=function(){if(!y.WORKERS_SUPPORTED)return!1;if(!m&&null===y.SCRIPT_PATH)throw new Error("Script path cannot be determined automatically when Papa Parse is loaded asynchronously. You need to set Papa.SCRIPT_PATH manually.");var e=y.SCRIPT_PATH||c;e+=(-1!==e.indexOf("?")?"&":"?")+"papaworker";var t=new p.Worker(e);return t.onmessage=o,t.id=k++,v[t.id]=t,t}();return h.userStep=s.step,h.userChunk=s.chunk,h.userComplete=s.complete,h.userError=s.error,s.step=l(s.step),s.chunk=l(s.chunk),s.complete=l(s.complete),s.error=l(s.error),delete s.worker,void h.postMessage({input:e,config:s,workerId:h.id})}var u=null;return"string"==typeof e?u=s.download?new t(s):new n(s):!0===e.readable&&l(e.read)&&l(e.on)?u=new r(s):(p.File&&e instanceof File||e instanceof Object)&&(u=new i(s)),u.stream(e)},unparse:function(e,t){function i(e){if("object"!=typeof e)return[];var t=[];for(var i in e)t.push(i);return t}function n(e,t){var i="";"string"==typeof e&&(e=JSON.parse(e)),"string"==typeof t&&(t=JSON.parse(t));var n=e instanceof Array&&e.length>0,s=!(t[0]instanceof Array);if(n&&a){for(var u=0;u<e.length;u++)u>0&&(i+=o),i+=r(e[u],u);t.length>0&&(i+=h)}for(var f=0;f<t.length;f++){for(var d=n?e.length:t[f].length,l=0;l<d;l++)l>0&&(i+=o),i+=r(t[f][n&&s?e[l]:l],l);f<t.length-1&&(i+=h)}return i}function r(e,t){return null==e?"":(e=e.toString().replace(f,u+u),"boolean"==typeof s&&s||s instanceof Array&&s[t]||function(e,t){for(var i=0;i<t.length;i++)if(e.indexOf(t[i])>-1)return!0;return!1}(e,y.BAD_DELIMITERS)||e.indexOf(o)>-1||" "===e.charAt(0)||" "===e.charAt(e.length-1)?u+e+u:e)}var s=!1,a=!0,o=",",h="\r\n",u='"';"object"==typeof t&&("string"==typeof t.delimiter&&1===t.delimiter.length&&-1===y.BAD_DELIMITERS.indexOf(t.delimiter)&&(o=t.delimiter),("boolean"==typeof t.quotes||t.quotes instanceof Array)&&(s=t.quotes),"string"==typeof t.newline&&(h=t.newline),"string"==typeof t.quoteChar&&(u=t.quoteChar),"boolean"==typeof t.header&&(a=t.header));var f=new RegExp(u,"g");if("string"==typeof e&&(e=JSON.parse(e)),e instanceof Array){if(!e.length||e[0]instanceof Array)return n(null,e);if("object"==typeof e[0])return n(i(e[0]),e)}else if("object"==typeof e)return"string"==typeof e.data&&(e.data=JSON.parse(e.data)),e.data instanceof Array&&(e.fields||(e.fields=e.meta&&e.meta.fields),e.fields||(e.fields=e.data[0]instanceof Array?e.fields:i(e.data[0])),e.data[0]instanceof Array||"object"==typeof e.data[0]||(e.data=[e.data])),n(e.fields||[],e.data||[]);throw"exception: Unable to serialize unrecognized input"}};if(y.RECORD_SEP=String.fromCharCode(30),y.UNIT_SEP=String.fromCharCode(31),y.BYTE_ORDER_MARK="\ufeff",y.BAD_DELIMITERS=["\r","\n",'"',y.BYTE_ORDER_MARK],y.WORKERS_SUPPORTED=!_&&!!p.Worker,y.SCRIPT_PATH=null,y.LocalChunkSize=10485760,y.RemoteChunkSize=5242880,y.DefaultDelimiter=",",y.Parser=a,y.ParserHandle=s,y.NetworkStreamer=t,y.FileStreamer=i,y.StringStreamer=n,y.ReadableStreamStreamer=r,p.jQuery){var b=p.jQuery;b.fn.parse=function(e){function t(){if(0!==r.length){var t=r[0];if(l(e.before)){var n=e.before(t.file,t.inputElem);if("object"==typeof n){if("abort"===n.action)return void function(t,i,n,r){l(e.error)&&e.error({name:"AbortError"},i,n,r)}(0,t.file,t.inputElem,n.reason);if("skip"===n.action)return void i();"object"==typeof n.config&&(t.instanceConfig=b.extend(t.instanceConfig,n.config))}else if("skip"===n)return void i()}var s=t.instanceConfig.complete;t.instanceConfig.complete=function(e){l(s)&&s(e,t.file,t.inputElem),i()},y.parse(t.file,t.instanceConfig)}else l(e.complete)&&e.complete()}function i(){r.splice(0,1),t()}var n=e.config||{},r=[];return this.each(function(e){if("INPUT"!==b(this).prop("tagName").toUpperCase()||"file"!==b(this).attr("type").toLowerCase()||!p.FileReader||!this.files||0===this.files.length)return!0;for(var t=0;t<this.files.length;t++)r.push({file:this.files[t],inputElem:this,instanceConfig:b.extend({},n)})}),t(),this}}return g?p.onmessage=function(e){var t=e.data;if(void 0===y.WORKER_ID&&t&&(y.WORKER_ID=t.workerId),"string"==typeof t.input)p.postMessage({workerId:y.WORKER_ID,results:y.parse(t.input,t.config),finished:!0});else if(p.File&&t.input instanceof File||t.input instanceof Object){var i=y.parse(t.input,t.config);i&&p.postMessage({workerId:y.WORKER_ID,results:i,finished:!0})}}:y.WORKERS_SUPPORTED&&(c=function(){var e=document.getElementsByTagName("script");return e.length?e[e.length-1].src:""}(),document.body?document.addEventListener("DOMContentLoaded",function(){m=!0},!0):m=!0),(t.prototype=Object.create(e.prototype)).constructor=t,(i.prototype=Object.create(e.prototype)).constructor=i,(n.prototype=Object.create(n.prototype)).constructor=n,(r.prototype=Object.create(e.prototype)).constructor=r,y});