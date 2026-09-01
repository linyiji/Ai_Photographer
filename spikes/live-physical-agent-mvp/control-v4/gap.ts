import { V4_MEASUREMENT_DEFINITIONS } from './measurement-definitions.js';
import type { BodyRegionV01, GapActionabilityV01, MeasurementTypeV01, ObservedBodyStateV01, SubjectRecognitionStateV01, TargetGapBlockerV01, TargetMeasurementRequirementV01, TargetObservationGapV01 } from './types.js';

const basisRegion:Readonly<Record<'HEAD'|'SHOULDERS'|'HIPS'|'KNEES'|'ANKLES',BodyRegionV01>>=Object.freeze({HEAD:'HEAD',SHOULDERS:'SHOULDERS',HIPS:'HIPS',KNEES:'KNEES',ANKLES:'ANKLES'});
const blocker=(requirement:MeasurementTypeV01,region:BodyRegionV01|null,reason:TargetGapBlockerV01['reason'],actionability:GapActionabilityV01):Readonly<TargetGapBlockerV01>=>Object.freeze({requirement,region,reason,actionability});
function blockersFor(measurement:MeasurementTypeV01,observed:ObservedBodyStateV01):Readonly<TargetGapBlockerV01>[] {
  if(!observed.fresh)return [blocker(measurement,null,'STALE_EVIDENCE','WAIT_FOR_STABLE_EVIDENCE')];
  const definition=V4_MEASUREMENT_DEFINITIONS[measurement],result:Readonly<TargetGapBlockerV01>[]=[];
  for(const dependency of definition.crop_dependencies){const basis=observed.landmark_basis[dependency],region=basisRegion[dependency];
    if(basis.status==='EDGE_CROPPED')result.push(blocker(measurement,region,'REGION_EDGE_CROPPED','USER_FIXABLE'));
    else if(basis.status==='UNKNOWN')result.push(blocker(measurement,region,'REGION_NOT_OBSERVED','USER_FIXABLE'));
    else if(basis.status==='LOW_CONFIDENCE')result.push(blocker(measurement,region,'LOW_CONFIDENCE','WAIT_FOR_STABLE_EVIDENCE'));
    else if(basis.status==='UNILATERAL_PARTIAL')result.push(blocker(measurement,region,'INSUFFICIENT_BILATERAL_EVIDENCE','WAIT_FOR_STABLE_EVIDENCE'));
  }
  const anchorsValid=definition.required_anchors.every(anchor=>{const value=observed.semantic_anchors.anchors[anchor];return Boolean(value&&Number.isFinite(value.x)&&Number.isFinite(value.y));});
  if(!anchorsValid&&result.length===0)result.push(blocker(measurement,null,'LANDMARK_REDUCTION_INVALID','SYSTEM_MEASUREMENT_DEFECT'));
  const scaleMetric=measurement==='TORSO_CENTER'?null:measurement;if(scaleMetric&&!observed.scale_evidence[scaleMetric].valid&&result.length===0)result.push(blocker(measurement,null,'NON_FINITE_GEOMETRY','SYSTEM_MEASUREMENT_DEFECT'));
  if(result.length===0)result.push(blocker(measurement,null,'UNKNOWN','SYSTEM_MEASUREMENT_DEFECT'));
  return result;
}
export function evaluateTargetObservationGapV01(recognition:SubjectRecognitionStateV01,observed:ObservedBodyStateV01,requirement:TargetMeasurementRequirementV01):Readonly<TargetObservationGapV01>{
  const satisfied=requirement.required_measurements.filter(measurement=>observed.measurement_capability[measurement]==='GOOD'),missing=requirement.required_measurements.filter(measurement=>observed.measurement_capability[measurement]!=='GOOD');
  const blocking=missing.flatMap(measurement=>blockersFor(measurement,observed));
  if(!recognition.detected)blocking.unshift(blocker(missing[0]??requirement.required_measurements[0],null,'REGION_NOT_OBSERVED','USER_FIXABLE'));
  const actions=blocking.map(item=>item.actionability);const actionability:GapActionabilityV01=actions.includes('SYSTEM_MEASUREMENT_DEFECT')?'SYSTEM_MEASUREMENT_DEFECT':actions.includes('USER_FIXABLE')?'USER_FIXABLE':actions.includes('WAIT_FOR_STABLE_EVIDENCE')?'WAIT_FOR_STABLE_EVIDENCE':'UNKNOWN';
  return Object.freeze({gap_version:'TargetObservationGapV01',target_id:requirement.target_id,ready:recognition.detected&&missing.length===0,satisfied_requirements:Object.freeze(satisfied),missing_requirements:Object.freeze(missing),blocking_reasons:Object.freeze(blocking),actionability,observation_state_version:observed.state_version});
}

export class TargetGapTemporalEvaluatorV01 {
  private readonly firstSeen=new Map<string,number>();
  constructor(private readonly boundedWaitMs=1500){}
  reset():void{this.firstSeen.clear();}
  evaluate(recognition:SubjectRecognitionStateV01,observed:ObservedBodyStateV01,requirement:TargetMeasurementRequirementV01,now:number):Readonly<TargetObservationGapV01>{
    const raw=evaluateTargetObservationGapV01(recognition,observed,requirement),active=new Set<string>();
    const blocking=raw.blocking_reasons.map(item=>{const key=`${item.requirement}:${item.region??'NONE'}:${item.reason}`;if(item.actionability!=='WAIT_FOR_STABLE_EVIDENCE'||item.reason!=='LOW_CONFIDENCE'&&item.reason!=='INSUFFICIENT_BILATERAL_EVIDENCE')return item;active.add(key);const since=this.firstSeen.get(key)??now;this.firstSeen.set(key,since);if(now-since<this.boundedWaitMs)return Object.freeze({...item,reason:'TEMPORARILY_UNSTABLE' as const});return Object.freeze({...item,reason:item.reason,actionability:'USER_FIXABLE' as const});});
    for(const key of this.firstSeen.keys())if(!active.has(key))this.firstSeen.delete(key);
    const actions=blocking.map(item=>item.actionability);const actionability:GapActionabilityV01=actions.includes('SYSTEM_MEASUREMENT_DEFECT')?'SYSTEM_MEASUREMENT_DEFECT':actions.includes('USER_FIXABLE')?'USER_FIXABLE':actions.includes('WAIT_FOR_STABLE_EVIDENCE')?'WAIT_FOR_STABLE_EVIDENCE':'UNKNOWN';
    return Object.freeze({...raw,blocking_reasons:Object.freeze(blocking),actionability});
  }
}
