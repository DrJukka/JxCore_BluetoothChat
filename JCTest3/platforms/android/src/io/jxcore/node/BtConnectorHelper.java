package io.jxcore.node;

import android.bluetooth.BluetoothSocket;
import android.os.Handler;
import android.os.Message;

import org.apache.cordova.PluginResult;
import org.thaliproject.p2p.btconnectorlib.BTConnector;
import org.thaliproject.p2p.btconnectorlib.BTConnectorSettings;
import org.thaliproject.p2p.btconnectorlib.ServiceItem;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Created by juksilve on 14.5.2015.
 */
public class BtConnectorHelper implements BTConnector.Callback, BTConnector.ConnectSelector {


    final String instanceEncryptionPWD = "CHANGEYOURPASSWRODHERE";
    final String serviceTypeIdentifier = "Cordovap2p._tcp";
    final String BtUUID                = "fa87c0d0-afac-11de-8a39-0800200c9a66";
    final String Bt_NAME               = "Thaili_Bluetooth";

    List<ServiceItem> lastAvailableList = null;

    BTConnectorSettings conSettings = null;
    BTConnector mBTConnector = null;
    BtConnectedThread mBTConnectedThread = null;

    public BtConnectorHelper() {
        conSettings = new BTConnectorSettings();
        conSettings.SERVICE_TYPE = serviceTypeIdentifier;
        conSettings.MY_UUID = UUID.fromString(BtUUID);
        conSettings.MY_NAME = Bt_NAME;
    }

    public void Start(){
        Stop();
        mBTConnector = new BTConnector(jxcore.activity.getApplicationContext(),this,this,conSettings,instanceEncryptionPWD);
        mBTConnector.Start();
    }

    public void Stop(){

        if (mBTConnectedThread != null) {
            mBTConnectedThread.Stop();
            mBTConnectedThread = null;
        }

        if(mBTConnector != null){
            mBTConnector.Stop();
            mBTConnector = null;
        }

        String reply = "{ \"status\": \"Idle\",";
        reply = reply +"\"remoteName\": \" \",";
        reply = reply +"\"remoteAddress\": \" \"}";

        jxcore.CallJSMethod("onBtConnectionStateChange", reply);
    }

    public void TryConnect(String toAddress,String CallBackId) {

        ServiceItem selectedDevice = null;
        if (lastAvailableList != null) {
            for (int i = 0; i < lastAvailableList.size(); i++) {
                if (lastAvailableList.get(i).deviceAddress.contentEquals(toAddress)) {
                    selectedDevice = lastAvailableList.get(i);
                    break;
                }
            }
        }

        ArrayList<Object> args = new ArrayList<Object>();

        if (selectedDevice != null && mBTConnector != null ) {
            mBTConnector.TryConnect(selectedDevice);
            args.add("Ok");
        } else {
            args.add("ERROR");
            args.add("Device not discovered");
        }

        jxcore.CallJSMethod(CallBackId, args.toArray());
    }


    public boolean SendMessage(String message) {
        boolean ret = false;

        if (mBTConnectedThread != null) {
            mBTConnectedThread.write(message.getBytes());
            ret = true;
        }

        return ret;
    }
    @Override
    public void Connected(BluetoothSocket bluetoothSocket, boolean b) {

        String reply = "{ \"remoteName\": \"" + bluetoothSocket.getRemoteDevice().getName() + "\",";
        reply = reply +"\"remoteAddress\": \"" + bluetoothSocket.getRemoteDevice().getAddress() + "\"}";

        jxcore.CallJSMethod("OnConnectedEvent", reply);

        if (mBTConnectedThread != null) {
            mBTConnectedThread.Stop();
            mBTConnectedThread = null;
        }

        mBTConnectedThread = new BtConnectedThread(bluetoothSocket,mHandler);
        mBTConnectedThread.start();
    }

    @Override
    public void StateChanged(BTConnector.State state) {

        String reply = "{ \"status\": \"" + state + "\"}";
        jxcore.CallJSMethod("onBtConnectionStateChange", reply);
    }

    @Override
    public ServiceItem SelectServiceToConnect(List<ServiceItem> serviceItems) {
        lastAvailableList = serviceItems;

        String reply = "{\"devicesAvailable\":[";

        for(int i =0; i < serviceItems.size(); i++){
            if(i>0){
                reply = reply + ",";
            }
            reply = reply +"{\"deviceName\":\"" + serviceItems.get(i).deviceName + "\", " +"\"deviceAddress\":\"" +serviceItems.get(i).deviceAddress + "\"}";
        }
        reply = reply +"]}";

        jxcore.CallJSMethod("OnDevicesAvailableToConnect", reply);

        return null;
    }

    // The Handler that gets information back from the BluetoothChatService
    private final Handler mHandler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case BtConnectedThread.MESSAGE_WRITE:
                {
                    byte[] writeBuf = (byte[]) msg.obj;// construct a string from the buffer
                    String writeMessage = new String(writeBuf);

                    String reply = "{ \"writeMessage\": \"" + writeMessage + "\"}";
                    jxcore.CallJSMethod("OnMessagingEvent", reply);
                }
                break;
                case BtConnectedThread.MESSAGE_READ:
                {
                    byte[] readBuf = (byte[]) msg.obj;// construct a string from the valid bytes in the buffer
                    String readMessage = new String(readBuf, 0, msg.arg1);

                    String reply = "{ \"readMessage\": \"" + readMessage + "\"}";
                    jxcore.CallJSMethod("OnMessagingEvent", reply);
                }
                break;
                case BtConnectedThread.SOCKET_DISCONNEDTED: {
                    if (mBTConnectedThread != null) {
                        mBTConnectedThread.Stop();
                        mBTConnectedThread = null;
                    }

                    String reply = "{ \"status\": \"Idle\",";
                    reply = reply +"\"remoteName\": \" \",";
                    reply = reply +"\"remoteAddress\": \" \"}";

                    jxcore.CallJSMethod("onBtConnectionStateChange", reply);

                    if(mBTConnector != null) {
                        mBTConnector.Start();
                    }
                }
                break;
            }
        }
    };
}
