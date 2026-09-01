import { V4_FRAMING_PROFILES_V01 } from './framing-profiles.js';
import type {
  CanonicalCommandActionV01,
  CanonicalControlOwnerV01,
  CanonicalErrorVectorV01,
  CanonicalFramingTargetV01,
  CanonicalGuidanceCommandV01,
  CanonicalConstraintDimensionV01,
  ErrorRelationV01,
  HumanObservationV02,
  LiveConstraintStateV01,
  LiveTargetV02,
  ObservationQualityV02,
  TargetFeasibilityV01,
  TargetObservationGapV01,
  TargetVerificationV01,
} from './types.js';

const freezeList=<T>(items:readonly T[]):readonly T[]=>Object.freeze([...items]);
const finite=(value:number|null|undefined):value is number=>typeof value==='number'&&Number.isFinite(value);
const ownerFor=(dimension:CanonicalConstraintDimensionV01,target:LiveTargetV02):CanonicalControlOwnerV01=>dimension==='Y'?'CAMERA_OPERATOR':dimension==='EXTENT'?'SUBJECT':target.control_actor==='CAMERA_OPERATOR'?'CAMERA_OPERATOR':'SUBJECT';

export function canonicalTargetFromFixtureV01(target:LiveTargetV02,targetRevision:number):Readonly<CanonicalFramingTargetV01>{
  const profile=V4_FRAMING_PROFILES_V01[target.framing_profile_id];
  const constraints=(['EXTENT','SCALE','X','Y'] as const).map(dimension=>Object.freeze({dimension,hard_for_ready:dimension!=='Y'||target.target_anchor_y!==null,owner:ownerFor(dimension,target),actionable:dimension!=='Y'||target.target_anchor_y!==null}));
  return Object.freeze({target_version:'CanonicalFramingTargetV01',target_id:target.id,target_revision:targetRevision,source_shot_plan_ref:null,status:'LOCKED',framing_profile_id:target.framing_profile_id,position_zone:target.position_zone,required_extent:profile.coverage_expectation,primary_anchor:target.primary_anchor,scale:Object.freeze({metric:target.scale_metric,target:target.target_scale,tolerance:target.tolerance_scale}),anchor:Object.freeze({x:target.target_anchor_x,tolerance_x:target.tolerance_x,y:target.target_anchor_y,tolerance_y:target.tolerance_y}),constraints:freezeList(constraints),legacy_fixture_ref:target.id});
}

export function evaluateControlFeasibilityV01(target:CanonicalFramingTargetV01):Readonly<TargetFeasibilityV01>{
  const unowned=target.constraints.filter(item=>item.hard_for_ready&&(!item.actionable||item.owner==='SYSTEM_NONE')).map(item=>item.dimension);
  const camera=target.constraints.filter(item=>item.hard_for_ready&&item.owner==='CAMERA_OPERATOR').map(item=>item.dimension);
  const invalid=!finite(target.scale.target)||target.scale.tolerance<=0||!finite(target.anchor.x)||target.anchor.tolerance_x<=0||(target.anchor.y!==null&&(!finite(target.anchor.y)||(target.anchor.tolerance_y??0)<=0));
  const status=invalid||unowned.length?'UNREACHABLE':'PARTIALLY_REACHABLE';
  const executionClass=invalid||unowned.length?'UNRESOLVED_WITH_CURRENT_EVIDENCE':camera.length?'CAMERA_OPERATOR_REQUIRED':'PRODUCT_EXECUTABLE';
  const reasons=invalid?['NON_FINITE_OR_INVALID_TARGET_GEOMETRY']:unowned.length?[`UNOWNED_HARD_CONSTRAINT:${unowned.join(',')}`]:camera.length?[`CAMERA_OPERATOR_OWNS:${camera.join(',')}`,'PHYSICAL_REACHABILITY_NOT_CLAIMED_IN_P2']:['PRODUCT_COMMANDS_COVER_ALL_HARD_CONSTRAINTS','PHYSICAL_REACHABILITY_NOT_CLAIMED_IN_P2'];
  return Object.freeze({feasibility_version:'TargetFeasibilityV01',scope:'CONTROL_FEASIBILITY_ONLY',target_id:target.target_id,target_revision:target.target_revision,status,execution_class:executionClass,unowned_hard_constraints:freezeList(unowned),camera_operator_constraints:freezeList(camera),blocks_ready:status==='UNREACHABLE',physical_reachability_claim:false,reasons:freezeList(reasons)});
}

const errorRelation=(relation:'TOO_LOW'|'IN_RANGE'|'TOO_HIGH'|'UNKNOWN'):ErrorRelationV01=>relation==='TOO_LOW'?'BELOW_TARGET':relation==='TOO_HIGH'?'ABOVE_TARGET':relation==='IN_RANGE'?'IN_TARGET':'UNKNOWN';
const qualityFor=(valid:boolean,observation:HumanObservationV02):ObservationQualityV02=>!valid?'INVALID':observation.quality;
export function buildCanonicalErrorVectorV01(observation:HumanObservationV02,target:CanonicalFramingTargetV01,constraints:LiveConstraintStateV01,gap:TargetObservationGapV01):Readonly<CanonicalErrorVectorV01>{
  const anchor=observation.observed_body.semantic_anchors.anchors[target.primary_anchor]??null;
  const scale=observation.observed_body.scale_evidence[target.scale.metric];
  const definition=(dimension:CanonicalConstraintDimensionV01)=>target.constraints.find(item=>item.dimension===dimension)!;
  const extentDef=definition('EXTENT'),scaleDef=definition('SCALE'),xDef=definition('X'),yDef=definition('Y');
  const dimensions=Object.freeze({
    EXTENT:Object.freeze({dimension:'EXTENT' as const,current:observation.observed_body.observed_extent,target:target.required_extent,tolerance:null,relation:gap.ready?'IN_TARGET' as const:gap.actionability==='SYSTEM_MEASUREMENT_DEFECT'?'BLOCKED' as const:'UNKNOWN' as const,delta:null,normalized_error:null,quality:qualityFor(gap.ready,observation),owner:extentDef.owner,actionable:extentDef.actionable,hard_for_ready:extentDef.hard_for_ready}),
    SCALE:Object.freeze({dimension:'SCALE' as const,current:scale.valid?scale.value:null,target:target.scale.target,tolerance:target.scale.tolerance,relation:errorRelation(constraints.scale_relation),delta:scale.valid&&scale.value!==null?scale.value-target.scale.target:null,normalized_error:constraints.scale_error_normalized,quality:qualityFor(scale.valid&&gap.ready,observation),owner:scaleDef.owner,actionable:scaleDef.actionable,hard_for_ready:scaleDef.hard_for_ready}),
    X:Object.freeze({dimension:'X' as const,current:gap.ready?anchor?.x??null:null,target:target.anchor.x,tolerance:target.anchor.tolerance_x,relation:errorRelation(constraints.x_relation),delta:gap.ready&&anchor?anchor.x-target.anchor.x:null,normalized_error:constraints.x_error_normalized,quality:qualityFor(Boolean(anchor)&&gap.ready,observation),owner:xDef.owner,actionable:xDef.actionable,hard_for_ready:xDef.hard_for_ready}),
    Y:Object.freeze({dimension:'Y' as const,current:target.anchor.y===null?null:gap.ready?anchor?.y??null:null,target:target.anchor.y,tolerance:target.anchor.tolerance_y,relation:target.anchor.y===null?'IN_TARGET' as const:errorRelation(constraints.y_relation),delta:target.anchor.y!==null&&gap.ready&&anchor?anchor.y-target.anchor.y:null,normalized_error:constraints.y_error_normalized,quality:target.anchor.y===null?observation.quality:qualityFor(Boolean(anchor)&&gap.ready,observation),owner:yDef.owner,actionable:yDef.actionable,hard_for_ready:yDef.hard_for_ready}),
  });
  const blocking=(Object.keys(dimensions) as CanonicalConstraintDimensionV01[]).filter(key=>dimensions[key].hard_for_ready&&dimensions[key].relation!=='IN_TARGET');
  return Object.freeze({error_vector_version:'CanonicalErrorVectorV01',target_id:target.target_id,target_revision:target.target_revision,observation_state_version:observation.state_version,dimensions,all_hard_constraints_pass:blocking.length===0,blocking_dimensions:freezeList(blocking)});
}

export function canonicalCommandV01(input:{sequence:number;target:CanonicalFramingTargetV01;action:CanonicalCommandActionV01;owner:CanonicalControlOwnerV01;dimension:CanonicalConstraintDimensionV01|null;lifecycle:CanonicalGuidanceCommandV01['lifecycle'];now:number;reason:string;control_epoch_id?:string|null;replaces_command_id?:string|null}):Readonly<CanonicalGuidanceCommandV01>{
  return Object.freeze({command_version:'CanonicalGuidanceCommandV01',command_id:`${input.target.target_id}:r${input.target.target_revision}:c${input.sequence}`,target_id:input.target.target_id,target_revision:input.target.target_revision,action:input.action,magnitude:input.action==='HOLD_POSITION'?'HOLD':'SMALL',owner:input.owner,dimension:input.dimension,lifecycle:input.lifecycle,created_at:input.now,issued_at:input.now,updated_at:input.now,reason:input.reason,control_epoch_id:input.control_epoch_id??null,replaces_command_id:input.replaces_command_id??null});
}

interface VerificationSample {at:number;inside:boolean;stable:boolean;x:number|null;y:number|null;scale:number|null}
export class RollingTargetVerifierV01 {
  private samples:VerificationSample[]=[];
  constructor(private readonly windowMs=600,private readonly inTargetRatio=.8){}
  reset():void{this.samples=[];}
  update(now:number,error:CanonicalErrorVectorV01,observation:HumanObservationV02):Readonly<TargetVerificationV01>{
    const anchorX=error.dimensions.X.current,anchorY=error.dimensions.Y.current,scale=error.dimensions.SCALE.current;
    this.samples.push({at:now,inside:error.all_hard_constraints_pass,stable:observation.stable&&observation.quality==='GOOD'&&observation.fresh,x:typeof anchorX==='number'?anchorX:null,y:typeof anchorY==='number'?anchorY:null,scale:typeof scale==='number'?scale:null});
    this.samples=this.samples.filter(sample=>now-sample.at<=this.windowMs);
    const ratio=this.samples.length?this.samples.filter(sample=>sample.inside).length/this.samples.length:0,stableRatio=this.samples.length?this.samples.filter(sample=>sample.stable).length/this.samples.length:0;
    const span=(values:(number|null)[])=>{const finiteValues=values.filter((value):value is number=>value!==null&&Number.isFinite(value));return finiteValues.length?Math.max(...finiteValues)-Math.min(...finiteValues):Number.POSITIVE_INFINITY;};
    const bounded=span(this.samples.map(item=>item.x))<=.025&&span(this.samples.map(item=>item.scale))<=.04&&(error.dimensions.Y.hard_for_ready?span(this.samples.map(item=>item.y))<=.035:true);
    const elapsed=this.samples.length>1?now-this.samples[0].at:0,verified=elapsed>=this.windowMs&&ratio>=this.inTargetRatio&&stableRatio>=this.inTargetRatio&&bounded;
    return Object.freeze({verification_version:'TargetVerificationV01',target_reached:error.all_hard_constraints_pass,window_ms:elapsed,sample_count:this.samples.length,in_target_ratio:ratio,stable_ratio:stableRatio,bounded_variance:bounded,verified,candidate_thresholds:true});
  }
}
