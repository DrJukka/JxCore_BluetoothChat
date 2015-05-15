package io.jxcore.node;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;

import java.util.ArrayList;

/**
 * Created by juksilve on 14.5.2015.
 */
public class ConnectivityMonitor {

    BroadcastReceiver receiver = null;

    public ConnectivityMonitor(){
    }

    public void Start(){
        Stop();
        IntentFilter filter = new IntentFilter();
        filter.addAction(ConnectivityManager.CONNECTIVITY_ACTION);

        receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                SendConnectivityInfo();
            }
        };

        jxcore.activity.registerReceiver(receiver, filter);

        //To do fix this once we know how to get events that all is ready !
        SendConnectivityInfo();
    }

    public void Stop(){
        if(receiver != null) {
            jxcore.activity.unregisterReceiver(receiver);
            receiver = null;
        }
    }

    public void SendConnectivityInfo() {

        ConnectivityManager connectivity = (ConnectivityManager) jxcore.activity.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = connectivity.getActiveNetworkInfo();

        final boolean isConnected = activeNetwork != null && activeNetwork.isConnectedOrConnecting();
        final boolean isWiFi =  activeNetwork != null && activeNetwork.getType() == ConnectivityManager.TYPE_WIFI;

//        Log.i("ConnectivityMonitor", "isConnected  = " + isConnected);
//        Log.i("ConnectivityMonitor", "isWiFi  = " + isWiFi);

        jxcore.activity.runOnUiThread(new Runnable(){
            public void run() {
                ArrayList<Object> args = new ArrayList<Object>();
                args.add(isConnected);
                args.add(isWiFi);
                jxcore.CallJSMethod("onConnectivityStateChange", args.toArray());
            }
        });
    }
}
