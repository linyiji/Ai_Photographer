import type { V3Episode, V3Snapshot } from './types.js';

export interface V3TraceContext { scenario_label:string; generated_at_iso:string; runtime_telemetry?:unknown; session?:unknown }

const scalarEpisode=(episode:Readonly<V3Episode>)=>({
  trial_id:episode.trial_id,episode_id:episode.episode_id,state:episode.state,stage:episode.stage,action:episode.action,
  action_issued_at:episode.issued_at,movement_started_at:episode.movement_started_at,meaningful_motion_at:episode.meaningful_motion_at,
  settle_detected_at:episode.settle_detected_at,settled_measurement_at:episode.settled_measurement_at,outcome_at:episode.outcome_at,
  start_state_version:episode.start_state_version,settled_state_version:episode.settled_state_version,start_relation:episode.start_relation,
  settled_relation:episode.settled_relation,start_error:episode.start_error,settled_error:episode.settled_error,
  measurement_quality:episode.measurement_quality,freshness:episode.freshness,settle_duration:episode.settle_duration,outcome:episode.outcome,
});

export class V3HumanStepTraceRecorder {
  private episodes=new Map<string,ReturnType<typeof scalarEpisode>>();
  private latest:V3Snapshot|null=null;
  clear():void{this.episodes.clear();this.latest=null;}
  append(snapshot:V3Snapshot):void{this.latest=snapshot;if(snapshot.episode){const row=scalarEpisode(snapshot.episode);this.episodes.set(`${row.trial_id}:${row.episode_id}`,row);}}
  json(context:V3TraceContext):string{return JSON.stringify({format:'xfx-live-p2-v3-human-step-trace-v1',raw_media:false,control_policy:'V3',evidence_context:context,controller:{settle_window_ms:375,episode_timeout_ms:4500,predictive_stop:false,states:['ISSUED','WAIT_FOR_SETTLE','EVALUATED']},episodes:[...this.episodes.values()],summary:this.latest?{stage:this.latest.stage,ready:this.latest.ready,metrics:this.latest.metrics}:null,privacy:{saved_camera_frames:0,raw_video_upload:0,backend_per_frame:0,provider:0,luna:0}},null,2);}
}
