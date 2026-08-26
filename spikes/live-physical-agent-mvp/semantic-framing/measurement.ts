import type { LandmarkSample, PerceptionConfig, PoseMeasurement } from '../perception/types.js';
import { buildLandmarkGroups, visibleGroupPoints } from './landmarks.js';
import type { BodyMode, CroppedEdges, FramingScaleMeasurement, LandmarkGroupEvidenceMap, RawDistanceProxyMeasurement, SemanticRawMeasurement, SensorPoint, TorsoOrientation, VisibleSensorRect } from './types.js';

const clamp = (value:number,min=0,max=1):number => Math.min(max,Math.max(min,value));
const average = (values: readonly number[]):number => values.length ? values.reduce((sum,value)=>sum+value,0)/values.length : 0;
const weighted = (values: readonly [number,number][]):number|null => { const usable=values.filter(([,weight])=>weight>0); const total=usable.reduce((sum,[,weight])=>sum+weight,0); return total?usable.reduce((sum,[value,weight])=>sum+value*weight,0)/total:null; };
const pointMean = (points: readonly LandmarkSample[]):SensorPoint|null => points.length ? {x:average(points.map((point)=>point.x)),y:average(points.map((point)=>point.y))}:null;

function classify(groups:LandmarkGroupEvidenceMap,crop:CroppedEdges):{mode:BodyMode;confidence:number} {
  const head=groups.HEAD_CORE.valid, shoulders=groups.SHOULDERS.bilateral_valid, hips=groups.HIPS.bilateral_valid, knees=groups.KNEES.bilateral_valid, ankles=groups.ANKLES.bilateral_valid;
  if (head&&shoulders&&hips&&knees&&ankles&&!crop.bottom) return {mode:'FULL_BODY',confidence:Math.min(groups.HEAD_CORE.confidence,groups.SHOULDERS.confidence,groups.HIPS.confidence,groups.KNEES.confidence,groups.ANKLES.confidence)};
  if (shoulders&&hips&&knees&&(!ankles||crop.bottom)) return {mode:'THREE_QUARTER',confidence:Math.min(groups.SHOULDERS.confidence,groups.HIPS.confidence,groups.KNEES.confidence)};
  if (shoulders&&hips&&(!knees||crop.bottom)) return {mode:'UPPER_BODY',confidence:Math.min(groups.SHOULDERS.confidence,groups.HIPS.confidence)};
  if (head&&shoulders&&!hips) return {mode:'HEAD_SHOULDERS',confidence:Math.min(groups.HEAD_CORE.confidence,groups.SHOULDERS.confidence)};
  if (head&&!shoulders) return {mode:'HEAD_ONLY',confidence:groups.HEAD_CORE.confidence};
  return {mode:'PARTIAL_OR_AMBIGUOUS',confidence:Math.max(groups.HEAD_CORE.confidence,groups.SHOULDERS.confidence,groups.HIPS.confidence)*0.6};
}

function cropEvidence(landmarks:readonly LandmarkSample[],groups:LandmarkGroupEvidenceMap,threshold:number,viewport:VisibleSensorRect):CroppedEdges {
  const marginX=Math.max(.025,(viewport.right-viewport.left)*.04), marginY=Math.max(.025,(viewport.bottom-viewport.top)*.04);
  const torso=[...visibleGroupPoints(landmarks,'SHOULDERS',threshold),...visibleGroupPoints(landmarks,'HIPS',threshold)];
  const head=visibleGroupPoints(landmarks,'HEAD_CORE',threshold); const knees=visibleGroupPoints(landmarks,'KNEES',threshold);
  const near=(points:readonly LandmarkSample[],edge:'left'|'right'|'top'|'bottom'):boolean => points.some((point)=>edge==='left'?point.x<=viewport.left+marginX:edge==='right'?point.x>=viewport.right-marginX:edge==='top'?point.y<=viewport.top+marginY:point.y>=viewport.bottom-marginY);
  const bottom=(groups.KNEES.valid&&!groups.ANKLES.valid&&near(knees,'bottom')) || (groups.HIPS.valid&&!groups.KNEES.valid&&near(visibleGroupPoints(landmarks,'HIPS',threshold),'bottom'));
  return {top:head.length>=2&&near(head,'top'),bottom,left:torso.length>=2&&near(torso,'left'),right:torso.length>=2&&near(torso,'right')};
}

function robustPoseBox(points:readonly LandmarkSample[],timestampMs:number,confidence:number):PoseMeasurement|null {
  if(!points.length)return null; const xs=points.map((point)=>clamp(point.x)); const ys=points.map((point)=>clamp(point.y)); const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  return {timestamp_ms:timestampMs,confidence,pose_presence:confidence,valid_landmark_count:points.length,min_x:minX,max_x:maxX,min_y:minY,max_y:maxY,center_x:(minX+maxX)/2,center_y:(minY+maxY)/2,width_ratio:maxX-minX,height_ratio:maxY-minY};
}

function torsoOrientation(landmarks:readonly LandmarkSample[],groups:LandmarkGroupEvidenceMap):{orientation:TorsoOrientation;uncertainty:number} {
  const left=landmarks[11],right=landmarks[12],shoulderWidth=groups.SHOULDERS.pair_width,shoulder=groups.SHOULDERS.pair_center,hip=groups.HIPS.pair_center;
  if(!groups.SHOULDERS.bilateral_valid||shoulderWidth===null)return {orientation:'SIDEWAYS_OR_UNCERTAIN',uncertainty:1};
  const torsoLength=shoulder&&hip?Math.abs(hip.y-shoulder.y):null;
  const ratio=torsoLength&&torsoLength>.001?shoulderWidth/torsoLength:null;
  const zAvailable=Number.isFinite(left?.z)&&Number.isFinite(right?.z);const zSkew=zAvailable?Math.abs((left.z??0)-(right.z??0))/Math.max(shoulderWidth,.01):0;
  if(zSkew>.75||(ratio!==null&&ratio<.45))return {orientation:'SIDEWAYS_OR_UNCERTAIN',uncertainty:.8};
  if(zSkew>.3||(ratio!==null&&ratio<.7))return {orientation:'OBLIQUE',uncertainty:.38};
  return {orientation:'FRONTAL_OR_NEAR_FRONTAL',uncertainty:zAvailable?clamp(zSkew*.35):.12};
}

function distanceProxy(groups:LandmarkGroupEvidenceMap,head:SensorPoint|null,orientation:TorsoOrientation,orientationUncertainty:number):RawDistanceProxyMeasurement {
  const shoulder=groups.SHOULDERS.pair_center,hip=groups.HIPS.pair_center,sw=groups.SHOULDERS.pair_width;
  if(!groups.SHOULDERS.bilateral_valid||sw===null)return {value:null,source:'UNAVAILABLE',confidence:0,uncertainty:1,valid:false,validity_reason:'SHOULDER_PAIR_MISSING'};
  const torso=shoulder&&hip?Math.abs(hip.y-shoulder.y):null;const hs=head&&shoulder?Math.abs(shoulder.y-head.y):null;
  let value=sw*1.5;let source:RawDistanceProxyMeasurement['source']='SHOULDER_WIDTH';let corroborationConfidence=groups.SHOULDERS.confidence;
  if(torso!==null){value=sw*1.05+torso*.7;source='TORSO_COMPOSITE';corroborationConfidence=Math.min(groups.SHOULDERS.confidence,groups.HIPS.confidence);}
  else if(hs!==null){value=sw*1.2+hs*.55;source='HEAD_SHOULDER_COMPOSITE';corroborationConfidence=Math.min(groups.SHOULDERS.confidence,groups.HEAD_CORE.confidence);}
  const confidence=clamp(groups.SHOULDERS.confidence*.75+corroborationConfidence*.25);const uncertainty=clamp((1-confidence)*.55+orientationUncertainty*.45);
  const valid=orientation!=='SIDEWAYS_OR_UNCERTAIN'&&uncertainty<=.5;
  return {value:clamp(value),source,confidence,uncertainty,valid,validity_reason:valid?'VALID':orientation==='SIDEWAYS_OR_UNCERTAIN'?'ORIENTATION_UNCERTAIN':'UNCERTAINTY_TOO_HIGH'};
}

function scale(mode:BodyMode,groups:LandmarkGroupEvidenceMap,head:SensorPoint|null,orientationUncertainty:number,crop:CroppedEdges):FramingScaleMeasurement|null {
  const shoulder=groups.SHOULDERS.pair_center,hip=groups.HIPS.pair_center,knee=groups.KNEES.pair_center,ankle=groups.ANKLES.pair_center;
  const sw=groups.SHOULDERS.pair_width; const hs=head&&shoulder?Math.abs(shoulder.y-head.y):null; const torso=shoulder&&hip?Math.abs(hip.y-shoulder.y):null; const hk=hip&&knee?Math.abs(knee.y-hip.y):null; const ha=head&&ankle?Math.abs(ankle.y-head.y):null;
  const components={...(sw!==null?{shoulder_width:sw}:{}),...(hs!==null?{head_shoulder_span:hs}:{}),...(torso!==null?{torso_length:torso}:{}),...(hk!==null?{hip_knee_span:hk}:{}),...(ha!==null?{head_ankle_span:ha}:{})};
  const confidences={...(sw!==null?{shoulder_width:groups.SHOULDERS.confidence}:{}),...(hs!==null?{head_shoulder_span:Math.min(groups.HEAD_CORE.confidence,groups.SHOULDERS.confidence)}:{}),...(torso!==null?{torso_length:Math.min(groups.SHOULDERS.confidence,groups.HIPS.confidence)}:{}),...(hk!==null?{hip_knee_span:Math.min(groups.HIPS.confidence,groups.KNEES.confidence)}:{}),...(ha!==null?{head_ankle_span:Math.min(groups.HEAD_CORE.confidence,groups.ANKLES.confidence)}:{})};
  let metric:FramingScaleMeasurement['metric_type']=null; let candidates:[number,number][]=[];
  if(mode==='HEAD_SHOULDERS'&&sw!==null){metric='HEAD_SHOULDERS_SCALE';candidates=[[sw*1.5,groups.SHOULDERS.confidence],...(hs!==null?[[hs*2.2,(confidences.head_shoulder_span??0)*.45] as [number,number]]:[])];}
  if(mode==='UPPER_BODY'&&sw!==null&&torso!==null){metric='UPPER_BODY_SCALE';candidates=[[sw*1.35,groups.SHOULDERS.confidence],[(torso+(hs??0)*.75),(confidences.torso_length??0)*.7]];}
  if(mode==='THREE_QUARTER'&&torso!==null&&hk!==null){metric='THREE_QUARTER_SCALE';candidates=[[torso+hk+(hs??0)*.6,Math.min(confidences.torso_length??0,confidences.hip_knee_span??0)],...(sw!==null?[[sw*2.1,groups.SHOULDERS.confidence*.35] as [number,number]]:[])];}
  if(mode==='FULL_BODY'&&ha!==null&&sw!==null){metric='FULL_BODY_SCALE';candidates=[[ha,confidences.head_ankle_span??0],[sw*3,groups.SHOULDERS.confidence*.3]];}
  const value=weighted(candidates); if(value===null||metric===null)return null; const normalized=candidates.map(([candidate])=>candidate); const mean=average(normalized);const disagreement=normalized.length>1?Math.abs(normalized[0]-normalized[1])/Math.max(mean,.01):0;
  const confidenceUncertainty=1-average(candidates.map(([,confidence])=>confidence));const cropAmbiguity:number=(crop.left||crop.right)?0.15:0;const componentDisagreement=clamp(disagreement);
  const uncertaintyComponents={landmark_confidence:clamp(confidenceUncertainty),component_disagreement:componentDisagreement,orientation_ambiguity:orientationUncertainty,crop_ambiguity:cropAmbiguity,temporal_variance:0};
  const uncertainty=clamp(uncertaintyComponents.landmark_confidence*.35+componentDisagreement*.15+orientationUncertainty*.3+cropAmbiguity*.2);
  return {value:clamp(value),metric_type:metric,component_values:Object.freeze(components),component_confidences:Object.freeze(confidences),uncertainty,uncertainty_components:Object.freeze(uncertaintyComponents),body_mode:mode};
}

export function extractSemanticRawMeasurement(landmarks:readonly LandmarkSample[],timestampMs:number,config:Pick<PerceptionConfig,'visibilityThreshold'|'presenceThreshold'>,viewport:VisibleSensorRect,rawPoseBox:PoseMeasurement|null):SemanticRawMeasurement|null {
  const threshold=Math.max(config.visibilityThreshold,config.presenceThreshold); const groups=buildLandmarkGroups(landmarks,threshold); const crop=cropEvidence(landmarks,groups,threshold,viewport); const classification=classify(groups,crop);
  const head=pointMean(visibleGroupPoints(landmarks,'HEAD_CORE',threshold)); const shoulder=groups.SHOULDERS.pair_center,hip=groups.HIPS.pair_center;
  const orientation=torsoOrientation(landmarks,groups);const proxy=distanceProxy(groups,head,orientation.orientation,orientation.uncertainty);
  let anchor:number|null=null,source:SemanticRawMeasurement['anchor_x_source']='UNAVAILABLE',uncertainty=1;
  if(shoulder&&hip){const sw=groups.SHOULDERS.confidence,hw=groups.HIPS.confidence;anchor=(shoulder.x*sw+hip.x*hw)/(sw+hw);source='SHOULDER_HIP_FUSION';uncertainty=clamp(Math.abs(shoulder.x-hip.x)*1.5+(1-Math.min(sw,hw))*.2);}
  else if(shoulder){anchor=shoulder.x;source='SHOULDER_PAIR';uncertainty=clamp(.045+(1-groups.SHOULDERS.confidence)*.25);}
  else if(hip){anchor=hip.x;source='HIP_PAIR';uncertainty=clamp(.06+(1-groups.HIPS.confidence)*.3);}
  else if(head){anchor=head.x;source='HEAD_FALLBACK';uncertainty=.18;}
  const modes:BodyMode[]=['HEAD_SHOULDERS','UPPER_BODY','THREE_QUARTER','FULL_BODY']; const scaleByMode:Partial<Record<BodyMode,FramingScaleMeasurement>>={}; for(const mode of modes){const value=scale(mode,groups,head,orientation.uncertainty,crop);if(value)scaleByMode[mode]=value;}
  const displayPoints=['HEAD_CORE','SHOULDERS','HIPS','KNEES','ANKLES'].flatMap((name)=>visibleGroupPoints(landmarks,name as keyof typeof groups,threshold));
  return {timestamp_ms:timestampMs,groups,candidate_mode:classification.mode,candidate_confidence:classification.confidence,cropped_edges:crop,anchor_x:anchor,anchor_x_source:source,anchor_x_uncertainty:uncertainty,torso_orientation:orientation.orientation,orientation_uncertainty:orientation.uncertainty,distance_proxy:proxy,scale_by_mode:Object.freeze(scaleByMode),display_box:robustPoseBox(displayPoints,timestampMs,classification.confidence),raw_pose_box:rawPoseBox};
}
