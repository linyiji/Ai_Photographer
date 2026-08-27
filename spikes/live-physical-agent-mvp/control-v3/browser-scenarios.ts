import { DEFAULT_TARGET } from '../closed-loop/config.js';
import { HumanStepServoV3 } from './controller.js';
import type { LiveMeasurementV3, V3FramingRelation, V3Snapshot, V3XRelation } from './types.js';

export const V3_BROWSER_SCENARIOS=['FRAMING_ONLY_BAD','X_ONLY_BAD','BOTH_BAD','ALREADY_SATISFIED','NO_EFFECT','WRONG_DIRECTION','MEASUREMENT_UNCERTAIN','SUBJECT_LOST','REACQUIRE','POST_READY_MOVEMENT'] as const;
export type V3BrowserScenario=typeof V3_BROWSER_SCENARIOS[number];

const m=(timestamp_ms:number,state_version:number,framing_relation:V3FramingRelation,x_relation:V3XRelation,options:{stable?:boolean;framing_error?:number|null;x_error?:number|null;lost?:boolean;quality?:'GOOD'|'MARGINAL'|'INVALID'}={}):LiveMeasurementV3=>{
  const stable=options.stable??true;const lost=options.lost??false;
  return Object.freeze({timestamp_ms,subject_state:lost?'LOST':'PRESENT',measurement_quality:options.quality??(lost?'INVALID':stable?'GOOD':'MARGINAL'),fresh:!lost,stable,framing_relation,x_relation,framing_motion:stable?'STILL':framing_relation==='TOO_CLOSE'?'FARTHER':'CLOSER',x_motion:stable?'STILL':x_relation==='TOO_LEFT'?'RIGHT':'LEFT',state_version,measurement_age_ms:0,diagnostics_ref:Object.freeze({measurement_id:`browser-${state_version}`,framing_error_normalized:options.framing_error??(framing_relation==='IN_RANGE'?0:2),x_error_normalized:options.x_error??(x_relation==='IN_RANGE'?0:2),framing_position:framing_relation==='TOO_CLOSE'?1.1:framing_relation==='TOO_FAR'?.3:.52,x_position:x_relation==='TOO_LEFT'?.3:x_relation==='TOO_RIGHT'?.7:.5,framing_comparison_key:'FRAMING_V3:center-medium',x_comparison_key:'X_V3:center-medium',internal_body_mode:'UPPER_BODY',internal_scale_metric_type:'UPPER_BODY_SCALE',validity_reason:'BROWSER_SCENARIO'})});
};
const step=(t:number,v:number,framing:V3FramingRelation,x:V3XRelation,endFraming:V3FramingRelation,endX:V3XRelation,endFramingError=0,endXError=0)=>[
  m(t,v,framing,x),m(t+300,v+1,framing,x),m(t+500,v+2,endFraming,endX,{stable:false,framing_error:endFramingError,x_error:endXError}),m(t+900,v+3,endFraming,endX,{framing_error:endFramingError,x_error:endXError}),m(t+1300,v+4,endFraming,endX,{framing_error:endFramingError,x_error:endXError}),
];

export function v3BrowserMeasurements(name:V3BrowserScenario):ReadonlyArray<LiveMeasurementV3>{
  if(name==='FRAMING_ONLY_BAD')return [...step(0,1,'TOO_FAR','IN_RANGE','IN_RANGE','IN_RANGE'),m(1600,6,'IN_RANGE','IN_RANGE'),m(2200,7,'IN_RANGE','IN_RANGE')];
  if(name==='X_ONLY_BAD')return [...step(0,1,'IN_RANGE','TOO_LEFT','IN_RANGE','IN_RANGE'),m(1600,6,'IN_RANGE','IN_RANGE'),m(2200,7,'IN_RANGE','IN_RANGE')];
  if(name==='BOTH_BAD')return [...step(0,1,'TOO_CLOSE','TOO_RIGHT','IN_RANGE','TOO_RIGHT',0,2),...step(1600,6,'IN_RANGE','TOO_RIGHT','IN_RANGE','IN_RANGE'),m(3200,11,'IN_RANGE','IN_RANGE'),m(3800,12,'IN_RANGE','IN_RANGE')];
  if(name==='ALREADY_SATISFIED'||name==='POST_READY_MOVEMENT')return [m(0,1,'IN_RANGE','IN_RANGE'),m(600,2,'IN_RANGE','IN_RANGE'),m(700,3,'IN_RANGE','IN_RANGE'),...(name==='POST_READY_MOVEMENT'?[m(900,4,'TOO_CLOSE','TOO_LEFT'),m(1400,5,'TOO_FAR','TOO_RIGHT')]:[])];
  if(name==='NO_EFFECT')return step(0,1,'IN_RANGE','TOO_LEFT','IN_RANGE','TOO_LEFT',0,2);
  if(name==='WRONG_DIRECTION')return step(0,1,'IN_RANGE','TOO_LEFT','IN_RANGE','TOO_LEFT',0,2.6);
  if(name==='MEASUREMENT_UNCERTAIN')return [m(0,1,'UNKNOWN','UNKNOWN',{quality:'INVALID'}),m(500,2,'UNKNOWN','UNKNOWN',{quality:'INVALID'})];
  if(name==='SUBJECT_LOST')return [m(0,1,'IN_RANGE','TOO_LEFT'),m(300,2,'IN_RANGE','TOO_LEFT'),m(600,3,'UNKNOWN','UNKNOWN',{lost:true})];
  return [m(0,1,'UNKNOWN','UNKNOWN',{lost:true}),m(500,2,'IN_RANGE','TOO_LEFT'),...step(800,3,'IN_RANGE','TOO_LEFT','IN_RANGE','IN_RANGE')];
}

export function runV3BrowserScenario(name:V3BrowserScenario):ReadonlyArray<V3Snapshot>{const controller=new HumanStepServoV3(DEFAULT_TARGET);controller.arm(0);return v3BrowserMeasurements(name).map(measurement=>controller.update(measurement));}
