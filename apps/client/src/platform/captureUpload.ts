export type CaptureUploadState='LOCAL_CAPTURE_READY'|'UPLOAD_PENDING'|'UPLOAD_IN_PROGRESS'|'UPLOAD_RETRYABLE_FAILED'|'UPLOAD_SUCCEEDED'|'CAPTURE_COMMITTED'
export type UploadAttemptTelemetry={candidateId:string;attemptId:string;sessionId:string;bytes:number;mime:string;startedAt:string;endedAt:string;durationMs:number;result:'SUCCEEDED'|'RETRYABLE_FAILED'|'FAILED';httpStatus:number|null;originReached:boolean;retryCount:number}
export type UploadContext={sessionId:string;idempotencyKey:string;attemptId:string;retryCount:number}

export function captureUploadKey(sessionId:string,candidateId:string){return `capture-upload:${sessionId}:${candidateId}`}
export function nextUploadState(current:CaptureUploadState,event:'QUEUE'|'START'|'RETRYABLE_FAILURE'|'SUCCESS'|'COMMIT'):CaptureUploadState{
 const transitions:Partial<Record<CaptureUploadState,Partial<Record<typeof event,CaptureUploadState>>>>={LOCAL_CAPTURE_READY:{QUEUE:'UPLOAD_PENDING'},UPLOAD_PENDING:{START:'UPLOAD_IN_PROGRESS'},UPLOAD_IN_PROGRESS:{RETRYABLE_FAILURE:'UPLOAD_RETRYABLE_FAILED',SUCCESS:'UPLOAD_SUCCEEDED'},UPLOAD_RETRYABLE_FAILED:{START:'UPLOAD_IN_PROGRESS'},UPLOAD_SUCCEEDED:{COMMIT:'CAPTURE_COMMITTED'}}
 const next=transitions[current]?.[event];if(!next)throw new Error(`INVALID_CAPTURE_UPLOAD_TRANSITION:${current}:${event}`);return next
}
