import { OneEuroFilter } from './filters.js';
import type { BodyMode, BodyVisibilityState, FramingMeasurement, SemanticRawMeasurement } from './types.js';

const variance=(values:readonly number[]):number=>{if(values.length<2)return 0;const mean=values.reduce((s,v)=>s+v,0)/values.length;return values.reduce((s,v)=>s+(v-mean)**2,0)/(values.length-1);};
const clamp=(value:number,min=0,max=1):number=>Math.min(max,Math.max(min,value));

export class SemanticFramingTracker {
  private committed:BodyMode='PARTIAL_OR_AMBIGUOUS'; private candidate:BodyMode='PARTIAL_OR_AMBIGUOUS'; private candidateSince=0; private stableModeSince=0; private transitions=0; private flickers=0;
  private anchorFilter=new OneEuroFilter(); private scaleFilter=new OneEuroFilter(); private lastTimestamp:number|null=null; private lastAnchor:number|null=null; private lastScale:number|null=null; private lastMovementAt:number|null=null; private last:FramingMeasurement|null=null; private anchorHistory:number[]=[]; private scaleHistory:number[]=[];
  constructor(private readonly persistenceMs=400,private readonly lossHoldMs=250){}
  reset():void{this.committed=this.candidate='PARTIAL_OR_AMBIGUOUS';this.candidateSince=this.stableModeSince=this.transitions=this.flickers=0;this.anchorFilter.reset();this.scaleFilter.reset();this.lastTimestamp=this.lastMovementAt=null;this.lastAnchor=this.lastScale=null;this.last=null;this.anchorHistory=[];this.scaleHistory=[];}
  update(raw:SemanticRawMeasurement|null,timestampMs:number,stateVersion:number):FramingMeasurement|null {
    if(!raw){if(this.last&&timestampMs-this.last.timestamp_ms<=this.lossHoldMs)return {...this.last,state_version:stateVersion,measurement_age_ms:timestampMs-this.last.timestamp_ms,valid_for_precision_x:false,valid_for_precision_scale:false,stable:false};return null;}
    this.updateMode(raw.candidate_mode,timestampMs); const scaleRaw=raw.scale_by_mode[this.committed]??null; const modeChanged=this.last?.body_mode!==undefined&&this.last.body_mode!==this.committed;
    if(modeChanged){this.scaleFilter.reset(scaleRaw?.value??undefined,timestampMs);this.lastScale=scaleRaw?.value??null;}
    const anchor=raw.anchor_x===null?null:this.anchorFilter.filter(raw.anchor_x,timestampMs); const scale=scaleRaw?.value===null||scaleRaw?.value===undefined?null:this.scaleFilter.filter(scaleRaw.value,timestampMs);
    const dt=this.lastTimestamp===null?.125:Math.max((timestampMs-this.lastTimestamp)/1000,.001); const vx=anchor===null||this.lastAnchor===null?0:(anchor-this.lastAnchor)/dt; const vs=scale===null||this.lastScale===null||modeChanged?0:(scale-this.lastScale)/dt;
    this.lastTimestamp=timestampMs;if(anchor!==null)this.lastAnchor=anchor;if(scale!==null)this.lastScale=scale; if(anchor!==null){this.anchorHistory.push(anchor);if(this.anchorHistory.length>8)this.anchorHistory.shift();} if(scale!==null){this.scaleHistory.push(scale);if(this.scaleHistory.length>8)this.scaleHistory.shift();}
    const moving=Math.abs(vx)>.08||Math.abs(vs)>.08;if(moving||this.lastMovementAt===null)this.lastMovementAt=timestampMs;const stable=!moving&&timestampMs-(this.lastMovementAt??timestampMs)>=400;
    const ux=clamp(raw.anchor_x_uncertainty+Math.sqrt(variance(this.anchorHistory))); const us=clamp((scaleRaw?.uncertainty??1)+Math.sqrt(variance(this.scaleHistory))); const compatibleMode=!['HEAD_ONLY','PARTIAL_OR_AMBIGUOUS'].includes(this.committed);
    const visibility:BodyVisibilityState={mode:this.committed,confidence:raw.candidate_mode===this.committed?raw.candidate_confidence:Math.max(0,raw.candidate_confidence*.75),visible_groups:{head:raw.groups.HEAD_CORE.valid,shoulders:raw.groups.SHOULDERS.valid,hips:raw.groups.HIPS.valid,knees:raw.groups.KNEES.valid,ankles:raw.groups.ANKLES.valid},bilateral_groups:{shoulders:raw.groups.SHOULDERS.bilateral_valid,hips:raw.groups.HIPS.bilateral_valid,knees:raw.groups.KNEES.bilateral_valid,ankles:raw.groups.ANKLES.bilateral_valid},cropped_edges:raw.cropped_edges,candidate_mode:this.candidate,candidate_since_ms:this.candidateSince,stable_mode_since_ms:this.stableModeSince,body_mode_transition_count:this.transitions,body_mode_flicker_count:this.flickers};
    const output:FramingMeasurement={timestamp_ms:timestampMs,state_version:stateVersion,body_mode:this.committed,body_mode_confidence:visibility.confidence,body_visibility:visibility,groups:raw.groups,anchor_x:anchor,anchor_x_source:raw.anchor_x_source,scale,scale_metric_type:scaleRaw?.metric_type??null,scale_components:scaleRaw?.component_values??{},confidence:Math.min(visibility.confidence,1-Math.min(ux,us)),uncertainty_x:ux,uncertainty_scale:us,cropped_edges:raw.cropped_edges,measurement_age_ms:0,valid_for_precision_x:compatibleMode&&anchor!==null&&ux<=.10,valid_for_precision_scale:compatibleMode&&scale!==null&&us<=.16,velocity_x:vx,velocity_scale:vs,stable,filter_type:'ONE_EURO',display_box:raw.display_box,raw_pose_box:raw.raw_pose_box};this.last=output;return output;
  }
  private updateMode(next:BodyMode,now:number):void {
    if(next!==this.candidate){if(this.candidate!==this.committed&&now-this.candidateSince<this.persistenceMs)this.flickers+=1;this.candidate=next;this.candidateSince=now;}
    if(next!==this.committed&&now-this.candidateSince>=this.persistenceMs){this.committed=next;this.stableModeSince=now;this.transitions+=1;}
    if(next===this.committed&&this.stableModeSince===0)this.stableModeSince=now;
  }
}
