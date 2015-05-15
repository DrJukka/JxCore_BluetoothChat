function log(x) {
        var txt = document.getElementById('txt');
        if (txt)
            txt.innerHTML += "<BR/>" + x;
    }

    var inter = setInterval(function() {
        if (typeof jxcore == 'undefined') return;

        clearInterval(inter);
        jxcore.isReady(function(){
            log('READY');
            // register log method from UI to jxcore instance
            jxcore('log').register(log);

            jxcore('app.js').loadMainFile(function (ret, err) {
                if(err) {
                    alert(err);
                } else {
                    log('Loaded');
                    jxcore_ready();
                }
            });
        });
    }, 5);

    function jxcore_ready() {

        document.getElementById("startButton").addEventListener("click", startConnector);
        document.getElementById("stopButton").addEventListener("click", stopConnector);
        document.getElementById("SendButton").addEventListener("click", SendMessage);
        document.getElementById("ClearMessagesButton").addEventListener("click", ClearMessages);
        document.getElementById("ConnectButton").addEventListener("click", ConnectToDevice);
    }

//   alert('button is set');
//    jxcore('ShowToast').call('Hello',true, myCallback);
//   jxcore('ShowToast').call('Hello',false, myCallback);

function startConnector()
{
    jxcore('StartConnector').call(myConnectorCallback);

    document.getElementById('stopButton').style.display = 'block';
    document.getElementById('startButton').style.display = 'none';
}

function stopConnector(){

    jxcore('StopConnector').call(myConnectorCallback);

    document.getElementById('stopButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('myRemoteDevice').style.display = 'none';
    document.getElementById('myDeviceSelection').style.display = 'none';
}

function myConnectorCallback(myJson) {

    if(myJson.status){
        document.getElementById('StateBox').value = myJson.status;
    }

    if(myJson.remoteName && myJson.remoteAddress){
        document.getElementById('RemNameBox').value = myJson.remoteName;
        document.getElementById('RemAddrBox').value = myJson.remoteAddress;

        if(document.getElementById('RemNameBox').value.length > 1
        && document.getElementById('RemAddrBox').value.length > 1){
            document.getElementById('myRemoteDevice').style.display = 'block';
            document.getElementById('myDeviceSelection').style.display = 'none';
        }
    }

    if(myJson.readMessage){
        addChatLine(document.getElementById('RemNameBox').value, myJson.readMessage);
    }

    if(myJson.writeMessage){
        addChatLine("ME",myJson.writeMessage);
    }

    if(myJson.devicesAvailable){
        document.getElementById('myDeviceSelection').style.display = 'block';
        document.getElementById('myRemoteDevice').style.display = 'none';

        //Remove previously found devices from the list
        var selDevice = document.getElementById("deviceSelector");
        for(o=selDevice.options.length-1;o>=0;o--){
            selDevice.remove(o);
        }

        var i = 0;
        for(; i < myJson.devicesAvailable.length; i++) {
            var obj = myJson.devicesAvailable[i];
            var option = document.createElement("option");
            option.value = obj.deviceAddress;
            option.text = obj.deviceName;
            selDevice.appendChild(option);
        }

        if(i > 0){
            selDevice.selectedIndex = 0;
        }
    }
}

function addChatLine(who, message){
    document.getElementById('ReplyBox').value = document.getElementById('ReplyBox').value + "\n" + who + " : " +message;
}

function ConnectToDeviceCallback(status,errorString){

    if(errorString.length > 0){
        alert("Connection " + status + ", details: " + errorString);
    }
}

function ConnectToDevice(){
    var selDevice = document.getElementById("deviceSelector");
    var address = selDevice.options[selDevice.selectedIndex].value;
    var name = selDevice.options[selDevice.selectedIndex].text;

    if(address.length > 0 && name.length > 0){
        document.getElementById('myRemoteDevice').style.display = 'block';
        document.getElementById('myDeviceSelection').style.display = 'none';

        jxcore('ConnectToDevice').call(address,ConnectToDeviceCallback);
    }else{
        alert("No device selected to connect to");
    }
}

function ClearMessages(){
    document.getElementById('ReplyBox').value = "";
}

function SendMessageCallback(status,errorString){

    if(errorString.length > 0){
        alert("Message sending status  " + status + ", details: " + errorString);
    }
}

function SendMessage(){
    var message = document.getElementById('MessageBox').value;

    jxcore('SendMessage').call(message,SendMessageCallback);

    document.getElementById('MessageBox').value = ""
}