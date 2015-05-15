// See the LICENSE file

var path = require('path');
var jx_methods = {};
var internal_methods = {};
var ui_methods = {};

function cordova(x) {
  if (!(this instanceof cordova)) return new cordova(x);

  this.name = x;
}

function callJXcoreNative(name, args) {
  var params = Array.prototype.slice.call(args, 0);

  var cb = "";

  if (params.length && typeof params[params.length - 1] == "function") {
    cb = "$$jxcore_callback_" + cordova.eventId;
    cordova.eventId++;
    cordova.eventId %= 1e5;
    cordova.on(cb, new WrapFunction(cb, params[params.length - 1]));
    params.pop();
  }

  var fnc = [name];
  var arr = fnc.concat(params);
  arr.push(cb);

  process.natives.callJXcoreNative.apply(null, arr);
}

function MakeCallback(callbackId) {
  this.cid = callbackId;

  var _this = this;
  this.callback = function () {
    callJXcoreNative("  _callback_  ", [Array.prototype.slice.call(arguments, 0), null, _this.cid]);
  };
}

function WrapFunction(cb, fnc) {
  this.fnc = fnc;
  this.cb = cb;

  var _this = this;
  this.callback = function () {
    delete cordova.events[_this.cb];
    return _this.fnc.apply(null, arguments);
  }
}

cordova.events = {};
cordova.eventId = 0;
cordova.on = function (name, target) {
  cordova.events[name] = target;
};

cordova.prototype.callNative = function () {
  callJXcoreNative(this.name, arguments);
  return this;
};

var isAndroid = process.platform == "android";

cordova.ping = function (name, param) {
  if (cordova.events.hasOwnProperty(name)) {
    var x;
    if (Array.isArray(param)) {
      x = param;
    } else if (param.str) {
      x = [param.str];
    } else if (param.json) {
      try {
        x = [JSON.parse(param.json)];
      } catch (e) {
        return e;
      }
    } else {
      x = null;
    }

    var target = cordova.events[name];

    if (target instanceof WrapFunction) {
      return target.callback.apply(target, x);
    } else {
      return target.apply(null, x);
    }
  }
};

process.natives.defineEventCB("eventPing", cordova.ping);

cordova.prototype.registerToNative = function (target) {
  if (!isAndroid)
    process.natives.defineEventCB(this.name, target);
  else
    cordova.events[this.name] = target;
  return this;
};

cordova.prototype.registerSync = function (target) {
  jx_methods[this.name] = {is_synced: 1, method: target};
  return this;
};

cordova.prototype.registerAsync = function (target) {
  jx_methods[this.name] = {is_synced: 0, method: target};
  return this;
};

cordova.prototype.unregister = function () {
  if (jx_methods[this.name]) {
    delete jx_methods[this.name];
  }
  return this;
};

cordova.prototype.call = function (rest) {
  var params = Array.prototype.slice.call(arguments, 0);
  var fnc = ui_methods[this.name];

  if (!fnc) {
    throw new Error("Method " + this.name + " is undefined.");
  }

  fnc.callback.apply(null, [params, null]);

  return this;
};

global.cordova = cordova;

internal_methods['registerUIMethod'] = function (methodName, callback_) {
  if (methodName && Array.isArray(methodName)) {
    methodName = methodName[0];
  }

  if (!methodName || !methodName.indexOf) {
    console.error("Couldn't register UI method. '" + methodName + "' is undefined or not string");
    return;
  }

  ui_methods[methodName] = {
    callback: callback_
  };
};

internal_methods['loadMainFile'] = function (filePath, callback_) {
  if (filePath && Array.isArray(filePath)) {
    filePath = filePath[0];
  }

  console.log("loadMainFile", filePath);
  if (!filePath || !filePath.indexOf) {
    console.error("Couldn't load main file. '" + filePath + "' is undefined or not string");
    return;
  }

  var result = true;
  var err = null;
  try {
    require(path.join(process.cwd(), filePath));
  } catch (e) {
    result = false;
    err = e;
    console.error("loadMainFile", e);
  }
  callback_(result, err);
};

cordova.executeJSON = function (json, callbackId) {
  if (!json.methodName) return; // try throw exception

  var internal = internal_methods[json.methodName];
  var fnc = jx_methods[json.methodName];

  if (!fnc && !internal) {
    console.error("JXcore: Method Doesn't Exist [", json.methodName, "] Did you register it?");
    return;
  }

  if (internal) {
    var cb = new MakeCallback(callbackId).callback
    json.params.push(cb);
    internal.apply(null, json.params);
  }

  if (fnc) {
    if (!fnc.is_synced) {
      if (!json.params || (json.params.length == 1 && json.params[0] === null)) {
        json.params = [];
      }
      json.params[json.params.length] = new MakeCallback(callbackId).callback;
    }

    var ret_val = fnc.method.apply(null, json.params);
    if (fnc.is_synced && callbackId) {
      new MakeCallback(callbackId).callback(ret_val);
    } else {
      return ret_val;
    }
  }
};

console.error("Platform", process.platform);
if (isAndroid) {
  process.registerAssets = function () {
    var fs = require('fs');
    var folders = process.natives.assetReadDirSync();
    var root = process.cwd();

    // patch execPath to userPath
    process.execPath = root;

    // force create /jxcore sub folder so we can write into cwd
    if (!fs.existsSync(root)) {
      fs.mkdir(root);
    }

    var jxcore_root;

    var prepVirtualDirs = function () {
      var _ = {};
      for (var o in folders) {
        var sub = o.split('/');
        var last = _;
        for (var i in sub) {
          var loc = sub[i];
          if (!last.hasOwnProperty(loc)) last[loc] = {};
          last = last[loc];
        }
        last['!s'] = folders[o];
      }

      folders = {};
      var sp = root.split('/');
      if (sp[0] === '') sp.shift();
      jxcore_root = folders;
      for (var o in sp) {
        if (sp[o] === 'jxcore')
          continue;

        jxcore_root[sp[o]] = {};
        jxcore_root = jxcore_root[sp[o]];
      }

      jxcore_root['jxcore'] = _; // assets/jxcore -> /
      jxcore_root = _;
    };

    prepVirtualDirs();

    var findIn = function (what, where) {
      var last = where;
      for (var o in what) {
        var subject = what[o];
        if (!last[subject]) return;

        last = last[subject];
      }

      return last;
    };

    var getLast = function (location) {
      while (location[0] == '/')
        location = location.substr(1);

      while (location[location.length - 1] == '/')
        location = location.substr(0, location.length - 1);

      var dirs = location.split('/');

      var res = findIn(dirs, jxcore_root);
      if (!res) res = findIn(dirs, folders);

      return res;
    };

    var existssync = function (pathname) {
      var n = pathname.indexOf(root);
      if (n === 0 || n === -1) {
        if (n === 0) {
          pathname = pathname.replace(root, '');
        }

        var last;
        if (pathname !== '') {
          last = getLast(pathname);
          if (!last) return false;
        } else {
          last = jxcore_root;
        }

        var result;
        if (typeof last['!s'] === 'undefined')
          result = {
            size: 0
          };
        else
          result = {
            size: last['!s']
          };

        return result;
      }
    };

    var readfilesync = function (pathname) {
      if (!existssync(pathname)) throw new Error(pathname + " does not exist");

      var n = pathname.indexOf(root);
      if (n === 0) {
        pathname = pathname.replace(root, "");
        pathname = path.join('jxcore/', pathname);
        return process.natives.assetReadSync(pathname);
      }
    };

    var readdirsync = function (pathname) {
      var n = pathname.indexOf(root);
      if (n === 0 || n === -1) {
        var last = getLast(pathname);
        if (!last || typeof last['!s'] !== 'undefined') return null;

        var arr = [];
        for (var o in last) {
          var item = last[o];
          if (item && o != '!s') arr.push(o);
        }
        return arr;
      }

      return null;
    };

    var extension = {
      readFileSync: readfilesync,
      readDirSync: readdirsync,
      existsSync: existssync
    };

    fs.setExtension("jxcore-java", extension);
  };

  process.registerAssets();
} else {
  //ugly patching
  var base_path = process.cwd();
  process.cwd = function () {
    return base_path + "/jxcore/";
  };
}

console.log("JXcore Cordova Bridge is Ready!");