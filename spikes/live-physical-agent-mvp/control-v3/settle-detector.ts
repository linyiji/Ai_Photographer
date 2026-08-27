import type { LiveMeasurementV3, V3ControllerConfig, V3Stage } from './types.js';

export type V3SettleStatus='WAITING'|'SETTLED'|'INVALIDATED';

export class HumanSettleDetectorV01 {
  private sawNewer=false;private sawMotion=false;private stableSince:number|null=null;
  constructor(private readonly issuedAt:number,private readonly issuedVersion:number,private readonly stage:Extract<V3Stage,'FRAMING'|'ALIGN_X'>,private readonly start:LiveMeasurementV3,private readonly config:V3ControllerConfig){}
  observe(current:LiveMeasurementV3):V3SettleStatus{
    if(current.state_version<=this.issuedVersion)return 'WAITING';
    this.sawNewer=true;
    if(current.subject_state!=='PRESENT'||!current.fresh||current.measurement_quality==='INVALID'||!this.comparable(current))return 'INVALIDATED';
    const motion=this.stage==='FRAMING'?current.framing_motion:current.x_motion;
    const startError=this.error(this.start);const currentError=this.error(current);
    if((motion!=='STILL'&&motion!=='UNKNOWN')||(startError!==null&&currentError!==null&&Math.abs(startError-currentError)>=this.config.motion_threshold_normalized))this.sawMotion=true;
    const eligible=current.stable&&(this.sawMotion||current.timestamp_ms-this.issuedAt>=this.config.response_grace_ms);
    if(!eligible){this.stableSince=null;return current.timestamp_ms-this.issuedAt>=this.config.episode_timeout_ms?'INVALIDATED':'WAITING';}
    this.stableSince??=current.timestamp_ms;
    if(current.timestamp_ms-this.stableSince>=this.config.settle_window_ms)return 'SETTLED';
    return current.timestamp_ms-this.issuedAt>=this.config.episode_timeout_ms&&this.sawNewer?'SETTLED':'WAITING';
  }
  private error(m:LiveMeasurementV3):number|null{return this.stage==='FRAMING'?m.diagnostics_ref.framing_error_normalized:m.diagnostics_ref.x_error_normalized;}
  private comparable(m:LiveMeasurementV3):boolean{
    const a=this.stage==='FRAMING'?this.start.diagnostics_ref.framing_comparison_key:this.start.diagnostics_ref.x_comparison_key;
    const b=this.stage==='FRAMING'?m.diagnostics_ref.framing_comparison_key:m.diagnostics_ref.x_comparison_key;
    return a!==null&&a===b;
  }
}
