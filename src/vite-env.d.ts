/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="chrome"/>

// compile-time constant injected by wxt.config.ts (vite define); true only
// when the build runs with WORDWISE_DEV_MOCK set
declare const __WORDWISE_DEV_MOCK__: boolean
