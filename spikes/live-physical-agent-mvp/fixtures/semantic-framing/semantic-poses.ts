import type { LandmarkSample } from '../../perception/types.js';
import type { BodyMode } from '../../semantic-framing/types.js';

const hidden=():LandmarkSample=>({x:.5,y:.5,z:0,visibility:.05,presence:.05});
const visible=(x:number,y:number,confidence=.95):LandmarkSample=>({x,y,z:0,visibility:confidence,presence:confidence});
const pair=(points:LandmarkSample[],left:number,right:number,cx:number,y:number,width:number,confidence:number):void=>{points[left]=visible(cx-width/2,y,confidence);points[right]=visible(cx+width/2,y,confidence);};

export interface SemanticPoseOptions { center_x?:number; scale?:number; confidence?:number; wrist_extension?:'LEFT'|'RIGHT'|null; missing_elbow?:boolean; missing_knee?:boolean; missing_ankle?:boolean; shoulder_confidence_asymmetry?:boolean; hip_confidence_asymmetry?:boolean; }

export function semanticPose(mode:BodyMode,options:SemanticPoseOptions={}):LandmarkSample[]{
  const points=Array.from({length:33},hidden);const cx=options.center_x??.5,s=options.scale??.8,c=options.confidence??.95;const yHead=.5-.4*s,yShoulder=.5-.28*s,yHip=.5,yKnee=.5+.25*s,yAnkle=.5+.45*s;
  if(mode!=='PARTIAL_OR_AMBIGUOUS'){points[0]=visible(cx,yHead,c);points[2]=visible(cx-.025*s,yHead,c);points[5]=visible(cx+.025*s,yHead,c);points[7]=visible(cx-.06*s,yHead+.01*s,c);points[8]=visible(cx+.06*s,yHead+.01*s,c);}
  if(['HEAD_SHOULDERS','UPPER_BODY','THREE_QUARTER','FULL_BODY'].includes(mode))pair(points,11,12,cx,yShoulder,.28*s,c);
  if(['UPPER_BODY','THREE_QUARTER','FULL_BODY'].includes(mode))pair(points,23,24,cx,yHip,.18*s,c);
  if(['THREE_QUARTER','FULL_BODY'].includes(mode)&&!options.missing_knee)pair(points,25,26,cx,yKnee,.16*s,c);
  if(mode==='FULL_BODY'&&!options.missing_ankle)pair(points,27,28,cx,yAnkle,.14*s,c);
  if(['UPPER_BODY','THREE_QUARTER','FULL_BODY'].includes(mode)){pair(points,13,14,cx,yShoulder+.14*s,.38*s,c);pair(points,15,16,cx,yShoulder+.27*s,.42*s,c);}
  if(options.wrist_extension==='RIGHT')points[16]=visible(Math.min(.99,cx+.46*s),yShoulder+.27*s,c);if(options.wrist_extension==='LEFT')points[15]=visible(Math.max(.01,cx-.46*s),yShoulder+.27*s,c);
  if(options.missing_elbow)points[14]=hidden();if(options.shoulder_confidence_asymmetry)points[12]=visible(cx+.14*s,yShoulder,.56);if(options.hip_confidence_asymmetry)points[24]=visible(cx+.09*s,yHip,.56);
  if(mode==='PARTIAL_OR_AMBIGUOUS'){points[11]=visible(cx-.1,yShoulder,c);points[23]=visible(cx-.08,yHip,c);points[13]=visible(cx-.18,yShoulder+.1,c);}
  return points;
}
