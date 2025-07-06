import require$$3 from "electron";
import require$$0$1 from "fs";
import require$$0 from "path";
import require$$0$2 from "os";
import require$$2 from "process";
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: () => e[k]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
var dist = {};
var browserWindow = {};
var vibrancy = {};
var bindings$1 = {};
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var bindings = { exports: {} };
var fileUriToPath_1;
var hasRequiredFileUriToPath;
function requireFileUriToPath() {
  if (hasRequiredFileUriToPath) return fileUriToPath_1;
  hasRequiredFileUriToPath = 1;
  var sep = require$$0.sep || "/";
  fileUriToPath_1 = fileUriToPath;
  function fileUriToPath(uri) {
    if ("string" != typeof uri || uri.length <= 7 || "file://" != uri.substring(0, 7)) {
      throw new TypeError("must pass in a file:// URI to convert to a file path");
    }
    var rest = decodeURI(uri.substring(7));
    var firstSlash = rest.indexOf("/");
    var host = rest.substring(0, firstSlash);
    var path = rest.substring(firstSlash + 1);
    if ("localhost" == host) host = "";
    if (host) {
      host = sep + sep + host;
    }
    path = path.replace(/^(.+)\|/, "$1:");
    if (sep == "\\") {
      path = path.replace(/\//g, "\\");
    }
    if (/^.+\:/.test(path)) ;
    else {
      path = sep + path;
    }
    return host + path;
  }
  return fileUriToPath_1;
}
var hasRequiredBindings$1;
function requireBindings$1() {
  if (hasRequiredBindings$1) return bindings.exports;
  hasRequiredBindings$1 = 1;
  (function(module, exports) {
    var fs = require$$0$1, path = require$$0, fileURLToPath = requireFileUriToPath(), join = path.join, dirname = path.dirname, exists = fs.accessSync && function(path2) {
      try {
        fs.accessSync(path2);
      } catch (e) {
        return false;
      }
      return true;
    } || fs.existsSync || path.existsSync, defaults = {
      arrow: process.env.NODE_BINDINGS_ARROW || " → ",
      compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
      platform: process.platform,
      arch: process.arch,
      nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
      version: process.versions.node,
      bindings: "bindings.node",
      try: [
        // node-gyp's linked version in the "build" dir
        ["module_root", "build", "bindings"],
        // node-waf and gyp_addon (a.k.a node-gyp)
        ["module_root", "build", "Debug", "bindings"],
        ["module_root", "build", "Release", "bindings"],
        // Debug files, for development (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Debug", "bindings"],
        ["module_root", "Debug", "bindings"],
        // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Release", "bindings"],
        ["module_root", "Release", "bindings"],
        // Legacy from node-waf, node <= 0.4.x
        ["module_root", "build", "default", "bindings"],
        // Production "Release" buildtype binary (meh...)
        ["module_root", "compiled", "version", "platform", "arch", "bindings"],
        // node-qbs builds
        ["module_root", "addon-build", "release", "install-root", "bindings"],
        ["module_root", "addon-build", "debug", "install-root", "bindings"],
        ["module_root", "addon-build", "default", "install-root", "bindings"],
        // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
        ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
      ]
    };
    function bindings2(opts) {
      if (typeof opts == "string") {
        opts = { bindings: opts };
      } else if (!opts) {
        opts = {};
      }
      Object.keys(defaults).map(function(i2) {
        if (!(i2 in opts)) opts[i2] = defaults[i2];
      });
      if (!opts.module_root) {
        opts.module_root = exports.getRoot(exports.getFileName());
      }
      if (path.extname(opts.bindings) != ".node") {
        opts.bindings += ".node";
      }
      var requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
      var tries = [], i = 0, l = opts.try.length, n, b, err;
      for (; i < l; i++) {
        n = join.apply(
          null,
          opts.try[i].map(function(p) {
            return opts[p] || p;
          })
        );
        tries.push(n);
        try {
          b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
          if (!opts.path) {
            b.path = n;
          }
          return b;
        } catch (e) {
          if (e.code !== "MODULE_NOT_FOUND" && e.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(e.message)) {
            throw e;
          }
        }
      }
      err = new Error(
        "Could not locate the bindings file. Tried:\n" + tries.map(function(a) {
          return opts.arrow + a;
        }).join("\n")
      );
      err.tries = tries;
      throw err;
    }
    module.exports = exports = bindings2;
    exports.getFileName = function getFileName(calling_file) {
      var origPST = Error.prepareStackTrace, origSTL = Error.stackTraceLimit, dummy = {}, fileName;
      Error.stackTraceLimit = 10;
      Error.prepareStackTrace = function(e, st) {
        for (var i = 0, l = st.length; i < l; i++) {
          fileName = st[i].getFileName();
          if (fileName !== __filename) {
            if (calling_file) {
              if (fileName !== calling_file) {
                return;
              }
            } else {
              return;
            }
          }
        }
      };
      Error.captureStackTrace(dummy);
      dummy.stack;
      Error.prepareStackTrace = origPST;
      Error.stackTraceLimit = origSTL;
      var fileSchema = "file://";
      if (fileName.indexOf(fileSchema) === 0) {
        fileName = fileURLToPath(fileName);
      }
      return fileName;
    };
    exports.getRoot = function getRoot(file) {
      var dir = dirname(file), prev;
      while (true) {
        if (dir === ".") {
          dir = process.cwd();
        }
        if (exists(join(dir, "package.json")) || exists(join(dir, "node_modules"))) {
          return dir;
        }
        if (prev === dir) {
          throw new Error(
            'Could not find module root given file: "' + file + '". Do you have a `package.json` file? '
          );
        }
        prev = dir;
        dir = join(dir, "..");
      }
    };
  })(bindings, bindings.exports);
  return bindings.exports;
}
var hasRequiredBindings;
function requireBindings() {
  if (hasRequiredBindings) return bindings$1;
  hasRequiredBindings = 1;
  Object.defineProperty(bindings$1, "__esModule", { value: true });
  let _bindings;
  function bindings2() {
    return _bindings !== null && _bindings !== void 0 ? _bindings : _bindings = requireBindings$1()("vibrancy-wrapper");
  }
  bindings$1.default = bindings2;
  return bindings$1;
}
var debug = {};
var hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug;
  hasRequiredDebug = 1;
  Object.defineProperty(debug, "__esModule", { value: true });
  debug.toggleDebugging = void 0;
  let _debug = false;
  function debug$1(...msgs) {
    if (!_debug)
      return;
    console.log(...msgs);
  }
  debug.default = debug$1;
  function toggleDebugging(debug2) {
    _debug = debug2;
  }
  debug.toggleDebugging = toggleDebugging;
  return debug;
}
var os = {};
var hasRequiredOs;
function requireOs() {
  if (hasRequiredOs) return os;
  hasRequiredOs = 1;
  (function(exports) {
    var __createBinding = os && os.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = os && os.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = os && os.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isRS4OrGreater = exports.isWindows11OrGreater = exports.isWindows10OrGreater = void 0;
    const os$1 = __importStar(require$$0$2);
    exports.isWindows10OrGreater = process.platform === "win32" && os$1.release().split(".")[0] === "10";
    exports.isWindows11OrGreater = process.platform === "win32" && parseInt(os$1.release().split(".")[2]) >= 22e3;
    exports.isRS4OrGreater = exports.isWindows10OrGreater && !(os$1.release().split(".")[1] === "0" && parseInt(os$1.release().split(".")[2], 10) < 17134);
  })(os);
  return os;
}
var hasRequiredVibrancy;
function requireVibrancy() {
  if (hasRequiredVibrancy) return vibrancy;
  hasRequiredVibrancy = 1;
  var __createBinding = vibrancy && vibrancy.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = vibrancy && vibrancy.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = vibrancy && vibrancy.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __importDefault = vibrancy && vibrancy.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(vibrancy, "__esModule", { value: true });
  vibrancy.setVibrancy = vibrancy._setVibrancy = vibrancy.getConfigFromOptions = vibrancy.rgbToHex = vibrancy._8bitToHex = vibrancy.hexTo255 = void 0;
  const bindings_1 = __importDefault(requireBindings());
  const debug_1 = __importDefault(requireDebug());
  const os_1 = requireOs();
  const electron = __importStar(require$$3);
  function getHwnd(win) {
    if (!win)
      throw new TypeError("WINDOW_NOT_GIVEN");
    try {
      return win.getNativeWindowHandle().readInt32LE(0);
    } catch (e) {
      throw new TypeError("NOT_VALID_WINDOW");
    }
  }
  const _lightThemeColor = [221, 221, 221, 136];
  const _darkThemeColor = [34, 34, 34, 136];
  function hexTo255(hex) {
    const result = /^#?([a-f\d]{2})$/i.exec(hex);
    return result ? parseInt(result[1], 16) : void 0;
  }
  vibrancy.hexTo255 = hexTo255;
  function _8bitToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  vibrancy._8bitToHex = _8bitToHex;
  function rgbToHex(rgb) {
    return "#" + _8bitToHex(rgb.r) + _8bitToHex(rgb.g) + _8bitToHex(rgb.b);
  }
  vibrancy.rgbToHex = rgbToHex;
  function getColorsFromTheme(theme) {
    const dark = {
      r: _darkThemeColor[0],
      g: _darkThemeColor[1],
      b: _darkThemeColor[2],
      a: _darkThemeColor[3]
    };
    const light = {
      r: _lightThemeColor[0],
      g: _lightThemeColor[1],
      b: _lightThemeColor[2],
      a: _lightThemeColor[3]
    };
    if (theme === "light")
      return light;
    if (theme === "dark")
      return dark;
    if (typeof theme === "string") {
      const r = hexTo255(theme.slice(1, 3));
      const g = hexTo255(theme.slice(3, 5));
      const b = hexTo255(theme.slice(5, 7));
      const a = hexTo255(theme.slice(7, 9));
      if (r === void 0 || g === void 0 || b === void 0 || a === void 0)
        return light;
      return { r, g, b, a };
    }
    if (electron.nativeTheme.shouldUseDarkColors)
      return dark;
    else
      return light;
  }
  function getConfigFromOptions(vibrancyOptions) {
    const defaultSettings = {
      theme: void 0,
      effect: "acrylic",
      useCustomWindowRefreshMethod: true,
      maximumRefreshRate: 60,
      disableOnBlur: true
    };
    const options = Object.assign(defaultSettings, typeof vibrancyOptions === "object" ? vibrancyOptions : { theme: vibrancyOptions });
    let config = {
      disableOnBlur: options.disableOnBlur,
      effect: 0,
      maximumRefreshRate: options.maximumRefreshRate,
      useCustomWindowRefreshMethod: options.useCustomWindowRefreshMethod,
      colors: getColorsFromTheme(options.theme),
      currentOpacity: 0
    };
    if (options.effect === "acrylic" && os_1.isRS4OrGreater)
      config.effect = 1;
    return config;
  }
  vibrancy.getConfigFromOptions = getConfigFromOptions;
  function _setVibrancy(win, config) {
    if (config && config.colors) {
      (0, debug_1.default)("Vibrancy On", config);
      (0, bindings_1.default)().setVibrancy(getHwnd(win), config.effect, config.colors.r, config.colors.g, config.colors.b, win.__electron_acrylic_window__.vibrnacyConfig.currentOpacity);
      win.__electron_acrylic_window__.vibrancyActivated = true;
      setTimeout(() => {
        try {
          if (win.__electron_acrylic_window__.vibrancyActivated)
            win.setBackgroundColor("#00000000");
        } catch (e) {
        }
      }, 50);
    } else {
      (0, debug_1.default)("Vibrancy Off", config, win.__electron_acrylic_window__.vibrnacyConfig);
      win.__electron_acrylic_window__.vibrancyActivated = false;
      if (win.__electron_acrylic_window__.vibrnacyConfig) {
        win.setBackgroundColor(win.__electron_acrylic_window__.vibrnacyConfig && win.__electron_acrylic_window__.vibrnacyConfig.colors ? "#FE" + win.__electron_acrylic_window__.vibrnacyConfig.colors.r + win.__electron_acrylic_window__.vibrnacyConfig.colors.g + win.__electron_acrylic_window__.vibrnacyConfig.colors.b : "#000000");
      }
      setTimeout(() => {
        try {
          if (!win.__electron_acrylic_window__.vibrancyActivated)
            (0, bindings_1.default)().disableVibrancy(getHwnd(win));
        } catch (e) {
        }
      }, 10);
    }
  }
  vibrancy._setVibrancy = _setVibrancy;
  function setVibrancy(win, vibrancy2 = "appearance-based") {
    win.__electron_acrylic_window__ = win.__electron_acrylic_window__ || {};
    if (vibrancy2) {
      win.__electron_acrylic_window__.vibrnacyConfig = getConfigFromOptions(vibrancy2);
      _setVibrancy(win, win.__electron_acrylic_window__.vibrnacyConfig);
    } else {
      _setVibrancy(win);
      win.__electron_acrylic_window__.vibrnacyConfig = getConfigFromOptions(void 0);
    }
  }
  vibrancy.setVibrancy = setVibrancy;
  return vibrancy;
}
var win10refresh = {};
var win32Displayconfig = { exports: {} };
var hasRequiredWin32Displayconfig;
function requireWin32Displayconfig() {
  if (hasRequiredWin32Displayconfig) return win32Displayconfig.exports;
  hasRequiredWin32Displayconfig = 1;
  (function(module) {
    const addon = requireBindings$1()("./win32_displayconfig");
    class Win32Error extends Error {
      constructor(code) {
        super(`Win32 error code ${code}`);
        this.code = code;
      }
    }
    module.exports.Win32Error = Win32Error;
    module.exports.queryDisplayConfig = () => {
      return new Promise((resolve, reject) => {
        const ran = addon.win32_queryDisplayConfig((err, result) => {
          if (err !== null) {
            reject(new Win32Error(err));
          } else {
            resolve(result);
          }
        });
        if (!ran) {
          resolve(void 0);
        }
      });
    };
    module.exports.extractDisplayConfig = async () => {
      const config = await module.exports.queryDisplayConfig();
      const ret = [];
      for (const { value, buffer: pathBuffer } of config.pathArray) {
        let inUse = value.flags & true ? true : false;
        const { sourceInfo, targetInfo } = value;
        const {
          modeInfoIdx: sourceModeIdx,
          adapterId: sourceAdapterId,
          id: sourceId
        } = sourceInfo;
        const {
          adapterId,
          id,
          outputTechnology,
          rotation,
          scaling,
          modeInfoIdx: targetModeIdx
        } = targetInfo;
        const sourceConfigId = {
          adapterId: sourceAdapterId,
          id: sourceId
        };
        const targetConfigId = {
          adapterId,
          id
        };
        const displayNameEntry = config.nameArray.find(
          (n) => n.adapterId.LowPart === adapterId.LowPart && n.adapterId.HighPart === adapterId.HighPart && n.id === id && n.outputTechnology && outputTechnology && n.monitorDevicePath.length > 0
        );
        if (displayNameEntry === void 0) {
          continue;
        }
        const sourceMode = config.modeArray[sourceModeIdx];
        const targetMode = config.modeArray[targetModeIdx];
        if (sourceMode === void 0) {
          continue;
        }
        if (targetMode === void 0) {
          inUse = false;
        }
        const sourceModeValue = sourceMode.value;
        if (sourceModeValue.infoType !== "source") {
          continue;
        }
        const { monitorFriendlyDeviceName, monitorDevicePath } = displayNameEntry;
        const output = {
          displayName: monitorFriendlyDeviceName,
          devicePath: monitorDevicePath,
          sourceConfigId,
          targetConfigId,
          inUse,
          outputTechnology,
          rotation,
          scaling,
          sourceMode: sourceModeValue.sourceMode,
          pathBuffer,
          sourceModeBuffer: sourceMode.buffer
        };
        if (targetMode !== void 0) {
          const targetModeValue = targetMode.value;
          if (targetModeValue.infoType === "target") {
            output.targetVideoSignalInfo = targetModeValue.targetMode.targetVideoSignalInfo;
            output.targetModeBuffer = targetMode.buffer;
          }
        }
        ret.push(output);
      }
      return ret;
    };
    async function win32_toggleEnabledDisplays(args) {
      return new Promise((resolve, reject) => {
        const ran = addon.win32_toggleEnabledDisplays(args, (_, errorCode) => {
          if (errorCode === 0) {
            resolve();
          } else {
            reject(new Win32Error(errorCode));
          }
        });
        if (!ran) {
          resolve();
        }
      });
    }
    module.exports.toggleEnabledDisplays = async (args) => {
      const { persistent, enable: enablePaths, disable: disablePaths } = args;
      const enable = [];
      const disable = [];
      const displayConfig = await module.exports.extractDisplayConfig();
      for (const { devicePath, targetConfigId } of displayConfig) {
        if (Array.isArray(enablePaths) && enablePaths.indexOf(devicePath) >= 0) {
          enable.push(targetConfigId);
        }
        if (Array.isArray(disablePaths) && disablePaths.indexOf(devicePath) >= 0) {
          disable.push(targetConfigId);
        }
      }
      await win32_toggleEnabledDisplays({ enable, disable, persistent });
    };
    function setSubtract(left, right) {
      const ret = /* @__PURE__ */ new Set();
      for (const entry of left) {
        if (!right.has(entry)) {
          ret.add(entry);
        }
      }
      return Array.from(ret);
    }
    function devicePathLookupForEnabledDisplayConfig(conf) {
      const ret = {};
      for (const entry of conf) {
        if (entry.inUse && entry.targetModeBuffer === void 0) {
          continue;
        }
        if (ret[entry.devicePath] !== void 0) {
          continue;
        }
        ret[entry.devicePath] = entry;
      }
      return ret;
    }
    module.exports.displayConfigForRestoration = async () => {
      const currentConfig = await module.exports.extractDisplayConfig();
      const ret = [];
      for (const entry of currentConfig) {
        if (!entry.inUse || entry.targetModeBuffer === void 0) {
          continue;
        }
        const {
          devicePath,
          pathBuffer,
          sourceModeBuffer,
          targetModeBuffer
        } = entry;
        ret.push({
          devicePath,
          pathBuffer: pathBuffer.toString("base64"),
          sourceModeBuffer: sourceModeBuffer.toString("base64"),
          targetModeBuffer: targetModeBuffer.toString("base64")
        });
      }
      return ret;
    };
    async function win32_restoreDisplayConfig(configs, persistent) {
      return new Promise((resolve, reject) => {
        const ran = addon.win32_restoreDisplayConfig(
          configs,
          (_, errorCode) => {
            if (errorCode === 0) {
              resolve();
            } else {
              reject(new Win32Error(errorCode));
            }
          },
          persistent
        );
        if (!ran) {
          resolve();
        }
      });
    }
    module.exports.restoreDisplayConfig = async (args) => {
      const devicePathNames = args.config.filter(({ targetModeBuffer }) => targetModeBuffer !== void 0).map(({ devicePath }) => devicePath);
      const currentConfig = await module.exports.extractDisplayConfig();
      const givenAsSet = new Set(currentConfig.map(({ devicePath }) => devicePath));
      const expectedEnabledAsSet = new Set(devicePathNames);
      const missingEnabled = setSubtract(expectedEnabledAsSet, givenAsSet);
      if (missingEnabled.length === 0) {
        const pathLookup = devicePathLookupForEnabledDisplayConfig(currentConfig);
        const coercedState = [];
        for (const entry of args.config) {
          if (entry.targetModeBuffer === void 0) {
            continue;
          }
          const currentConfigEntry = pathLookup[entry.devicePath];
          if (currentConfigEntry === void 0) {
            continue;
          }
          const { sourceConfigId, targetConfigId } = currentConfigEntry;
          const { pathBuffer, sourceModeBuffer, targetModeBuffer } = entry;
          coercedState.push({
            sourceConfigId,
            targetConfigId,
            pathBuffer: Buffer.from(pathBuffer, "base64"),
            sourceModeBuffer: Buffer.from(sourceModeBuffer, "base64"),
            targetModeBuffer: Buffer.from(targetModeBuffer, "base64")
          });
        }
        await win32_restoreDisplayConfig(coercedState, args.persistent);
      } else {
        const seen = /* @__PURE__ */ new Set();
        const enable = [];
        const disable = [];
        const notInUse = args.config.filter(({ targetModeBuffer }) => targetModeBuffer === void 0).map(({ devicePath }) => devicePath);
        for (const devicePathName of devicePathNames) {
          if (!seen.has(devicePathName) && givenAsSet.has(devicePathName)) {
            enable.push(devicePathName);
            seen.add(devicePathName);
          }
        }
        for (const devicePathName of notInUse) {
          if (!seen.has(devicePathName) && givenAsSet.has(devicePathName)) {
            disable.push(devicePathName);
            seen.add(devicePathName);
          }
        }
        await module.exports.toggleEnabledDisplays({
          enable,
          disable,
          persistent: args.persistent
        });
      }
    };
    let currentDisplayConfig;
    const displayChangeCallbacks = /* @__PURE__ */ new Set();
    async function updateDisplayStateAndNotifyCallbacks() {
      try {
        currentDisplayConfig = await module.exports.extractDisplayConfig();
        for (const callback of Array.from(displayChangeCallbacks)) {
          callback(null, currentDisplayConfig);
        }
      } catch (e) {
        for (const callback of Array.from(displayChangeCallbacks)) {
          callback(e);
        }
      }
    }
    let currentDisplayConfigPromise = updateDisplayStateAndNotifyCallbacks();
    function setupListenForDisplayChanges() {
      addon.win32_listenForDisplayChanges((err) => {
        if (err === null) {
          currentDisplayConfigPromise = currentDisplayConfigPromise.then(
            () => updateDisplayStateAndNotifyCallbacks()
          );
        }
      });
    }
    module.exports.addDisplayChangeListener = (listener) => {
      if (displayChangeCallbacks.size === 0) {
        setupListenForDisplayChanges();
      }
      displayChangeCallbacks.add(listener);
      if (currentDisplayConfig !== void 0) {
        listener(null, currentDisplayConfig);
      }
      return listener;
    };
    module.exports.removeDisplayChangeListener = (listener) => {
      displayChangeCallbacks.delete(listener);
      if (displayChangeCallbacks.size === 0) {
        addon.win32_stopListeningForDisplayChanges();
      }
    };
    class VerticalRefreshRateContext {
      constructor() {
        let readyPromiseResolver;
        let readyPromiseResolved = false;
        this.readyPromise = new Promise((resolve) => {
          readyPromiseResolver = () => {
            if (readyPromiseResolved) return;
            readyPromiseResolved = true;
            resolve();
          };
        });
        this.geometry = [];
        const computeDisplayGeometryFromConfig = (err, conf) => {
          if (err !== null) {
            return;
          }
          const geom = [];
          for (const { sourceMode, targetVideoSignalInfo, inUse } of conf) {
            if (!inUse) {
              continue;
            }
            const { width, height, position } = sourceMode;
            const { vSyncFreq } = targetVideoSignalInfo;
            const vRefreshRate = vSyncFreq.Numerator === 0 || vSyncFreq.Denominator === 0 ? 30 : vSyncFreq.Numerator / vSyncFreq.Denominator;
            const top = position.y;
            const bottom = position.y + height;
            const left = position.x;
            const right = position.x + width;
            geom.push({ top, bottom, left, right, vRefreshRate });
          }
          this.geometry = geom;
          readyPromiseResolver();
        };
        this.changeListener = module.exports.addDisplayChangeListener(
          computeDisplayGeometryFromConfig
        );
      }
      /**
       * Computes the vertical refresh rate of the displays at a given display point.
       *
       * If any displays overlap at the given display point, the return result will
       * be the minimum of the vertical refresh rates of each physical device displaying
       * at that effective point.
       *
       * This method is asynchronous due to the implementation of addDisplayChangeListener;
       * it waits for a valid display configuration to be captured before returning the
       * best possible refresh rate.
       *
       * @param {number} x The vertical offset of the display point
       * @param {number} y The horizontal offset of the display point
       *
       * @returns {number | undefined} The vertical refresh rate at the given display point,
       *   or undefined if the given display point is out of bounds of the available display space.
       */
      async findVerticalRefreshRateForDisplayPoint(x, y) {
        await this.readyPromise;
        let ret;
        for (const { top, bottom, left, right, vRefreshRate } of this.geometry) {
          if (left <= x && x < right && top <= y && y < bottom) {
            ret = ret === void 0 ? vRefreshRate : Math.min(ret, vRefreshRate);
          }
        }
        return ret;
      }
      /**
       * Disconnects this instance from display change events.
       *
       * Disconnecting the instance from display change events will clear relevant
       * work items off of the event loop as per {@link removeDisplayChangeListener}.
       */
      close() {
        module.exports.removeDisplayChangeListener(this.changeListener);
      }
    }
    module.exports.VerticalRefreshRateContext = VerticalRefreshRateContext;
  })(win32Displayconfig);
  return win32Displayconfig.exports;
}
var hasRequiredWin10refresh;
function requireWin10refresh() {
  if (hasRequiredWin10refresh) return win10refresh;
  hasRequiredWin10refresh = 1;
  var __createBinding = win10refresh && win10refresh.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = win10refresh && win10refresh.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = win10refresh && win10refresh.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __awaiter = win10refresh && win10refresh.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __importDefault = win10refresh && win10refresh.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(win10refresh, "__esModule", { value: true });
  const win32_displayconfig_1 = requireWin32Displayconfig();
  const electron = __importStar(require$$3);
  const process_1 = __importDefault(require$$2);
  const debug_1 = __importDefault(requireDebug());
  function sleep(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }
  function areBoundsEqual(left, right) {
    return left.height === right.height && left.width === right.width && left.x === right.x && left.y === right.y;
  }
  const billion = 1e3 * 1e3 * 1e3;
  function hrtimeDeltaForFrequency(freq) {
    return BigInt(Math.ceil(billion / freq));
  }
  let disableJitterFix = false;
  function isInSnapZone() {
    const point = electron.screen.getCursorScreenPoint();
    const display = electron.screen.getDisplayNearestPoint(point);
    return point.x > display.bounds.x - 20 && point.x < display.bounds.x + 20 || point.x > display.bounds.x + display.bounds.width - 20 && point.x < display.bounds.x + display.bounds.width + 20;
  }
  function win10refresh$1(win, maximumRefreshRate) {
    const refreshCtx = new win32_displayconfig_1.VerticalRefreshRateContext();
    function getRefreshRateAtCursor(cursor) {
      cursor = cursor || electron.screen.getCursorScreenPoint();
      return refreshCtx.findVerticalRefreshRateForDisplayPoint(cursor.x, cursor.y);
    }
    let pollingRate;
    let doFollowUpQuery = false, isMoving = false, shouldMove = false;
    let moveLastUpdate = BigInt(0), resizeLastUpdate = BigInt(0);
    let lastWillMoveBounds, lastWillResizeBounds, desiredMoveBounds;
    let boundsPromise = Promise.race([
      getRefreshRateAtCursor(electron.screen.getCursorScreenPoint()).then((rate) => {
        pollingRate = rate || 30;
        doFollowUpQuery = true;
      }),
      // Establishing the display configuration can fail; we can't
      // just block forever if that happens. Instead, establish
      // a fallback polling rate and hope for the best.
      sleep(2e3).then(() => {
        pollingRate = pollingRate || 30;
      })
    ]);
    function doFollowUpQueryIfNecessary(cursor) {
      return __awaiter(this, void 0, void 0, function* () {
        if (doFollowUpQuery) {
          const rate = yield getRefreshRateAtCursor(cursor);
          if (rate != pollingRate)
            (0, debug_1.default)(`New polling rate: ${rate}`);
          pollingRate = rate || 30;
        }
      });
    }
    function setWindowBounds(bounds) {
      if (win.isDestroyed())
        return;
      win.setBounds(bounds);
      desiredMoveBounds = win.getBounds();
    }
    function currentTimeBeforeNextActivityWindow(lastTime, forceFreq) {
      return process_1.default.hrtime.bigint() < lastTime + hrtimeDeltaForFrequency(forceFreq || pollingRate || 30);
    }
    function guardingAgainstMoveUpdate(fn) {
      if (pollingRate === void 0 || !currentTimeBeforeNextActivityWindow(moveLastUpdate)) {
        moveLastUpdate = process_1.default.hrtime.bigint();
        fn();
        return true;
      } else {
        return false;
      }
    }
    win.on("will-move", (e, newBounds) => {
      if (win.__electron_acrylic_window__.opacityInterval)
        return;
      if (lastWillMoveBounds !== void 0 && areBoundsEqual(lastWillMoveBounds, newBounds)) {
        e.preventDefault();
        return;
      }
      if (lastWillMoveBounds) {
        newBounds.width = lastWillMoveBounds.width;
        newBounds.height = lastWillMoveBounds.height;
      }
      lastWillMoveBounds = newBounds;
      const didOptimisticMove = !isMoving && guardingAgainstMoveUpdate(() => {
        desiredMoveBounds = void 0;
      });
      if (didOptimisticMove) {
        boundsPromise = boundsPromise.then(doFollowUpQueryIfNecessary);
        return;
      }
      e.preventDefault();
      if (win.__electron_acrylic_window__.moveTimeout)
        clearTimeout(win.__electron_acrylic_window__.moveTimeout);
      win.__electron_acrylic_window__.moveTimeout = setTimeout(() => {
        shouldMove = false;
      }, 1e3 / Math.min(pollingRate, maximumRefreshRate));
      disableJitterFix = isInSnapZone();
      if (!shouldMove) {
        let handleIntervalTick = function(moveInterval2) {
          boundsPromise = boundsPromise.then(() => {
            if (!shouldMove) {
              isMoving = false;
              clearInterval(moveInterval2);
              return;
            }
            const cursor = electron.screen.getCursorScreenPoint();
            const didIt = guardingAgainstMoveUpdate(() => {
              if (lastWillResizeBounds && lastWillResizeBounds.width)
                setWindowBounds({
                  x: Math.floor(basisBounds.x + (cursor.x - basisCursor.x)),
                  y: Math.floor(basisBounds.y + (cursor.y - basisCursor.y)),
                  width: Math.floor(lastWillResizeBounds.width / electron.screen.getDisplayMatching(basisBounds).scaleFactor),
                  height: Math.floor(lastWillResizeBounds.height / electron.screen.getDisplayMatching(basisBounds).scaleFactor)
                });
              else
                setWindowBounds({
                  x: Math.floor(basisBounds.x + (cursor.x - basisCursor.x)),
                  y: Math.floor(basisBounds.y + (cursor.y - basisCursor.y)),
                  width: Math.floor(lastWillMoveBounds.width / electron.screen.getDisplayMatching(basisBounds).scaleFactor),
                  height: Math.floor(lastWillMoveBounds.height / electron.screen.getDisplayMatching(basisBounds).scaleFactor)
                });
            });
            if (didIt) {
              return doFollowUpQueryIfNecessary(cursor);
            }
          });
        };
        shouldMove = true;
        if (isMoving)
          return false;
        isMoving = true;
        const basisBounds = win.getBounds();
        const basisCursor = electron.screen.getCursorScreenPoint();
        const moveInterval = setInterval(() => handleIntervalTick(moveInterval), 1e3 / 600);
      }
    });
    win.on("move", (e) => {
      if (disableJitterFix) {
        return false;
      }
      if (isMoving || win.isDestroyed()) {
        e.preventDefault();
        return false;
      }
      if (desiredMoveBounds !== void 0) {
        const forceBounds = desiredMoveBounds;
        desiredMoveBounds = void 0;
        win.setBounds({
          x: Math.floor(forceBounds.x),
          y: Math.floor(forceBounds.y),
          width: Math.floor(forceBounds.width),
          height: Math.floor(forceBounds.height)
        });
      }
    });
    win.on("will-resize", (e, newBounds) => {
      if (lastWillResizeBounds !== void 0 && areBoundsEqual(lastWillResizeBounds, newBounds)) {
        e.preventDefault();
        return;
      }
      lastWillResizeBounds = newBounds;
      if (pollingRate !== void 0 && currentTimeBeforeNextActivityWindow(resizeLastUpdate, Math.min(pollingRate, maximumRefreshRate))) {
        e.preventDefault();
        return false;
      }
      resizeLastUpdate = process_1.default.hrtime.bigint();
    });
    win.on("resize", () => {
      resizeLastUpdate = process_1.default.hrtime.bigint();
      boundsPromise = boundsPromise.then(doFollowUpQueryIfNecessary);
    });
    win.on("closed", refreshCtx.close);
  }
  win10refresh.default = win10refresh$1;
  return win10refresh;
}
var hasRequiredBrowserWindow;
function requireBrowserWindow() {
  if (hasRequiredBrowserWindow) return browserWindow;
  hasRequiredBrowserWindow = 1;
  var __createBinding = browserWindow && browserWindow.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = browserWindow && browserWindow.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = browserWindow && browserWindow.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __classPrivateFieldGet = browserWindow && browserWindow.__classPrivateFieldGet || function(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  };
  var __classPrivateFieldSet = browserWindow && browserWindow.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
  };
  var __importDefault = browserWindow && browserWindow.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  var _BrowserWindow_vibconfig, _BrowserWindow_winconfig;
  Object.defineProperty(browserWindow, "__esModule", { value: true });
  browserWindow.BrowserWindow = void 0;
  const electron = __importStar(require$$3);
  const vibrancy_1 = requireVibrancy();
  const os_1 = requireOs();
  const win10refresh_1 = __importDefault(requireWin10refresh());
  const debug_1 = requireDebug();
  class BrowserWindow extends electron.BrowserWindow {
    constructor(options) {
      var _a, _b;
      super(Object.assign(Object.assign({}, options), { vibrancy: void 0, show: false }));
      this.options = options;
      _BrowserWindow_vibconfig.set(this, (0, vibrancy_1.getConfigFromOptions)((_a = this.options) === null || _a === void 0 ? void 0 : _a.vibrancy));
      _BrowserWindow_winconfig.set(this, {
        targetOpacity: 0,
        vibrancyActivated: false,
        vibrnacyConfig: __classPrivateFieldGet(this, _BrowserWindow_vibconfig, "f"),
        opacity: 0,
        currentOpacity: 0,
        opacityInterval: void 0,
        moveTimeout: void 0,
        debug: false
      });
      void this.__electron_acrylic_window__;
      let config = (0, vibrancy_1.getConfigFromOptions)(options === null || options === void 0 ? void 0 : options.vibrancy);
      let opShowOriginal = (_b = options === null || options === void 0 ? void 0 : options.show) !== null && _b !== void 0 ? _b : true;
      if (os_1.isWindows10OrGreater && config) {
        if (config.colors.base)
          this.setBackgroundColor((0, vibrancy_1.rgbToHex)(config.colors.base));
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.currentOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        this.webContents.on("devtools-closed", () => {
          (0, vibrancy_1._setVibrancy)(this);
          setTimeout(() => {
            (0, vibrancy_1._setVibrancy)(this, __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig);
          }, 100);
        });
        this.once("ready-to-show", () => {
          setTimeout(() => {
            if (opShowOriginal)
              this.show();
            (0, vibrancy_1._setVibrancy)(this, __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig);
          }, 100);
        });
        if (__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").debug)
          (0, debug_1.toggleDebugging)(__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").debug);
        if (config.useCustomWindowRefreshMethod && !os_1.isWindows11OrGreater)
          (0, win10refresh_1.default)(this, config.maximumRefreshRate || 60);
        if (config.disableOnBlur) {
          __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacity = 0;
          this.on("blur", () => {
            if (os_1.isWindows10OrGreater && __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f")) {
              __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity = 255;
              if (!__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacityInterval)
                __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacityInterval = setInterval(() => {
                  try {
                    let colorDiff = (255 - __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a) / 3.5;
                    if (Math.abs(__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity - __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity) < colorDiff) {
                      __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity;
                      if (__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacityInterval)
                        clearInterval(__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacityInterval);
                      __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacityInterval = void 0;
                    } else if (__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity > __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity)
                      __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity -= colorDiff;
                    else
                      __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity += colorDiff;
                    __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.currentOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity;
                    (0, vibrancy_1._setVibrancy)(this, __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig);
                  } catch (e) {
                  }
                }, 1e3 / 30);
            }
          });
          this.on("focus", () => {
            if (os_1.isWindows10OrGreater && __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f")) {
              __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
              if (!__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacityInterval)
                __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacityInterval = setInterval(() => {
                  try {
                    let colorDiff = (255 - __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a) / 3.5;
                    if (Math.abs(__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity - __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity) < colorDiff) {
                      __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity;
                      if (__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacityInterval)
                        clearInterval(__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacityInterval);
                      __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacityInterval = void 0;
                    } else if (__classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity > __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity)
                      __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity -= colorDiff;
                    else
                      __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity += colorDiff;
                    __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.currentOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity;
                    (0, vibrancy_1._setVibrancy)(this, __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig);
                  } catch (e) {
                  }
                }, 1e3 / 30);
            }
          });
        }
      }
    }
    get __electron_acrylic_window__() {
      return __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f");
    }
    set __electron_acrylic_window__(v) {
      __classPrivateFieldSet(this, _BrowserWindow_winconfig, v, "f");
    }
    /**
     * Set the vibrancy for the specified window.
     *
     * @param options
     */
    // https://github.com/microsoft/TypeScript/issues/30071
    // @ts-ignore
    setVibrancy(options) {
      if (options) {
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig = (0, vibrancy_1.getConfigFromOptions)(options);
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.currentOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        (0, vibrancy_1._setVibrancy)(this, __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig);
      } else {
        (0, vibrancy_1._setVibrancy)(this);
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig = (0, vibrancy_1.getConfigFromOptions)(void 0);
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").opacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").targetOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").currentOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
        __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.currentOpacity = __classPrivateFieldGet(this, _BrowserWindow_winconfig, "f").vibrnacyConfig.colors.a;
      }
    }
  }
  browserWindow.BrowserWindow = BrowserWindow;
  _BrowserWindow_vibconfig = /* @__PURE__ */ new WeakMap(), _BrowserWindow_winconfig = /* @__PURE__ */ new WeakMap();
  return browserWindow;
}
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) return dist;
  hasRequiredDist = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setVibrancy = exports.BrowserWindow = void 0;
    var browserWindow_1 = requireBrowserWindow();
    Object.defineProperty(exports, "BrowserWindow", { enumerable: true, get: function() {
      return browserWindow_1.BrowserWindow;
    } });
    var vibrancy_1 = requireVibrancy();
    Object.defineProperty(exports, "setVibrancy", { enumerable: true, get: function() {
      return vibrancy_1.setVibrancy;
    } });
  })(dist);
  return dist;
}
var distExports = requireDist();
const index = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null
}, [distExports]);
export {
  index as i
};
