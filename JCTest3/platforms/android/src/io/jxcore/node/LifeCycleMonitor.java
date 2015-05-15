package io.jxcore.node;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;

import java.util.ArrayList;

/**
 * Created by juksilve on 13.5.2015.
 */
public class LifeCycleMonitor implements Application.ActivityLifecycleCallbacks {

    Application MyApp = null;
    final String callbackId = "onLifeCycleEvent";

    final String ACTIVITY_CREATED   = "onActivityCreated";
    final String ACTIVITY_STARTED   = "onActivityStarted";
    final String ACTIVITY_RESUMED   = "onActivityResumed";
    final String ACTIVITY_PAUSED    = "onActivityPaused";
    final String ACTIVITY_STOPPED   = "onActivityStopped";
    final String ACTIVITY_SAVE_INST = "onActivitySaveInstanceState";
    final String ACTIVITY_DESTROYED = "onActivityDestroyed";

    public LifeCycleMonitor() {




    }

    public void Start() {
        this.MyApp = jxcore.activity.getApplication();
        if (this.MyApp != null) {
            this.MyApp.registerActivityLifecycleCallbacks(this);
        }
    }

    public void Stop() {
        if (this.MyApp != null) {
            this.MyApp.unregisterActivityLifecycleCallbacks(this);
            this.MyApp = null;
        }
    }

    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {SendEvent(ACTIVITY_CREATED);}

    @Override
    public void onActivityStarted(Activity activity) {SendEvent(ACTIVITY_STARTED);}

    @Override
    public void onActivityResumed(Activity activity) {SendEvent(ACTIVITY_RESUMED);}

    @Override
    public void onActivityPaused(Activity activity) {SendEvent(ACTIVITY_PAUSED);}

    @Override
    public void onActivityStopped(Activity activity) {SendEvent(ACTIVITY_STOPPED);}

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {SendEvent(ACTIVITY_SAVE_INST);}

    @Override
    public void onActivityDestroyed(Activity activity) {
        Stop();
        SendEvent(ACTIVITY_DESTROYED);
    }

    private void SendEvent(String message) {
        final String messageTmp = message;
        jxcore.activity.runOnUiThread(new Runnable(){
            public void run() {
                if (callbackId.length() > 0) {
                    ArrayList<Object> args = new ArrayList<Object>();
                    args.add(messageTmp);
                    jxcore.CallJSMethod(callbackId, args.toArray());
                }
            }
        });
    }
}
