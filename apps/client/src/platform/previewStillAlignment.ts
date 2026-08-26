import type {CameraOrientation,CaptureViewport} from './captureViewport'

export type AlignmentResult='IDENTITY'|'CALIBRATED'|'LOW_CONFIDENCE'|'UNSUPPORTED'
export type AlignmentMode='IDENTITY'|'ORIENTATION_NORMALIZED'|'CALIBRATED_CROP'|'CALIBRATED_TRANSFORM'|'UNSUPPORTED'
export type PreviewStillAlignmentResultV01={
 previewReferenceId:string;nativeStillId:string;alignmentMode:AlignmentMode;previewWidth:number;previewHeight:number;stillWidth:number;stillHeight:number
 normalizedPreviewOrientation:CameraOrientation;normalizedStillOrientation:CameraOrientation;cropRectNormalized:CaptureViewport
 scaleX:number;scaleY:number;translationX:number;translationY:number;mirrorX:boolean;mirrorY:boolean;confidence:number;residualError:number;result:AlignmentResult
 generation:number;source:'CAPTURE_TIME_REFERENCE'|'CONTROLLED_FIXTURE'
}
export type AlignmentEstimate=Omit<PreviewStillAlignmentResultV01,'result'>

export function classifyPreviewStillAlignment(value:AlignmentEstimate):PreviewStillAlignmentResultV01{
 const finite=[value.scaleX,value.scaleY,value.translationX,value.translationY,value.confidence,value.residualError].every(Number.isFinite)
 const validDimensions=value.previewWidth>0&&value.previewHeight>0&&value.stillWidth>0&&value.stillHeight>0
 const geometryValid=value.cropRectNormalized.width>0&&value.cropRectNormalized.height>0&&value.scaleX>0&&value.scaleY>0
 let result:AlignmentResult='CALIBRATED'
 if(!finite||!validDimensions||!geometryValid||value.alignmentMode==='UNSUPPORTED')result='UNSUPPORTED'
 else if(value.confidence<.8||value.residualError>.08)result='LOW_CONFIDENCE'
 else if(value.alignmentMode==='IDENTITY'&&!value.mirrorX&&!value.mirrorY&&Math.abs(value.scaleX-1)<.001&&Math.abs(value.scaleY-1)<.001&&Math.abs(value.translationX)<.001&&Math.abs(value.translationY)<.001)result='IDENTITY'
 return {...value,result}
}

export class PreviewStillAlignmentTracker{
 private generation=0;private current:PreviewStillAlignmentResultV01|null=null
 evaluate(value:Omit<AlignmentEstimate,'generation'>){this.generation++;this.current=classifyPreviewStillAlignment({...value,generation:this.generation});return this.current}
 invalidate(){this.current=null}
 snapshot(){return {generation:this.generation,result:this.current}}
}

export const fullViewport=(aspectRatio:number):CaptureViewport=>({x:0,y:0,width:1,height:1,aspectRatio})
