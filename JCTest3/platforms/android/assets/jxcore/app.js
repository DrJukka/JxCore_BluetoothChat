var util = require('util');

console.toCordova = function() {
  var msg = util.format.apply(this, arguments);

  cordova('log').call(msg);
};

console.toCordova("JXcore is up and running!");


cordova('getBuffer').registerSync(function() {
  console.log("getBuffer is called!!!");
  var buffer = new Buffer(25000);
  buffer.fill(45);

  // send back a buffer
  return buffer;
});

cordova('asyncPing').registerAsync(function(message, callback){
  setTimeout(function() {
    callback("Pong:" + message);
  }, 500);
});

cordova('fromJXcore').registerToNative(function(param1, param2){
  // this method is reachable from Java or ObjectiveC
  // OBJ-C : [JXcore callEventCallback:@"fromJXcore" withParams:arr_parms];
  // Java  : jxcore.CallJSMethod("fromJXcore", arr_params);
});

// calling this custom native method from JXcoreExtension.m / .java
cordova('ScreenInfo').callNative(function(width, height){
  console.toCordova("Screen Size", width, height);
});

cordova('ScreenBrightness').callNative(function(br){
  console.toCordova("Screen Brightness", br);
});

/*
cordova('TestParams').callNative(function(){
  console.toCordova("TestParams result:")
  for (var i=0; i<arguments.length; i++)
    console.toCordova("args[" + i +"] :", arguments[i].toString());
});
*/

/* jukka's stuff starts here
*/

cordova('onLifeCycleEvent').registerToNative(function(message){
        console.log("LifeCycleEvent :" + message);

        if (message.localeCompare("onActivityCreated") == 0) {
            console.log("Activity was created");
        } else if (message.localeCompare("onActivityStarted") == 0) {
            console.log("Activity was started");
        } else if (message.localeCompare("onActivityResumed") == 0) {
            console.log("Activity was resumed");
        } else if (message.localeCompare("onActivityPaused") == 0) {
            console.log("Activity was paused");
        } else if (message.localeCompare("onActivityStopped") == 0) {
            console.log("Activity was stopped");
        } else if (message.localeCompare("onActivitySaveInstanceState") == 0) {
            console.log("Activity was save on instance event");
        } else if (message.localeCompare("onActivityDestroyed") == 0) {
            console.log("Activity was destroyed");
        } else {
            console.log("unknown LifeCycleEvent received !!!");
        }

});

cordova('onConnectivityStateChange').registerToNative(function(Connected,WifiOn){
    console.log("onConnectivityStateChange with :" + arguments.length + " arguments");

    console.log("Connected: " + Connected);
    console.log("WifiOn: " + WifiOn);

    if(Connected == true){
        if(WifiOn == true){
            console.log("We are connected via WiFi");
        }else{
            console.log("We are connected via mobile network");
        }
    }else{
        console.log("We don't have any active connections");
    }
});


cordova('ShowToast').registerAsync(function(message,isLong,callback){

//    console.log("ShowToast :" + message + " ,isLong: " + isLong);

    cordova('ShowToast').callNative(message,isLong,function(){
        callback(arguments);
    });
});

var BtCallback;
function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

cordova('onBtConnectionStateChange').registerToNative(function(message){
    console.log("Bt- ConnectionStateChanged with :" + arguments.length + " arguments");
    console.log("State: " + message);

    if(isFunction(BtCallback)){
        BtCallback(message);
    }else{
        console.log("BtCallback not set !!!!");
    }
});

cordova('OnDevicesAvailableToConnect').registerToNative(function(message){
    console.log("On-DevicesAvailableToConnect :" + arguments.length + " arguments");

    if(isFunction(BtCallback)){
        BtCallback(message);
    }else{
        console.log("BtCallback not set !!!!");
    }
});

cordova('OnMessagingEvent').registerToNative(function(message){
    console.log("On-MessagingEvent:" + arguments.length + " arguments");

    if(isFunction(BtCallback)){
        BtCallback(message);
    }else{
        console.log("BtCallback not set !!!!");
    }
});

cordova('OnConnectedEvent').registerToNative(function(message){
    console.log("On- ConnectedEvent :" + arguments.length + " arguments");

    if(isFunction(BtCallback)){
        BtCallback(message);
    }else{
        console.log("BtCallback not set !!!!");
    }
});

cordova('StartConnector').registerAsync(function(btConnectorCallback){

    console.log("StartConnector: " + btConnectorCallback);
    BtCallback = btConnectorCallback;


    cordova('StartConnector').callNative(function(){

      console.log("StartInternetMonitor callback: ")
        for (var i=0; i<arguments.length; i++)
          console.log("args[" + i +"] :", arguments[i].toString());

    });
});


cordova('ConnectToDevice').registerAsync(function(address,callback){

    console.log("ConnectToDevice address : " + address);

    cordova('ConnectToDevice').callNative(address,function(){

      console.log("ConnectToDevice callback with " + arguments.length + " arguments");
      if(arguments.length > 1){
            callback(arguments[0].toString(),arguments[1].toString());
      }else{
            callback(arguments[0].toString(),"");
      }
    });
});

cordova('SendMessage').registerAsync(function(message,callback){

    console.log("SendMessage : " + message);

    cordova('SendMessage').callNative(message,function(){

      console.log("ConnectToDevice callback with " + arguments.length + " arguments");
      if(arguments.length > 1){
            callback(arguments[0].toString(),arguments[1].toString());
      }else{
            callback(arguments[0].toString(),"");
      }
    });
});



cordova('StopConnector').registerAsync(function(){

    console.log("StopConnector called");

    cordova('StopConnector').callNative(function(){

      console.log("StartInternetMonitor callback: ")
        for (var i=0; i<arguments.length; i++)
          console.log("args[" + i +"] :", arguments[i].toString());

    });
});



cordova('CallOne').registerAsync(function(message, callback){

    console.log("CallOne is called with : " + message);

    cordova('StartInternetMonitor').callNative(function(){

      console.log("StartInternetMonitor callback: ")
        for (var i=0; i<arguments.length; i++)
          console.log("args[" + i +"] :", arguments[i].toString());

    });
});

cordova('CallTwo').registerAsync(function(message, callback){

    console.log("CallTwo is called with : " + message);

    cordova('StopCInternetMonitor').callNative(function(){

      console.log("StopCInternetMonitor callback: ")
        for (var i=0; i<arguments.length; i++)
          console.log("args[" + i +"] :", arguments[i].toString());

    });
});