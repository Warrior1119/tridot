export function isMobileSafari() {
    const {userAgent} = window.navigator;
    return userAgent.match(/iPad/i) || userAgent.match(/iPhone/i);
}

export function isCordova() {
  return (window as any).cordova;
}

export function isiOSApp() {
  return isMobileSafari() && isCordova();
}

export function getWindowWidth(window: Window) {
    return window.document.documentElement.clientWidth || window.innerWidth;
}
