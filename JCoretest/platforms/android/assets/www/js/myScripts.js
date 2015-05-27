//
//  The MIT License (MIT)
//
//  Copyright (c) 2015 Microsoft
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//
//  JCoreTest
//  myScripts.js
//

(function () {


// Logs in Cordova.
      function logInCordova(logEntry) {
        var logEntriesDiv = document.getElementById('logEntries');
        if (logEntriesDiv) {
          var logEntryDiv = document.createElement('div');
          logEntryDiv.className = 'logEntry';
          logEntryDiv.innerHTML = logEntry;
          logEntriesDiv.appendChild(logEntryDiv);
        }
      }

  // Find out when JXcore is loaded.
  var jxcoreLoadedInterval = setInterval(function () {
    // HACK Repeat until jxcore is defined. When it is, it's loaded.
    if (typeof jxcore == 'undefined') {
      return;
    }

    // JXcore is loaded. Stop interval.
    clearInterval(jxcoreLoadedInterval);

    // Set the ready function.
    jxcore.isReady(function () {
      // Log that JXcore is ready.
      logInCordova('JXcore ready');

      // Register logging function.
      jxcore('logInCordova').register(logInCordova);

      // Load app.js.
      jxcore('app.js').loadMainFile(function (ret, err) {
        if (err) {
          alert('Error loading ThaliMobile app.js');
          alert(err);
        } else {
            logInCordova('Loaded');
            jxcore_ready();
        }
      });
    });
  }, 10);


    function jxcore_ready() {

        document.getElementById("startButton").addEventListener("click", startConnector);
        document.getElementById("stopButton").addEventListener("click", stopConnector);
        document.getElementById("SendButton").addEventListener("click", SendMessage);
        document.getElementById("ClearMessagesButton").addEventListener("click", ClearMessages);
        document.getElementById("DisconnectButton").addEventListener("click", DisconnectPeer);
    }

//   alert('button is set');
//    jxcore('ShowToast').call('Hello',true, myCallback);
//   jxcore('ShowToast').call('Hello',false, myCallback);

function startConnector()
{
    jxcore('StartConnector').call(peersChangedCallback);
    document.getElementById('StateBox').value = "Running";
    document.getElementById('stopButton').style.display = 'block';
    document.getElementById('startButton').style.display = 'none';

    jxcore('setMessageCallback').call(SendMessageCallback);
}

function stopConnector(){

    jxcore('StopConnector').call(peersChangedCallback);
    document.getElementById('StateBox').value = "Stopped";

    document.getElementById('stopButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('myRemoteDevice').style.display = 'none';
    document.getElementById('myDeviceSelection').style.display = 'none';
}

// Peers that we know about.
var _peers = {};

function peersChangedCallback(myJson) {

    //alert("Got myJson :" + myJson);

    //Lets clear the old list first
    var butEntries = document.getElementById('peerListSelector');
    butEntries.innerHTML = "";

    for (var i = 0; i < myJson.length; i++) {
        var peer = myJson[i];
        _peers[peer.peerIdentifier] = peer;

        addButton(peer);

       // alert("Got peer : " + peer.peerName + ": "  + peer.state + " : " + peer.peerIdentifier);
        if(peer.state == "Available"){
        }else if(peer.state == "Unavailable"){
        }else if(peer.state == "Connecting"){
        }else if(peer.state == "ConnectingFailed"){
        }else if(peer.state == "Disconnected"){
            document.getElementById('RemNameBox').value = "";
            document.getElementById('RemAddrBox').value = "";
        }else if(peer.state == "Connected"){

            document.getElementById('RemNameBox').value = peer.peerName;
            document.getElementById('RemAddrBox').value = peer.peerIdentifier;
        }
    }

    if(document.getElementById('RemNameBox').value.length > 0
    && document.getElementById('RemAddrBox').value.length > 0){
        document.getElementById('myRemoteDevice').style.display = 'block';
        document.getElementById('myDeviceSelection').style.display = 'none';
    }else{
        document.getElementById('myRemoteDevice').style.display = 'none';
        document.getElementById('myDeviceSelection').style.display = 'block';
    }
}

function addButton(peer) {
        var butEntries = document.getElementById('peerListSelector');

        if (butEntries) {
            var holdingdiv = document.createElement('div');
            var hrelem1 = document.createElement('hr');
            holdingdiv.appendChild(hrelem1);

            if(peer.state == "Available"){
                var button = document.createElement('button');
                button.innerHTML = 'Connect to ' + peer.peerName;
                button.onclick = function(){
                    ConnectToDevice(peer.peerIdentifier);return false;
                };

                holdingdiv.appendChild(button);
            }else{
                var statediv = document.createElement('div');

                if(peer.state == "Unavailable"){
                    statediv.innerHTML = peer.peerName + " Unavailable, id: " +peer.peerIdentifier;
                }else if(peer.state == "Connecting"){
                    statediv.innerHTML = peer.peerName + " Connecting, id: " +peer.peerIdentifier;
                }else if(peer.state == "ConnectingFailed"){
                    statediv.innerHTML = peer.peerName + " ConnectingFailed, id: " +peer.peerIdentifier;
                }else if(peer.state == "Disconnected"){
                    statediv.innerHTML = peer.peerName + " Disconnected, id: " +peer.peerIdentifier;
                }else if(peer.state == "Connected"){
                    statediv.innerHTML = peer.peerName + " Connected, id: " +peer.peerIdentifier;
                }
                holdingdiv.appendChild(statediv);
            }

            var hrelem2 = document.createElement('hr');
            holdingdiv.appendChild(hrelem2);

            butEntries.appendChild(holdingdiv);
         }
      }
function DisconnectPeer(){
// could use document.getElementById('RemAddrBox').value as peerId as well
    jxcore('DisconnectPeer').call("",ConnectCallback);
}

function ConnectToDevice(peerid){

    if(peerid.length > 0){
 //       document.getElementById('myRemoteDevice').style.display = 'block';
 //       document.getElementById('myDeviceSelection').style.display = 'none';
        jxcore('ConnectToDevice').call(peerid,ConnectCallback);

    }else{
        alert("No device selected to connect to");
    }
}
function ConnectCallback(status,errorString){
    if(errorString.length > 0){
        alert("Connection " + status + ", details: " + errorString);
    }
}

function addChatLine(who, message){
    document.getElementById('ReplyBox').value = document.getElementById('ReplyBox').value + "\n" + who + " : " +message;
}

function ClearMessages(){
    document.getElementById('ReplyBox').value = "";
}

function SendMessageCallback(myJson){

    console.log("SendMessageCallback " + myJson);

    if(myJson.readMessage){
        addChatLine(document.getElementById('RemNameBox').value, myJson.readMessage);
    }

    if(myJson.writeMessage){
        addChatLine("ME",myJson.writeMessage);
    }
}

function SendMessage(){
    var message = document.getElementById('MessageBox').value;

    jxcore('SendMessage').call(message,SendMessageCallback);

    document.getElementById('MessageBox').value = ""
}

})();
