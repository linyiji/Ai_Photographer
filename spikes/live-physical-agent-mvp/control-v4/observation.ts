import type { StructuredPerceptionState } from '../perception/types.js';
import type { BodyRegionEvidenceV01, BodyRegionV01, HumanObservationV02, ScaleEvidenceV02, ScaleMetricV02, SemanticAnchorNameV01, SemanticAnchorV01, SubjectLockStateV01 } from './types.js';

const finite=(v:number|null|undefined):v is number=>typeof v==='number'&&Number.isFinite(v);
const region=(visible:boolean,bilateral:boolean,confidence:number,crop_risk:BodyRegionEvidenceV01['crop_risk']='NONE'):Readonly<BodyRegionEvidenceV01>=>Object.freeze({visible,bilateral,confidence,crop_risk});
const motion=(v:number|null|undefined):'NEGATIVE'|'POSITIVE'|'STILL'|'UNKNOWN'=>!finite(v)?'UNKNOWN':v<-.08?'NEGATIVE':v>.08?'POSITIVE':'STILL';

export class HumanObservationV02Projector {
  private presentSince:number|null=null;private lostSince:number|null=null;private previousReacquisition=0;private hadLock=false;
  reset():void{this.presentSince=this.lostSince=null;this.previousReacquisition=0;this.hadLock=false;}
  project(state:StructuredPerceptionState,decisionAgeMs=0):Readonly<HumanObservationV02>{
    const framing=state.framing;const present=state.subject.present;const now=state.timestamp_ms;const reacquisitionBarrier=state.reacquisition_count>this.previousReacquisition;this.previousReacquisition=Math.max(this.previousReacquisition,state.reacquisition_count);
    let lockState:SubjectLockStateV01;
    if(present){this.presentSince??=now;this.lostSince=null;lockState=reacquisitionBarrier||this.hadLock&&now-this.presentSince<300?'REACQUIRING':now-this.presentSince>=300?'LOCKED':'ACQUIRING';if(lockState==='LOCKED')this.hadLock=true;}
    else {this.lostSince??=now;this.presentSince=null;lockState=this.hadLock&&now-this.lostSince<=450?'HELD':'LOST';}
    const groups=framing?.groups;const crop=framing?.cropped_edges;const g=(name:keyof NonNullable<typeof groups>)=>groups?.[name];
    const head=g('HEAD_CORE'),shoulders=g('SHOULDERS'),hips=g('HIPS'),knees=g('KNEES'),ankles=g('ANKLES');
    const regions:Record<BodyRegionV01,Readonly<BodyRegionEvidenceV01>>={
      HEAD:region(Boolean(head?.valid),Boolean(head?.bilateral_valid),head?.confidence??0,crop?.top?'TOP':'NONE'),
      SHOULDERS:region(Boolean(shoulders?.valid),Boolean(shoulders?.bilateral_valid),shoulders?.confidence??0,crop?.left||crop?.right?'SIDE':'NONE'),
      UPPER_TORSO:region(Boolean(shoulders?.valid&&hips?.valid),Boolean(shoulders?.bilateral_valid&&hips?.bilateral_valid),Math.min(shoulders?.confidence??0,hips?.confidence??0)),
      HIPS:region(Boolean(hips?.valid),Boolean(hips?.bilateral_valid),hips?.confidence??0),
      KNEES:region(Boolean(knees?.valid),Boolean(knees?.bilateral_valid),knees?.confidence??0,crop?.bottom?'BOTTOM':'NONE'),
      ANKLES:region(Boolean(ankles?.valid),Boolean(ankles?.bilateral_valid),ankles?.confidence??0,crop?.bottom?'BOTTOM':'NONE'),
      FEET:region(Boolean(ankles?.bilateral_valid&&!crop?.bottom),Boolean(ankles?.bilateral_valid),ankles?.confidence??0,crop?.bottom?'BOTTOM':'NONE'),
    };
    const anchors:Partial<Record<SemanticAnchorNameV01,Readonly<SemanticAnchorV01>>>={};
    const put=(name:SemanticAnchorNameV01,p:typeof head extends infer _ ? {x:number;y:number}|null|undefined:never,confidence:number,source:string)=>{if(p&&finite(p.x)&&finite(p.y))anchors[name]=Object.freeze({name,x:p.x,y:p.y,confidence,source});};
    put('HEAD_CENTER',head?.pair_center,head?.confidence??0,'HEAD_CORE');put('SHOULDER_CENTER',shoulders?.pair_center,shoulders?.confidence??0,'SHOULDERS');put('HIP_CENTER',hips?.pair_center,hips?.confidence??0,'HIPS');put('KNEE_CENTER',knees?.pair_center,knees?.confidence??0,'KNEES');put('ANKLE_CENTER',ankles?.pair_center,ankles?.confidence??0,'ANKLES');
    const shoulder=anchors.SHOULDER_CENTER,hip=anchors.HIP_CENTER,headAnchor=anchors.HEAD_CENTER,knee=anchors.KNEE_CENTER,ankle=anchors.ANKLE_CENTER;
    if(shoulder&&hip)anchors.TORSO_CENTER=Object.freeze({name:'TORSO_CENTER',x:(shoulder.x+hip.x)/2,y:(shoulder.y+hip.y)/2,confidence:Math.min(shoulder.confidence,hip.confidence),source:'SHOULDER_HIP_MIDPOINT'});
    const bodyPoints=[headAnchor,shoulder,hip,knee,ankle].filter((v):v is Readonly<SemanticAnchorV01>=>Boolean(v));if(bodyPoints.length)anchors.BODY_CENTER=Object.freeze({name:'BODY_CENTER',x:bodyPoints.reduce((s,p)=>s+p.x,0)/bodyPoints.length,y:bodyPoints.reduce((s,p)=>s+p.y,0)/bodyPoints.length,confidence:Math.min(...bodyPoints.map(p=>p.confidence)),source:'VISIBLE_ANCHOR_MEAN'});
    const scale=(metric:ScaleMetricV02,end:Readonly<SemanticAnchorV01>|undefined):Readonly<ScaleEvidenceV02>=>{const value=headAnchor&&end?Math.abs(end.y-headAnchor.y):null;return Object.freeze({metric,value,valid:finite(value)&&value>.02,confidence:headAnchor&&end?Math.min(headAnchor.confidence,end.confidence):0});};
    const measurementAge=state.measurement_age_ms??9999;const fresh=present&&measurementAge<=180&&decisionAgeMs<=160&&!reacquisitionBarrier;const stable=Boolean(framing?.stable??state.subject.stable);const primary=anchors.TORSO_CENTER??anchors.SHOULDER_CENTER??anchors.HEAD_CENTER;const quality=!present||!primary?'INVALID':fresh&&stable?'GOOD':'MARGINAL';const warnings:string[]=[];if(lockState==='HELD')warnings.push('TEMPORARY_LANDMARK_LOSS');if(crop?.bottom)warnings.push('BOTTOM_CROP_RISK');if(!framing)warnings.push('SEMANTIC_FRAMING_UNAVAILABLE');
    return Object.freeze({observation_version:'HumanObservationV02',timestamp_ms:now,state_version:state.sequence,measurement_age_ms:measurementAge,fresh,stable,quality,subject_lock:Object.freeze({state:lockState,confidence:present?state.subject.confidence:0,tracked_subject_count:present?1:0,lock_age_ms:this.presentSince===null?0:now-this.presentSince,identity_claim:false,multi_person_supported:false}),body_visibility:Object.freeze({regions:Object.freeze(regions),summary_mode:framing?.body_mode??'UNKNOWN',summary_only:true,feet_visible:regions.FEET.visible,feet_bottom_cropped:Boolean(crop?.bottom&&ankles?.valid),partial_landmarks:present&&Object.values(regions).some(r=>!r.visible)}),semantic_anchors:Object.freeze({anchors:Object.freeze(anchors),coordinate_basis:'SENSOR_NORMALIZED_NON_MIRRORED',mirror_applied_to_control:false}),scale_evidence:Object.freeze({HEAD_TO_HIP:scale('HEAD_TO_HIP',hip),HEAD_TO_KNEE:scale('HEAD_TO_KNEE',knee),HEAD_TO_ANKLE:scale('HEAD_TO_ANKLE',ankle)}),motion_evidence:Object.freeze({x_motion:motion(framing?.velocity_x??state.subject.velocity_x),scale_motion:motion(framing?.velocity_scale??state.subject.velocity_scale),velocity_x:framing?.velocity_x??state.subject.velocity_x??null,velocity_scale:framing?.velocity_scale??state.subject.velocity_scale??null,distance_proxy:framing?.distance_proxy.valid?framing.distance_proxy.value:null,distance_proxy_role:'RESPONSE_EVIDENCE_ONLY'}),diagnostics:Object.freeze({source_body_mode_summary:framing?.body_mode??null,reacquisition_barrier:reacquisitionBarrier,warnings:Object.freeze(warnings)})});
  }
}

