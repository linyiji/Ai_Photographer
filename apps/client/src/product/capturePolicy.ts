export type CaptureConfirmationState={candidateId:string|null;uploadedAssetId:string|null;busy:boolean}

export function confirmationKey(candidateId:string):string{return `capture-confirm-${candidateId}`}
export function mayConfirm(state:CaptureConfirmationState):boolean{return Boolean(state.candidateId)&&!state.busy}
export function retakeBeforeConfirm(state:CaptureConfirmationState,serverUploadCount:number){return {state:{candidateId:null,uploadedAssetId:null,busy:false} as CaptureConfirmationState,serverUploadCount,workflowAdvance:false}}
export function publicRuntimeMayStart(mode:string,ready:boolean):boolean{return mode!=='PRODUCTION'||ready}
export function shareFallback(shareSupported:boolean):'SHARE'|'DOWNLOAD'{return shareSupported?'SHARE':'DOWNLOAD'}
