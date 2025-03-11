import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  MediaMatcher
} from "./chunk-KNYUC5SM.js";
import {
  environment,
  getEventPosition,
  isTouchEvent
} from "./chunk-46OF3TAS.js";
import {
  Platform
} from "./chunk-ZHYRNV4L.js";
import {
  DOCUMENT
} from "./chunk-HIJDZSYJ.js";
import {
  Injectable,
  NgZone,
  RendererFactory2,
  inject,
  require_operators,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵgetInheritedFactory,
  ɵɵinject
} from "./chunk-K6L7TLVU.js";
import {
  require_cjs
} from "./chunk-AQYIT73X.js";
import {
  __toESM
} from "./chunk-YHCV7DAQ.js";

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-polyfill.mjs
var availablePrefixes = ["moz", "ms", "webkit"];
function requestAnimationFramePolyfill() {
  let lastTime = 0;
  return function(callback) {
    const currTime = (/* @__PURE__ */ new Date()).getTime();
    const timeToCall = Math.max(0, 16 - (currTime - lastTime));
    const id = window.setTimeout(() => {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}
function getRequestAnimationFrame() {
  if (typeof window === "undefined") {
    return () => 0;
  }
  if (window.requestAnimationFrame) {
    return window.requestAnimationFrame.bind(window);
  }
  const prefix = availablePrefixes.filter((key) => `${key}RequestAnimationFrame` in window)[0];
  return prefix ? window[`${prefix}RequestAnimationFrame`] : requestAnimationFramePolyfill();
}
function cancelRequestAnimationFrame(id) {
  if (typeof window === "undefined") {
    return null;
  }
  if (window.cancelAnimationFrame) {
    return window.cancelAnimationFrame(id);
  }
  const prefix = availablePrefixes.filter((key) => `${key}CancelAnimationFrame` in window || `${key}CancelRequestAnimationFrame` in window)[0];
  return prefix ? (window[`${prefix}CancelAnimationFrame`] || window[`${prefix}CancelRequestAnimationFrame`]).call(this, id) : clearTimeout(id);
}
var reqAnimFrame = getRequestAnimationFrame();

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-services.mjs
var import_rxjs = __toESM(require_cjs(), 1);
var import_operators = __toESM(require_operators(), 1);
var NOOP = () => {
};
var NzResizeService = class _NzResizeService {
  ngZone;
  rendererFactory2;
  resizeSource$ = new import_rxjs.Subject();
  listeners = 0;
  renderer;
  disposeHandle = NOOP;
  handler = () => {
    this.ngZone.run(() => {
      this.resizeSource$.next();
    });
  };
  constructor(ngZone, rendererFactory2) {
    this.ngZone = ngZone;
    this.rendererFactory2 = rendererFactory2;
    this.renderer = this.rendererFactory2.createRenderer(null, null);
  }
  ngOnDestroy() {
    this.handler = NOOP;
  }
  subscribe() {
    this.registerListener();
    return this.resizeSource$.pipe((0, import_operators.auditTime)(16), (0, import_operators.finalize)(() => this.unregisterListener()));
  }
  unsubscribe() {
    this.unregisterListener();
  }
  registerListener() {
    if (this.listeners === 0) {
      this.ngZone.runOutsideAngular(() => {
        this.disposeHandle = this.renderer.listen("window", "resize", this.handler);
      });
    }
    this.listeners += 1;
  }
  unregisterListener() {
    this.listeners -= 1;
    if (this.listeners === 0) {
      this.disposeHandle();
      this.disposeHandle = NOOP;
    }
  }
  static ɵfac = function NzResizeService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzResizeService)(ɵɵinject(NgZone), ɵɵinject(RendererFactory2));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzResizeService,
    factory: _NzResizeService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzResizeService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: NgZone
  }, {
    type: RendererFactory2
  }], null);
})();
var testSingleRegistry = /* @__PURE__ */ new Map();
var NzSingletonService = class _NzSingletonService {
  get singletonRegistry() {
    return environment.isTestMode ? testSingleRegistry : this._singletonRegistry;
  }
  /**
   * This registry is used to register singleton in dev mode.
   * So that singletons get destroyed when hot module reload happens.
   *
   * This works in prod mode too but with no specific effect.
   */
  _singletonRegistry = /* @__PURE__ */ new Map();
  registerSingletonWithKey(key, target) {
    const alreadyHave = this.singletonRegistry.has(key);
    const item = alreadyHave ? this.singletonRegistry.get(key) : this.withNewTarget(target);
    if (!alreadyHave) {
      this.singletonRegistry.set(key, item);
    }
  }
  unregisterSingletonWithKey(key) {
    if (this.singletonRegistry.has(key)) {
      this.singletonRegistry.delete(key);
    }
  }
  getSingletonWithKey(key) {
    return this.singletonRegistry.has(key) ? this.singletonRegistry.get(key).target : null;
  }
  withNewTarget(target) {
    return {
      target
    };
  }
  static ɵfac = function NzSingletonService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSingletonService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzSingletonService,
    factory: _NzSingletonService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSingletonService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
function getPagePosition(event) {
  const e = getEventPosition(event);
  return {
    x: e.pageX,
    y: e.pageY
  };
}
var NzDragService = class _NzDragService {
  draggingThreshold = 5;
  currentDraggingSequence = null;
  currentStartingPoint = null;
  handleRegistry = /* @__PURE__ */ new Set();
  renderer;
  constructor(rendererFactory2) {
    this.renderer = rendererFactory2.createRenderer(null, null);
  }
  requestDraggingSequence(event) {
    if (!this.handleRegistry.size) {
      this.registerDraggingHandler(isTouchEvent(event));
    }
    if (this.currentDraggingSequence) {
      this.currentDraggingSequence.complete();
    }
    this.currentStartingPoint = getPagePosition(event);
    this.currentDraggingSequence = new import_rxjs.Subject();
    return this.currentDraggingSequence.pipe((0, import_operators.map)((e) => ({
      x: e.pageX - this.currentStartingPoint.x,
      y: e.pageY - this.currentStartingPoint.y
    })), (0, import_operators.filter)((e) => Math.abs(e.x) > this.draggingThreshold || Math.abs(e.y) > this.draggingThreshold), (0, import_operators.finalize)(() => this.teardownDraggingSequence()));
  }
  registerDraggingHandler(isTouch) {
    if (isTouch) {
      this.handleRegistry.add({
        teardown: this.renderer.listen("document", "touchmove", (e) => {
          if (this.currentDraggingSequence) {
            this.currentDraggingSequence.next(e.touches[0] || e.changedTouches[0]);
          }
        })
      });
      this.handleRegistry.add({
        teardown: this.renderer.listen("document", "touchend", () => {
          if (this.currentDraggingSequence) {
            this.currentDraggingSequence.complete();
          }
        })
      });
    } else {
      this.handleRegistry.add({
        teardown: this.renderer.listen("document", "mousemove", (e) => {
          if (this.currentDraggingSequence) {
            this.currentDraggingSequence.next(e);
          }
        })
      });
      this.handleRegistry.add({
        teardown: this.renderer.listen("document", "mouseup", () => {
          if (this.currentDraggingSequence) {
            this.currentDraggingSequence.complete();
          }
        })
      });
    }
  }
  teardownDraggingSequence() {
    this.currentDraggingSequence = null;
  }
  static ɵfac = function NzDragService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzDragService)(ɵɵinject(RendererFactory2));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzDragService,
    factory: _NzDragService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzDragService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: RendererFactory2
  }], null);
})();
function easeInOutCubic(t, b, c, d) {
  const cc = c - b;
  let tt = t / (d / 2);
  if (tt < 1) {
    return cc / 2 * tt * tt * tt + b;
  } else {
    return cc / 2 * ((tt -= 2) * tt * tt + 2) + b;
  }
}
var NzScrollService = class _NzScrollService {
  ngZone;
  doc = inject(DOCUMENT);
  constructor(ngZone) {
    this.ngZone = ngZone;
  }
  /** Set the position of the scroll bar of `el`. */
  setScrollTop(el, topValue = 0) {
    if (el === window) {
      this.doc.body.scrollTop = topValue;
      this.doc.documentElement.scrollTop = topValue;
    } else {
      el.scrollTop = topValue;
    }
  }
  /** Get position of `el` against window. */
  getOffset(el) {
    const ret = {
      top: 0,
      left: 0
    };
    if (!el || !el.getClientRects().length) {
      return ret;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width || rect.height) {
      const doc = el.ownerDocument.documentElement;
      ret.top = rect.top - doc.clientTop;
      ret.left = rect.left - doc.clientLeft;
    } else {
      ret.top = rect.top;
      ret.left = rect.left;
    }
    return ret;
  }
  /** Get the position of the scoll bar of `el`. */
  // TODO: remove '| Window' as the fallback already happens here
  getScroll(target, top = true) {
    if (typeof window === "undefined") {
      return 0;
    }
    const method = top ? "scrollTop" : "scrollLeft";
    let result = 0;
    if (this.isWindow(target)) {
      result = target[top ? "pageYOffset" : "pageXOffset"];
    } else if (target instanceof Document) {
      result = target.documentElement[method];
    } else if (target) {
      result = target[method];
    }
    if (target && !this.isWindow(target) && typeof result !== "number") {
      result = (target.ownerDocument || target).documentElement[method];
    }
    return result;
  }
  isWindow(obj) {
    return obj !== null && obj !== void 0 && obj === obj.window;
  }
  /**
   * Scroll `el` to some position with animation.
   *
   * @param containerEl container, `window` by default
   * @param y Scroll to `top`, 0 by default
   */
  scrollTo(containerEl, y = 0, options = {}) {
    const target = containerEl ? containerEl : window;
    const scrollTop = this.getScroll(target);
    const startTime = Date.now();
    const {
      easing,
      callback,
      duration = 450
    } = options;
    const frameFunc = () => {
      const timestamp = Date.now();
      const time = timestamp - startTime;
      const nextScrollTop = (easing || easeInOutCubic)(time > duration ? duration : time, scrollTop, y, duration);
      if (this.isWindow(target)) {
        target.scrollTo(window.pageXOffset, nextScrollTop);
      } else if (target instanceof HTMLDocument || target.constructor.name === "HTMLDocument") {
        target.documentElement.scrollTop = nextScrollTop;
      } else {
        target.scrollTop = nextScrollTop;
      }
      if (time < duration) {
        reqAnimFrame(frameFunc);
      } else if (typeof callback === "function") {
        this.ngZone.run(callback);
      }
    };
    this.ngZone.runOutsideAngular(() => reqAnimFrame(frameFunc));
  }
  static ɵfac = function NzScrollService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzScrollService)(ɵɵinject(NgZone));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzScrollService,
    factory: _NzScrollService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzScrollService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: NgZone
  }], null);
})();
var NzBreakpointEnum;
(function(NzBreakpointEnum2) {
  NzBreakpointEnum2["xxl"] = "xxl";
  NzBreakpointEnum2["xl"] = "xl";
  NzBreakpointEnum2["lg"] = "lg";
  NzBreakpointEnum2["md"] = "md";
  NzBreakpointEnum2["sm"] = "sm";
  NzBreakpointEnum2["xs"] = "xs";
})(NzBreakpointEnum || (NzBreakpointEnum = {}));
var gridResponsiveMap = {
  xs: "(max-width: 575px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)",
  xxl: "(min-width: 1600px)"
};
var NzBreakpointService = class _NzBreakpointService {
  resizeService;
  mediaMatcher;
  destroy$ = new import_rxjs.Subject();
  constructor(resizeService, mediaMatcher) {
    this.resizeService = resizeService;
    this.mediaMatcher = mediaMatcher;
    this.resizeService.subscribe().pipe((0, import_operators.takeUntil)(this.destroy$)).subscribe(() => {
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
  }
  subscribe(breakpointMap, fullMap) {
    if (fullMap) {
      const get = () => this.matchMedia(breakpointMap, true);
      return this.resizeService.subscribe().pipe((0, import_operators.map)(get), (0, import_operators.startWith)(get()), (0, import_operators.distinctUntilChanged)((x, y) => x[0] === y[0]), (0, import_operators.map)((x) => x[1]));
    } else {
      const get = () => this.matchMedia(breakpointMap);
      return this.resizeService.subscribe().pipe((0, import_operators.map)(get), (0, import_operators.startWith)(get()), (0, import_operators.distinctUntilChanged)());
    }
  }
  matchMedia(breakpointMap, fullMap) {
    let bp = NzBreakpointEnum.md;
    const breakpointBooleanMap = {};
    Object.keys(breakpointMap).map((breakpoint) => {
      const castBP = breakpoint;
      const matched = this.mediaMatcher.matchMedia(gridResponsiveMap[castBP]).matches;
      breakpointBooleanMap[breakpoint] = matched;
      if (matched) {
        bp = castBP;
      }
    });
    if (fullMap) {
      return [bp, breakpointBooleanMap];
    } else {
      return bp;
    }
  }
  static ɵfac = function NzBreakpointService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzBreakpointService)(ɵɵinject(NzResizeService), ɵɵinject(MediaMatcher));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzBreakpointService,
    factory: _NzBreakpointService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzBreakpointService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: NzResizeService
  }, {
    type: MediaMatcher
  }], null);
})();
var NzDestroyService = class _NzDestroyService extends import_rxjs.Subject {
  ngOnDestroy() {
    this.next();
    this.complete();
  }
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵNzDestroyService_BaseFactory;
    return function NzDestroyService_Factory(__ngFactoryType__) {
      return (ɵNzDestroyService_BaseFactory || (ɵNzDestroyService_BaseFactory = ɵɵgetInheritedFactory(_NzDestroyService)))(__ngFactoryType__ || _NzDestroyService);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _NzDestroyService,
    factory: _NzDestroyService.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzDestroyService, [{
    type: Injectable
  }], null, null);
})();
var ImagePreloadService = class _ImagePreloadService {
  platform;
  counter = /* @__PURE__ */ new Map();
  linkRefs = /* @__PURE__ */ new Map();
  document = inject(DOCUMENT);
  constructor(platform) {
    this.platform = platform;
  }
  addPreload(option) {
    if (this.platform.isBrowser) {
      return () => void 0;
    }
    const uniqueKey = `${option.src}${option.srcset}`;
    let currentCount = this.counter.get(uniqueKey) || 0;
    currentCount++;
    this.counter.set(uniqueKey, currentCount);
    if (!this.linkRefs.has(uniqueKey)) {
      const linkNode = this.appendPreloadLink(option);
      this.linkRefs.set(uniqueKey, linkNode);
    }
    return () => {
      if (this.counter.has(uniqueKey)) {
        let count = this.counter.get(uniqueKey);
        count--;
        if (count === 0) {
          const linkNode = this.linkRefs.get(uniqueKey);
          this.removePreloadLink(linkNode);
          this.counter.delete(uniqueKey);
          this.linkRefs.delete(uniqueKey);
        } else {
          this.counter.set(uniqueKey, count);
        }
      }
    };
  }
  appendPreloadLink(option) {
    const linkNode = this.document.createElement("link");
    linkNode.setAttribute("rel", "preload");
    linkNode.setAttribute("as", "image");
    linkNode.setAttribute("href", option.src);
    if (option.srcset) {
      linkNode.setAttribute("imagesrcset", option.srcset);
    }
    this.document.head.appendChild(linkNode);
    return linkNode;
  }
  removePreloadLink(linkNode) {
    if (this.document.head.contains(linkNode)) {
      this.document.head.removeChild(linkNode);
    }
  }
  static ɵfac = function ImagePreloadService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ImagePreloadService)(ɵɵinject(Platform));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ImagePreloadService,
    factory: _ImagePreloadService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ImagePreloadService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: Platform
  }], null);
})();

export {
  cancelRequestAnimationFrame,
  reqAnimFrame,
  NzResizeService,
  gridResponsiveMap,
  NzBreakpointService,
  NzDestroyService
};
//# sourceMappingURL=chunk-P7RLLFM3.js.map
