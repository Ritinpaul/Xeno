var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/@trpc/server/dist/codes-DagpWZLc.mjs
function mergeWithoutOverrides(obj1, ...objs) {
  const newObj = Object.assign(emptyObject(), obj1);
  for (const overrides of objs) for (const key in overrides) {
    if (key in newObj && newObj[key] !== overrides[key]) throw new Error(`Duplicate key ${key}`);
    newObj[key] = overrides[key];
  }
  return newObj;
}
function isObject(value) {
  return !!value && !Array.isArray(value) && typeof value === "object";
}
function isFunction(fn) {
  return typeof fn === "function";
}
function emptyObject() {
  return /* @__PURE__ */ Object.create(null);
}
function isAsyncIterable(value) {
  return asyncIteratorsSupported && isObject(value) && Symbol.asyncIterator in value;
}
function identity(it) {
  return it;
}
function abortSignalsAnyPonyfill(signals) {
  if (typeof AbortSignal.any === "function") return AbortSignal.any(signals);
  const ac = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      trigger();
      break;
    }
    signal.addEventListener("abort", trigger, { once: true });
  }
  return ac.signal;
  function trigger() {
    ac.abort();
    for (const signal of signals) signal.removeEventListener("abort", trigger);
  }
}
var asyncIteratorsSupported, run, TRPC_ERROR_CODES_BY_KEY, TRPC_ERROR_CODES_BY_NUMBER, retryableRpcCodes;
var init_codes_DagpWZLc = __esm({
  "node_modules/@trpc/server/dist/codes-DagpWZLc.mjs"() {
    asyncIteratorsSupported = typeof Symbol === "function" && !!Symbol.asyncIterator;
    run = (fn) => fn();
    TRPC_ERROR_CODES_BY_KEY = {
      PARSE_ERROR: -32700,
      BAD_REQUEST: -32600,
      INTERNAL_SERVER_ERROR: -32603,
      NOT_IMPLEMENTED: -32603,
      BAD_GATEWAY: -32603,
      SERVICE_UNAVAILABLE: -32603,
      GATEWAY_TIMEOUT: -32603,
      UNAUTHORIZED: -32001,
      PAYMENT_REQUIRED: -32002,
      FORBIDDEN: -32003,
      NOT_FOUND: -32004,
      METHOD_NOT_SUPPORTED: -32005,
      TIMEOUT: -32008,
      CONFLICT: -32009,
      PRECONDITION_FAILED: -32012,
      PAYLOAD_TOO_LARGE: -32013,
      UNSUPPORTED_MEDIA_TYPE: -32015,
      UNPROCESSABLE_CONTENT: -32022,
      PRECONDITION_REQUIRED: -32028,
      TOO_MANY_REQUESTS: -32029,
      CLIENT_CLOSED_REQUEST: -32099
    };
    TRPC_ERROR_CODES_BY_NUMBER = {
      [-32700]: "PARSE_ERROR",
      [-32600]: "BAD_REQUEST",
      [-32603]: "INTERNAL_SERVER_ERROR",
      [-32001]: "UNAUTHORIZED",
      [-32002]: "PAYMENT_REQUIRED",
      [-32003]: "FORBIDDEN",
      [-32004]: "NOT_FOUND",
      [-32005]: "METHOD_NOT_SUPPORTED",
      [-32008]: "TIMEOUT",
      [-32009]: "CONFLICT",
      [-32012]: "PRECONDITION_FAILED",
      [-32013]: "PAYLOAD_TOO_LARGE",
      [-32015]: "UNSUPPORTED_MEDIA_TYPE",
      [-32022]: "UNPROCESSABLE_CONTENT",
      [-32028]: "PRECONDITION_REQUIRED",
      [-32029]: "TOO_MANY_REQUESTS",
      [-32099]: "CLIENT_CLOSED_REQUEST"
    };
    retryableRpcCodes = [
      TRPC_ERROR_CODES_BY_KEY.BAD_GATEWAY,
      TRPC_ERROR_CODES_BY_KEY.SERVICE_UNAVAILABLE,
      TRPC_ERROR_CODES_BY_KEY.GATEWAY_TIMEOUT,
      TRPC_ERROR_CODES_BY_KEY.INTERNAL_SERVER_ERROR
    ];
  }
});

// node_modules/@trpc/server/dist/getErrorShape-BPSzUA7W.mjs
function createInnerProxy(callback, path, memo2) {
  var _memo$cacheKey;
  const cacheKey = path.join(".");
  (_memo$cacheKey = memo2[cacheKey]) !== null && _memo$cacheKey !== void 0 || (memo2[cacheKey] = new Proxy(noop, {
    get(_obj, key) {
      if (typeof key !== "string" || key === "then") return void 0;
      return createInnerProxy(callback, [...path, key], memo2);
    },
    apply(_1, _2, args) {
      const lastOfPath = path[path.length - 1];
      if (lastOfPath === "valueOf" || lastOfPath === "toString" || lastOfPath === "toJSON") {
        const debugPath = path.slice(0, -1).join(".");
        return `tRPC.proxy(${debugPath})`;
      }
      let opts = {
        args,
        path
      };
      if (lastOfPath === "call") opts = {
        args: args.length >= 2 ? [args[1]] : [],
        path: path.slice(0, -1)
      };
      else if (lastOfPath === "apply") opts = {
        args: args.length >= 2 ? args[1] : [],
        path: path.slice(0, -1)
      };
      freezeIfAvailable(opts.args);
      freezeIfAvailable(opts.path);
      return callback(opts);
    }
  }));
  return memo2[cacheKey];
}
function getStatusCodeFromKey(code) {
  var _JSONRPC2_TO_HTTP_COD;
  return (_JSONRPC2_TO_HTTP_COD = JSONRPC2_TO_HTTP_CODE[code]) !== null && _JSONRPC2_TO_HTTP_COD !== void 0 ? _JSONRPC2_TO_HTTP_COD : 500;
}
function getHTTPStatusCode(json2) {
  const arr = Array.isArray(json2) ? json2 : [json2];
  const httpStatuses = new Set(arr.map((res) => {
    if ("error" in res && isObject(res.error.data)) {
      var _res$error$data;
      if (typeof ((_res$error$data = res.error.data) === null || _res$error$data === void 0 ? void 0 : _res$error$data["httpStatus"]) === "number") return res.error.data["httpStatus"];
      const code = TRPC_ERROR_CODES_BY_NUMBER[res.error.code];
      return getStatusCodeFromKey(code);
    }
    return 200;
  }));
  if (httpStatuses.size !== 1) return 207;
  const httpStatus = httpStatuses.values().next().value;
  return httpStatus;
}
function getHTTPStatusCodeFromError(error) {
  return getStatusCodeFromKey(error.code);
}
function getErrorShape(opts) {
  const { path, error, config: config2 } = opts;
  const { code } = opts.error;
  const shape = {
    message: error.message,
    code: TRPC_ERROR_CODES_BY_KEY[code],
    data: {
      code,
      httpStatus: getHTTPStatusCodeFromError(error)
    }
  };
  if (config2.isDev && typeof opts.error.stack === "string") shape.data.stack = opts.error.stack;
  if (typeof path === "string") shape.data.path = path;
  return config2.errorFormatter((0, import_objectSpread2.default)((0, import_objectSpread2.default)({}, opts), {}, { shape }));
}
var __create, __defProp2, __getOwnPropDesc, __getOwnPropNames2, __getProtoOf, __hasOwnProp, __commonJS, __copyProps, __toESM, noop, freezeIfAvailable, createRecursiveProxy, JSONRPC2_TO_HTTP_CODE, require_typeof, require_toPrimitive, require_toPropertyKey, require_defineProperty, require_objectSpread2, import_objectSpread2;
var init_getErrorShape_BPSzUA7W = __esm({
  "node_modules/@trpc/server/dist/getErrorShape-BPSzUA7W.mjs"() {
    init_codes_DagpWZLc();
    __create = Object.create;
    __defProp2 = Object.defineProperty;
    __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    __getOwnPropNames2 = Object.getOwnPropertyNames;
    __getProtoOf = Object.getPrototypeOf;
    __hasOwnProp = Object.prototype.hasOwnProperty;
    __commonJS = (cb, mod) => function() {
      return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    };
    __copyProps = (to, from, except, desc5) => {
      if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames2(from), i = 0, n = keys.length, key; i < n; i++) {
        key = keys[i];
        if (!__hasOwnProp.call(to, key) && key !== except) __defProp2(to, key, {
          get: ((k) => from[k]).bind(null, key),
          enumerable: !(desc5 = __getOwnPropDesc(from, key)) || desc5.enumerable
        });
      }
      return to;
    };
    __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", {
      value: mod,
      enumerable: true
    }) : target, mod));
    noop = () => {
    };
    freezeIfAvailable = (obj) => {
      if (Object.freeze) Object.freeze(obj);
    };
    createRecursiveProxy = (callback) => createInnerProxy(callback, [], emptyObject());
    JSONRPC2_TO_HTTP_CODE = {
      PARSE_ERROR: 400,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      PAYMENT_REQUIRED: 402,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      METHOD_NOT_SUPPORTED: 405,
      TIMEOUT: 408,
      CONFLICT: 409,
      PRECONDITION_FAILED: 412,
      PAYLOAD_TOO_LARGE: 413,
      UNSUPPORTED_MEDIA_TYPE: 415,
      UNPROCESSABLE_CONTENT: 422,
      PRECONDITION_REQUIRED: 428,
      TOO_MANY_REQUESTS: 429,
      CLIENT_CLOSED_REQUEST: 499,
      INTERNAL_SERVER_ERROR: 500,
      NOT_IMPLEMENTED: 501,
      BAD_GATEWAY: 502,
      SERVICE_UNAVAILABLE: 503,
      GATEWAY_TIMEOUT: 504
    };
    require_typeof = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/typeof.js"(exports, module) {
      function _typeof$2(o) {
        "@babel/helpers - typeof";
        return module.exports = _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
          return typeof o$1;
        } : function(o$1) {
          return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
        }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof$2(o);
      }
      module.exports = _typeof$2, module.exports.__esModule = true, module.exports["default"] = module.exports;
    } });
    require_toPrimitive = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/toPrimitive.js"(exports, module) {
      var _typeof$1 = require_typeof()["default"];
      function toPrimitive$1(t2, r) {
        if ("object" != _typeof$1(t2) || !t2) return t2;
        var e = t2[Symbol.toPrimitive];
        if (void 0 !== e) {
          var i = e.call(t2, r || "default");
          if ("object" != _typeof$1(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t2);
      }
      module.exports = toPrimitive$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
    } });
    require_toPropertyKey = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/toPropertyKey.js"(exports, module) {
      var _typeof = require_typeof()["default"];
      var toPrimitive = require_toPrimitive();
      function toPropertyKey$1(t2) {
        var i = toPrimitive(t2, "string");
        return "symbol" == _typeof(i) ? i : i + "";
      }
      module.exports = toPropertyKey$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
    } });
    require_defineProperty = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/defineProperty.js"(exports, module) {
      var toPropertyKey = require_toPropertyKey();
      function _defineProperty(e, r, t2) {
        return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
          value: t2,
          enumerable: true,
          configurable: true,
          writable: true
        }) : e[r] = t2, e;
      }
      module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
    } });
    require_objectSpread2 = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/objectSpread2.js"(exports, module) {
      var defineProperty = require_defineProperty();
      function ownKeys(e, r) {
        var t2 = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var o = Object.getOwnPropertySymbols(e);
          r && (o = o.filter(function(r$1) {
            return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
          })), t2.push.apply(t2, o);
        }
        return t2;
      }
      function _objectSpread2(e) {
        for (var r = 1; r < arguments.length; r++) {
          var t2 = null != arguments[r] ? arguments[r] : {};
          r % 2 ? ownKeys(Object(t2), true).forEach(function(r$1) {
            defineProperty(e, r$1, t2[r$1]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys(Object(t2)).forEach(function(r$1) {
            Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t2, r$1));
          });
        }
        return e;
      }
      module.exports = _objectSpread2, module.exports.__esModule = true, module.exports["default"] = module.exports;
    } });
    import_objectSpread2 = __toESM(require_objectSpread2(), 1);
  }
});

// node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs
function getMessage(cause) {
  if ("message" in cause) return String(cause.message);
  return void 0;
}
function getCauseFromUnknown(cause) {
  if (cause instanceof Error) return cause;
  const type = typeof cause;
  if (type === "undefined" || type === "function" || cause === null) return void 0;
  if (type !== "object") return new Error(String(cause));
  if (isObject(cause)) return new UnknownCauseError(cause);
  return void 0;
}
function getTRPCErrorFromUnknown(cause) {
  if (cause instanceof TRPCError) return cause;
  if (cause instanceof Error && cause.name === "TRPCError") return cause;
  const trpcError = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    cause
  });
  if (cause instanceof Error && cause.stack) trpcError.stack = cause.stack;
  return trpcError;
}
function getDataTransformer(transformer) {
  if ("input" in transformer) return transformer;
  return {
    input: transformer,
    output: transformer
  };
}
function transformTRPCResponseItem(config2, item) {
  if ("error" in item) return (0, import_objectSpread2$1.default)((0, import_objectSpread2$1.default)({}, item), {}, { error: config2.transformer.output.serialize(item.error) });
  if ("data" in item.result) return (0, import_objectSpread2$1.default)((0, import_objectSpread2$1.default)({}, item), {}, { result: (0, import_objectSpread2$1.default)((0, import_objectSpread2$1.default)({}, item.result), {}, { data: config2.transformer.output.serialize(item.result.data) }) });
  return item;
}
function transformTRPCResponse(config2, itemOrItems) {
  return Array.isArray(itemOrItems) ? itemOrItems.map((item) => transformTRPCResponseItem(config2, item)) : transformTRPCResponseItem(config2, itemOrItems);
}
function once(fn) {
  const uncalled = /* @__PURE__ */ Symbol();
  let result = uncalled;
  return () => {
    if (result === uncalled) result = fn();
    return result;
  };
}
function isLazy(input) {
  return typeof input === "function" && lazyMarker in input;
}
function isRouter(value) {
  return isObject(value) && isObject(value["_def"]) && "router" in value["_def"];
}
function createRouterFactory(config2) {
  function createRouterInner(input) {
    const reservedWordsUsed = new Set(Object.keys(input).filter((v) => reservedWords.includes(v)));
    if (reservedWordsUsed.size > 0) throw new Error("Reserved words used in `router({})` call: " + Array.from(reservedWordsUsed).join(", "));
    const procedures = emptyObject();
    const lazy$1 = emptyObject();
    function createLazyLoader(opts) {
      return {
        ref: opts.ref,
        load: once(async () => {
          const router$1 = await opts.ref();
          const lazyPath = [...opts.path, opts.key];
          const lazyKey = lazyPath.join(".");
          opts.aggregate[opts.key] = step(router$1._def.record, lazyPath);
          delete lazy$1[lazyKey];
          for (const [nestedKey, nestedItem] of Object.entries(router$1._def.lazy)) {
            const nestedRouterKey = [...lazyPath, nestedKey].join(".");
            lazy$1[nestedRouterKey] = createLazyLoader({
              ref: nestedItem.ref,
              path: lazyPath,
              key: nestedKey,
              aggregate: opts.aggregate[opts.key]
            });
          }
        })
      };
    }
    function step(from, path = []) {
      const aggregate = emptyObject();
      for (const [key, item] of Object.entries(from !== null && from !== void 0 ? from : {})) {
        if (isLazy(item)) {
          lazy$1[[...path, key].join(".")] = createLazyLoader({
            path,
            ref: item,
            key,
            aggregate
          });
          continue;
        }
        if (isRouter(item)) {
          aggregate[key] = step(item._def.record, [...path, key]);
          continue;
        }
        if (!isProcedure(item)) {
          aggregate[key] = step(item, [...path, key]);
          continue;
        }
        const newPath = [...path, key].join(".");
        if (procedures[newPath]) throw new Error(`Duplicate key: ${newPath}`);
        procedures[newPath] = item;
        aggregate[key] = item;
      }
      return aggregate;
    }
    const record = step(input);
    const _def = (0, import_objectSpread22.default)((0, import_objectSpread22.default)({
      _config: config2,
      router: true,
      procedures,
      lazy: lazy$1
    }, emptyRouter), {}, { record });
    const router = (0, import_objectSpread22.default)((0, import_objectSpread22.default)({}, record), {}, {
      _def,
      createCaller: createCallerFactory()({ _def })
    });
    return router;
  }
  return createRouterInner;
}
function isProcedure(procedureOrRouter) {
  return typeof procedureOrRouter === "function";
}
async function getProcedureAtPath(router, path) {
  const { _def } = router;
  let procedure = _def.procedures[path];
  while (!procedure) {
    const key = Object.keys(_def.lazy).find((key$1) => path.startsWith(key$1));
    if (!key) return null;
    const lazyRouter = _def.lazy[key];
    await lazyRouter.load();
    procedure = _def.procedures[path];
  }
  return procedure;
}
function createCallerFactory() {
  return function createCallerInner(router) {
    const { _def } = router;
    return function createCaller(ctxOrCallback, opts) {
      return createRecursiveProxy(async (innerOpts) => {
        const { path, args } = innerOpts;
        const fullPath = path.join(".");
        if (path.length === 1 && path[0] === "_def") return _def;
        const procedure = await getProcedureAtPath(router, fullPath);
        let ctx = void 0;
        try {
          if (!procedure) throw new TRPCError({
            code: "NOT_FOUND",
            message: `No procedure found on path "${path}"`
          });
          ctx = isFunction(ctxOrCallback) ? await Promise.resolve(ctxOrCallback()) : ctxOrCallback;
          return await procedure({
            path: fullPath,
            getRawInput: async () => args[0],
            ctx,
            type: procedure._def.type,
            signal: opts === null || opts === void 0 ? void 0 : opts.signal,
            batchIndex: 0
          });
        } catch (cause) {
          var _opts$onError, _procedure$_def$type;
          opts === null || opts === void 0 || (_opts$onError = opts.onError) === null || _opts$onError === void 0 || _opts$onError.call(opts, {
            ctx,
            error: getTRPCErrorFromUnknown(cause),
            input: args[0],
            path: fullPath,
            type: (_procedure$_def$type = procedure === null || procedure === void 0 ? void 0 : procedure._def.type) !== null && _procedure$_def$type !== void 0 ? _procedure$_def$type : "unknown"
          });
          throw cause;
        }
      });
    };
  };
}
function mergeRouters(...routerList) {
  var _routerList$, _routerList$2;
  const record = mergeWithoutOverrides({}, ...routerList.map((r) => r._def.record));
  const errorFormatter = routerList.reduce((currentErrorFormatter, nextRouter) => {
    if (nextRouter._def._config.errorFormatter && nextRouter._def._config.errorFormatter !== defaultFormatter) {
      if (currentErrorFormatter !== defaultFormatter && currentErrorFormatter !== nextRouter._def._config.errorFormatter) throw new Error("You seem to have several error formatters");
      return nextRouter._def._config.errorFormatter;
    }
    return currentErrorFormatter;
  }, defaultFormatter);
  const transformer = routerList.reduce((prev, current) => {
    if (current._def._config.transformer && current._def._config.transformer !== defaultTransformer) {
      if (prev !== defaultTransformer && prev !== current._def._config.transformer) throw new Error("You seem to have several transformers");
      return current._def._config.transformer;
    }
    return prev;
  }, defaultTransformer);
  const router = createRouterFactory({
    errorFormatter,
    transformer,
    isDev: routerList.every((r) => r._def._config.isDev),
    allowOutsideOfServer: routerList.every((r) => r._def._config.allowOutsideOfServer),
    isServer: routerList.every((r) => r._def._config.isServer),
    $types: (_routerList$ = routerList[0]) === null || _routerList$ === void 0 ? void 0 : _routerList$._def._config.$types,
    sse: (_routerList$2 = routerList[0]) === null || _routerList$2 === void 0 ? void 0 : _routerList$2._def._config.sse
  })(record);
  return router;
}
function isTrackedEnvelope(value) {
  return Array.isArray(value) && value[2] === trackedSymbol;
}
var defaultFormatter, import_defineProperty, UnknownCauseError, TRPCError, import_objectSpread2$1, defaultTransformer, import_objectSpread22, lazyMarker, emptyRouter, reservedWords, trackedSymbol;
var init_tracked_DWInO6EQ = __esm({
  "node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs"() {
    init_getErrorShape_BPSzUA7W();
    init_codes_DagpWZLc();
    defaultFormatter = ({ shape }) => {
      return shape;
    };
    import_defineProperty = __toESM(require_defineProperty(), 1);
    UnknownCauseError = class extends Error {
      constructor(cause) {
        super(getMessage(cause));
        Object.assign(this, cause);
      }
    };
    TRPCError = class extends Error {
      constructor(opts) {
        var _ref, _opts$message, _this$cause;
        const cause = getCauseFromUnknown(opts.cause);
        const message = (_ref = (_opts$message = opts.message) !== null && _opts$message !== void 0 ? _opts$message : cause === null || cause === void 0 ? void 0 : cause.message) !== null && _ref !== void 0 ? _ref : opts.code;
        super(message, { cause });
        (0, import_defineProperty.default)(this, "cause", void 0);
        (0, import_defineProperty.default)(this, "code", void 0);
        this.code = opts.code;
        this.name = "TRPCError";
        (_this$cause = this.cause) !== null && _this$cause !== void 0 || (this.cause = cause);
      }
    };
    import_objectSpread2$1 = __toESM(require_objectSpread2(), 1);
    defaultTransformer = {
      input: {
        serialize: (obj) => obj,
        deserialize: (obj) => obj
      },
      output: {
        serialize: (obj) => obj,
        deserialize: (obj) => obj
      }
    };
    import_objectSpread22 = __toESM(require_objectSpread2(), 1);
    lazyMarker = "lazyMarker";
    emptyRouter = {
      _ctx: null,
      _errorShape: null,
      _meta: null,
      queries: {},
      mutations: {},
      subscriptions: {},
      errorFormatter: defaultFormatter,
      transformer: defaultTransformer
    };
    reservedWords = [
      "then",
      "call",
      "apply"
    ];
    trackedSymbol = /* @__PURE__ */ Symbol();
  }
});

// node_modules/@trpc/server/dist/initTRPC-BRf4imah.mjs
function createMiddlewareFactory() {
  function createMiddlewareInner(middlewares) {
    return {
      _middlewares: middlewares,
      unstable_pipe(middlewareBuilderOrFn) {
        const pipedMiddleware = "_middlewares" in middlewareBuilderOrFn ? middlewareBuilderOrFn._middlewares : [middlewareBuilderOrFn];
        return createMiddlewareInner([...middlewares, ...pipedMiddleware]);
      }
    };
  }
  function createMiddleware(fn) {
    return createMiddlewareInner([fn]);
  }
  return createMiddleware;
}
function createInputMiddleware(parse2) {
  const inputMiddleware = async function inputValidatorMiddleware(opts) {
    let parsedInput;
    const rawInput = await opts.getRawInput();
    try {
      parsedInput = await parse2(rawInput);
    } catch (cause) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        cause
      });
    }
    const combinedInput = isObject(opts.input) && isObject(parsedInput) ? (0, import_objectSpread2$2.default)((0, import_objectSpread2$2.default)({}, opts.input), parsedInput) : parsedInput;
    return opts.next({ input: combinedInput });
  };
  inputMiddleware._type = "input";
  return inputMiddleware;
}
function createOutputMiddleware(parse2) {
  const outputMiddleware = async function outputValidatorMiddleware({ next }) {
    const result = await next();
    if (!result.ok) return result;
    try {
      const data = await parse2(result.data);
      return (0, import_objectSpread2$2.default)((0, import_objectSpread2$2.default)({}, result), {}, { data });
    } catch (cause) {
      throw new TRPCError({
        message: "Output validation failed",
        code: "INTERNAL_SERVER_ERROR",
        cause
      });
    }
  };
  outputMiddleware._type = "output";
  return outputMiddleware;
}
function getParseFn(procedureParser) {
  const parser = procedureParser;
  const isStandardSchema = "~standard" in parser;
  if (typeof parser === "function" && typeof parser.assert === "function") return parser.assert.bind(parser);
  if (typeof parser === "function" && !isStandardSchema) return parser;
  if (typeof parser.parseAsync === "function") return parser.parseAsync.bind(parser);
  if (typeof parser.parse === "function") return parser.parse.bind(parser);
  if (typeof parser.validateSync === "function") return parser.validateSync.bind(parser);
  if (typeof parser.create === "function") return parser.create.bind(parser);
  if (typeof parser.assert === "function") return (value) => {
    parser.assert(value);
    return value;
  };
  if (isStandardSchema) return async (value) => {
    const result = await parser["~standard"].validate(value);
    if (result.issues) throw new StandardSchemaV1Error(result.issues);
    return result.value;
  };
  throw new Error("Could not find a validator fn");
}
function createNewBuilder(def1, def2) {
  const { middlewares = [], inputs, meta } = def2, rest = (0, import_objectWithoutProperties.default)(def2, _excluded);
  return createBuilder((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, mergeWithoutOverrides(def1, rest)), {}, {
    inputs: [...def1.inputs, ...inputs !== null && inputs !== void 0 ? inputs : []],
    middlewares: [...def1.middlewares, ...middlewares],
    meta: def1.meta && meta ? (0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, def1.meta), meta) : meta !== null && meta !== void 0 ? meta : def1.meta
  }));
}
function createBuilder(initDef = {}) {
  const _def = (0, import_objectSpread2$13.default)({
    procedure: true,
    inputs: [],
    middlewares: []
  }, initDef);
  const builder = {
    _def,
    input(input) {
      const parser = getParseFn(input);
      return createNewBuilder(_def, {
        inputs: [input],
        middlewares: [createInputMiddleware(parser)]
      });
    },
    output(output) {
      const parser = getParseFn(output);
      return createNewBuilder(_def, {
        output,
        middlewares: [createOutputMiddleware(parser)]
      });
    },
    meta(meta) {
      return createNewBuilder(_def, { meta });
    },
    use(middlewareBuilderOrFn) {
      const middlewares = "_middlewares" in middlewareBuilderOrFn ? middlewareBuilderOrFn._middlewares : [middlewareBuilderOrFn];
      return createNewBuilder(_def, { middlewares });
    },
    unstable_concat(builder$1) {
      return createNewBuilder(_def, builder$1._def);
    },
    concat(builder$1) {
      return createNewBuilder(_def, builder$1._def);
    },
    query(resolver) {
      return createResolver((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, _def), {}, { type: "query" }), resolver);
    },
    mutation(resolver) {
      return createResolver((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, _def), {}, { type: "mutation" }), resolver);
    },
    subscription(resolver) {
      return createResolver((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, _def), {}, { type: "subscription" }), resolver);
    },
    experimental_caller(caller) {
      return createNewBuilder(_def, { caller });
    }
  };
  return builder;
}
function createResolver(_defIn, resolver) {
  const finalBuilder = createNewBuilder(_defIn, {
    resolver,
    middlewares: [async function resolveMiddleware(opts) {
      const data = await resolver(opts);
      return {
        marker: middlewareMarker,
        ok: true,
        data,
        ctx: opts.ctx
      };
    }]
  });
  const _def = (0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, finalBuilder._def), {}, {
    type: _defIn.type,
    experimental_caller: Boolean(finalBuilder._def.caller),
    meta: finalBuilder._def.meta,
    $types: null
  });
  const invoke = createProcedureCaller(finalBuilder._def);
  const callerOverride = finalBuilder._def.caller;
  if (!callerOverride) return invoke;
  const callerWrapper = async (...args) => {
    return await callerOverride({
      args,
      invoke,
      _def
    });
  };
  callerWrapper._def = _def;
  return callerWrapper;
}
async function callRecursive(index2, _def, opts) {
  try {
    const middleware = _def.middlewares[index2];
    const result = await middleware((0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts), {}, {
      meta: _def.meta,
      input: opts.input,
      next(_nextOpts) {
        var _nextOpts$getRawInput;
        const nextOpts = _nextOpts;
        return callRecursive(index2 + 1, _def, (0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts), {}, {
          ctx: (nextOpts === null || nextOpts === void 0 ? void 0 : nextOpts.ctx) ? (0, import_objectSpread2$13.default)((0, import_objectSpread2$13.default)({}, opts.ctx), nextOpts.ctx) : opts.ctx,
          input: nextOpts && "input" in nextOpts ? nextOpts.input : opts.input,
          getRawInput: (_nextOpts$getRawInput = nextOpts === null || nextOpts === void 0 ? void 0 : nextOpts.getRawInput) !== null && _nextOpts$getRawInput !== void 0 ? _nextOpts$getRawInput : opts.getRawInput
        }));
      }
    }));
    return result;
  } catch (cause) {
    return {
      ok: false,
      error: getTRPCErrorFromUnknown(cause),
      marker: middlewareMarker
    };
  }
}
function createProcedureCaller(_def) {
  async function procedure(opts) {
    if (!opts || !("getRawInput" in opts)) throw new Error(codeblock);
    const result = await callRecursive(0, _def, opts);
    if (!result) throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No result from middlewares - did you forget to `return next()`?"
    });
    if (!result.ok) throw result.error;
    return result.data;
  }
  procedure._def = _def;
  procedure.procedure = true;
  procedure.meta = _def.meta;
  return procedure;
}
var import_objectSpread2$2, middlewareMarker, import_defineProperty3, StandardSchemaV1Error, require_objectWithoutPropertiesLoose, require_objectWithoutProperties, import_objectWithoutProperties, import_objectSpread2$13, _excluded, codeblock, _globalThis$process, _globalThis$process2, _globalThis$process3, isServerDefault, import_objectSpread25, TRPCBuilder, initTRPC;
var init_initTRPC_BRf4imah = __esm({
  "node_modules/@trpc/server/dist/initTRPC-BRf4imah.mjs"() {
    init_getErrorShape_BPSzUA7W();
    init_codes_DagpWZLc();
    init_tracked_DWInO6EQ();
    import_objectSpread2$2 = __toESM(require_objectSpread2(), 1);
    middlewareMarker = "middlewareMarker";
    import_defineProperty3 = __toESM(require_defineProperty(), 1);
    StandardSchemaV1Error = class extends Error {
      /**
      * Creates a schema error with useful information.
      *
      * @param issues The schema issues.
      */
      constructor(issues) {
        var _issues$;
        super((_issues$ = issues[0]) === null || _issues$ === void 0 ? void 0 : _issues$.message);
        (0, import_defineProperty3.default)(this, "issues", void 0);
        this.name = "SchemaError";
        this.issues = issues;
      }
    };
    require_objectWithoutPropertiesLoose = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/objectWithoutPropertiesLoose.js"(exports, module) {
      function _objectWithoutPropertiesLoose(r, e) {
        if (null == r) return {};
        var t2 = {};
        for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
          if (e.includes(n)) continue;
          t2[n] = r[n];
        }
        return t2;
      }
      module.exports = _objectWithoutPropertiesLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;
    } });
    require_objectWithoutProperties = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/objectWithoutProperties.js"(exports, module) {
      var objectWithoutPropertiesLoose = require_objectWithoutPropertiesLoose();
      function _objectWithoutProperties$1(e, t2) {
        if (null == e) return {};
        var o, r, i = objectWithoutPropertiesLoose(e, t2);
        if (Object.getOwnPropertySymbols) {
          var s = Object.getOwnPropertySymbols(e);
          for (r = 0; r < s.length; r++) o = s[r], t2.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
        }
        return i;
      }
      module.exports = _objectWithoutProperties$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
    } });
    import_objectWithoutProperties = __toESM(require_objectWithoutProperties(), 1);
    import_objectSpread2$13 = __toESM(require_objectSpread2(), 1);
    _excluded = [
      "middlewares",
      "inputs",
      "meta"
    ];
    codeblock = `
This is a client-only function.
If you want to call this function on the server, see https://trpc.io/docs/v11/server/server-side-calls
`.trim();
    isServerDefault = typeof window === "undefined" || "Deno" in window || ((_globalThis$process = globalThis.process) === null || _globalThis$process === void 0 || (_globalThis$process = _globalThis$process.env) === null || _globalThis$process === void 0 ? void 0 : _globalThis$process["NODE_ENV"]) === "test" || !!((_globalThis$process2 = globalThis.process) === null || _globalThis$process2 === void 0 || (_globalThis$process2 = _globalThis$process2.env) === null || _globalThis$process2 === void 0 ? void 0 : _globalThis$process2["JEST_WORKER_ID"]) || !!((_globalThis$process3 = globalThis.process) === null || _globalThis$process3 === void 0 || (_globalThis$process3 = _globalThis$process3.env) === null || _globalThis$process3 === void 0 ? void 0 : _globalThis$process3["VITEST_WORKER_ID"]);
    import_objectSpread25 = __toESM(require_objectSpread2(), 1);
    TRPCBuilder = class TRPCBuilder2 {
      /**
      * Add a context shape as a generic to the root object
      * @see https://trpc.io/docs/v11/server/context
      */
      context() {
        return new TRPCBuilder2();
      }
      /**
      * Add a meta shape as a generic to the root object
      * @see https://trpc.io/docs/v11/quickstart
      */
      meta() {
        return new TRPCBuilder2();
      }
      /**
      * Create the root object
      * @see https://trpc.io/docs/v11/server/routers#initialize-trpc
      */
      create(opts) {
        var _opts$transformer, _opts$isDev, _globalThis$process$1, _opts$allowOutsideOfS, _opts$errorFormatter, _opts$isServer;
        const config2 = (0, import_objectSpread25.default)((0, import_objectSpread25.default)({}, opts), {}, {
          transformer: getDataTransformer((_opts$transformer = opts === null || opts === void 0 ? void 0 : opts.transformer) !== null && _opts$transformer !== void 0 ? _opts$transformer : defaultTransformer),
          isDev: (_opts$isDev = opts === null || opts === void 0 ? void 0 : opts.isDev) !== null && _opts$isDev !== void 0 ? _opts$isDev : ((_globalThis$process$1 = globalThis.process) === null || _globalThis$process$1 === void 0 ? void 0 : _globalThis$process$1.env["NODE_ENV"]) !== "production",
          allowOutsideOfServer: (_opts$allowOutsideOfS = opts === null || opts === void 0 ? void 0 : opts.allowOutsideOfServer) !== null && _opts$allowOutsideOfS !== void 0 ? _opts$allowOutsideOfS : false,
          errorFormatter: (_opts$errorFormatter = opts === null || opts === void 0 ? void 0 : opts.errorFormatter) !== null && _opts$errorFormatter !== void 0 ? _opts$errorFormatter : defaultFormatter,
          isServer: (_opts$isServer = opts === null || opts === void 0 ? void 0 : opts.isServer) !== null && _opts$isServer !== void 0 ? _opts$isServer : isServerDefault,
          $types: null
        });
        {
          var _opts$isServer2;
          const isServer = (_opts$isServer2 = opts === null || opts === void 0 ? void 0 : opts.isServer) !== null && _opts$isServer2 !== void 0 ? _opts$isServer2 : isServerDefault;
          if (!isServer && (opts === null || opts === void 0 ? void 0 : opts.allowOutsideOfServer) !== true) throw new Error(`You're trying to use @trpc/server in a non-server environment. This is not supported by default.`);
        }
        return {
          _config: config2,
          procedure: createBuilder({ meta: opts === null || opts === void 0 ? void 0 : opts.defaultMeta }),
          middleware: createMiddlewareFactory(),
          router: createRouterFactory(config2),
          mergeRouters,
          createCallerFactory: createCallerFactory()
        };
      }
    };
    initTRPC = new TRPCBuilder();
  }
});

// node_modules/@trpc/server/dist/index.mjs
var init_dist = __esm({
  "node_modules/@trpc/server/dist/index.mjs"() {
    init_initTRPC_BRf4imah();
  }
});

// node_modules/superjson/dist/double-indexed-kv.js
var DoubleIndexedKV;
var init_double_indexed_kv = __esm({
  "node_modules/superjson/dist/double-indexed-kv.js"() {
    DoubleIndexedKV = class {
      constructor() {
        this.keyToValue = /* @__PURE__ */ new Map();
        this.valueToKey = /* @__PURE__ */ new Map();
      }
      set(key, value) {
        this.keyToValue.set(key, value);
        this.valueToKey.set(value, key);
      }
      getByKey(key) {
        return this.keyToValue.get(key);
      }
      getByValue(value) {
        return this.valueToKey.get(value);
      }
      clear() {
        this.keyToValue.clear();
        this.valueToKey.clear();
      }
    };
  }
});

// node_modules/superjson/dist/registry.js
var Registry;
var init_registry = __esm({
  "node_modules/superjson/dist/registry.js"() {
    init_double_indexed_kv();
    Registry = class {
      constructor(generateIdentifier) {
        this.generateIdentifier = generateIdentifier;
        this.kv = new DoubleIndexedKV();
      }
      register(value, identifier) {
        if (this.kv.getByValue(value)) {
          return;
        }
        if (!identifier) {
          identifier = this.generateIdentifier(value);
        }
        this.kv.set(identifier, value);
      }
      clear() {
        this.kv.clear();
      }
      getIdentifier(value) {
        return this.kv.getByValue(value);
      }
      getValue(identifier) {
        return this.kv.getByKey(identifier);
      }
    };
  }
});

// node_modules/superjson/dist/class-registry.js
var ClassRegistry;
var init_class_registry = __esm({
  "node_modules/superjson/dist/class-registry.js"() {
    init_registry();
    ClassRegistry = class extends Registry {
      constructor() {
        super((c) => c.name);
        this.classToAllowedProps = /* @__PURE__ */ new Map();
      }
      register(value, options) {
        if (typeof options === "object") {
          if (options.allowProps) {
            this.classToAllowedProps.set(value, options.allowProps);
          }
          super.register(value, options.identifier);
        } else {
          super.register(value, options);
        }
      }
      getAllowedProps(value) {
        return this.classToAllowedProps.get(value);
      }
    };
  }
});

// node_modules/superjson/dist/util.js
function valuesOfObj(record) {
  if ("values" in Object) {
    return Object.values(record);
  }
  const values = [];
  for (const key in record) {
    if (record.hasOwnProperty(key)) {
      values.push(record[key]);
    }
  }
  return values;
}
function find(record, predicate) {
  const values = valuesOfObj(record);
  if ("find" in values) {
    return values.find(predicate);
  }
  const valuesNotNever = values;
  for (let i = 0; i < valuesNotNever.length; i++) {
    const value = valuesNotNever[i];
    if (predicate(value)) {
      return value;
    }
  }
  return void 0;
}
function forEach(record, run2) {
  Object.entries(record).forEach(([key, value]) => run2(value, key));
}
function includes(arr, value) {
  return arr.indexOf(value) !== -1;
}
function findArr(record, predicate) {
  for (let i = 0; i < record.length; i++) {
    const value = record[i];
    if (predicate(value)) {
      return value;
    }
  }
  return void 0;
}
var init_util = __esm({
  "node_modules/superjson/dist/util.js"() {
  }
});

// node_modules/superjson/dist/custom-transformer-registry.js
var CustomTransformerRegistry;
var init_custom_transformer_registry = __esm({
  "node_modules/superjson/dist/custom-transformer-registry.js"() {
    init_util();
    CustomTransformerRegistry = class {
      constructor() {
        this.transfomers = {};
      }
      register(transformer) {
        this.transfomers[transformer.name] = transformer;
      }
      findApplicable(v) {
        return find(this.transfomers, (transformer) => transformer.isApplicable(v));
      }
      findByName(name) {
        return this.transfomers[name];
      }
    };
  }
});

// node_modules/superjson/dist/is.js
var getType, isUndefined, isNull, isPlainObject2, isEmptyObject, isArray, isString, isNumber, isBoolean, isRegExp, isMap, isSet, isSymbol, isDate, isError, isNaNValue, isPrimitive, isBigint, isInfinite, isTypedArray, isURL;
var init_is = __esm({
  "node_modules/superjson/dist/is.js"() {
    getType = (payload) => Object.prototype.toString.call(payload).slice(8, -1);
    isUndefined = (payload) => typeof payload === "undefined";
    isNull = (payload) => payload === null;
    isPlainObject2 = (payload) => {
      if (typeof payload !== "object" || payload === null)
        return false;
      if (payload === Object.prototype)
        return false;
      if (Object.getPrototypeOf(payload) === null)
        return true;
      return Object.getPrototypeOf(payload) === Object.prototype;
    };
    isEmptyObject = (payload) => isPlainObject2(payload) && Object.keys(payload).length === 0;
    isArray = (payload) => Array.isArray(payload);
    isString = (payload) => typeof payload === "string";
    isNumber = (payload) => typeof payload === "number" && !isNaN(payload);
    isBoolean = (payload) => typeof payload === "boolean";
    isRegExp = (payload) => payload instanceof RegExp;
    isMap = (payload) => payload instanceof Map;
    isSet = (payload) => payload instanceof Set;
    isSymbol = (payload) => getType(payload) === "Symbol";
    isDate = (payload) => payload instanceof Date && !isNaN(payload.valueOf());
    isError = (payload) => payload instanceof Error;
    isNaNValue = (payload) => typeof payload === "number" && isNaN(payload);
    isPrimitive = (payload) => isBoolean(payload) || isNull(payload) || isUndefined(payload) || isNumber(payload) || isString(payload) || isSymbol(payload);
    isBigint = (payload) => typeof payload === "bigint";
    isInfinite = (payload) => payload === Infinity || payload === -Infinity;
    isTypedArray = (payload) => ArrayBuffer.isView(payload) && !(payload instanceof DataView);
    isURL = (payload) => payload instanceof URL;
  }
});

// node_modules/superjson/dist/pathstringifier.js
var escapeKey, stringifyPath, parsePath;
var init_pathstringifier = __esm({
  "node_modules/superjson/dist/pathstringifier.js"() {
    escapeKey = (key) => key.replace(/\\/g, "\\\\").replace(/\./g, "\\.");
    stringifyPath = (path) => path.map(String).map(escapeKey).join(".");
    parsePath = (string, legacyPaths) => {
      const result = [];
      let segment = "";
      for (let i = 0; i < string.length; i++) {
        let char = string.charAt(i);
        if (!legacyPaths && char === "\\") {
          const escaped = string.charAt(i + 1);
          if (escaped === "\\") {
            segment += "\\";
            i++;
            continue;
          } else if (escaped !== ".") {
            throw Error("invalid path");
          }
        }
        const isEscapedDot = char === "\\" && string.charAt(i + 1) === ".";
        if (isEscapedDot) {
          segment += ".";
          i++;
          continue;
        }
        const isEndOfSegment = char === ".";
        if (isEndOfSegment) {
          result.push(segment);
          segment = "";
          continue;
        }
        segment += char;
      }
      const lastSegment = segment;
      result.push(lastSegment);
      return result;
    };
  }
});

// node_modules/superjson/dist/transformer.js
function simpleTransformation(isApplicable, annotation, transform, untransform) {
  return {
    isApplicable,
    annotation,
    transform,
    untransform
  };
}
function compositeTransformation(isApplicable, annotation, transform, untransform) {
  return {
    isApplicable,
    annotation,
    transform,
    untransform
  };
}
function isInstanceOfRegisteredClass(potentialClass, superJson) {
  if (potentialClass?.constructor) {
    const isRegistered = !!superJson.classRegistry.getIdentifier(potentialClass.constructor);
    return isRegistered;
  }
  return false;
}
var simpleRules, symbolRule, constructorToName, typedArrayRule, classRule, customRule, compositeRules, transformValue, simpleRulesByAnnotation, untransformValue;
var init_transformer = __esm({
  "node_modules/superjson/dist/transformer.js"() {
    init_is();
    init_util();
    simpleRules = [
      simpleTransformation(isUndefined, "undefined", () => null, () => void 0),
      simpleTransformation(isBigint, "bigint", (v) => v.toString(), (v) => {
        if (typeof BigInt !== "undefined") {
          return BigInt(v);
        }
        console.error("Please add a BigInt polyfill.");
        return v;
      }),
      simpleTransformation(isDate, "Date", (v) => v.toISOString(), (v) => new Date(v)),
      simpleTransformation(isError, "Error", (v, superJson) => {
        const baseError = {
          name: v.name,
          message: v.message
        };
        if ("cause" in v) {
          baseError.cause = v.cause;
        }
        superJson.allowedErrorProps.forEach((prop) => {
          baseError[prop] = v[prop];
        });
        return baseError;
      }, (v, superJson) => {
        const e = new Error(v.message, { cause: v.cause });
        e.name = v.name;
        e.stack = v.stack;
        superJson.allowedErrorProps.forEach((prop) => {
          e[prop] = v[prop];
        });
        return e;
      }),
      simpleTransformation(isRegExp, "regexp", (v) => "" + v, (regex) => {
        const body = regex.slice(1, regex.lastIndexOf("/"));
        const flags = regex.slice(regex.lastIndexOf("/") + 1);
        return new RegExp(body, flags);
      }),
      simpleTransformation(
        isSet,
        "set",
        // (sets only exist in es6+)
        // eslint-disable-next-line es5/no-es6-methods
        (v) => [...v.values()],
        (v) => new Set(v)
      ),
      simpleTransformation(isMap, "map", (v) => [...v.entries()], (v) => new Map(v)),
      simpleTransformation((v) => isNaNValue(v) || isInfinite(v), "number", (v) => {
        if (isNaNValue(v)) {
          return "NaN";
        }
        if (v > 0) {
          return "Infinity";
        } else {
          return "-Infinity";
        }
      }, Number),
      simpleTransformation((v) => v === 0 && 1 / v === -Infinity, "number", () => {
        return "-0";
      }, Number),
      simpleTransformation(isURL, "URL", (v) => v.toString(), (v) => new URL(v))
    ];
    symbolRule = compositeTransformation((s, superJson) => {
      if (isSymbol(s)) {
        const isRegistered = !!superJson.symbolRegistry.getIdentifier(s);
        return isRegistered;
      }
      return false;
    }, (s, superJson) => {
      const identifier = superJson.symbolRegistry.getIdentifier(s);
      return ["symbol", identifier];
    }, (v) => v.description, (_, a, superJson) => {
      const value = superJson.symbolRegistry.getValue(a[1]);
      if (!value) {
        throw new Error("Trying to deserialize unknown symbol");
      }
      return value;
    });
    constructorToName = [
      Int8Array,
      Uint8Array,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
      Uint8ClampedArray
    ].reduce((obj, ctor) => {
      obj[ctor.name] = ctor;
      return obj;
    }, {});
    typedArrayRule = compositeTransformation(isTypedArray, (v) => ["typed-array", v.constructor.name], (v) => [...v], (v, a) => {
      const ctor = constructorToName[a[1]];
      if (!ctor) {
        throw new Error("Trying to deserialize unknown typed array");
      }
      return new ctor(v);
    });
    classRule = compositeTransformation(isInstanceOfRegisteredClass, (clazz, superJson) => {
      const identifier = superJson.classRegistry.getIdentifier(clazz.constructor);
      return ["class", identifier];
    }, (clazz, superJson) => {
      const allowedProps = superJson.classRegistry.getAllowedProps(clazz.constructor);
      if (!allowedProps) {
        return { ...clazz };
      }
      const result = {};
      allowedProps.forEach((prop) => {
        result[prop] = clazz[prop];
      });
      return result;
    }, (v, a, superJson) => {
      const clazz = superJson.classRegistry.getValue(a[1]);
      if (!clazz) {
        throw new Error(`Trying to deserialize unknown class '${a[1]}' - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564`);
      }
      return Object.assign(Object.create(clazz.prototype), v);
    });
    customRule = compositeTransformation((value, superJson) => {
      return !!superJson.customTransformerRegistry.findApplicable(value);
    }, (value, superJson) => {
      const transformer = superJson.customTransformerRegistry.findApplicable(value);
      return ["custom", transformer.name];
    }, (value, superJson) => {
      const transformer = superJson.customTransformerRegistry.findApplicable(value);
      return transformer.serialize(value);
    }, (v, a, superJson) => {
      const transformer = superJson.customTransformerRegistry.findByName(a[1]);
      if (!transformer) {
        throw new Error("Trying to deserialize unknown custom value");
      }
      return transformer.deserialize(v);
    });
    compositeRules = [classRule, symbolRule, customRule, typedArrayRule];
    transformValue = (value, superJson) => {
      const applicableCompositeRule = findArr(compositeRules, (rule) => rule.isApplicable(value, superJson));
      if (applicableCompositeRule) {
        return {
          value: applicableCompositeRule.transform(value, superJson),
          type: applicableCompositeRule.annotation(value, superJson)
        };
      }
      const applicableSimpleRule = findArr(simpleRules, (rule) => rule.isApplicable(value, superJson));
      if (applicableSimpleRule) {
        return {
          value: applicableSimpleRule.transform(value, superJson),
          type: applicableSimpleRule.annotation
        };
      }
      return void 0;
    };
    simpleRulesByAnnotation = {};
    simpleRules.forEach((rule) => {
      simpleRulesByAnnotation[rule.annotation] = rule;
    });
    untransformValue = (json2, type, superJson) => {
      if (isArray(type)) {
        switch (type[0]) {
          case "symbol":
            return symbolRule.untransform(json2, type, superJson);
          case "class":
            return classRule.untransform(json2, type, superJson);
          case "custom":
            return customRule.untransform(json2, type, superJson);
          case "typed-array":
            return typedArrayRule.untransform(json2, type, superJson);
          default:
            throw new Error("Unknown transformation: " + type);
        }
      } else {
        const transformation = simpleRulesByAnnotation[type];
        if (!transformation) {
          throw new Error("Unknown transformation: " + type);
        }
        return transformation.untransform(json2, superJson);
      }
    };
  }
});

// node_modules/superjson/dist/accessDeep.js
function validatePath(path) {
  if (includes(path, "__proto__")) {
    throw new Error("__proto__ is not allowed as a property");
  }
  if (includes(path, "prototype")) {
    throw new Error("prototype is not allowed as a property");
  }
  if (includes(path, "constructor")) {
    throw new Error("constructor is not allowed as a property");
  }
}
var getNthKey, getDeep, setDeep;
var init_accessDeep = __esm({
  "node_modules/superjson/dist/accessDeep.js"() {
    init_is();
    init_util();
    getNthKey = (value, n) => {
      if (n > value.size)
        throw new Error("index out of bounds");
      const keys = value.keys();
      while (n > 0) {
        keys.next();
        n--;
      }
      return keys.next().value;
    };
    getDeep = (object, path) => {
      validatePath(path);
      for (let i = 0; i < path.length; i++) {
        const key = path[i];
        if (isSet(object)) {
          object = getNthKey(object, +key);
        } else if (isMap(object)) {
          const row = +key;
          const type = +path[++i] === 0 ? "key" : "value";
          const keyOfRow = getNthKey(object, row);
          switch (type) {
            case "key":
              object = keyOfRow;
              break;
            case "value":
              object = object.get(keyOfRow);
              break;
          }
        } else {
          object = object[key];
        }
      }
      return object;
    };
    setDeep = (object, path, mapper) => {
      validatePath(path);
      if (path.length === 0) {
        return mapper(object);
      }
      let parent = object;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (isArray(parent)) {
          const index2 = +key;
          parent = parent[index2];
        } else if (isPlainObject2(parent)) {
          parent = parent[key];
        } else if (isSet(parent)) {
          const row = +key;
          parent = getNthKey(parent, row);
        } else if (isMap(parent)) {
          const isEnd = i === path.length - 2;
          if (isEnd) {
            break;
          }
          const row = +key;
          const type = +path[++i] === 0 ? "key" : "value";
          const keyOfRow = getNthKey(parent, row);
          switch (type) {
            case "key":
              parent = keyOfRow;
              break;
            case "value":
              parent = parent.get(keyOfRow);
              break;
          }
        }
      }
      const lastKey = path[path.length - 1];
      if (isArray(parent)) {
        parent[+lastKey] = mapper(parent[+lastKey]);
      } else if (isPlainObject2(parent)) {
        parent[lastKey] = mapper(parent[lastKey]);
      }
      if (isSet(parent)) {
        const oldValue = getNthKey(parent, +lastKey);
        const newValue = mapper(oldValue);
        if (oldValue !== newValue) {
          parent.delete(oldValue);
          parent.add(newValue);
        }
      }
      if (isMap(parent)) {
        const row = +path[path.length - 2];
        const keyToRow = getNthKey(parent, row);
        const type = +lastKey === 0 ? "key" : "value";
        switch (type) {
          case "key": {
            const newKey = mapper(keyToRow);
            parent.set(newKey, parent.get(keyToRow));
            if (newKey !== keyToRow) {
              parent.delete(keyToRow);
            }
            break;
          }
          case "value": {
            parent.set(keyToRow, mapper(parent.get(keyToRow)));
            break;
          }
        }
      }
      return object;
    };
  }
});

// node_modules/superjson/dist/plainer.js
function traverse(tree, walker2, version, origin = []) {
  if (!tree) {
    return;
  }
  const legacyPaths = enableLegacyPaths(version);
  if (!isArray(tree)) {
    forEach(tree, (subtree, key) => traverse(subtree, walker2, version, [
      ...origin,
      ...parsePath(key, legacyPaths)
    ]));
    return;
  }
  const [nodeValue, children] = tree;
  if (children) {
    forEach(children, (child, key) => {
      traverse(child, walker2, version, [
        ...origin,
        ...parsePath(key, legacyPaths)
      ]);
    });
  }
  walker2(nodeValue, origin);
}
function applyValueAnnotations(plain, annotations, version, superJson) {
  traverse(annotations, (type, path) => {
    plain = setDeep(plain, path, (v) => untransformValue(v, type, superJson));
  }, version);
  return plain;
}
function applyReferentialEqualityAnnotations(plain, annotations, version) {
  const legacyPaths = enableLegacyPaths(version);
  function apply(identicalPaths, path) {
    const object = getDeep(plain, parsePath(path, legacyPaths));
    identicalPaths.map((path2) => parsePath(path2, legacyPaths)).forEach((identicalObjectPath) => {
      plain = setDeep(plain, identicalObjectPath, () => object);
    });
  }
  if (isArray(annotations)) {
    const [root, other] = annotations;
    root.forEach((identicalPath) => {
      plain = setDeep(plain, parsePath(identicalPath, legacyPaths), () => plain);
    });
    if (other) {
      forEach(other, apply);
    }
  } else {
    forEach(annotations, apply);
  }
  return plain;
}
function addIdentity(object, path, identities) {
  const existingSet = identities.get(object);
  if (existingSet) {
    existingSet.push(path);
  } else {
    identities.set(object, [path]);
  }
}
function generateReferentialEqualityAnnotations(identitites, dedupe) {
  const result = {};
  let rootEqualityPaths = void 0;
  identitites.forEach((paths) => {
    if (paths.length <= 1) {
      return;
    }
    if (!dedupe) {
      paths = paths.map((path) => path.map(String)).sort((a, b) => a.length - b.length);
    }
    const [representativePath, ...identicalPaths] = paths;
    if (representativePath.length === 0) {
      rootEqualityPaths = identicalPaths.map(stringifyPath);
    } else {
      result[stringifyPath(representativePath)] = identicalPaths.map(stringifyPath);
    }
  });
  if (rootEqualityPaths) {
    if (isEmptyObject(result)) {
      return [rootEqualityPaths];
    } else {
      return [rootEqualityPaths, result];
    }
  } else {
    return isEmptyObject(result) ? void 0 : result;
  }
}
var enableLegacyPaths, isDeep, walker;
var init_plainer = __esm({
  "node_modules/superjson/dist/plainer.js"() {
    init_is();
    init_pathstringifier();
    init_transformer();
    init_util();
    init_pathstringifier();
    init_accessDeep();
    enableLegacyPaths = (version) => version < 1;
    isDeep = (object, superJson) => isPlainObject2(object) || isArray(object) || isMap(object) || isSet(object) || isError(object) || isInstanceOfRegisteredClass(object, superJson);
    walker = (object, identities, superJson, dedupe, path = [], objectsInThisPath = [], seenObjects = /* @__PURE__ */ new Map()) => {
      const primitive = isPrimitive(object);
      if (!primitive) {
        addIdentity(object, path, identities);
        const seen = seenObjects.get(object);
        if (seen) {
          return dedupe ? {
            transformedValue: null
          } : seen;
        }
      }
      if (!isDeep(object, superJson)) {
        const transformed2 = transformValue(object, superJson);
        const result2 = transformed2 ? {
          transformedValue: transformed2.value,
          annotations: [transformed2.type]
        } : {
          transformedValue: object
        };
        if (!primitive) {
          seenObjects.set(object, result2);
        }
        return result2;
      }
      if (includes(objectsInThisPath, object)) {
        return {
          transformedValue: null
        };
      }
      const transformationResult = transformValue(object, superJson);
      const transformed = transformationResult?.value ?? object;
      const transformedValue = isArray(transformed) ? [] : {};
      const innerAnnotations = {};
      forEach(transformed, (value, index2) => {
        if (index2 === "__proto__" || index2 === "constructor" || index2 === "prototype") {
          throw new Error(`Detected property ${index2}. This is a prototype pollution risk, please remove it from your object.`);
        }
        const recursiveResult = walker(value, identities, superJson, dedupe, [...path, index2], [...objectsInThisPath, object], seenObjects);
        transformedValue[index2] = recursiveResult.transformedValue;
        if (isArray(recursiveResult.annotations)) {
          innerAnnotations[escapeKey(index2)] = recursiveResult.annotations;
        } else if (isPlainObject2(recursiveResult.annotations)) {
          forEach(recursiveResult.annotations, (tree, key) => {
            innerAnnotations[escapeKey(index2) + "." + key] = tree;
          });
        }
      });
      const result = isEmptyObject(innerAnnotations) ? {
        transformedValue,
        annotations: !!transformationResult ? [transformationResult.type] : void 0
      } : {
        transformedValue,
        annotations: !!transformationResult ? [transformationResult.type, innerAnnotations] : innerAnnotations
      };
      if (!primitive) {
        seenObjects.set(object, result);
      }
      return result;
    };
  }
});

// node_modules/is-what/dist/getType.js
function getType2(payload) {
  return Object.prototype.toString.call(payload).slice(8, -1);
}
var init_getType = __esm({
  "node_modules/is-what/dist/getType.js"() {
  }
});

// node_modules/is-what/dist/isArray.js
function isArray2(payload) {
  return getType2(payload) === "Array";
}
var init_isArray = __esm({
  "node_modules/is-what/dist/isArray.js"() {
    init_getType();
  }
});

// node_modules/is-what/dist/isPlainObject.js
function isPlainObject3(payload) {
  if (getType2(payload) !== "Object")
    return false;
  const prototype = Object.getPrototypeOf(payload);
  return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
}
var init_isPlainObject = __esm({
  "node_modules/is-what/dist/isPlainObject.js"() {
    init_getType();
  }
});

// node_modules/is-what/dist/index.js
var init_dist2 = __esm({
  "node_modules/is-what/dist/index.js"() {
    init_isArray();
    init_isPlainObject();
  }
});

// node_modules/copy-anything/dist/index.js
function assignProp(carry, key, newVal, originalObject, includeNonenumerable) {
  const propType = {}.propertyIsEnumerable.call(originalObject, key) ? "enumerable" : "nonenumerable";
  if (propType === "enumerable")
    carry[key] = newVal;
  if (includeNonenumerable && propType === "nonenumerable") {
    Object.defineProperty(carry, key, {
      value: newVal,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
}
function copy(target, options = {}) {
  if (isArray2(target)) {
    return target.map((item) => copy(item, options));
  }
  if (!isPlainObject3(target)) {
    return target;
  }
  const props = Object.getOwnPropertyNames(target);
  const symbols = Object.getOwnPropertySymbols(target);
  return [...props, ...symbols].reduce((carry, key) => {
    if (key === "__proto__")
      return carry;
    if (isArray2(options.props) && !options.props.includes(key)) {
      return carry;
    }
    const val = target[key];
    const newVal = copy(val, options);
    assignProp(carry, key, newVal, target, options.nonenumerable);
    return carry;
  }, {});
}
var init_dist3 = __esm({
  "node_modules/copy-anything/dist/index.js"() {
    init_dist2();
  }
});

// node_modules/superjson/dist/index.js
var SuperJSON, dist_default, serialize, deserialize, stringify, parse, registerClass, registerCustom, registerSymbol, allowErrorProps;
var init_dist4 = __esm({
  "node_modules/superjson/dist/index.js"() {
    init_class_registry();
    init_registry();
    init_custom_transformer_registry();
    init_plainer();
    init_dist3();
    SuperJSON = class {
      /**
       * @param dedupeReferentialEqualities  If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
       */
      constructor({ dedupe = false } = {}) {
        this.classRegistry = new ClassRegistry();
        this.symbolRegistry = new Registry((s) => s.description ?? "");
        this.customTransformerRegistry = new CustomTransformerRegistry();
        this.allowedErrorProps = [];
        this.dedupe = dedupe;
      }
      serialize(object) {
        const identities = /* @__PURE__ */ new Map();
        const output = walker(object, identities, this, this.dedupe);
        const res = {
          json: output.transformedValue
        };
        if (output.annotations) {
          res.meta = {
            ...res.meta,
            values: output.annotations
          };
        }
        const equalityAnnotations = generateReferentialEqualityAnnotations(identities, this.dedupe);
        if (equalityAnnotations) {
          res.meta = {
            ...res.meta,
            referentialEqualities: equalityAnnotations
          };
        }
        if (res.meta)
          res.meta.v = 1;
        return res;
      }
      deserialize(payload, options) {
        const { json: json2, meta } = payload;
        let result = options?.inPlace ? json2 : copy(json2);
        if (meta?.values) {
          result = applyValueAnnotations(result, meta.values, meta.v ?? 0, this);
        }
        if (meta?.referentialEqualities) {
          result = applyReferentialEqualityAnnotations(result, meta.referentialEqualities, meta.v ?? 0);
        }
        return result;
      }
      stringify(object) {
        return JSON.stringify(this.serialize(object));
      }
      parse(string) {
        return this.deserialize(JSON.parse(string), { inPlace: true });
      }
      registerClass(v, options) {
        this.classRegistry.register(v, options);
      }
      registerSymbol(v, identifier) {
        this.symbolRegistry.register(v, identifier);
      }
      registerCustom(transformer, name) {
        this.customTransformerRegistry.register({
          name,
          ...transformer
        });
      }
      allowErrorProps(...props) {
        this.allowedErrorProps.push(...props);
      }
    };
    SuperJSON.defaultInstance = new SuperJSON();
    SuperJSON.serialize = SuperJSON.defaultInstance.serialize.bind(SuperJSON.defaultInstance);
    SuperJSON.deserialize = SuperJSON.defaultInstance.deserialize.bind(SuperJSON.defaultInstance);
    SuperJSON.stringify = SuperJSON.defaultInstance.stringify.bind(SuperJSON.defaultInstance);
    SuperJSON.parse = SuperJSON.defaultInstance.parse.bind(SuperJSON.defaultInstance);
    SuperJSON.registerClass = SuperJSON.defaultInstance.registerClass.bind(SuperJSON.defaultInstance);
    SuperJSON.registerSymbol = SuperJSON.defaultInstance.registerSymbol.bind(SuperJSON.defaultInstance);
    SuperJSON.registerCustom = SuperJSON.defaultInstance.registerCustom.bind(SuperJSON.defaultInstance);
    SuperJSON.allowErrorProps = SuperJSON.defaultInstance.allowErrorProps.bind(SuperJSON.defaultInstance);
    dist_default = SuperJSON;
    serialize = SuperJSON.serialize;
    deserialize = SuperJSON.deserialize;
    stringify = SuperJSON.stringify;
    parse = SuperJSON.parse;
    registerClass = SuperJSON.registerClass;
    registerCustom = SuperJSON.registerCustom;
    registerSymbol = SuperJSON.registerSymbol;
    allowErrorProps = SuperJSON.allowErrorProps;
  }
});

// server/middleware.ts
var t, createRouter, publicQuery;
var init_middleware = __esm({
  "server/middleware.ts"() {
    init_dist();
    init_dist4();
    t = initTRPC.context().create({
      transformer: dist_default
    });
    createRouter = t.router;
    publicQuery = t.procedure;
  }
});

// server/lib/env.ts
import "dotenv/config";
function required(name) {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}
function optional(name, fallback = "") {
  return process.env[name] ?? fallback;
}
var env;
var init_env = __esm({
  "server/lib/env.ts"() {
    env = {
      appId: optional("APP_ID"),
      appSecret: optional("APP_SECRET"),
      isProduction: process.env.NODE_ENV === "production",
      databaseUrl: required("DATABASE_URL")
    };
  }
});

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  brandProfiles: () => brandProfiles,
  campaignChannelEnum: () => campaignChannelEnum,
  campaignInsights: () => campaignInsights,
  campaignStatusEnum: () => campaignStatusEnum,
  campaigns: () => campaigns,
  channelPreferenceEnum: () => channelPreferenceEnum,
  confidenceEnum: () => confidenceEnum,
  customers: () => customers,
  eventTypeEnum: () => eventTypeEnum,
  events: () => events,
  messageChannelEnum: () => messageChannelEnum,
  messageStatusEnum: () => messageStatusEnum,
  messages: () => messages,
  orderChannelEnum: () => orderChannelEnum,
  orderStatusEnum: () => orderStatusEnum,
  orders: () => orders,
  personaEnum: () => personaEnum,
  products: () => products,
  segmentCustomers: () => segmentCustomers,
  segmentSourceEnum: () => segmentSourceEnum,
  segments: () => segments
});
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  json,
  pgEnum,
  bigint,
  index
} from "drizzle-orm/pg-core";
var channelPreferenceEnum, personaEnum, orderStatusEnum, orderChannelEnum, segmentSourceEnum, campaignChannelEnum, campaignStatusEnum, messageChannelEnum, messageStatusEnum, eventTypeEnum, confidenceEnum, brandProfiles, products, customers, orders, segments, segmentCustomers, campaigns, messages, events, campaignInsights;
var init_schema = __esm({
  "db/schema.ts"() {
    channelPreferenceEnum = pgEnum("channel_preference", ["whatsapp", "sms", "email"]);
    personaEnum = pgEnum("persona", [
      "office_regular",
      "weekend_enthusiast",
      "gift_buyer",
      "subscription_loyalist",
      "lapsed_explorer",
      "new"
    ]);
    orderStatusEnum = pgEnum("order_status", ["completed", "pending", "cancelled"]);
    orderChannelEnum = pgEnum("order_channel", ["online", "in_store", "subscription"]);
    segmentSourceEnum = pgEnum("segment_source", ["manual", "nl_query", "ai_suggested"]);
    campaignChannelEnum = pgEnum("campaign_channel", ["whatsapp", "sms", "email"]);
    campaignStatusEnum = pgEnum("campaign_status", [
      "draft",
      "scheduled",
      "running",
      "paused",
      "completed",
      "failed"
    ]);
    messageChannelEnum = pgEnum("message_channel", ["whatsapp", "sms", "email"]);
    messageStatusEnum = pgEnum("message_status", [
      "pending",
      "queued",
      "sent",
      "delivered",
      "opened",
      "read",
      "clicked",
      "converted",
      "failed",
      "bounced"
    ]);
    eventTypeEnum = pgEnum("event_type", [
      "sent",
      "delivered",
      "opened",
      "read",
      "clicked",
      "converted",
      "failed",
      "bounced"
    ]);
    confidenceEnum = pgEnum("confidence", ["low", "medium", "high"]);
    brandProfiles = pgTable("brand_profiles", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      tagline: varchar("tagline", { length: 255 }),
      originStory: text("origin_story"),
      toneOfVoice: text("tone_of_voice"),
      visualIdentity: json("visual_identity"),
      contactInfo: json("contact_info"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    products = pgTable("products", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      category: varchar("category", { length: 100 }).notNull(),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      description: text("description"),
      story: text("story"),
      sku: varchar("sku", { length: 50 }).notNull().unique(),
      isActive: integer("is_active").notNull().default(1),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    customers = pgTable(
      "customers",
      {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull(),
        phone: varchar("phone", { length: 20 }),
        channelPreference: channelPreferenceEnum("channel_preference").default("email"),
        persona: personaEnum("persona").default("new"),
        totalOrders: integer("total_orders").notNull().default(0),
        totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).notNull().default("0.00"),
        lastOrderAt: timestamp("last_order_at"),
        firstOrderAt: timestamp("first_order_at"),
        healthScore: integer("health_score").default(50),
        aiSummary: text("ai_summary"),
        metadata: json("metadata"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_customers_persona").on(table.persona),
        index("idx_customers_health").on(table.healthScore),
        index("idx_customers_last_order").on(table.lastOrderAt)
      ]
    );
    orders = pgTable(
      "orders",
      {
        id: serial("id").primaryKey(),
        customerId: bigint("customer_id", { mode: "number" }).notNull(),
        orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
        totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
        status: orderStatusEnum("status").notNull().default("completed"),
        channel: orderChannelEnum("channel").notNull().default("online"),
        items: json("items").notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_orders_customer").on(table.customerId),
        index("idx_orders_created").on(table.createdAt),
        index("idx_orders_status").on(table.status)
      ]
    );
    segments = pgTable(
      "segments",
      {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        filterJson: json("filter_json"),
        aiReasoning: text("ai_reasoning"),
        customerCount: integer("customer_count").notNull().default(0),
        isAiSuggested: integer("is_ai_suggested").notNull().default(0),
        source: segmentSourceEnum("source").notNull().default("manual"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
      },
      (table) => [index("idx_segments_source").on(table.source)]
    );
    segmentCustomers = pgTable(
      "segment_customers",
      {
        id: serial("id").primaryKey(),
        segmentId: bigint("segment_id", { mode: "number" }).notNull(),
        customerId: bigint("customer_id", { mode: "number" }).notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_seg_cust_segment").on(table.segmentId),
        index("idx_seg_cust_customer").on(table.customerId)
      ]
    );
    campaigns = pgTable(
      "campaigns",
      {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        segmentId: bigint("segment_id", { mode: "number" }),
        channel: campaignChannelEnum("channel").notNull(),
        status: campaignStatusEnum("status").notNull().default("draft"),
        messageVariants: json("message_variants"),
        selectedVariant: integer("selected_variant").default(0),
        goal: text("goal"),
        predictedSent: integer("predicted_sent").default(0),
        predictedDelivered: integer("predicted_delivered").default(0),
        predictedOpened: integer("predicted_opened").default(0),
        predictedClicked: integer("predicted_clicked").default(0),
        predictedConverted: integer("predicted_converted").default(0),
        actualSent: integer("actual_sent").default(0),
        actualDelivered: integer("actual_delivered").default(0),
        actualOpened: integer("actual_opened").default(0),
        actualClicked: integer("actual_clicked").default(0),
        actualConverted: integer("actual_converted").default(0),
        actualRevenue: decimal("actual_revenue", { precision: 12, scale: 2 }).default("0.00"),
        scheduledAt: timestamp("scheduled_at"),
        startedAt: timestamp("started_at"),
        completedAt: timestamp("completed_at"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_campaigns_status").on(table.status),
        index("idx_campaigns_segment").on(table.segmentId)
      ]
    );
    messages = pgTable(
      "messages",
      {
        id: serial("id").primaryKey(),
        campaignId: bigint("campaign_id", { mode: "number" }).notNull(),
        customerId: bigint("customer_id", { mode: "number" }).notNull(),
        channel: messageChannelEnum("channel").notNull(),
        content: text("content").notNull(),
        subject: varchar("subject", { length: 255 }),
        status: messageStatusEnum("status").notNull().default("pending"),
        failureReason: text("failure_reason"),
        personalizedData: json("personalized_data"),
        sentAt: timestamp("sent_at"),
        deliveredAt: timestamp("delivered_at"),
        openedAt: timestamp("opened_at"),
        clickedAt: timestamp("clicked_at"),
        convertedAt: timestamp("converted_at"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_messages_campaign").on(table.campaignId),
        index("idx_messages_customer").on(table.customerId),
        index("idx_messages_status").on(table.status)
      ]
    );
    events = pgTable(
      "events",
      {
        id: serial("id").primaryKey(),
        messageId: bigint("message_id", { mode: "number" }).notNull(),
        campaignId: bigint("campaign_id", { mode: "number" }).notNull(),
        eventType: eventTypeEnum("event_type").notNull(),
        metadata: json("metadata"),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_events_message").on(table.messageId),
        index("idx_events_campaign").on(table.campaignId),
        index("idx_events_type").on(table.eventType)
      ]
    );
    campaignInsights = pgTable("campaign_insights", {
      id: serial("id").primaryKey(),
      campaignId: bigint("campaign_id", { mode: "number" }).notNull(),
      insight: text("insight").notNull(),
      recommendation: text("recommendation"),
      confidence: confidenceEnum("confidence").default("medium"),
      metricsBreakdown: json("metrics_breakdown"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
  }
});

// db/relations.ts
var relations_exports = {};
__export(relations_exports, {
  campaignInsightsRelations: () => campaignInsightsRelations,
  campaignsRelations: () => campaignsRelations,
  customersRelations: () => customersRelations,
  eventsRelations: () => eventsRelations,
  messagesRelations: () => messagesRelations,
  ordersRelations: () => ordersRelations,
  segmentCustomersRelations: () => segmentCustomersRelations,
  segmentsRelations: () => segmentsRelations
});
import { relations } from "drizzle-orm";
var customersRelations, ordersRelations, segmentsRelations, segmentCustomersRelations, campaignsRelations, messagesRelations, eventsRelations, campaignInsightsRelations;
var init_relations = __esm({
  "db/relations.ts"() {
    init_schema();
    customersRelations = relations(customers, ({ many }) => ({
      orders: many(orders),
      messages: many(messages),
      segmentMemberships: many(segmentCustomers)
    }));
    ordersRelations = relations(orders, ({ one }) => ({
      customer: one(customers, {
        fields: [orders.customerId],
        references: [customers.id]
      })
    }));
    segmentsRelations = relations(segments, ({ many }) => ({
      segmentCustomers: many(segmentCustomers),
      campaigns: many(campaigns)
    }));
    segmentCustomersRelations = relations(
      segmentCustomers,
      ({ one }) => ({
        segment: one(segments, {
          fields: [segmentCustomers.segmentId],
          references: [segments.id]
        }),
        customer: one(customers, {
          fields: [segmentCustomers.customerId],
          references: [customers.id]
        })
      })
    );
    campaignsRelations = relations(campaigns, ({ one, many }) => ({
      segment: one(segments, {
        fields: [campaigns.segmentId],
        references: [segments.id]
      }),
      messages: many(messages),
      insights: many(campaignInsights)
    }));
    messagesRelations = relations(messages, ({ one, many }) => ({
      campaign: one(campaigns, {
        fields: [messages.campaignId],
        references: [campaigns.id]
      }),
      customer: one(customers, {
        fields: [messages.customerId],
        references: [customers.id]
      }),
      events: many(events)
    }));
    eventsRelations = relations(events, ({ one }) => ({
      message: one(messages, {
        fields: [events.messageId],
        references: [messages.id]
      })
    }));
    campaignInsightsRelations = relations(
      campaignInsights,
      ({ one }) => ({
        campaign: one(campaigns, {
          fields: [campaignInsights.campaignId],
          references: [campaigns.id]
        })
      })
    );
  }
});

// server/queries/connection.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
function getDb() {
  if (!instance) {
    const queryClient = neon(env.databaseUrl);
    instance = drizzle(queryClient, {
      schema: fullSchema
    });
  }
  return instance;
}
var fullSchema, instance;
var init_connection = __esm({
  "server/queries/connection.ts"() {
    init_env();
    init_schema();
    init_relations();
    fullSchema = { ...schema_exports, ...relations_exports };
  }
});

// server/routers/channel.ts
var channel_exports = {};
__export(channel_exports, {
  CHANNEL_MODELS: () => CHANNEL_MODELS,
  channelRouter: () => channelRouter,
  dispatchCampaign: () => dispatchCampaign
});
import { z as z3 } from "zod";
import { eq as eq3, sql as sql3 } from "drizzle-orm";
async function processMessageReceipt(messageId, campaignId, channel) {
  const db = getDb();
  const model = CHANNEL_MODELS[channel];
  const rng = Math.random();
  const rng2 = Math.random();
  const rng3 = Math.random();
  const rng4 = Math.random();
  try {
    await new Promise((r) => setTimeout(r, model.sentDelayMs + Math.random() * 200));
    await db.update(messages).set({ status: "sent", sentAt: /* @__PURE__ */ new Date() }).where(eq3(messages.id, messageId));
    await db.update(campaigns).set({ actualSent: sql3`${campaigns.actualSent} + 1` }).where(eq3(campaigns.id, campaignId));
    await new Promise((r) => setTimeout(r, model.deliveredDelayMs - model.sentDelayMs));
    if (rng > model.deliveryRate) {
      await db.update(messages).set({
        status: "failed",
        failureReason: "Channel delivery failed \u2014 recipient unreachable or blocked"
      }).where(eq3(messages.id, messageId));
      return;
    }
    await db.update(messages).set({ status: "delivered", deliveredAt: /* @__PURE__ */ new Date() }).where(eq3(messages.id, messageId));
    await db.update(campaigns).set({ actualDelivered: sql3`${campaigns.actualDelivered} + 1` }).where(eq3(campaigns.id, campaignId));
    await new Promise((r) => setTimeout(r, model.openedDelayMs - model.deliveredDelayMs));
    if (rng2 > model.openRate) return;
    await db.update(messages).set({ status: "opened", openedAt: /* @__PURE__ */ new Date() }).where(eq3(messages.id, messageId));
    await db.update(campaigns).set({ actualOpened: sql3`${campaigns.actualOpened} + 1` }).where(eq3(campaigns.id, campaignId));
    await new Promise((r) => setTimeout(r, model.clickedDelayMs - model.openedDelayMs));
    if (rng3 > model.clickRate) return;
    await db.update(messages).set({ status: "clicked", clickedAt: /* @__PURE__ */ new Date() }).where(eq3(messages.id, messageId));
    await db.update(campaigns).set({ actualClicked: sql3`${campaigns.actualClicked} + 1` }).where(eq3(campaigns.id, campaignId));
    await new Promise((r) => setTimeout(r, model.convertedDelayMs - model.clickedDelayMs));
    if (rng4 > model.conversionRate) return;
    const revenueAmount = (80 + Math.random() * 600).toFixed(2);
    await db.update(messages).set({ status: "converted", convertedAt: /* @__PURE__ */ new Date() }).where(eq3(messages.id, messageId));
    await db.update(campaigns).set({
      actualConverted: sql3`${campaigns.actualConverted} + 1`,
      actualRevenue: sql3`${campaigns.actualRevenue} + ${revenueAmount}`
    }).where(eq3(campaigns.id, campaignId));
  } catch (err) {
    console.error(
      `[ChannelService] Receipt callback failed for message ${messageId}:`,
      err
    );
  }
}
async function dispatchCampaign(campaignId, channel, messageIds) {
  const db = getDb();
  if (messageIds.length === 0) {
    return { accepted: 0 };
  }
  await db.update(messages).set({ status: "queued" }).where(eq3(messages.campaignId, campaignId));
  const CONCURRENCY = 8;
  const STAGGER_MS = 80;
  const runAsync = async () => {
    for (let i = 0; i < messageIds.length; i += CONCURRENCY) {
      if (i > 0) await new Promise((r) => setTimeout(r, STAGGER_MS));
      const batch = messageIds.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map((msgId) => processMessageReceipt(msgId, campaignId, channel))
      );
    }
    await new Promise((r) => setTimeout(r, 500));
    await db.update(campaigns).set({ status: "completed", completedAt: /* @__PURE__ */ new Date() }).where(eq3(campaigns.id, campaignId));
    console.log(
      `[ChannelService] Campaign ${campaignId} completed. ${messageIds.length} messages processed via ${channel}.`
    );
  };
  runAsync().catch(
    (err) => console.error(`[ChannelService] Campaign ${campaignId} batch error:`, err)
  );
  return { accepted: messageIds.length };
}
var CHANNEL_MODELS, channelRouter;
var init_channel = __esm({
  "server/routers/channel.ts"() {
    init_middleware();
    init_connection();
    init_schema();
    CHANNEL_MODELS = {
      whatsapp: {
        deliveryRate: 0.95,
        openRate: 0.82,
        clickRate: 0.32,
        conversionRate: 0.12,
        // Simulated timing (ms) — compressed for demo realism
        sentDelayMs: 400,
        deliveredDelayMs: 900,
        openedDelayMs: 1800,
        clickedDelayMs: 3e3,
        convertedDelayMs: 4500
      },
      sms: {
        deliveryRate: 0.98,
        openRate: 0.88,
        clickRate: 0.18,
        conversionRate: 0.07,
        sentDelayMs: 300,
        deliveredDelayMs: 700,
        openedDelayMs: 1400,
        clickedDelayMs: 2500,
        convertedDelayMs: 4e3
      },
      email: {
        deliveryRate: 0.87,
        openRate: 0.24,
        clickRate: 0.07,
        conversionRate: 0.025,
        sentDelayMs: 600,
        deliveredDelayMs: 1300,
        openedDelayMs: 2800,
        clickedDelayMs: 4500,
        convertedDelayMs: 7e3
      }
    };
    channelRouter = createRouter({
      /**
       * channel.send — CRM calls this to hand off a campaign to the channel service.
       * Returns immediately; delivery simulation runs asynchronously.
       */
      send: publicQuery.input(
        z3.object({
          campaignId: z3.number(),
          channel: z3.enum(["whatsapp", "sms", "email"]),
          messageIds: z3.array(z3.number())
        })
      ).mutation(async ({ input }) => {
        const result = await dispatchCampaign(
          input.campaignId,
          input.channel,
          input.messageIds
        );
        return {
          ...result,
          campaignId: input.campaignId,
          channel: input.channel,
          status: "queued",
          message: `Channel service accepted ${result.accepted} messages for ${input.channel} delivery. Callbacks will update CRM asynchronously.`
        };
      }),
      /**
       * channel.status — Query the delivery breakdown for a campaign.
       * Simulates calling the channel provider's status API.
       */
      status: publicQuery.input(z3.object({ campaignId: z3.number() })).query(async ({ input }) => {
        const db = getDb();
        const result = await db.select({
          status: messages.status,
          count: sql3`count(*)`
        }).from(messages).where(eq3(messages.campaignId, input.campaignId)).groupBy(messages.status);
        return {
          campaignId: input.campaignId,
          breakdown: result,
          total: result.reduce((sum, r) => sum + Number(r.count), 0)
        };
      })
    });
  }
});

// node_modules/hono/dist/adapter/vercel/handler.js
var handle = (app2) => (req) => {
  return app2.fetch(req);
};

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index2 = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index2) {
        throw new Error("next() called multiple times");
      }
      index2 = i;
      let res;
      let isError2 = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError2 = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError2)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/http-exception.js
var HTTPException = class extends Error {
  res;
  status;
  /**
   * Creates an instance of `HTTPException`.
   * @param status - HTTP status code for the exception. Defaults to 500.
   * @param options - Additional options for the exception.
   */
  constructor(status = 500, options) {
    super(options?.message, { cause: options?.cause });
    this.res = options?.res;
    this.status = status;
  }
  /**
   * Returns the response object associated with the exception.
   * If a response object is not provided, a new response is created with the error message and status code.
   * @returns The response object.
   */
  getResponse() {
    if (this.res) {
      const newResponse = new Response(this.res.body, {
        status: this.status,
        headers: this.res.headers
      });
      return newResponse;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index2) => {
    if (index2 === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index2) => {
    const mark = `@${index2}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments2 = path.split("/");
  const results = [];
  let basePath = "";
  segments2.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text2) => JSON.parse(text2));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text2, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text2) : this.#newResponse(
      text2,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers2) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers2.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers2) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers2.unshift(arg1);
      }
      handlers2.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index2 = match3.indexOf("", 1);
    return [matcher[1][index2], match3];
  });
  this.match = match2;
  return match2(method, path);
}

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index2, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index2;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index2, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index2, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index2, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers2] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers2.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers2.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = (children) => {
  for (const _ in children) {
    return true;
  }
  return false;
};
var Node2 = class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/body-limit/index.js
var ERROR_MESSAGE = "Payload Too Large";
var bodyLimit = (options) => {
  const onError = options.onError || (() => {
    const res = new Response(ERROR_MESSAGE, {
      status: 413
    });
    throw new HTTPException(413, { res });
  });
  const maxSize = options.maxSize;
  return async function bodyLimit2(c, next) {
    if (!c.req.raw.body) {
      return next();
    }
    const hasTransferEncoding = c.req.raw.headers.has("transfer-encoding");
    const hasContentLength = c.req.raw.headers.has("content-length");
    if (hasContentLength && !hasTransferEncoding) {
      const contentLength = parseInt(c.req.raw.headers.get("content-length") || "0", 10);
      return contentLength > maxSize ? onError(c) : next();
    }
    let size = 0;
    const chunks = [];
    const rawReader = c.req.raw.body.getReader();
    for (; ; ) {
      const { done, value } = await rawReader.read();
      if (done) {
        break;
      }
      size += value.length;
      if (size > maxSize) {
        return onError(c);
      }
      chunks.push(value);
    }
    const requestInit = {
      body: new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        }
      }),
      duplex: "half"
    };
    c.req.raw = new Request(c.req.raw, requestInit);
    return next();
  };
};

// node_modules/@trpc/server/dist/adapters/fetch/index.mjs
init_getErrorShape_BPSzUA7W();

// node_modules/@trpc/server/dist/resolveResponse-CdASWfAV.mjs
init_getErrorShape_BPSzUA7W();
init_codes_DagpWZLc();
init_tracked_DWInO6EQ();

// node_modules/@trpc/server/dist/observable-UMO3vUa_.mjs
function isObservable(x) {
  return typeof x === "object" && x !== null && "subscribe" in x;
}
function observableToReadableStream(observable$1, signal) {
  let unsub = null;
  const onAbort = () => {
    unsub === null || unsub === void 0 || unsub.unsubscribe();
    unsub = null;
    signal.removeEventListener("abort", onAbort);
  };
  return new ReadableStream({
    start(controller) {
      unsub = observable$1.subscribe({
        next(data) {
          controller.enqueue({
            ok: true,
            value: data
          });
        },
        error(error) {
          controller.enqueue({
            ok: false,
            error
          });
          controller.close();
        },
        complete() {
          controller.close();
        }
      });
      if (signal.aborted) onAbort();
      else signal.addEventListener("abort", onAbort, { once: true });
    },
    cancel() {
      onAbort();
    }
  });
}
function observableToAsyncIterable(observable$1, signal) {
  const stream = observableToReadableStream(observable$1, signal);
  const reader = stream.getReader();
  const iterator = {
    async next() {
      const value = await reader.read();
      if (value.done) return {
        value: void 0,
        done: true
      };
      const { value: result } = value;
      if (!result.ok) throw result.error;
      return {
        value: result.value,
        done: false
      };
    },
    async return() {
      await reader.cancel();
      return {
        value: void 0,
        done: true
      };
    }
  };
  return { [Symbol.asyncIterator]() {
    return iterator;
  } };
}

// node_modules/@trpc/server/dist/resolveResponse-CdASWfAV.mjs
function parseConnectionParamsFromUnknown(parsed) {
  try {
    if (parsed === null) return null;
    if (!isObject(parsed)) throw new Error("Expected object");
    const nonStringValues = Object.entries(parsed).filter(([_key, value]) => typeof value !== "string");
    if (nonStringValues.length > 0) throw new Error(`Expected connectionParams to be string values. Got ${nonStringValues.map(([key, value]) => `${key}: ${typeof value}`).join(", ")}`);
    return parsed;
  } catch (cause) {
    throw new TRPCError({
      code: "PARSE_ERROR",
      message: "Invalid connection params shape",
      cause
    });
  }
}
function parseConnectionParamsFromString(str) {
  let parsed;
  try {
    parsed = JSON.parse(str);
  } catch (cause) {
    throw new TRPCError({
      code: "PARSE_ERROR",
      message: "Not JSON-parsable query params",
      cause
    });
  }
  return parseConnectionParamsFromUnknown(parsed);
}
var import_objectSpread2$12 = __toESM(require_objectSpread2(), 1);
function getAcceptHeader(headers) {
  var _ref, _headers$get;
  return (_ref = headers.get("trpc-accept")) !== null && _ref !== void 0 ? _ref : ((_headers$get = headers.get("accept")) === null || _headers$get === void 0 ? void 0 : _headers$get.split(",").some((t2) => t2.trim() === "application/jsonl")) ? "application/jsonl" : null;
}
function memo(fn) {
  let promise = null;
  const sym = /* @__PURE__ */ Symbol.for("@trpc/server/http/memo");
  let value = sym;
  return {
    read: async () => {
      var _promise;
      if (value !== sym) return value;
      (_promise = promise) !== null && _promise !== void 0 || (promise = fn().catch((cause) => {
        if (cause instanceof TRPCError) throw cause;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: cause instanceof Error ? cause.message : "Invalid input",
          cause
        });
      }));
      value = await promise;
      promise = null;
      return value;
    },
    result: () => {
      return value !== sym ? value : void 0;
    }
  };
}
var jsonContentTypeHandler = {
  isMatch(req) {
    var _req$headers$get;
    return !!((_req$headers$get = req.headers.get("content-type")) === null || _req$headers$get === void 0 ? void 0 : _req$headers$get.startsWith("application/json"));
  },
  async parse(opts) {
    var _types$values$next$va;
    const { req } = opts;
    const isBatchCall = opts.searchParams.get("batch") === "1";
    const maxBatchSize = opts.maxBatchSize;
    const paths = isBatchCall ? opts.path.split(",") : [opts.path];
    if (isBatchCall && typeof maxBatchSize === "number" && paths.length > maxBatchSize) throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Batch call exceeds maximum size`
    });
    const getInputs = memo(async () => {
      let inputs = void 0;
      if (req.method === "GET") {
        const queryInput = opts.searchParams.get("input");
        if (queryInput) inputs = JSON.parse(queryInput);
      } else inputs = await req.json();
      if (inputs === void 0) return emptyObject();
      if (!isBatchCall) {
        const result = emptyObject();
        result[0] = opts.router._def._config.transformer.input.deserialize(inputs);
        return result;
      }
      if (!isObject(inputs)) throw new TRPCError({
        code: "BAD_REQUEST",
        message: '"input" needs to be an object when doing a batch call'
      });
      const acc = emptyObject();
      for (const index2 of paths.keys()) {
        const input = inputs[index2];
        if (input !== void 0) acc[index2] = opts.router._def._config.transformer.input.deserialize(input);
      }
      return acc;
    });
    const calls = await Promise.all(paths.map(async (path, index2) => {
      const procedure = await getProcedureAtPath(opts.router, path);
      return {
        batchIndex: index2,
        path,
        procedure,
        getRawInput: async () => {
          const inputs = await getInputs.read();
          let input = inputs[index2];
          if ((procedure === null || procedure === void 0 ? void 0 : procedure._def.type) === "subscription") {
            var _ref2, _opts$headers$get;
            const lastEventId = (_ref2 = (_opts$headers$get = opts.headers.get("last-event-id")) !== null && _opts$headers$get !== void 0 ? _opts$headers$get : opts.searchParams.get("lastEventId")) !== null && _ref2 !== void 0 ? _ref2 : opts.searchParams.get("Last-Event-Id");
            if (lastEventId) if (isObject(input)) input = (0, import_objectSpread2$12.default)((0, import_objectSpread2$12.default)({}, input), {}, { lastEventId });
            else {
              var _input;
              (_input = input) !== null && _input !== void 0 || (input = { lastEventId });
            }
          }
          return input;
        },
        result: () => {
          var _getInputs$result;
          return (_getInputs$result = getInputs.result()) === null || _getInputs$result === void 0 ? void 0 : _getInputs$result[index2];
        }
      };
    }));
    const types = new Set(calls.map((call) => {
      var _call$procedure;
      return (_call$procedure = call.procedure) === null || _call$procedure === void 0 ? void 0 : _call$procedure._def.type;
    }).filter(Boolean));
    if (types.size > 1) throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot mix procedure types in call: ${Array.from(types).join(", ")}`
    });
    const type = (_types$values$next$va = types.values().next().value) !== null && _types$values$next$va !== void 0 ? _types$values$next$va : "unknown";
    const connectionParamsStr = opts.searchParams.get("connectionParams");
    const info = {
      isBatchCall,
      accept: getAcceptHeader(req.headers),
      calls,
      type,
      connectionParams: connectionParamsStr === null ? null : parseConnectionParamsFromString(connectionParamsStr),
      signal: req.signal,
      url: opts.url
    };
    return info;
  }
};
var formDataContentTypeHandler = {
  isMatch(req) {
    var _req$headers$get2;
    return !!((_req$headers$get2 = req.headers.get("content-type")) === null || _req$headers$get2 === void 0 ? void 0 : _req$headers$get2.startsWith("multipart/form-data"));
  },
  async parse(opts) {
    const { req } = opts;
    if (req.method !== "POST") throw new TRPCError({
      code: "METHOD_NOT_SUPPORTED",
      message: "Only POST requests are supported for multipart/form-data requests"
    });
    const getInputs = memo(async () => {
      const fd = await req.formData();
      return fd;
    });
    const procedure = await getProcedureAtPath(opts.router, opts.path);
    return {
      accept: null,
      calls: [{
        batchIndex: 0,
        path: opts.path,
        getRawInput: getInputs.read,
        result: getInputs.result,
        procedure
      }],
      isBatchCall: false,
      type: "mutation",
      connectionParams: null,
      signal: req.signal,
      url: opts.url
    };
  }
};
var octetStreamContentTypeHandler = {
  isMatch(req) {
    var _req$headers$get3;
    return !!((_req$headers$get3 = req.headers.get("content-type")) === null || _req$headers$get3 === void 0 ? void 0 : _req$headers$get3.startsWith("application/octet-stream"));
  },
  async parse(opts) {
    const { req } = opts;
    if (req.method !== "POST") throw new TRPCError({
      code: "METHOD_NOT_SUPPORTED",
      message: "Only POST requests are supported for application/octet-stream requests"
    });
    const getInputs = memo(async () => {
      return req.body;
    });
    return {
      calls: [{
        batchIndex: 0,
        path: opts.path,
        getRawInput: getInputs.read,
        result: getInputs.result,
        procedure: await getProcedureAtPath(opts.router, opts.path)
      }],
      isBatchCall: false,
      accept: null,
      type: "mutation",
      connectionParams: null,
      signal: req.signal,
      url: opts.url
    };
  }
};
var handlers = [
  jsonContentTypeHandler,
  formDataContentTypeHandler,
  octetStreamContentTypeHandler
];
function getContentTypeHandler(req) {
  const handler = handlers.find((handler$1) => handler$1.isMatch(req));
  if (handler) return handler;
  if (!handler && req.method === "GET") return jsonContentTypeHandler;
  throw new TRPCError({
    code: "UNSUPPORTED_MEDIA_TYPE",
    message: req.headers.has("content-type") ? `Unsupported content-type "${req.headers.get("content-type")}` : "Missing content-type header"
  });
}
async function getRequestInfo(opts) {
  const handler = getContentTypeHandler(opts.req);
  return await handler.parse(opts);
}
function isAbortError(error) {
  return isObject(error) && error["name"] === "AbortError";
}
function throwAbortError(message = "AbortError") {
  throw new DOMException(message, "AbortError");
}
function isObject$1(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function isPlainObject(o) {
  var ctor, prot;
  if (isObject$1(o) === false) return false;
  ctor = o.constructor;
  if (ctor === void 0) return true;
  prot = ctor.prototype;
  if (isObject$1(prot) === false) return false;
  if (prot.hasOwnProperty("isPrototypeOf") === false) return false;
  return true;
}
var import_defineProperty2 = __toESM(require_defineProperty(), 1);
var _Symbol$toStringTag;
var subscribableCache = /* @__PURE__ */ new WeakMap();
var NOOP = () => {
};
_Symbol$toStringTag = Symbol.toStringTag;
var Unpromise = class Unpromise2 {
  constructor(arg) {
    (0, import_defineProperty2.default)(this, "promise", void 0);
    (0, import_defineProperty2.default)(this, "subscribers", []);
    (0, import_defineProperty2.default)(this, "settlement", null);
    (0, import_defineProperty2.default)(this, _Symbol$toStringTag, "Unpromise");
    if (typeof arg === "function") this.promise = new Promise(arg);
    else this.promise = arg;
    const thenReturn = this.promise.then((value) => {
      const { subscribers } = this;
      this.subscribers = null;
      this.settlement = {
        status: "fulfilled",
        value
      };
      subscribers === null || subscribers === void 0 || subscribers.forEach(({ resolve }) => {
        resolve(value);
      });
    });
    if ("catch" in thenReturn) thenReturn.catch((reason) => {
      const { subscribers } = this;
      this.subscribers = null;
      this.settlement = {
        status: "rejected",
        reason
      };
      subscribers === null || subscribers === void 0 || subscribers.forEach(({ reject }) => {
        reject(reason);
      });
    });
  }
  /** Create a promise that mitigates uncontrolled subscription to a long-lived
  * Promise via .then() and .catch() - otherwise a source of memory leaks.
  *
  * The returned promise has an `unsubscribe()` method which can be called when
  * the Promise is no longer being tracked by application logic, and which
  * ensures that there is no reference chain from the original promise to the
  * new one, and therefore no memory leak.
  *
  * If original promise has not yet settled, this adds a new unique promise
  * that listens to then/catch events, along with an `unsubscribe()` method to
  * detach it.
  *
  * If original promise has settled, then creates a new Promise.resolve() or
  * Promise.reject() and provided unsubscribe is a noop.
  *
  * If you call `unsubscribe()` before the returned Promise has settled, it
  * will never settle.
  */
  subscribe() {
    let promise;
    let unsubscribe;
    const { settlement } = this;
    if (settlement === null) {
      if (this.subscribers === null) throw new Error("Unpromise settled but still has subscribers");
      const subscriber = withResolvers();
      this.subscribers = listWithMember(this.subscribers, subscriber);
      promise = subscriber.promise;
      unsubscribe = () => {
        if (this.subscribers !== null) this.subscribers = listWithoutMember(this.subscribers, subscriber);
      };
    } else {
      const { status } = settlement;
      if (status === "fulfilled") promise = Promise.resolve(settlement.value);
      else promise = Promise.reject(settlement.reason);
      unsubscribe = NOOP;
    }
    return Object.assign(promise, { unsubscribe });
  }
  /** STANDARD PROMISE METHODS (but returning a SubscribedPromise) */
  then(onfulfilled, onrejected) {
    const subscribed = this.subscribe();
    const { unsubscribe } = subscribed;
    return Object.assign(subscribed.then(onfulfilled, onrejected), { unsubscribe });
  }
  catch(onrejected) {
    const subscribed = this.subscribe();
    const { unsubscribe } = subscribed;
    return Object.assign(subscribed.catch(onrejected), { unsubscribe });
  }
  finally(onfinally) {
    const subscribed = this.subscribe();
    const { unsubscribe } = subscribed;
    return Object.assign(subscribed.finally(onfinally), { unsubscribe });
  }
  /** Unpromise STATIC METHODS */
  /** Create or Retrieve the proxy Unpromise (a re-used Unpromise for the VM lifetime
  * of the provided Promise reference) */
  static proxy(promise) {
    const cached = Unpromise2.getSubscribablePromise(promise);
    return typeof cached !== "undefined" ? cached : Unpromise2.createSubscribablePromise(promise);
  }
  /** Create and store an Unpromise keyed by an original Promise. */
  static createSubscribablePromise(promise) {
    const created = new Unpromise2(promise);
    subscribableCache.set(promise, created);
    subscribableCache.set(created, created);
    return created;
  }
  /** Retrieve a previously-created Unpromise keyed by an original Promise. */
  static getSubscribablePromise(promise) {
    return subscribableCache.get(promise);
  }
  /** Promise STATIC METHODS */
  /** Lookup the Unpromise for this promise, and derive a SubscribedPromise from
  * it (that can be later unsubscribed to eliminate Memory leaks) */
  static resolve(value) {
    const promise = typeof value === "object" && value !== null && "then" in value && typeof value.then === "function" ? value : Promise.resolve(value);
    return Unpromise2.proxy(promise).subscribe();
  }
  static async any(values) {
    const valuesArray = Array.isArray(values) ? values : [...values];
    const subscribedPromises = valuesArray.map(Unpromise2.resolve);
    try {
      return await Promise.any(subscribedPromises);
    } finally {
      subscribedPromises.forEach(({ unsubscribe }) => {
        unsubscribe();
      });
    }
  }
  static async race(values) {
    const valuesArray = Array.isArray(values) ? values : [...values];
    const subscribedPromises = valuesArray.map(Unpromise2.resolve);
    try {
      return await Promise.race(subscribedPromises);
    } finally {
      subscribedPromises.forEach(({ unsubscribe }) => {
        unsubscribe();
      });
    }
  }
  /** Create a race of SubscribedPromises that will fulfil to a single winning
  * Promise (in a 1-Tuple). Eliminates memory leaks from long-lived promises
  * accumulating .then() and .catch() subscribers. Allows simple logic to
  * consume the result, like...
  * ```ts
  * const [ winner ] = await Unpromise.race([ promiseA, promiseB ]);
  * if(winner === promiseB){
  *   const result = await promiseB;
  *   // do the thing
  * }
  * ```
  * */
  static async raceReferences(promises) {
    const selfPromises = promises.map(resolveSelfTuple);
    try {
      return await Promise.race(selfPromises);
    } finally {
      for (const promise of selfPromises) promise.unsubscribe();
    }
  }
};
function resolveSelfTuple(promise) {
  return Unpromise.proxy(promise).then(() => [promise]);
}
function withResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise,
    resolve,
    reject
  };
}
function listWithMember(arr, member) {
  return [...arr, member];
}
function listWithoutIndex(arr, index2) {
  return [...arr.slice(0, index2), ...arr.slice(index2 + 1)];
}
function listWithoutMember(arr, member) {
  const index2 = arr.indexOf(member);
  if (index2 !== -1) return listWithoutIndex(arr, index2);
  return arr;
}
var _Symbol;
var _Symbol$dispose;
var _Symbol2;
var _Symbol2$asyncDispose;
(_Symbol$dispose = (_Symbol = Symbol).dispose) !== null && _Symbol$dispose !== void 0 || (_Symbol.dispose = /* @__PURE__ */ Symbol());
(_Symbol2$asyncDispose = (_Symbol2 = Symbol).asyncDispose) !== null && _Symbol2$asyncDispose !== void 0 || (_Symbol2.asyncDispose = /* @__PURE__ */ Symbol());
function makeResource(thing, dispose) {
  const it = thing;
  const existing = it[Symbol.dispose];
  it[Symbol.dispose] = () => {
    dispose();
    existing === null || existing === void 0 || existing();
  };
  return it;
}
function makeAsyncResource(thing, dispose) {
  const it = thing;
  const existing = it[Symbol.asyncDispose];
  it[Symbol.asyncDispose] = async () => {
    await dispose();
    await (existing === null || existing === void 0 ? void 0 : existing());
  };
  return it;
}
var disposablePromiseTimerResult = /* @__PURE__ */ Symbol();
function timerResource(ms) {
  let timer = null;
  return makeResource({ start() {
    if (timer) throw new Error("Timer already started");
    const promise = new Promise((resolve) => {
      timer = setTimeout(() => resolve(disposablePromiseTimerResult), ms);
    });
    return promise;
  } }, () => {
    if (timer) clearTimeout(timer);
  });
}
var require_usingCtx = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/usingCtx.js"(exports, module) {
  function _usingCtx() {
    var r = "function" == typeof SuppressedError ? SuppressedError : function(r$1, e$1) {
      var n$1 = Error();
      return n$1.name = "SuppressedError", n$1.error = r$1, n$1.suppressed = e$1, n$1;
    }, e = {}, n = [];
    function using(r$1, e$1) {
      if (null != e$1) {
        if (Object(e$1) !== e$1) throw new TypeError("using declarations can only be used with objects, functions, null, or undefined.");
        if (r$1) var o = e$1[Symbol.asyncDispose || Symbol["for"]("Symbol.asyncDispose")];
        if (void 0 === o && (o = e$1[Symbol.dispose || Symbol["for"]("Symbol.dispose")], r$1)) var t2 = o;
        if ("function" != typeof o) throw new TypeError("Object is not disposable.");
        t2 && (o = function o$1() {
          try {
            t2.call(e$1);
          } catch (r$2) {
            return Promise.reject(r$2);
          }
        }), n.push({
          v: e$1,
          d: o,
          a: r$1
        });
      } else r$1 && n.push({
        d: e$1,
        a: r$1
      });
      return e$1;
    }
    return {
      e,
      u: using.bind(null, false),
      a: using.bind(null, true),
      d: function d() {
        var o, t2 = this.e, s = 0;
        function next() {
          for (; o = n.pop(); ) try {
            if (!o.a && 1 === s) return s = 0, n.push(o), Promise.resolve().then(next);
            if (o.d) {
              var r$1 = o.d.call(o.v);
              if (o.a) return s |= 2, Promise.resolve(r$1).then(next, err);
            } else s |= 1;
          } catch (r$2) {
            return err(r$2);
          }
          if (1 === s) return t2 !== e ? Promise.reject(t2) : Promise.resolve();
          if (t2 !== e) throw t2;
        }
        function err(n$1) {
          return t2 = t2 !== e ? new r(n$1, t2) : n$1, next();
        }
        return next();
      }
    };
  }
  module.exports = _usingCtx, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_OverloadYield = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/OverloadYield.js"(exports, module) {
  function _OverloadYield(e, d) {
    this.v = e, this.k = d;
  }
  module.exports = _OverloadYield, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_awaitAsyncGenerator = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/awaitAsyncGenerator.js"(exports, module) {
  var OverloadYield$2 = require_OverloadYield();
  function _awaitAsyncGenerator$5(e) {
    return new OverloadYield$2(e, 0);
  }
  module.exports = _awaitAsyncGenerator$5, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var require_wrapAsyncGenerator = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/wrapAsyncGenerator.js"(exports, module) {
  var OverloadYield$1 = require_OverloadYield();
  function _wrapAsyncGenerator$6(e) {
    return function() {
      return new AsyncGenerator(e.apply(this, arguments));
    };
  }
  function AsyncGenerator(e) {
    var r, t2;
    function resume(r$1, t$1) {
      try {
        var n = e[r$1](t$1), o = n.value, u = o instanceof OverloadYield$1;
        Promise.resolve(u ? o.v : o).then(function(t$2) {
          if (u) {
            var i = "return" === r$1 ? "return" : "next";
            if (!o.k || t$2.done) return resume(i, t$2);
            t$2 = e[i](t$2).value;
          }
          settle(n.done ? "return" : "normal", t$2);
        }, function(e$1) {
          resume("throw", e$1);
        });
      } catch (e$1) {
        settle("throw", e$1);
      }
    }
    function settle(e$1, n) {
      switch (e$1) {
        case "return":
          r.resolve({
            value: n,
            done: true
          });
          break;
        case "throw":
          r.reject(n);
          break;
        default:
          r.resolve({
            value: n,
            done: false
          });
      }
      (r = r.next) ? resume(r.key, r.arg) : t2 = null;
    }
    this._invoke = function(e$1, n) {
      return new Promise(function(o, u) {
        var i = {
          key: e$1,
          arg: n,
          resolve: o,
          reject: u,
          next: null
        };
        t2 ? t2 = t2.next = i : (r = t2 = i, resume(e$1, n));
      });
    }, "function" != typeof e["return"] && (this["return"] = void 0);
  }
  AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
    return this;
  }, AsyncGenerator.prototype.next = function(e) {
    return this._invoke("next", e);
  }, AsyncGenerator.prototype["throw"] = function(e) {
    return this._invoke("throw", e);
  }, AsyncGenerator.prototype["return"] = function(e) {
    return this._invoke("return", e);
  };
  module.exports = _wrapAsyncGenerator$6, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var import_usingCtx$4 = __toESM(require_usingCtx(), 1);
var import_awaitAsyncGenerator$4 = __toESM(require_awaitAsyncGenerator(), 1);
var import_wrapAsyncGenerator$5 = __toESM(require_wrapAsyncGenerator(), 1);
function iteratorResource(iterable) {
  const iterator = iterable[Symbol.asyncIterator]();
  if (iterator[Symbol.asyncDispose]) return iterator;
  return makeAsyncResource(iterator, async () => {
    var _iterator$return;
    await ((_iterator$return = iterator.return) === null || _iterator$return === void 0 ? void 0 : _iterator$return.call(iterator));
  });
}
function takeWithGrace(_x, _x2) {
  return _takeWithGrace.apply(this, arguments);
}
function _takeWithGrace() {
  _takeWithGrace = (0, import_wrapAsyncGenerator$5.default)(function* (iterable, opts) {
    try {
      var _usingCtx$1 = (0, import_usingCtx$4.default)();
      const iterator = _usingCtx$1.a(iteratorResource(iterable));
      let result;
      const timer = _usingCtx$1.u(timerResource(opts.gracePeriodMs));
      let count = opts.count;
      let timerPromise = new Promise(() => {
      });
      while (true) {
        result = yield (0, import_awaitAsyncGenerator$4.default)(Unpromise.race([iterator.next(), timerPromise]));
        if (result === disposablePromiseTimerResult) throwAbortError();
        if (result.done) return result.value;
        yield result.value;
        if (--count === 0) timerPromise = timer.start();
        result = null;
      }
    } catch (_) {
      _usingCtx$1.e = _;
    } finally {
      yield (0, import_awaitAsyncGenerator$4.default)(_usingCtx$1.d());
    }
  });
  return _takeWithGrace.apply(this, arguments);
}
function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject
  };
}
var import_usingCtx$3 = __toESM(require_usingCtx(), 1);
var import_awaitAsyncGenerator$3 = __toESM(require_awaitAsyncGenerator(), 1);
var import_wrapAsyncGenerator$4 = __toESM(require_wrapAsyncGenerator(), 1);
function createManagedIterator(iterable, onResult) {
  const iterator = iterable[Symbol.asyncIterator]();
  let state = "idle";
  function cleanup() {
    state = "done";
    onResult = () => {
    };
  }
  function pull() {
    if (state !== "idle") return;
    state = "pending";
    const next = iterator.next();
    next.then((result) => {
      if (result.done) {
        state = "done";
        onResult({
          status: "return",
          value: result.value
        });
        cleanup();
        return;
      }
      state = "idle";
      onResult({
        status: "yield",
        value: result.value
      });
    }).catch((cause) => {
      onResult({
        status: "error",
        error: cause
      });
      cleanup();
    });
  }
  return {
    pull,
    destroy: async () => {
      var _iterator$return;
      cleanup();
      await ((_iterator$return = iterator.return) === null || _iterator$return === void 0 ? void 0 : _iterator$return.call(iterator));
    }
  };
}
function mergeAsyncIterables() {
  let state = "idle";
  let flushSignal = createDeferred();
  const iterables = [];
  const iterators = /* @__PURE__ */ new Set();
  const buffer = [];
  function initIterable(iterable) {
    if (state !== "pending") return;
    const iterator = createManagedIterator(iterable, (result) => {
      if (state !== "pending") return;
      switch (result.status) {
        case "yield":
          buffer.push([iterator, result]);
          break;
        case "return":
          iterators.delete(iterator);
          break;
        case "error":
          buffer.push([iterator, result]);
          iterators.delete(iterator);
          break;
      }
      flushSignal.resolve();
    });
    iterators.add(iterator);
    iterator.pull();
  }
  return {
    add(iterable) {
      switch (state) {
        case "idle":
          iterables.push(iterable);
          break;
        case "pending":
          initIterable(iterable);
          break;
        case "done":
          break;
      }
    },
    [Symbol.asyncIterator]() {
      return (0, import_wrapAsyncGenerator$4.default)(function* () {
        try {
          var _usingCtx$1 = (0, import_usingCtx$3.default)();
          if (state !== "idle") throw new Error("Cannot iterate twice");
          state = "pending";
          const _finally = _usingCtx$1.a(makeAsyncResource({}, async () => {
            state = "done";
            const errors = [];
            await Promise.all(Array.from(iterators.values()).map(async (it) => {
              try {
                await it.destroy();
              } catch (cause) {
                errors.push(cause);
              }
            }));
            buffer.length = 0;
            iterators.clear();
            flushSignal.resolve();
            if (errors.length > 0) throw new AggregateError(errors);
          }));
          while (iterables.length > 0) initIterable(iterables.shift());
          while (iterators.size > 0) {
            yield (0, import_awaitAsyncGenerator$3.default)(flushSignal.promise);
            while (buffer.length > 0) {
              const [iterator, result] = buffer.shift();
              switch (result.status) {
                case "yield":
                  yield result.value;
                  iterator.pull();
                  break;
                case "error":
                  throw result.error;
              }
            }
            flushSignal = createDeferred();
          }
        } catch (_) {
          _usingCtx$1.e = _;
        } finally {
          yield (0, import_awaitAsyncGenerator$3.default)(_usingCtx$1.d());
        }
      })();
    }
  };
}
function readableStreamFrom(iterable) {
  const iterator = iterable[Symbol.asyncIterator]();
  return new ReadableStream({
    async cancel() {
      var _iterator$return;
      await ((_iterator$return = iterator.return) === null || _iterator$return === void 0 ? void 0 : _iterator$return.call(iterator));
    },
    async pull(controller) {
      const result = await iterator.next();
      if (result.done) {
        controller.close();
        return;
      }
      controller.enqueue(result.value);
    }
  });
}
var import_usingCtx$2 = __toESM(require_usingCtx(), 1);
var import_awaitAsyncGenerator$2 = __toESM(require_awaitAsyncGenerator(), 1);
var import_wrapAsyncGenerator$3 = __toESM(require_wrapAsyncGenerator(), 1);
var PING_SYM = /* @__PURE__ */ Symbol("ping");
function withPing(_x, _x2) {
  return _withPing.apply(this, arguments);
}
function _withPing() {
  _withPing = (0, import_wrapAsyncGenerator$3.default)(function* (iterable, pingIntervalMs) {
    try {
      var _usingCtx$1 = (0, import_usingCtx$2.default)();
      const iterator = _usingCtx$1.a(iteratorResource(iterable));
      let result;
      let nextPromise = iterator.next();
      while (true) try {
        var _usingCtx3 = (0, import_usingCtx$2.default)();
        const pingPromise = _usingCtx3.u(timerResource(pingIntervalMs));
        result = yield (0, import_awaitAsyncGenerator$2.default)(Unpromise.race([nextPromise, pingPromise.start()]));
        if (result === disposablePromiseTimerResult) {
          yield PING_SYM;
          continue;
        }
        if (result.done) return result.value;
        nextPromise = iterator.next();
        yield result.value;
        result = null;
      } catch (_) {
        _usingCtx3.e = _;
      } finally {
        _usingCtx3.d();
      }
    } catch (_) {
      _usingCtx$1.e = _;
    } finally {
      yield (0, import_awaitAsyncGenerator$2.default)(_usingCtx$1.d());
    }
  });
  return _withPing.apply(this, arguments);
}
var require_asyncIterator = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/asyncIterator.js"(exports, module) {
  function _asyncIterator$2(r) {
    var n, t2, o, e = 2;
    for ("undefined" != typeof Symbol && (t2 = Symbol.asyncIterator, o = Symbol.iterator); e--; ) {
      if (t2 && null != (n = r[t2])) return n.call(r);
      if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r));
      t2 = "@@asyncIterator", o = "@@iterator";
    }
    throw new TypeError("Object is not async iterable");
  }
  function AsyncFromSyncIterator(r) {
    function AsyncFromSyncIteratorContinuation(r$1) {
      if (Object(r$1) !== r$1) return Promise.reject(new TypeError(r$1 + " is not an object."));
      var n = r$1.done;
      return Promise.resolve(r$1.value).then(function(r$2) {
        return {
          value: r$2,
          done: n
        };
      });
    }
    return AsyncFromSyncIterator = function AsyncFromSyncIterator$1(r$1) {
      this.s = r$1, this.n = r$1.next;
    }, AsyncFromSyncIterator.prototype = {
      s: null,
      n: null,
      next: function next() {
        return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
      },
      "return": function _return(r$1) {
        var n = this.s["return"];
        return void 0 === n ? Promise.resolve({
          value: r$1,
          done: true
        }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments));
      },
      "throw": function _throw(r$1) {
        var n = this.s["return"];
        return void 0 === n ? Promise.reject(r$1) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments));
      }
    }, new AsyncFromSyncIterator(r);
  }
  module.exports = _asyncIterator$2, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var import_awaitAsyncGenerator$1 = __toESM(require_awaitAsyncGenerator(), 1);
var import_wrapAsyncGenerator$2 = __toESM(require_wrapAsyncGenerator(), 1);
var import_usingCtx$1 = __toESM(require_usingCtx(), 1);
var import_asyncIterator$1 = __toESM(require_asyncIterator(), 1);
var CHUNK_VALUE_TYPE_PROMISE = 0;
var CHUNK_VALUE_TYPE_ASYNC_ITERABLE = 1;
var PROMISE_STATUS_FULFILLED = 0;
var PROMISE_STATUS_REJECTED = 1;
var ASYNC_ITERABLE_STATUS_RETURN = 0;
var ASYNC_ITERABLE_STATUS_YIELD = 1;
var ASYNC_ITERABLE_STATUS_ERROR = 2;
function isPromise(value) {
  return (isObject(value) || isFunction(value)) && typeof (value === null || value === void 0 ? void 0 : value["then"]) === "function" && typeof (value === null || value === void 0 ? void 0 : value["catch"]) === "function";
}
var MaxDepthError = class extends Error {
  constructor(path) {
    super("Max depth reached at path: " + path.join("."));
    this.path = path;
  }
};
function createBatchStreamProducer(_x3) {
  return _createBatchStreamProducer.apply(this, arguments);
}
function _createBatchStreamProducer() {
  _createBatchStreamProducer = (0, import_wrapAsyncGenerator$2.default)(function* (opts) {
    const { data } = opts;
    let counter = 0;
    const placeholder = 0;
    const mergedIterables = mergeAsyncIterables();
    function registerAsync(callback) {
      const idx = counter++;
      const iterable$1 = callback(idx);
      mergedIterables.add(iterable$1);
      return idx;
    }
    function encodePromise(promise, path) {
      return registerAsync(/* @__PURE__ */ (function() {
        var _ref = (0, import_wrapAsyncGenerator$2.default)(function* (idx) {
          const error = checkMaxDepth(path);
          if (error) {
            promise.catch((cause) => {
              var _opts$onError;
              (_opts$onError = opts.onError) === null || _opts$onError === void 0 || _opts$onError.call(opts, {
                error: cause,
                path
              });
            });
            promise = Promise.reject(error);
          }
          try {
            const next = yield (0, import_awaitAsyncGenerator$1.default)(promise);
            yield [
              idx,
              PROMISE_STATUS_FULFILLED,
              encode(next, path)
            ];
          } catch (cause) {
            var _opts$onError2, _opts$formatError;
            (_opts$onError2 = opts.onError) === null || _opts$onError2 === void 0 || _opts$onError2.call(opts, {
              error: cause,
              path
            });
            yield [
              idx,
              PROMISE_STATUS_REJECTED,
              (_opts$formatError = opts.formatError) === null || _opts$formatError === void 0 ? void 0 : _opts$formatError.call(opts, {
                error: cause,
                path
              })
            ];
          }
        });
        return function(_x) {
          return _ref.apply(this, arguments);
        };
      })());
    }
    function encodeAsyncIterable(iterable$1, path) {
      return registerAsync(/* @__PURE__ */ (function() {
        var _ref2 = (0, import_wrapAsyncGenerator$2.default)(function* (idx) {
          try {
            var _usingCtx$1 = (0, import_usingCtx$1.default)();
            const error = checkMaxDepth(path);
            if (error) throw error;
            const iterator = _usingCtx$1.a(iteratorResource(iterable$1));
            try {
              while (true) {
                const next = yield (0, import_awaitAsyncGenerator$1.default)(iterator.next());
                if (next.done) {
                  yield [
                    idx,
                    ASYNC_ITERABLE_STATUS_RETURN,
                    encode(next.value, path)
                  ];
                  break;
                }
                yield [
                  idx,
                  ASYNC_ITERABLE_STATUS_YIELD,
                  encode(next.value, path)
                ];
              }
            } catch (cause) {
              var _opts$onError3, _opts$formatError2;
              (_opts$onError3 = opts.onError) === null || _opts$onError3 === void 0 || _opts$onError3.call(opts, {
                error: cause,
                path
              });
              yield [
                idx,
                ASYNC_ITERABLE_STATUS_ERROR,
                (_opts$formatError2 = opts.formatError) === null || _opts$formatError2 === void 0 ? void 0 : _opts$formatError2.call(opts, {
                  error: cause,
                  path
                })
              ];
            }
          } catch (_) {
            _usingCtx$1.e = _;
          } finally {
            yield (0, import_awaitAsyncGenerator$1.default)(_usingCtx$1.d());
          }
        });
        return function(_x2) {
          return _ref2.apply(this, arguments);
        };
      })());
    }
    function checkMaxDepth(path) {
      if (opts.maxDepth && path.length > opts.maxDepth) return new MaxDepthError(path);
      return null;
    }
    function encodeAsync(value, path) {
      if (isPromise(value)) return [CHUNK_VALUE_TYPE_PROMISE, encodePromise(value, path)];
      if (isAsyncIterable(value)) {
        if (opts.maxDepth && path.length >= opts.maxDepth) throw new Error("Max depth reached");
        return [CHUNK_VALUE_TYPE_ASYNC_ITERABLE, encodeAsyncIterable(value, path)];
      }
      return null;
    }
    function encode(value, path) {
      if (value === void 0) return [[]];
      const reg = encodeAsync(value, path);
      if (reg) return [[placeholder], [null, ...reg]];
      if (!isPlainObject(value)) return [[value]];
      const newObj = emptyObject();
      const asyncValues = [];
      for (const [key, item] of Object.entries(value)) {
        const transformed = encodeAsync(item, [...path, key]);
        if (!transformed) {
          newObj[key] = item;
          continue;
        }
        newObj[key] = placeholder;
        asyncValues.push([key, ...transformed]);
      }
      return [[newObj], ...asyncValues];
    }
    const newHead = emptyObject();
    for (const [key, item] of Object.entries(data)) newHead[key] = encode(item, [key]);
    yield newHead;
    let iterable = mergedIterables;
    if (opts.pingMs) iterable = withPing(mergedIterables, opts.pingMs);
    var _iteratorAbruptCompletion = false;
    var _didIteratorError = false;
    var _iteratorError;
    try {
      for (var _iterator = (0, import_asyncIterator$1.default)(iterable), _step; _iteratorAbruptCompletion = !(_step = yield (0, import_awaitAsyncGenerator$1.default)(_iterator.next())).done; _iteratorAbruptCompletion = false) {
        const value = _step.value;
        yield value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion && _iterator.return != null) yield (0, import_awaitAsyncGenerator$1.default)(_iterator.return());
      } finally {
        if (_didIteratorError) throw _iteratorError;
      }
    }
  });
  return _createBatchStreamProducer.apply(this, arguments);
}
function jsonlStreamProducer(opts) {
  let stream = readableStreamFrom(createBatchStreamProducer(opts));
  const { serialize: serialize2 } = opts;
  if (serialize2) stream = stream.pipeThrough(new TransformStream({ transform(chunk, controller) {
    if (chunk === PING_SYM) controller.enqueue(PING_SYM);
    else controller.enqueue(serialize2(chunk));
  } }));
  return stream.pipeThrough(new TransformStream({ transform(chunk, controller) {
    if (chunk === PING_SYM) controller.enqueue(" ");
    else controller.enqueue(JSON.stringify(chunk) + "\n");
  } })).pipeThrough(new TextEncoderStream());
}
var require_asyncGeneratorDelegate = __commonJS({ "../../node_modules/.pnpm/@oxc-project+runtime@0.72.2/node_modules/@oxc-project/runtime/src/helpers/asyncGeneratorDelegate.js"(exports, module) {
  var OverloadYield = require_OverloadYield();
  function _asyncGeneratorDelegate$1(t2) {
    var e = {}, n = false;
    function pump(e$1, r) {
      return n = true, r = new Promise(function(n$1) {
        n$1(t2[e$1](r));
      }), {
        done: false,
        value: new OverloadYield(r, 1)
      };
    }
    return e["undefined" != typeof Symbol && Symbol.iterator || "@@iterator"] = function() {
      return this;
    }, e.next = function(t$1) {
      return n ? (n = false, t$1) : pump("next", t$1);
    }, "function" == typeof t2["throw"] && (e["throw"] = function(t$1) {
      if (n) throw n = false, t$1;
      return pump("throw", t$1);
    }), "function" == typeof t2["return"] && (e["return"] = function(t$1) {
      return n ? (n = false, t$1) : pump("return", t$1);
    }), e;
  }
  module.exports = _asyncGeneratorDelegate$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
} });
var import_asyncIterator = __toESM(require_asyncIterator(), 1);
var import_awaitAsyncGenerator = __toESM(require_awaitAsyncGenerator(), 1);
var import_wrapAsyncGenerator$1 = __toESM(require_wrapAsyncGenerator(), 1);
var import_asyncGeneratorDelegate = __toESM(require_asyncGeneratorDelegate(), 1);
var import_usingCtx = __toESM(require_usingCtx(), 1);
var PING_EVENT = "ping";
var SERIALIZED_ERROR_EVENT = "serialized-error";
var CONNECTED_EVENT = "connected";
var RETURN_EVENT = "return";
function sseStreamProducer(opts) {
  var _opts$ping$enabled, _opts$ping, _opts$ping$intervalMs, _opts$ping2, _opts$client;
  const { serialize: serialize2 = identity } = opts;
  const ping = {
    enabled: (_opts$ping$enabled = (_opts$ping = opts.ping) === null || _opts$ping === void 0 ? void 0 : _opts$ping.enabled) !== null && _opts$ping$enabled !== void 0 ? _opts$ping$enabled : false,
    intervalMs: (_opts$ping$intervalMs = (_opts$ping2 = opts.ping) === null || _opts$ping2 === void 0 ? void 0 : _opts$ping2.intervalMs) !== null && _opts$ping$intervalMs !== void 0 ? _opts$ping$intervalMs : 1e3
  };
  const client = (_opts$client = opts.client) !== null && _opts$client !== void 0 ? _opts$client : {};
  if (ping.enabled && client.reconnectAfterInactivityMs && ping.intervalMs > client.reconnectAfterInactivityMs) throw new Error(`Ping interval must be less than client reconnect interval to prevent unnecessary reconnection - ping.intervalMs: ${ping.intervalMs} client.reconnectAfterInactivityMs: ${client.reconnectAfterInactivityMs}`);
  function generator() {
    return _generator.apply(this, arguments);
  }
  function _generator() {
    _generator = (0, import_wrapAsyncGenerator$1.default)(function* () {
      yield {
        event: CONNECTED_EVENT,
        data: JSON.stringify(client)
      };
      let iterable = opts.data;
      if (opts.emitAndEndImmediately) iterable = takeWithGrace(iterable, {
        count: 1,
        gracePeriodMs: 1
      });
      if (ping.enabled && ping.intervalMs !== Infinity && ping.intervalMs > 0) iterable = withPing(iterable, ping.intervalMs);
      let value;
      let chunk;
      var _iteratorAbruptCompletion = false;
      var _didIteratorError = false;
      var _iteratorError;
      try {
        for (var _iterator = (0, import_asyncIterator.default)(iterable), _step; _iteratorAbruptCompletion = !(_step = yield (0, import_awaitAsyncGenerator.default)(_iterator.next())).done; _iteratorAbruptCompletion = false) {
          value = _step.value;
          {
            if (value === PING_SYM) {
              yield {
                event: PING_EVENT,
                data: ""
              };
              continue;
            }
            chunk = isTrackedEnvelope(value) ? {
              id: value[0],
              data: value[1]
            } : { data: value };
            chunk.data = JSON.stringify(serialize2(chunk.data));
            yield chunk;
            value = null;
            chunk = null;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (_iteratorAbruptCompletion && _iterator.return != null) yield (0, import_awaitAsyncGenerator.default)(_iterator.return());
        } finally {
          if (_didIteratorError) throw _iteratorError;
        }
      }
    });
    return _generator.apply(this, arguments);
  }
  function generatorWithErrorHandling() {
    return _generatorWithErrorHandling.apply(this, arguments);
  }
  function _generatorWithErrorHandling() {
    _generatorWithErrorHandling = (0, import_wrapAsyncGenerator$1.default)(function* () {
      try {
        yield* (0, import_asyncGeneratorDelegate.default)((0, import_asyncIterator.default)(generator()));
        yield {
          event: RETURN_EVENT,
          data: ""
        };
      } catch (cause) {
        var _opts$formatError, _opts$formatError2;
        if (isAbortError(cause)) return;
        const error = getTRPCErrorFromUnknown(cause);
        const data = (_opts$formatError = (_opts$formatError2 = opts.formatError) === null || _opts$formatError2 === void 0 ? void 0 : _opts$formatError2.call(opts, { error })) !== null && _opts$formatError !== void 0 ? _opts$formatError : null;
        yield {
          event: SERIALIZED_ERROR_EVENT,
          data: JSON.stringify(serialize2(data))
        };
      }
    });
    return _generatorWithErrorHandling.apply(this, arguments);
  }
  const stream = readableStreamFrom(generatorWithErrorHandling());
  return stream.pipeThrough(new TransformStream({ transform(chunk, controller) {
    if ("event" in chunk) controller.enqueue(`event: ${chunk.event}
`);
    if ("data" in chunk) controller.enqueue(`data: ${chunk.data}
`);
    if ("id" in chunk) controller.enqueue(`id: ${chunk.id}
`);
    if ("comment" in chunk) controller.enqueue(`: ${chunk.comment}
`);
    controller.enqueue("\n\n");
  } })).pipeThrough(new TextEncoderStream());
}
var sseHeaders = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  "X-Accel-Buffering": "no",
  Connection: "keep-alive"
};
var import_wrapAsyncGenerator = __toESM(require_wrapAsyncGenerator(), 1);
var import_objectSpread23 = __toESM(require_objectSpread2(), 1);
function errorToAsyncIterable(err) {
  return run((0, import_wrapAsyncGenerator.default)(function* () {
    throw err;
  }));
}
function combinedAbortController(signal) {
  const controller = new AbortController();
  const combinedSignal = abortSignalsAnyPonyfill([signal, controller.signal]);
  return {
    signal: combinedSignal,
    controller
  };
}
var TYPE_ACCEPTED_METHOD_MAP = {
  mutation: ["POST"],
  query: ["GET"],
  subscription: ["GET"]
};
var TYPE_ACCEPTED_METHOD_MAP_WITH_METHOD_OVERRIDE = {
  mutation: ["POST"],
  query: ["GET", "POST"],
  subscription: ["GET", "POST"]
};
function initResponse(initOpts) {
  var _responseMeta, _info$calls$find$proc, _info$calls$find;
  const { ctx, info, responseMeta, untransformedJSON, errors = [], headers } = initOpts;
  let status = untransformedJSON ? getHTTPStatusCode(untransformedJSON) : 200;
  const eagerGeneration = !untransformedJSON;
  const data = eagerGeneration ? [] : Array.isArray(untransformedJSON) ? untransformedJSON : [untransformedJSON];
  const meta = (_responseMeta = responseMeta === null || responseMeta === void 0 ? void 0 : responseMeta({
    ctx,
    info,
    paths: info === null || info === void 0 ? void 0 : info.calls.map((call) => call.path),
    data,
    errors,
    eagerGeneration,
    type: (_info$calls$find$proc = info === null || info === void 0 || (_info$calls$find = info.calls.find((call) => {
      var _call$procedure;
      return (_call$procedure = call.procedure) === null || _call$procedure === void 0 ? void 0 : _call$procedure._def.type;
    })) === null || _info$calls$find === void 0 || (_info$calls$find = _info$calls$find.procedure) === null || _info$calls$find === void 0 ? void 0 : _info$calls$find._def.type) !== null && _info$calls$find$proc !== void 0 ? _info$calls$find$proc : "unknown"
  })) !== null && _responseMeta !== void 0 ? _responseMeta : {};
  if (meta.headers) {
    if (meta.headers instanceof Headers) for (const [key, value] of meta.headers.entries()) headers.append(key, value);
    else
      for (const [key, value] of Object.entries(meta.headers)) if (Array.isArray(value)) for (const v of value) headers.append(key, v);
      else if (typeof value === "string") headers.set(key, value);
  }
  if (meta.status) status = meta.status;
  return { status };
}
function caughtErrorToData(cause, errorOpts) {
  const { router, req, onError } = errorOpts.opts;
  const error = getTRPCErrorFromUnknown(cause);
  onError === null || onError === void 0 || onError({
    error,
    path: errorOpts.path,
    input: errorOpts.input,
    ctx: errorOpts.ctx,
    type: errorOpts.type,
    req
  });
  const untransformedJSON = { error: getErrorShape({
    config: router._def._config,
    error,
    type: errorOpts.type,
    path: errorOpts.path,
    input: errorOpts.input,
    ctx: errorOpts.ctx
  }) };
  const transformedJSON = transformTRPCResponse(router._def._config, untransformedJSON);
  const body = JSON.stringify(transformedJSON);
  return {
    error,
    untransformedJSON,
    body
  };
}
function isDataStream(v) {
  if (!isObject(v)) return false;
  if (isAsyncIterable(v)) return true;
  return Object.values(v).some(isPromise) || Object.values(v).some(isAsyncIterable);
}
async function resolveResponse(opts) {
  var _ref, _opts$allowBatching, _opts$batching, _opts$allowMethodOver, _config$sse$enabled, _config$sse;
  const { router, req } = opts;
  const headers = new Headers([["vary", "trpc-accept, accept"]]);
  const config2 = router._def._config;
  const url = new URL(req.url);
  if (req.method === "HEAD") return new Response(null, { status: 204 });
  const allowBatching = (_ref = (_opts$allowBatching = opts.allowBatching) !== null && _opts$allowBatching !== void 0 ? _opts$allowBatching : (_opts$batching = opts.batching) === null || _opts$batching === void 0 ? void 0 : _opts$batching.enabled) !== null && _ref !== void 0 ? _ref : true;
  const allowMethodOverride = ((_opts$allowMethodOver = opts.allowMethodOverride) !== null && _opts$allowMethodOver !== void 0 ? _opts$allowMethodOver : false) && req.method === "POST";
  const infoTuple = await run(async () => {
    try {
      return [void 0, await getRequestInfo({
        req,
        path: decodeURIComponent(opts.path),
        router,
        searchParams: url.searchParams,
        headers: opts.req.headers,
        url,
        maxBatchSize: opts.maxBatchSize
      })];
    } catch (cause) {
      return [getTRPCErrorFromUnknown(cause), void 0];
    }
  });
  const ctxManager = run(() => {
    let result = void 0;
    return {
      valueOrUndefined: () => {
        if (!result) return void 0;
        return result[1];
      },
      value: () => {
        const [err, ctx] = result;
        if (err) throw err;
        return ctx;
      },
      create: async (info) => {
        if (result) throw new Error("This should only be called once - report a bug in tRPC");
        try {
          const ctx = await opts.createContext({ info });
          result = [void 0, ctx];
        } catch (cause) {
          result = [getTRPCErrorFromUnknown(cause), void 0];
        }
      }
    };
  });
  const methodMapper = allowMethodOverride ? TYPE_ACCEPTED_METHOD_MAP_WITH_METHOD_OVERRIDE : TYPE_ACCEPTED_METHOD_MAP;
  const isStreamCall = getAcceptHeader(req.headers) === "application/jsonl";
  const experimentalSSE = (_config$sse$enabled = (_config$sse = config2.sse) === null || _config$sse === void 0 ? void 0 : _config$sse.enabled) !== null && _config$sse$enabled !== void 0 ? _config$sse$enabled : true;
  try {
    const [infoError, info] = infoTuple;
    if (infoError) throw infoError;
    if (info.isBatchCall && !allowBatching) throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Batching is not enabled on the server`
    });
    if (isStreamCall && !info.isBatchCall) throw new TRPCError({
      message: `Streaming requests must be batched (you can do a batch of 1)`,
      code: "BAD_REQUEST"
    });
    await ctxManager.create(info);
    const rpcCalls = info.calls.map(async (call) => {
      const proc = call.procedure;
      const combinedAbort = combinedAbortController(opts.req.signal);
      try {
        if (opts.error) throw opts.error;
        if (!proc) throw new TRPCError({
          code: "NOT_FOUND",
          message: `No procedure found on path "${call.path}"`
        });
        if (!methodMapper[proc._def.type].includes(req.method)) throw new TRPCError({
          code: "METHOD_NOT_SUPPORTED",
          message: `Unsupported ${req.method}-request to ${proc._def.type} procedure at path "${call.path}"`
        });
        if (proc._def.type === "subscription") {
          var _config$sse2;
          if (info.isBatchCall) throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot batch subscription calls`
          });
          if ((_config$sse2 = config2.sse) === null || _config$sse2 === void 0 ? void 0 : _config$sse2.maxDurationMs) {
            let cleanup = function() {
              clearTimeout(timer);
              combinedAbort.signal.removeEventListener("abort", cleanup);
              combinedAbort.controller.abort();
            };
            const timer = setTimeout(cleanup, config2.sse.maxDurationMs);
            combinedAbort.signal.addEventListener("abort", cleanup);
          }
        }
        const data = await proc({
          path: call.path,
          getRawInput: call.getRawInput,
          ctx: ctxManager.value(),
          type: proc._def.type,
          signal: combinedAbort.signal,
          batchIndex: call.batchIndex
        });
        return [void 0, {
          data,
          signal: proc._def.type === "subscription" ? combinedAbort.signal : void 0
        }];
      } catch (cause) {
        var _opts$onError, _call$procedure$_def$, _call$procedure2;
        const error = getTRPCErrorFromUnknown(cause);
        const input = call.result();
        (_opts$onError = opts.onError) === null || _opts$onError === void 0 || _opts$onError.call(opts, {
          error,
          path: call.path,
          input,
          ctx: ctxManager.valueOrUndefined(),
          type: (_call$procedure$_def$ = (_call$procedure2 = call.procedure) === null || _call$procedure2 === void 0 ? void 0 : _call$procedure2._def.type) !== null && _call$procedure$_def$ !== void 0 ? _call$procedure$_def$ : "unknown",
          req: opts.req
        });
        return [error, void 0];
      }
    });
    if (!info.isBatchCall) {
      const [call] = info.calls;
      const [error, result] = await rpcCalls[0];
      switch (info.type) {
        case "unknown":
        case "mutation":
        case "query": {
          headers.set("content-type", "application/json");
          if (isDataStream(result === null || result === void 0 ? void 0 : result.data)) throw new TRPCError({
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: "Cannot use stream-like response in non-streaming request - use httpBatchStreamLink"
          });
          const res = error ? { error: getErrorShape({
            config: config2,
            ctx: ctxManager.valueOrUndefined(),
            error,
            input: call.result(),
            path: call.path,
            type: info.type
          }) } : { result: { data: result.data } };
          const headResponse$1 = initResponse({
            ctx: ctxManager.valueOrUndefined(),
            info,
            responseMeta: opts.responseMeta,
            errors: error ? [error] : [],
            headers,
            untransformedJSON: [res]
          });
          return new Response(JSON.stringify(transformTRPCResponse(config2, res)), {
            status: headResponse$1.status,
            headers
          });
        }
        case "subscription": {
          const iterable = run(() => {
            if (error) return errorToAsyncIterable(error);
            if (!experimentalSSE) return errorToAsyncIterable(new TRPCError({
              code: "METHOD_NOT_SUPPORTED",
              message: 'Missing experimental flag "sseSubscriptions"'
            }));
            if (!isObservable(result.data) && !isAsyncIterable(result.data)) return errorToAsyncIterable(new TRPCError({
              message: `Subscription ${call.path} did not return an observable or a AsyncGenerator`,
              code: "INTERNAL_SERVER_ERROR"
            }));
            const dataAsIterable = isObservable(result.data) ? observableToAsyncIterable(result.data, opts.req.signal) : result.data;
            return dataAsIterable;
          });
          const stream = sseStreamProducer((0, import_objectSpread23.default)((0, import_objectSpread23.default)({}, config2.sse), {}, {
            data: iterable,
            serialize: (v) => config2.transformer.output.serialize(v),
            formatError(errorOpts) {
              var _call$procedure$_def$2, _call$procedure3, _opts$onError2;
              const error$1 = getTRPCErrorFromUnknown(errorOpts.error);
              const input = call === null || call === void 0 ? void 0 : call.result();
              const path = call === null || call === void 0 ? void 0 : call.path;
              const type = (_call$procedure$_def$2 = call === null || call === void 0 || (_call$procedure3 = call.procedure) === null || _call$procedure3 === void 0 ? void 0 : _call$procedure3._def.type) !== null && _call$procedure$_def$2 !== void 0 ? _call$procedure$_def$2 : "unknown";
              (_opts$onError2 = opts.onError) === null || _opts$onError2 === void 0 || _opts$onError2.call(opts, {
                error: error$1,
                path,
                input,
                ctx: ctxManager.valueOrUndefined(),
                req: opts.req,
                type
              });
              const shape = getErrorShape({
                config: config2,
                ctx: ctxManager.valueOrUndefined(),
                error: error$1,
                input,
                path,
                type
              });
              return shape;
            }
          }));
          for (const [key, value] of Object.entries(sseHeaders)) headers.set(key, value);
          const headResponse$1 = initResponse({
            ctx: ctxManager.valueOrUndefined(),
            info,
            responseMeta: opts.responseMeta,
            errors: [],
            headers,
            untransformedJSON: null
          });
          const abortSignal = result === null || result === void 0 ? void 0 : result.signal;
          let responseBody = stream;
          if (abortSignal) {
            const reader = stream.getReader();
            const onAbort = () => void reader.cancel();
            if (abortSignal.aborted) onAbort();
            else abortSignal.addEventListener("abort", onAbort, { once: true });
            responseBody = new ReadableStream({
              async pull(controller) {
                const chunk = await reader.read();
                if (chunk.done) {
                  abortSignal.removeEventListener("abort", onAbort);
                  controller.close();
                } else controller.enqueue(chunk.value);
              },
              cancel() {
                abortSignal.removeEventListener("abort", onAbort);
                return reader.cancel();
              }
            });
          }
          return new Response(responseBody, {
            headers,
            status: headResponse$1.status
          });
        }
      }
    }
    if (info.accept === "application/jsonl") {
      headers.set("content-type", "application/json");
      headers.set("transfer-encoding", "chunked");
      const headResponse$1 = initResponse({
        ctx: ctxManager.valueOrUndefined(),
        info,
        responseMeta: opts.responseMeta,
        errors: [],
        headers,
        untransformedJSON: null
      });
      const stream = jsonlStreamProducer((0, import_objectSpread23.default)((0, import_objectSpread23.default)({}, config2.jsonl), {}, {
        maxDepth: Infinity,
        data: rpcCalls.map(async (res, index2) => {
          const [error, result] = await res;
          const call = info.calls[index2];
          if (error) {
            var _procedure$_def$type, _procedure;
            return { error: getErrorShape({
              config: config2,
              ctx: ctxManager.valueOrUndefined(),
              error,
              input: call.result(),
              path: call.path,
              type: (_procedure$_def$type = (_procedure = call.procedure) === null || _procedure === void 0 ? void 0 : _procedure._def.type) !== null && _procedure$_def$type !== void 0 ? _procedure$_def$type : "unknown"
            }) };
          }
          const iterable = isObservable(result.data) ? observableToAsyncIterable(result.data, opts.req.signal) : Promise.resolve(result.data);
          return { result: Promise.resolve({ data: iterable }) };
        }),
        serialize: (data) => config2.transformer.output.serialize(data),
        onError: (cause) => {
          var _opts$onError3, _info$type;
          (_opts$onError3 = opts.onError) === null || _opts$onError3 === void 0 || _opts$onError3.call(opts, {
            error: getTRPCErrorFromUnknown(cause.error),
            path: void 0,
            input: void 0,
            ctx: ctxManager.valueOrUndefined(),
            req: opts.req,
            type: (_info$type = info === null || info === void 0 ? void 0 : info.type) !== null && _info$type !== void 0 ? _info$type : "unknown"
          });
        },
        formatError(errorOpts) {
          var _call$procedure$_def$3, _call$procedure4;
          const call = info === null || info === void 0 ? void 0 : info.calls[errorOpts.path[0]];
          const error = getTRPCErrorFromUnknown(errorOpts.error);
          const input = call === null || call === void 0 ? void 0 : call.result();
          const path = call === null || call === void 0 ? void 0 : call.path;
          const type = (_call$procedure$_def$3 = call === null || call === void 0 || (_call$procedure4 = call.procedure) === null || _call$procedure4 === void 0 ? void 0 : _call$procedure4._def.type) !== null && _call$procedure$_def$3 !== void 0 ? _call$procedure$_def$3 : "unknown";
          const shape = getErrorShape({
            config: config2,
            ctx: ctxManager.valueOrUndefined(),
            error,
            input,
            path,
            type
          });
          return shape;
        }
      }));
      return new Response(stream, {
        headers,
        status: headResponse$1.status
      });
    }
    headers.set("content-type", "application/json");
    const results = (await Promise.all(rpcCalls)).map((res) => {
      const [error, result] = res;
      if (error) return res;
      if (isDataStream(result.data)) return [new TRPCError({
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Cannot use stream-like response in non-streaming request - use httpBatchStreamLink"
      }), void 0];
      return res;
    });
    const resultAsRPCResponse = results.map(([error, result], index2) => {
      const call = info.calls[index2];
      if (error) {
        var _call$procedure$_def$4, _call$procedure5;
        return { error: getErrorShape({
          config: config2,
          ctx: ctxManager.valueOrUndefined(),
          error,
          input: call.result(),
          path: call.path,
          type: (_call$procedure$_def$4 = (_call$procedure5 = call.procedure) === null || _call$procedure5 === void 0 ? void 0 : _call$procedure5._def.type) !== null && _call$procedure$_def$4 !== void 0 ? _call$procedure$_def$4 : "unknown"
        }) };
      }
      return { result: { data: result.data } };
    });
    const errors = results.map(([error]) => error).filter(Boolean);
    const headResponse = initResponse({
      ctx: ctxManager.valueOrUndefined(),
      info,
      responseMeta: opts.responseMeta,
      untransformedJSON: resultAsRPCResponse,
      errors,
      headers
    });
    return new Response(JSON.stringify(transformTRPCResponse(config2, resultAsRPCResponse)), {
      status: headResponse.status,
      headers
    });
  } catch (cause) {
    var _info$type2;
    const [_infoError, info] = infoTuple;
    const ctx = ctxManager.valueOrUndefined();
    const { error, untransformedJSON, body } = caughtErrorToData(cause, {
      opts,
      ctx: ctxManager.valueOrUndefined(),
      type: (_info$type2 = info === null || info === void 0 ? void 0 : info.type) !== null && _info$type2 !== void 0 ? _info$type2 : "unknown"
    });
    const headResponse = initResponse({
      ctx,
      info,
      responseMeta: opts.responseMeta,
      untransformedJSON,
      errors: [error],
      headers
    });
    return new Response(body, {
      status: headResponse.status,
      headers
    });
  }
}

// node_modules/@trpc/server/dist/adapters/fetch/index.mjs
var import_objectSpread24 = __toESM(require_objectSpread2(), 1);
var trimSlashes = (path) => {
  path = path.startsWith("/") ? path.slice(1) : path;
  path = path.endsWith("/") ? path.slice(0, -1) : path;
  return path;
};
async function fetchRequestHandler(opts) {
  const resHeaders = new Headers();
  const createContext2 = async (innerOpts) => {
    var _opts$createContext;
    return (_opts$createContext = opts.createContext) === null || _opts$createContext === void 0 ? void 0 : _opts$createContext.call(opts, (0, import_objectSpread24.default)({
      req: opts.req,
      resHeaders
    }, innerOpts));
  };
  const url = new URL(opts.req.url);
  const pathname = trimSlashes(url.pathname);
  const endpoint = trimSlashes(opts.endpoint);
  const path = trimSlashes(pathname.slice(endpoint.length));
  return await resolveResponse((0, import_objectSpread24.default)((0, import_objectSpread24.default)({}, opts), {}, {
    req: opts.req,
    createContext: createContext2,
    path,
    error: null,
    onError(o) {
      var _opts$onError;
      opts === null || opts === void 0 || (_opts$onError = opts.onError) === null || _opts$onError === void 0 || _opts$onError.call(opts, (0, import_objectSpread24.default)((0, import_objectSpread24.default)({}, o), {}, { req: opts.req }));
    },
    responseMeta(data) {
      var _opts$responseMeta;
      const meta = (_opts$responseMeta = opts.responseMeta) === null || _opts$responseMeta === void 0 ? void 0 : _opts$responseMeta.call(opts, data);
      if (meta === null || meta === void 0 ? void 0 : meta.headers) {
        if (meta.headers instanceof Headers) for (const [key, value] of meta.headers.entries()) resHeaders.append(key, value);
        else
          for (const [key, value] of Object.entries(meta.headers)) if (Array.isArray(value)) for (const v of value) resHeaders.append(key, v);
          else if (typeof value === "string") resHeaders.set(key, value);
      }
      return {
        headers: resHeaders,
        status: meta === null || meta === void 0 ? void 0 : meta.status
      };
    }
  }));
}

// server/router.ts
init_middleware();

// server/routers/customer.ts
init_middleware();
init_connection();
init_schema();
import { z } from "zod";
import { eq, like, desc, sql, gte, lte } from "drizzle-orm";
var customerRouter = createRouter({
  list: publicQuery.input(
    z.object({
      search: z.string().optional(),
      persona: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      minSpent: z.number().optional(),
      maxSpent: z.number().optional()
    })
  ).query(async ({ input }) => {
    const db = getDb();
    const { search, persona, page, limit, minSpent, maxSpent } = input;
    const offset = (page - 1) * limit;
    let query = db.select().from(customers);
    const conditions = [];
    if (search) {
      conditions.push(like(customers.name, `%${search}%`));
    }
    if (persona) {
      conditions.push(eq(customers.persona, persona));
    }
    if (minSpent !== void 0) {
      conditions.push(gte(customers.totalSpent, minSpent.toString()));
    }
    if (maxSpent !== void 0) {
      conditions.push(lte(customers.totalSpent, maxSpent.toString()));
    }
    const allCustomers = await query.where(conditions.length > 0 ? sql.join(conditions, sql` AND `) : void 0).orderBy(desc(customers.lastOrderAt)).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql`count(*)` }).from(customers).where(conditions.length > 0 ? sql.join(conditions, sql` AND `) : void 0);
    return {
      customers: allCustomers,
      total: countResult[0].count,
      page,
      totalPages: Math.ceil(countResult[0].count / limit)
    };
  }),
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const customer = await db.select().from(customers).where(eq(customers.id, input.id)).limit(1);
    if (!customer[0]) return null;
    const customerOrders = await db.select().from(orders).where(eq(orders.customerId, input.id)).orderBy(desc(orders.createdAt));
    return {
      ...customer[0],
      orders: customerOrders
    };
  }),
  getStats: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({
      totalCustomers: sql`count(*)`,
      totalRevenue: sql`COALESCE(SUM(CAST(total_spent AS DECIMAL(12,2))), 0)`,
      avgOrderValue: sql`COALESCE(AVG(CAST(total_spent AS DECIMAL(12,2))), 0)`,
      activeCustomers: sql`count(CASE WHEN last_order_at > NOW() - INTERVAL '30 days' THEN 1 END)`,
      lapsedCustomers: sql`count(CASE WHEN last_order_at < NOW() - INTERVAL '60 days' OR last_order_at IS NULL THEN 1 END)`,
      newCustomers: sql`count(CASE WHEN first_order_at > NOW() - INTERVAL '14 days' THEN 1 END)`
    }).from(customers);
    return result[0];
  }),
  getBySegment: publicQuery.input(z.object({ segmentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const { segmentCustomers: segmentCustomers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const segmentCustomerIds = await db.select({ customerId: segmentCustomers2.customerId }).from(segmentCustomers2).where(eq(segmentCustomers2.segmentId, input.segmentId));
    const ids = segmentCustomerIds.map((sc) => sc.customerId);
    if (ids.length === 0) return [];
    const segmentCustomersList = await db.select().from(customers).where(sql`${customers.id} IN (${sql.join(ids)})`);
    return segmentCustomersList;
  })
});

// server/routers/segment.ts
init_middleware();
init_connection();
init_schema();
import { z as z2 } from "zod";
import { eq as eq2, desc as desc2, sql as sql2 } from "drizzle-orm";
var segmentRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const allSegments = await db.select().from(segments).orderBy(desc2(segments.createdAt));
    return allSegments;
  }),
  getById: publicQuery.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    const db = getDb();
    const segment = await db.select().from(segments).where(eq2(segments.id, input.id)).limit(1);
    if (!segment[0]) return null;
    const segCustomers = await db.select({
      customerId: segmentCustomers.customerId
    }).from(segmentCustomers).where(eq2(segmentCustomers.segmentId, input.id));
    const customerIds = segCustomers.map((sc) => sc.customerId);
    const customersList = [];
    if (customerIds.length > 0) {
      const rows = await db.select().from(customers).where(sql2`${customers.id} IN (${sql2.join(customerIds)})`);
      customersList.push(...rows);
    }
    return {
      ...segment[0],
      customers: customersList
    };
  }),
  discover: publicQuery.input(
    z2.object({
      filters: z2.object({
        minTotalSpent: z2.number().optional(),
        maxTotalSpent: z2.number().optional(),
        minOrders: z2.number().optional(),
        lastOrderBefore: z2.string().optional(),
        lastOrderAfter: z2.string().optional(),
        persona: z2.string().optional(),
        channelPreference: z2.string().optional()
      })
    })
  ).query(async ({ input }) => {
    const db = getDb();
    const { filters } = input;
    const conditions = [];
    if (filters.minTotalSpent) {
      conditions.push(sql2`CAST(${customers.totalSpent} AS DECIMAL) >= ${filters.minTotalSpent}`);
    }
    if (filters.maxTotalSpent) {
      conditions.push(sql2`CAST(${customers.totalSpent} AS DECIMAL) <= ${filters.maxTotalSpent}`);
    }
    if (filters.minOrders) {
      conditions.push(sql2`${customers.totalOrders} >= ${filters.minOrders}`);
    }
    if (filters.lastOrderBefore) {
      conditions.push(sql2`${customers.lastOrderAt} < ${new Date(filters.lastOrderBefore)}`);
    }
    if (filters.lastOrderAfter) {
      conditions.push(sql2`${customers.lastOrderAt} > ${new Date(filters.lastOrderAfter)}`);
    }
    if (filters.persona) {
      conditions.push(eq2(customers.persona, filters.persona));
    }
    if (filters.channelPreference) {
      conditions.push(eq2(customers.channelPreference, filters.channelPreference));
    }
    const whereClause = conditions.length > 0 ? sql2.join(conditions, sql2` AND `) : void 0;
    const result = await db.select().from(customers).where(whereClause).orderBy(desc2(customers.lastOrderAt)).limit(100);
    return {
      customers: result,
      count: result.length
    };
  }),
  create: publicQuery.input(
    z2.object({
      name: z2.string(),
      description: z2.string().optional(),
      filterJson: z2.record(z2.string(), z2.any()).optional(),
      aiReasoning: z2.string().optional(),
      customerIds: z2.array(z2.number()),
      source: z2.string().default("manual")
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const segment = await db.insert(segments).values([{
      name: input.name,
      description: input.description,
      filterJson: input.filterJson,
      aiReasoning: input.aiReasoning,
      customerCount: input.customerIds.length,
      source: input.source
    }]).returning({ id: segments.id });
    const segmentId = segment[0].id;
    if (input.customerIds.length > 0) {
      await db.insert(segmentCustomers).values(
        input.customerIds.map((id) => ({
          segmentId,
          customerId: id
        }))
      );
    }
    return { id: segmentId, name: input.name, customerCount: input.customerIds.length };
  }),
  nlDiscover: publicQuery.input(z2.object({ query: z2.string() })).query(async ({ input }) => {
    const raw2 = input.query;
    const query = raw2.toLowerCase();
    const now = /* @__PURE__ */ new Date();
    const filters = {};
    const reasoningParts = [];
    const spentOverMatch = query.match(/(?:over|above|more than|spent|minimum|min)\s*[₹rs.]?\s*(\d[\d,]*)/i);
    const spentUnderMatch = query.match(/(?:under|below|less than|maximum|max|up to)\s*[₹rs.]?\s*(\d[\d,]*)/i);
    const daysMatch = query.match(/(\d+)\s*days?\s*(?:ago|back|old)?/i);
    const ordersMatch = query.match(/(?:at least|more than|min(?:imum)?|\+)?\s*(\d+)\s*(?:orders?|purchases?|times?)/i);
    if (spentOverMatch) {
      filters.minTotalSpent = parseInt(spentOverMatch[1].replace(/,/g, ""));
      reasoningParts.push(`spent over \u20B9${filters.minTotalSpent}`);
    }
    if (spentUnderMatch) {
      filters.maxTotalSpent = parseInt(spentUnderMatch[1].replace(/,/g, ""));
      reasoningParts.push(`spent under \u20B9${filters.maxTotalSpent}`);
    }
    if (ordersMatch) {
      filters.minOrders = parseInt(ordersMatch[1]);
      reasoningParts.push(`${filters.minOrders}+ orders`);
    }
    const isLapsed = /lapsed|haven.t|not returned|win back|re.engage|inactive|churned|lost/i.test(query);
    const isNew = /new|recent|just joined|just signed|onboard|welcome|first time/i.test(query);
    const isActive = /active|engaged|frequent|regular|returning/i.test(query);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      const cutoff = new Date(now.getTime() - days * 864e5);
      if (isLapsed) {
        filters.lastOrderBefore = cutoff.toISOString();
        reasoningParts.push(`no order in ${days}+ days`);
      } else if (isNew) {
        filters.lastOrderAfter = cutoff.toISOString();
        reasoningParts.push(`active in last ${days} days`);
      } else {
        filters.lastOrderBefore = cutoff.toISOString();
        reasoningParts.push(`no order in ${days}+ days`);
      }
    } else if (isLapsed) {
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 864e5);
      filters.lastOrderBefore = sixtyDaysAgo.toISOString();
      if (!filters.minOrders) filters.minOrders = 1;
      reasoningParts.push("lapsed 60+ days");
    } else if (isNew) {
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 864e5);
      filters.lastOrderAfter = fourteenDaysAgo.toISOString();
      reasoningParts.push("joined in last 14 days");
    } else if (isActive) {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 864e5);
      filters.lastOrderAfter = thirtyDaysAgo.toISOString();
      reasoningParts.push("active in last 30 days");
    }
    if (/subscription|loyalist|loyal/i.test(query)) {
      filters.persona = "subscription_loyalist";
      reasoningParts.push("subscription loyalists");
      if (!filters.minTotalSpent) filters.minTotalSpent = 1500;
    } else if (/weekend|enthusiast/i.test(query)) {
      filters.persona = "weekend_enthusiast";
      reasoningParts.push("weekend enthusiasts");
    } else if (/office|regular|daily/i.test(query)) {
      filters.persona = "office_regular";
      reasoningParts.push("office regulars");
    } else if (/gift|gifter/i.test(query)) {
      filters.persona = "gift_buyer";
      reasoningParts.push("gift buyers");
    } else if (/explorer|lapsed explorer/i.test(query)) {
      filters.persona = "lapsed_explorer";
      reasoningParts.push("lapsed explorers");
    }
    const isHighValue = /high.?value|vip|premium|top|best|big spend/i.test(query);
    if (isHighValue && !filters.minTotalSpent) {
      filters.minTotalSpent = 3e3;
      reasoningParts.push("high-value (\u20B93000+)");
    }
    if (reasoningParts.length === 0) {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 864e5);
      filters.lastOrderAfter = thirtyDaysAgo.toISOString();
      reasoningParts.push("recently active");
    }
    const description = `Customers matching: ${reasoningParts.join(", ")}`;
    const aiReasoning = generateAiReasoning(filters, reasoningParts, raw2);
    const db = getDb();
    const conditions = [];
    if (filters.minTotalSpent) {
      conditions.push(sql2`CAST(${customers.totalSpent} AS DECIMAL) >= ${filters.minTotalSpent}`);
    }
    if (filters.maxTotalSpent) {
      conditions.push(sql2`CAST(${customers.totalSpent} AS DECIMAL) <= ${filters.maxTotalSpent}`);
    }
    if (filters.minOrders) {
      conditions.push(sql2`${customers.totalOrders} >= ${filters.minOrders}`);
    }
    if (filters.lastOrderBefore) {
      conditions.push(sql2`${customers.lastOrderAt} < ${new Date(filters.lastOrderBefore)}`);
    }
    if (filters.lastOrderAfter) {
      conditions.push(sql2`${customers.lastOrderAt} > ${new Date(filters.lastOrderAfter)}`);
    }
    if (filters.persona) {
      conditions.push(eq2(customers.persona, filters.persona));
    }
    const result = await db.select().from(customers).where(conditions.length > 0 ? sql2.join(conditions, sql2` AND `) : void 0).orderBy(desc2(customers.lastOrderAt)).limit(100);
    return {
      customers: result,
      count: result.length,
      filters,
      description,
      aiReasoning
    };
  })
});
function generateAiReasoning(filters, parts, originalQuery) {
  const reasons = [];
  if (filters.persona === "subscription_loyalist") {
    reasons.push("Subscription loyalists are your highest-LTV customers. Reward their loyalty to reduce churn.");
  } else if (filters.persona === "weekend_enthusiast") {
    reasons.push("Weekend enthusiasts treat coffee as a ritual. Equipment and premium roast upsells work well for them.");
  } else if (filters.persona === "office_regular") {
    reasons.push("Office regulars prioritise convenience and consistency. Bulk offers and subscription nudges convert well.");
  } else if (filters.persona === "gift_buyer") {
    reasons.push("Gift buyers are seasonal. A timely campaign before festivals or holidays maximises conversion.");
  }
  if (filters.lastOrderBefore) {
    reasons.push("These customers previously engaged but have gone quiet \u2014 a win-back offer with urgency (e.g., expiring discount) is highly effective.");
  }
  if (filters.minTotalSpent && filters.minTotalSpent >= 2e3) {
    reasons.push(`High spenders (\u20B9${filters.minTotalSpent}+) respond well to exclusivity: early access, limited roasts, and loyalty perks.`);
  }
  if (filters.lastOrderAfter && !filters.lastOrderBefore) {
    reasons.push("Recent customers are primed for nurturing. A welcome sequence or a 'complete the ritual' upsell can convert them to repeat buyers.");
  }
  if (reasons.length === 0) {
    reasons.push(`Parsed from: "${originalQuery}". Found customers matching ${parts.join(", ")}. Consider a personalised message referencing their last order.`);
  }
  return reasons.join(" ");
}

// server/routers/campaign.ts
init_middleware();
init_connection();
init_schema();
import { z as z4 } from "zod";
import { eq as eq4, desc as desc3, sql as sql4 } from "drizzle-orm";
var CHANNEL_MODELS2 = {
  whatsapp: {
    deliveryRate: 0.95,
    openRate: 0.85,
    clickRate: 0.35,
    conversionRate: 0.12,
    avgDeliveryTime: 2e3,
    avgOpenTime: 15e3,
    avgClickTime: 45e3,
    avgConversionTime: 12e4
  },
  sms: {
    deliveryRate: 0.98,
    openRate: 0.9,
    clickRate: 0.2,
    conversionRate: 0.08,
    avgDeliveryTime: 1500,
    avgOpenTime: 1e4,
    avgClickTime: 3e4,
    avgConversionTime: 9e4
  },
  email: {
    deliveryRate: 0.88,
    openRate: 0.25,
    clickRate: 0.08,
    conversionRate: 0.03,
    avgDeliveryTime: 3e3,
    avgOpenTime: 6e4,
    avgClickTime: 12e4,
    avgConversionTime: 3e5
  }
};
var BRAND_TONE = {
  voice: "warm, slightly poetic, never corporate",
  greeting: ["Hey there", "Hello", "Hi", "Namaste"],
  closing: ["Warmly, Team Bloom", "With love from Bangalore", "Happy brewing", "From our roastery to your cup"]
};
function generatePersonalizedMessage(customer, channel, campaignGoal, variant) {
  const name = customer.name.split(" ")[0];
  const tone = BRAND_TONE;
  const templates = {
    reengagement: [
      `${tone.greeting[variant % tone.greeting.length]} ${name}, we miss you at Bloom. Your last cup of ${customer.metadata ? JSON.parse(customer.metadata).favoriteProduct || "our Monsoon Malabar" : "our Monsoon Malabar"} was a while ago. Come back and get 15% off your next order. We've been roasting something special. Use code COMEBACK15. ${tone.closing[variant % tone.closing.length]}`,
      `${name}, your coffee ritual is calling. We noticed you haven't stopped by in a while \u2014 your usual ${customer.persona === "subscription_loyalist" ? "subscription" : "order"} is waiting. Here's 15% off to welcome you back: COMEBACK15. ${tone.closing[variant % tone.closing.length]}`,
      `We saved your spot, ${name}. The Monsoon Malabar is tasting better than ever, and we thought of you. 15% off with COMEBACK15 \u2014 because some cups are worth coming back for. ${tone.closing[variant % tone.closing.length]}`
    ],
    retention: [
      `${name}, as one of our most cherished customers, we wanted you to be the first to know \u2014 our limited Monsooned AA Roast is back. Only 50 bags. Your loyalty means everything to us. ${tone.closing[variant % tone.closing.length]}`,
      `${tone.greeting[variant % tone.greeting.length]} ${name}! Your loyalty hasn't gone unnoticed. We're setting aside a bag of our new seasonal roast just for you. Reply YES to reserve yours. ${tone.closing[variant % tone.closing.length]}`,
      `${name}, great coffee is better shared. Refer a friend and you both get 20% off your next order. Because the best discoveries are shared over a cup. ${tone.closing[variant % tone.closing.length]}`
    ],
    upsell: [
      `${name}, we noticed you love our single origins. Have you tried brewing with a French Press? It brings out notes you didn't know existed. 10% off equipment with code BREWUPGRADE. ${tone.closing[variant % tone.closing.length]}`,
      `Your ${customer.persona === "weekend_enthusiast" ? "weekend ritual" : "morning cup"} deserves an upgrade, ${name}. The AeroPress Go is perfect for your lifestyle. Check it out with 10% off: BREWUPGRADE. ${tone.closing[variant % tone.closing.length]}`,
      `${name}, pair your favorite Monsoon Malabar with our Cold Brew Kit. Summer in Bangalore calls for cold coffee. 10% off with BREWUPGRADE. ${tone.closing[variant % tone.closing.length]}`
    ],
    welcome: [
      `Welcome to the Bloom family, ${name}! Your first order is just the beginning. Here's a guide to getting the most out of your beans. Welcome home. ${tone.closing[variant % tone.closing.length]}`,
      `${name}, thank you for choosing Bloom. We wanted to share our story with you \u2014 from the hills of Chikmagalur to your cup. Every bean has a journey. ${tone.closing[variant % tone.closing.length]}`,
      `Hey ${name}! Welcome to Bloom Coffee Co. As a thank you, enjoy free shipping on your next 3 orders. No code needed \u2014 it's automatic. ${tone.closing[variant % tone.closing.length]}`
    ]
  };
  let type = "retention";
  if (campaignGoal.includes("re-engage") || campaignGoal.includes("win back") || campaignGoal.includes("lapsed")) {
    type = "reengagement";
  } else if (campaignGoal.includes("up") || campaignGoal.includes("cross") || campaignGoal.includes("equipment")) {
    type = "upsell";
  } else if (campaignGoal.includes("new") || campaignGoal.includes("welcome") || campaignGoal.includes("onboard")) {
    type = "welcome";
  }
  const content = templates[type]?.[variant % 3] || templates.retention[variant % 3];
  if (channel === "email") {
    const subjects = {
      reengagement: ["We miss you, " + name, "Your coffee is waiting", "Come back for 15% off"],
      retention: ["Exclusive: New roast just for you", "Your loyalty reward is here", "A special surprise inside"],
      upsell: ["Upgrade your brew, " + name, "The perfect pairing for your favorite coffee", "10% off brewing equipment"],
      welcome: ["Welcome to Bloom Coffee Co.", "Your coffee journey begins now", "Thanks for joining us, " + name]
    };
    return {
      content,
      subject: subjects[type]?.[variant % 3] || "A message from Bloom Coffee Co."
    };
  }
  return { content };
}
var campaignRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const allCampaigns = await db.select().from(campaigns).orderBy(desc3(campaigns.createdAt));
    return allCampaigns;
  }),
  getById: publicQuery.input(z4.object({ id: z4.number() })).query(async ({ input }) => {
    const db = getDb();
    const campaign = await db.select().from(campaigns).where(eq4(campaigns.id, input.id)).limit(1);
    if (!campaign[0]) return null;
    const campaignMessages = await db.select().from(messages).where(eq4(messages.campaignId, input.id));
    const segment = campaign[0].segmentId ? await db.select().from(segments).where(eq4(segments.id, campaign[0].segmentId)).limit(1) : null;
    return {
      ...campaign[0],
      messages: campaignMessages,
      segment: segment?.[0] || null
    };
  }),
  create: publicQuery.input(
    z4.object({
      name: z4.string(),
      description: z4.string().optional(),
      segmentId: z4.number(),
      channel: z4.enum(["whatsapp", "sms", "email"]),
      goal: z4.string(),
      messageVariant: z4.number().default(0)
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const { segmentCustomers: segCustTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const segCustomers = await db.select({ customerId: segCustTable.customerId }).from(segCustTable).where(eq4(segCustTable.segmentId, input.segmentId));
    const customerIds = segCustomers.map((sc) => sc.customerId);
    const customerDetails = await db.select().from(customers).where(sql4`${customers.id} IN (${sql4.join(customerIds)})`);
    const channelModel = CHANNEL_MODELS2[input.channel];
    const count = customerIds.length;
    const predictedSent = count;
    const predictedDelivered = Math.round(count * channelModel.deliveryRate);
    const predictedOpened = Math.round(predictedDelivered * channelModel.openRate);
    const predictedClicked = Math.round(predictedOpened * channelModel.clickRate);
    const predictedConverted = Math.round(predictedClicked * channelModel.conversionRate);
    const messageVariants = [];
    for (let v = 0; v < 3; v++) {
      const sampleMsg = generatePersonalizedMessage(
        customerDetails[0] || { name: "there", persona: "new", metadata: null, totalSpent: "0", totalOrders: 0, healthScore: 50, id: 0, email: "", phone: null, channelPreference: "email", lastOrderAt: null, firstOrderAt: null, aiSummary: null, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() },
        input.channel,
        input.goal,
        v
      );
      messageVariants.push(sampleMsg.content);
    }
    const campaign = await db.insert(campaigns).values({
      name: input.name,
      description: input.description,
      segmentId: input.segmentId,
      channel: input.channel,
      goal: input.goal,
      status: "draft",
      predictedSent,
      predictedDelivered,
      predictedOpened,
      predictedClicked,
      predictedConverted,
      selectedVariant: input.messageVariant
    }).returning({ id: campaigns.id });
    const campaignId = campaign[0].id;
    await db.update(campaigns).set({ messageVariants }).where(eq4(campaigns.id, campaignId));
    const messageValues = customerDetails.map((customer) => {
      const msg = generatePersonalizedMessage(customer, input.channel, input.goal, input.messageVariant);
      return {
        campaignId,
        customerId: customer.id,
        channel: input.channel,
        content: msg.content,
        subject: msg.subject || null,
        status: "pending",
        personalizedData: JSON.stringify({
          customerName: customer.name.split(" ")[0],
          variant: input.messageVariant
        })
      };
    });
    for (let i = 0; i < messageValues.length; i += 50) {
      const batch = messageValues.slice(i, i + 50);
      await db.insert(messages).values(batch);
    }
    return {
      id: campaignId,
      name: input.name,
      customerCount: count,
      predictedMetrics: {
        sent: predictedSent,
        delivered: predictedDelivered,
        opened: predictedOpened,
        clicked: predictedClicked,
        converted: predictedConverted
      },
      messageVariants
    };
  }),
  launch: publicQuery.input(z4.object({ id: z4.number() })).mutation(async ({ input }) => {
    const db = getDb();
    const campaign = await db.select().from(campaigns).where(eq4(campaigns.id, input.id)).limit(1);
    if (!campaign[0]) throw new Error("Campaign not found");
    await db.update(campaigns).set({ status: "running", startedAt: /* @__PURE__ */ new Date() }).where(eq4(campaigns.id, input.id));
    const pendingMessages = await db.select({ id: messages.id }).from(messages).where(eq4(messages.campaignId, input.id));
    const messageIds = pendingMessages.map((m) => m.id);
    const { dispatchCampaign: dispatchCampaign2 } = await Promise.resolve().then(() => (init_channel(), channel_exports));
    dispatchCampaign2(input.id, campaign[0].channel, messageIds).catch(
      (err) => console.error(
        `[CRM] Channel service dispatch failed for campaign ${input.id}:`,
        err
      )
    );
    return {
      success: true,
      campaignId: input.id,
      messageCount: messageIds.length,
      channel: campaign[0].channel,
      channelService: "Handed off to channel service \u2014 callbacks will update delivery status asynchronously"
    };
  }),
  simulateStep: publicQuery.input(z4.object({ id: z4.number() })).mutation(async ({ input }) => {
    const db = getDb();
    const campaign = await db.select().from(campaigns).where(eq4(campaigns.id, input.id)).limit(1);
    if (!campaign[0] || campaign[0].status !== "running") {
      return { done: true };
    }
    const channel = campaign[0].channel;
    const model = CHANNEL_MODELS2[channel];
    const pendingMessages = await db.select().from(messages).where(eq4(messages.campaignId, input.id)).limit(20);
    if (pendingMessages.length === 0) {
      await db.update(campaigns).set({ status: "completed", completedAt: /* @__PURE__ */ new Date() }).where(eq4(campaigns.id, input.id));
      return { done: true };
    }
    for (const msg of pendingMessages) {
      const rng = Math.random();
      if (msg.status === "queued") {
        if (rng < model.deliveryRate) {
          await db.update(messages).set({ status: "sent", sentAt: /* @__PURE__ */ new Date() }).where(eq4(messages.id, msg.id));
          await db.update(campaigns).set({ actualSent: sql4`${campaigns.actualSent} + 1` }).where(eq4(campaigns.id, input.id));
        } else {
          await db.update(messages).set({ status: "failed", failureReason: "Channel delivery failed" }).where(eq4(messages.id, msg.id));
        }
      } else if (msg.status === "sent") {
        await db.update(messages).set({ status: "delivered", deliveredAt: /* @__PURE__ */ new Date() }).where(eq4(messages.id, msg.id));
        await db.update(campaigns).set({ actualDelivered: sql4`${campaigns.actualDelivered} + 1` }).where(eq4(campaigns.id, input.id));
      } else if (msg.status === "delivered") {
        if (rng < model.openRate) {
          await db.update(messages).set({ status: "opened", openedAt: /* @__PURE__ */ new Date() }).where(eq4(messages.id, msg.id));
          await db.update(campaigns).set({ actualOpened: sql4`${campaigns.actualOpened} + 1` }).where(eq4(campaigns.id, input.id));
        }
      } else if (msg.status === "opened") {
        if (rng < model.clickRate) {
          await db.update(messages).set({ status: "clicked", clickedAt: /* @__PURE__ */ new Date() }).where(eq4(messages.id, msg.id));
          await db.update(campaigns).set({ actualClicked: sql4`${campaigns.actualClicked} + 1` }).where(eq4(campaigns.id, input.id));
        }
      } else if (msg.status === "clicked") {
        if (rng < model.conversionRate) {
          const revenue = (50 + Math.random() * 500).toFixed(2);
          await db.update(messages).set({ status: "converted", convertedAt: /* @__PURE__ */ new Date() }).where(eq4(messages.id, msg.id));
          await db.update(campaigns).set({
            actualConverted: sql4`${campaigns.actualConverted} + 1`,
            actualRevenue: sql4`${campaigns.actualRevenue} + ${revenue}`
          }).where(eq4(campaigns.id, input.id));
        }
      }
    }
    return { done: false, processed: pendingMessages.length };
  }),
  generateInsight: publicQuery.input(z4.object({ id: z4.number() })).query(async ({ input }) => {
    const db = getDb();
    const campaign = await db.select().from(campaigns).where(eq4(campaigns.id, input.id)).limit(1);
    if (!campaign[0]) return null;
    const c = campaign[0];
    const channel = c.channel;
    const pOpen = c.predictedOpened ?? 0;
    const pConv = c.predictedConverted ?? 0;
    const aDel = c.actualDelivered ?? 0;
    const aOpen = c.actualOpened ?? 0;
    const aClick = c.actualClicked ?? 0;
    const aConv = c.actualConverted ?? 0;
    let insight = "";
    let recommendation = "";
    let confidence = "medium";
    const openRate = aDel > 0 ? (aOpen / aDel * 100).toFixed(1) : "0";
    const clickRate = aOpen > 0 ? (aClick / aOpen * 100).toFixed(1) : "0";
    const convRate = aClick > 0 ? (aConv / aClick * 100).toFixed(1) : "0";
    if (aOpen > pOpen * 1.2) {
      insight = `Your ${channel} campaign overperformed on opens by ${((aOpen / Math.max(pOpen, 1) - 1) * 100).toFixed(0)}%. The subject lines resonated strongly.`;
      recommendation = "Reuse similar messaging themes in your next campaign. Consider A/B testing the best-performing variant.";
      confidence = "high";
    } else if (aConv > pConv * 1.3) {
      insight = `Excellent conversion rate! ${convRate}% of clicked messages led to purchases \u2014 well above the ${(CHANNEL_MODELS2[channel].conversionRate * 100).toFixed(0)}% benchmark.`;
      recommendation = "This segment is highly responsive. Schedule a follow-up campaign within 7 days while engagement is high.";
      confidence = "high";
    } else if (aOpen < pOpen * 0.7) {
      insight = `Open rates were below expectations at ${openRate}%. The timing or subject may need adjustment.`;
      recommendation = "Try sending during morning hours (8-10 AM) and test more personalized subject lines.";
      confidence = "medium";
    } else {
      insight = `Solid performance overall. ${aDel} messages delivered, ${openRate}% open rate, ${convRate}% conversion rate from clicks. This aligns with typical ${channel} benchmarks.`;
      recommendation = "Consider segmenting further by purchase history for more targeted messaging next time.";
      confidence = "medium";
    }
    return {
      insight,
      recommendation,
      confidence,
      metrics: {
        openRate,
        clickRate,
        conversionRate: convRate,
        totalRevenue: c.actualRevenue
      }
    };
  })
});

// server/routers/analytics.ts
init_middleware();
init_connection();
init_schema();
import { desc as desc4, sql as sql5, eq as eq5 } from "drizzle-orm";
var analyticsRouter = createRouter({
  dashboard: publicQuery.query(async () => {
    const db = getDb();
    const customerStats = await db.select({
      totalCustomers: sql5`count(*)`,
      totalRevenue: sql5`COALESCE(SUM(CAST(total_spent AS DECIMAL(12,2))), 0)`,
      avgSpent: sql5`COALESCE(AVG(CAST(total_spent AS DECIMAL(12,2))), 0)`,
      active30d: sql5`count(CASE WHEN last_order_at > NOW() - INTERVAL '30 days' THEN 1 END)`,
      lapsed60d: sql5`count(CASE WHEN last_order_at < NOW() - INTERVAL '60 days' OR last_order_at IS NULL THEN 1 END)`,
      new14d: sql5`count(CASE WHEN first_order_at > NOW() - INTERVAL '14 days' THEN 1 END)`
    }).from(customers);
    const orderStats = await db.select({
      totalOrders: sql5`count(*)`,
      avgOrderValue: sql5`COALESCE(AVG(CAST(total_amount AS DECIMAL(10,2))), 0)`,
      recentOrders: sql5`count(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END)`
    }).from(orders);
    const campaignStats = await db.select({
      totalCampaigns: sql5`count(*)`,
      running: sql5`count(CASE WHEN status = 'running' THEN 1 END)`,
      completed: sql5`count(CASE WHEN status = 'completed' THEN 1 END)`,
      totalRevenue: sql5`COALESCE(SUM(CAST(actual_revenue AS DECIMAL(12,2))), 0)`
    }).from(campaigns);
    const channelDist = await db.select({
      channel: customers.channelPreference,
      count: sql5`count(*)`
    }).from(customers).groupBy(customers.channelPreference);
    const personaDist = await db.select({
      persona: customers.persona,
      count: sql5`count(*)`
    }).from(customers).groupBy(customers.persona);
    const topProducts = await db.select({
      productName: sql5`items->0->>'productName'`,
      count: sql5`count(*)`
    }).from(orders).groupBy(sql5`items->0->>'productName'`).orderBy(sql5`count(*) DESC`).limit(5);
    const aiSegments = await db.select().from(segments).where(eq5(segments.isAiSuggested, 1)).orderBy(desc4(segments.createdAt)).limit(5);
    const recentActivity = await db.select({
      id: messages.id,
      customerName: customers.name,
      status: messages.status,
      channel: messages.channel,
      updatedAt: messages.updatedAt
    }).from(messages).innerJoin(customers, eq5(messages.customerId, customers.id)).orderBy(desc4(messages.updatedAt)).limit(10);
    return {
      customers: customerStats[0],
      orders: orderStats[0],
      campaigns: campaignStats[0],
      channelDistribution: channelDist,
      personaDistribution: personaDist,
      topProducts,
      aiSegments,
      recentActivity
    };
  }),
  campaignPerformance: publicQuery.query(async () => {
    const db = getDb();
    const performance = await db.select({
      id: campaigns.id,
      name: campaigns.name,
      channel: campaigns.channel,
      status: campaigns.status,
      actualSent: campaigns.actualSent,
      actualDelivered: campaigns.actualDelivered,
      actualOpened: campaigns.actualOpened,
      actualClicked: campaigns.actualClicked,
      actualConverted: campaigns.actualConverted,
      actualRevenue: campaigns.actualRevenue,
      createdAt: campaigns.createdAt
    }).from(campaigns).orderBy(desc4(campaigns.createdAt)).limit(10);
    return performance;
  })
});

// server/router.ts
init_channel();
var appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  customer: customerRouter,
  segment: segmentRouter,
  campaign: campaignRouter,
  analytics: analyticsRouter,
  channel: channelRouter
});

// server/context.ts
async function createContext(opts) {
  return { req: opts.req, resHeaders: opts.resHeaders };
}

// server/vercel-entry.ts
var config = {
  maxDuration: 60
};
var app = new Hono2().basePath("/api");
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get("/ping", (c) => c.json({ message: "pong" }));
app.use("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext
  });
});
app.all("/*", (c) => c.json({ error: "Not Found" }, 404));
var vercel_entry_default = handle(app);
export {
  config,
  vercel_entry_default as default
};
/*! Bundled license information:

@trpc/server/dist/resolveResponse-CdASWfAV.mjs:
  (* istanbul ignore if -- @preserve *)
  (*!
  * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
  *
  * Copyright (c) 2014-2017, Jon Schlinkert.
  * Released under the MIT License.
  *)

@trpc/server/dist/resolveResponse-CdASWfAV.mjs:
  (* istanbul ignore if -- @preserve *)
*/
