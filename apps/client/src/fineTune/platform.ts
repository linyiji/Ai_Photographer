export type FineTunePlatformCapability={
 platform:'H5'|'WECHAT'
 core:'SHARED'
 interactiveRenderer:'BROWSER_CANVAS2D'|'WECHAT_CANVAS2D_ADAPTER'
 finalRenderer:'WORKER_OR_MAIN_CANVAS2D'|'WECHAT_OFFSCREEN_CANVAS2D'
 derivedUpload:'IMPLEMENTED'
 localRegionTouch:'IMPLEMENTED'
 deviceAcceptance:'PASS'|'NOT_EXERCISED'
}

export function fineTunePlatformCapability(platform:'H5'|'WECHAT'):FineTunePlatformCapability{
 if(platform==='H5')return {platform,core:'SHARED',interactiveRenderer:'BROWSER_CANVAS2D',finalRenderer:'WORKER_OR_MAIN_CANVAS2D',derivedUpload:'IMPLEMENTED',localRegionTouch:'IMPLEMENTED',deviceAcceptance:'PASS'}
 return {platform,core:'SHARED',interactiveRenderer:'WECHAT_CANVAS2D_ADAPTER',finalRenderer:'WECHAT_OFFSCREEN_CANVAS2D',derivedUpload:'IMPLEMENTED',localRegionTouch:'IMPLEMENTED',deviceAcceptance:'NOT_EXERCISED'}
}
