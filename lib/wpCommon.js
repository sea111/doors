var wpCommon={
	Url:'http://192.168.199.14',
	viewShow:function(){
		WPBridge.callMethod("JsInvokeNative","wpShowWebView",{},function(){})
		WPBridge.callMethod("JsInvokeNative","wpDismissLoadingDialog",{},function(){})
	}
}

var Url='http://192.168.199.14';
var wholeHei=document.documentElement.clientHeight-document.documentElement.clientWidth /7.5*0.88;		
function getUrlRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        if (str.indexOf("&") != -1) {
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        } else {
            theRequest[str.split("=")[0]] = unescape(str.split("=")[1]);
        }
    }
    return theRequest;
}
(function () {
    var doc = document;
    var win = window;
    var ua = win.navigator.userAgent;
    var JS_BRIDGE_PROTOCOL_SCHEMA = "rainbow";
    var increase = 1;
    var WPBridge = win.WPBridge || (win.WPBridge = {});

    var ExposeMethod = {

        callMethod: function (clazz, method, param, callback) {
            var port = PrivateMethod.generatePort();
            if (typeof callback !== 'function') {
                callback = null;
            }
            PrivateMethod.registerCallback(port, callback);
            PrivateMethod.callNativeMethod(clazz, port, method, param);
        },

        onComplete: function (port, result) {

            PrivateMethod.onNativeComplete(port, result);
        }

    };

    var PrivateMethod = {
        callbacks: {},
        registerCallback: function (port, callback) {
            if (callback) {
                PrivateMethod.callbacks[port] = callback;
            }
        },
        getCallback: function (port) {
            var call = {};
            if (PrivateMethod.callbacks[port]) {
                call.callback = PrivateMethod.callbacks[port];
            } else {
                call.callback = null;
            }
            return call;
        },
        unRegisterCallback: function (port) {
            if (PrivateMethod.callbacks[port]) {
                delete PrivateMethod.callbacks[port];
            }
        },
        onNativeComplete: function (port, result) {
 
            var resultJson = PrivateMethod.str2Json(result);
            var callback = PrivateMethod.getCallback(port).callback;
            PrivateMethod.unRegisterCallback(port);
            if (callback) {
                //执行回调
                callback && callback(resultJson);
            }
        },
        generatePort: function () {
            return Math.floor(Math.random() * (1 << 50)) + '' + increase++;
        },
        str2Json: function (str) {
            if (str && typeof str === 'string') {
                try {
                    return JSON.parse(str);
                } catch (e) {
                    return {
                        status: {
                            code: 1,
                            msg: 'params parse error!'
                        }
                    };
                }
            } else {
                return str || {};
            }
        },
        json2Str: function (param) {
            if (param && typeof param === 'object') {
                return JSON.stringify(param);
            } else {
                return param || '';
            }
        },
        callNativeMethod: function (clazz, port, method, param) {
            if (PrivateMethod.isAndroid()) {
                var jsonStr = PrivateMethod.json2Str(param);
                var uri = JS_BRIDGE_PROTOCOL_SCHEMA + "://" + clazz + ":" + port + "/" + method + "?" + jsonStr;
                win.prompt(uri, "");
            }
            else if(PrivateMethod.isIos())
            {
                var jsonStr = PrivateMethod.json2Str(param);
//              var uri = "iOS?" + port + "?" + method + "?" + jsonStr;
				var uri = "{\"Method\":\""+method+"\","+"\"Param\":"+jsonStr+",\"CallBackID\":\""+port+"\"}";
                WPBridgeIOS.JavaScriptRunning(uri);
            }
 
 
        },

        isAndroid: function () {
            var tmp = ua.toLowerCase();
            var android = tmp.indexOf("android") > -1;
            return !!android;
        },
        isIos: function () {
            var tmp = ua.toLowerCase();
            var ios = tmp.indexOf("iphone") > -1;
            return !!ios;
        }
    };
    for (var index in ExposeMethod) {
        if (ExposeMethod.hasOwnProperty(index)) {
            if (!Object.prototype.hasOwnProperty.call(WPBridge, index)) {
                WPBridge[index] = ExposeMethod[index];
            }
        }
    }
})();
