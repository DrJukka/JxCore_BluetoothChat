// License information is available from LICENSE file

package io.jxcore.node;

import io.jxcore.node.jxcore.JXcoreCallback;
import java.util.ArrayList;
import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Point;
import android.provider.Settings.SettingNotFoundException;
import android.view.Display;
import android.view.WindowManager;
import android.widget.Toast;

public class JXcoreExtension {
  public static void LoadExtensions() {
    jxcore.RegisterMethod("ScreenInfo", new JXcoreCallback() {
      @SuppressLint("NewApi")
      @Override
      public void Receiver(ArrayList<Object> params, String callbackId) {
        Context context = jxcore.activity.getBaseContext();
        WindowManager wm = (WindowManager) context
            .getSystemService(Context.WINDOW_SERVICE);
        Display display = wm.getDefaultDisplay();

        Point outSize = new Point();
        display.getSize(outSize);

        // we can deliver the size in 2 ways (array of arguments OR JSON
        // string) lets send it as arguments
        ArrayList<Object> args = new ArrayList<Object>();
        args.add(outSize.x);
        args.add(outSize.y);

        jxcore.CallJSMethod(callbackId, args.toArray());
      }
    });

    jxcore.RegisterMethod("ScreenBrightness", new JXcoreCallback() {
      @SuppressLint("NewApi")
      @Override
      public void Receiver(ArrayList<Object> params, String callbackId) {
        Context context = jxcore.activity.getBaseContext();

        int br;
        try {
          br = android.provider.Settings.System.getInt(
              context.getContentResolver(),
              android.provider.Settings.System.SCREEN_BRIGHTNESS);
        } catch (SettingNotFoundException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
          br = 0;
        }

        ArrayList<Object> args = new ArrayList<Object>();
        args.add(br);

        jxcore.CallJSMethod(callbackId, args.toArray());
      }
    });

    jxcore.RegisterMethod("TestParams", new JXcoreCallback() {
      @Override
      public void Receiver(ArrayList<Object> params, String callbackId) {
        ArrayList<Object> args = new ArrayList<Object>();
        args.add(100); // int
        args.add(-1); // int
        args.add(4.5); // double
        args.add(true); // boolean
        args.add("Hello World"); // string
        args.add("Test Buffer".getBytes()); // buffer
        args.add("Another String with UTF8 中國"); // utf8 string

        jxcore.CallJSMethod(callbackId, args.toArray());
      }
    });

    //Jukka's stuff
      jxcore.RegisterMethod("ShowToast", new JXcoreCallback() {
          @Override
          public void Receiver(ArrayList<Object> params, String callbackId) {

              ArrayList<Object> args = new ArrayList<Object>();

              if(params.size() > 0) {
                  String message = params.get(0).toString();
                  boolean isLong = true;
                  if (params.size() == 2) {
                      isLong = ((Boolean) params.get(1)).booleanValue();
                  }

                  int duration = Toast.LENGTH_SHORT;
                  if (isLong) {
                      duration = Toast.LENGTH_LONG;
                  }

                  Toast.makeText(jxcore.activity.getApplicationContext(), message, duration).show();
                  args.add("Ok");
              }else{
                  args.add("ERROR");
                  args.add("Required parameters missing");
              }

              jxcore.CallJSMethod(callbackId, args.toArray());
          }
      });

      final BtConnectorHelper mBtConnectorHelper = new BtConnectorHelper();

      jxcore.RegisterMethod("StartConnector", new JXcoreCallback() {
          @Override
          public void Receiver(ArrayList<Object> params, String callbackId) {

              mBtConnectorHelper.Start();

              ArrayList<Object> args = new ArrayList<Object>();
              jxcore.CallJSMethod(callbackId, args.toArray());
              args.add("Ok");
          }
      });

      jxcore.RegisterMethod("ConnectToDevice", new JXcoreCallback() {
          @Override
          public void Receiver(ArrayList<Object> params, String callbackId) {

              ArrayList<Object> args = new ArrayList<Object>();
              if(params.size() > 0) {
                  String address = params.get(0).toString();
                  mBtConnectorHelper.TryConnect(address,callbackId);
                  args.add("Ok");
              }else{
                  args.add("ERROR");
                  args.add("Required parameters missing");
              }

              jxcore.CallJSMethod(callbackId, args.toArray());
          }
      });

      jxcore.RegisterMethod("SendMessage", new JXcoreCallback() {
          @Override
          public void Receiver(ArrayList<Object> params, String callbackId) {
              ArrayList<Object> args = new ArrayList<Object>();

              if (params.size() > 0) {
                  String message = params.get(0).toString();
                  if (mBtConnectorHelper.SendMessage(message)) {
                      args.add("Ok");
                  } else {
                      args.add("ERROR");
                      args.add("No connections available");
                  }
              } else {
                  args.add("ERROR");
                  args.add("Required parameters missing");
              }

              jxcore.CallJSMethod(callbackId, args.toArray());
          }
      });


      jxcore.RegisterMethod("StopConnector", new JXcoreCallback() {
          @Override
          public void Receiver(ArrayList<Object> params, String callbackId) {

              mBtConnectorHelper.Stop();

              ArrayList<Object> args = new ArrayList<Object>();
              jxcore.CallJSMethod(callbackId, args.toArray());
              args.add("Ok");
          }
      });

      final ConnectivityMonitor mConnectivityMonitor = new ConnectivityMonitor();

      jxcore.RegisterMethod("StartInternetMonitor", new JXcoreCallback() {
          @Override
          public void Receiver(ArrayList<Object> params, String callbackId) {

              mConnectivityMonitor.Start();

              ArrayList<Object> args = new ArrayList<Object>();
              jxcore.CallJSMethod(callbackId, args.toArray());
              args.add("Ok");
          }
      });


      jxcore.RegisterMethod("StopCInternetMonitor", new JXcoreCallback() {
          @Override
          public void Receiver(ArrayList<Object> params, String callbackId) {

              mConnectivityMonitor.Stop();

              ArrayList<Object> args = new ArrayList<Object>();
              jxcore.CallJSMethod(callbackId, args.toArray());
              args.add("Ok");
          }
      });


      final LifeCycleMonitor mLifeCycleMonitor = new LifeCycleMonitor();
      mLifeCycleMonitor.Start();




  }
}