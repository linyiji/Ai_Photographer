import type { DirectionalAction } from '../closed-loop/types.js';
import { bodyModeProgressionDelta, coarseActionForCompatibility, framingCompatibilityFor } from './profiles.js';
import type { CoarseFramingAction, CoarseFramingEpisode, FramingCompatibilityState, FramingMeasurement } from './types.js';

export interface CoarseFramingDecision {
  compatibility: FramingCompatibilityState;
  precision_ready: boolean;
  handoff_barrier_state_version: number | null;
  handoff_count: number;
  instruction_action: DirectionalAction | null;
  episode: Readonly<CoarseFramingEpisode> | null;
}

const coarseName=(action:DirectionalAction):CoarseFramingAction=>action==='MOVE_FARTHER'?'COARSE_MOVE_FARTHER':'COARSE_MOVE_CLOSER';
const directionProgress=(action:CoarseFramingAction,start:number,current:number):number=>action==='COARSE_MOVE_FARTHER'?(start-current)/Math.max(start,.01):(current-start)/Math.max(start,.01);

export class CoarseFramingController {
  private sequence=0;private episode:CoarseFramingEpisode|null=null;private handoffBarrier:number|null=null;private handoffCount=0;private previousCompatibility:FramingCompatibilityState|null=null;
  constructor(private readonly persistenceMs=250,private readonly responseGraceMs=900,private readonly timeoutMs=4500){}
  reset():void{this.sequence=0;this.episode=null;this.handoffBarrier=null;this.handoffCount=0;this.previousCompatibility=null;}
  update(targetId:string,framing:FramingMeasurement,trialId:number,now:number):CoarseFramingDecision {
    const compatibility=framingCompatibilityFor(targetId,framing.body_mode);const previous=this.previousCompatibility;this.previousCompatibility=compatibility;
    if(compatibility==='COMPATIBLE'){
      if(this.episode&&previous!==compatibility){const directional:DirectionalAction=this.episode.action==='COARSE_MOVE_FARTHER'?'MOVE_FARTHER':'MOVE_CLOSER';if(this.episode.body_mode_progression_path.at(-1)!==framing.body_mode)this.episode.body_mode_progression_path.push(framing.body_mode);this.episode.body_mode_progression=Math.max(this.episode.body_mode_progression,bodyModeProgressionDelta(this.episode.start_body_mode,framing.body_mode,directional));if(!this.episode.terminal_outcome)this.finish('SUCCESS',now);this.handoffBarrier=framing.state_version;this.handoffCount+=1;}
      const ready=this.handoffBarrier===null||(framing.state_version>this.handoffBarrier&&framing.stable&&framing.valid_for_precision_scale);
      if(ready)this.handoffBarrier=null;
      return this.decision(compatibility,ready,null);
    }
    const directional=coarseActionForCompatibility(compatibility);
    if(!directional){if(this.episode&&!this.episode.terminal_outcome&&now-this.episode.issued_at>=this.timeoutMs)this.finish('MEASUREMENT_UNCERTAIN',now);return this.decision(compatibility,false,null);}
    const action=coarseName(directional);
    if(!this.episode||(this.episode.terminal_outcome&&this.episode.action!==action)){
      this.sequence+=1;this.episode={trial_id:trialId,coarse_episode_id:this.sequence,action,issued_at:now,instruction_issued:false,start_body_mode:framing.body_mode,target_compatibility:compatibility,start_distance_proxy:framing.distance_proxy.valid?framing.distance_proxy.value:null,start_distance_proxy_confidence:framing.distance_proxy.confidence,best_distance_proxy:framing.distance_proxy.value,coarse_progress_proxy:0,body_mode_progression:0,body_mode_progression_path:[framing.body_mode],terminal_outcome:null,terminal_at:null};
    }
    const episode=this.episode;
    if(episode.terminal_outcome)return this.decision(compatibility,false,null);
    if(episode.action!==action){this.finish('SUCCESS',now);return this.update(targetId,framing,trialId,now);}
    if(episode.body_mode_progression_path.at(-1)!==framing.body_mode)episode.body_mode_progression_path.push(framing.body_mode);
    episode.body_mode_progression=Math.max(episode.body_mode_progression,bodyModeProgressionDelta(episode.start_body_mode,framing.body_mode,directional));
    if(episode.start_distance_proxy!==null&&framing.distance_proxy.valid&&framing.distance_proxy.value!==null){const progress=directionProgress(episode.action,episode.start_distance_proxy,framing.distance_proxy.value);episode.coarse_progress_proxy=Math.max(episode.coarse_progress_proxy,progress);episode.best_distance_proxy=framing.distance_proxy.value;if(now-episode.issued_at>=this.responseGraceMs&&progress<=-.06)this.finish('WRONG_DIRECTION',now);else if(framing.stable&&(episode.coarse_progress_proxy>=.05||episode.body_mode_progression>0))this.finish('SUCCESS',now);}
    if(!episode.terminal_outcome&&now-episode.issued_at>=this.timeoutMs)this.finish(framing.distance_proxy.valid?'NO_EFFECT':'MEASUREMENT_UNCERTAIN',now);
    let instruction:DirectionalAction|null=null;if(!episode.instruction_issued&&now-episode.issued_at>=this.persistenceMs){episode.instruction_issued=true;instruction=directional;}
    return this.decision(compatibility,false,instruction);
  }
  private finish(outcome:NonNullable<CoarseFramingEpisode['terminal_outcome']>,now:number):void{if(!this.episode||this.episode.terminal_outcome)return;this.episode.terminal_outcome=outcome;this.episode.terminal_at=now;}
  private decision(compatibility:FramingCompatibilityState,precisionReady:boolean,instruction:DirectionalAction|null):CoarseFramingDecision{return {compatibility,precision_ready:precisionReady,handoff_barrier_state_version:this.handoffBarrier,handoff_count:this.handoffCount,instruction_action:instruction,episode:this.episode?Object.freeze({...this.episode,body_mode_progression_path:[...this.episode.body_mode_progression_path]}):null};}
}
