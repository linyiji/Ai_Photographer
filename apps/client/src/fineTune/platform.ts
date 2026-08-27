export type FineTunePlatformCapability={
 platform:'H5'|'WECHAT'
 core:'SHARED'
 interactiveRenderer:'BROWSER_CANVAS2D'|'WECHAT_CANVAS2D_REQUIRED'
 finalRenderer:'WORKER_OR_MAIN_CANVAS2D'|'WECHAT_CANVAS2D_REQUIRED'
 derivedUpload:'IMPLEMENTED'|'ADAPTER_REQUIRED'
 localRegionTouch:'IMPLEMENTED'|'ADAPTER_REQUIRED'
 deviceAcceptance:'PASS'|'NOT_EXERCISED'
}

export function fineTunePlatformCapability(platform:'H5'|'WECHAT'):FineTunePlatformCapability{
 if(platform==='H5')return {platform,core:'SHARED',interactiveRenderer:'BROWSER_CANVAS2D',finalRenderer:'WORKER_OR_MAIN_CANVAS2D',derivedUpload:'IMPLEMENTED',localRegionTouch:'IMPLEMENTED',deviceAcceptance:'PASS'}
 return {platform,core:'SHARED',interactiveRenderer:'WECHAT_CANVAS2D_REQUIRED',finalRenderer:'WECHAT_CANVAS2D_REQUIRED',derivedUpload:'ADAPTER_REQUIRED',localRegionTouch:'ADAPTER_REQUIRED',deviceAcceptance:'NOT_EXERCISED'}
}
