export type ShootingRelationDefault='FRIEND'|'SOLO'
export type DeviceModeDefault='SINGLE'|'DUAL'|'SOLO_FIXED'
export type CameraFacingDefault='environment'|'user'

export type UserPreferences={
 shooting_relation_default:ShootingRelationDefault
 device_mode_default:DeviceModeDefault
 camera_facing_default:CameraFacingDefault
 voice_guidance_enabled:boolean
 haptic_enabled:boolean
 composition_grid_enabled:boolean
 auto_processing_enabled:boolean
 open_fine_tune_after_processing:boolean
}

export const DEFAULT_USER_PREFERENCES:UserPreferences={
 shooting_relation_default:'FRIEND',device_mode_default:'SINGLE',camera_facing_default:'environment',
 voice_guidance_enabled:true,haptic_enabled:true,composition_grid_enabled:true,
 auto_processing_enabled:true,open_fine_tune_after_processing:true
}

export type PreferenceStorage={read:()=>Promise<unknown>;write:(value:UserPreferences)=>Promise<void>}

export function normalizePreferences(value:unknown):UserPreferences{
 const candidate=value&&typeof value==='object'?value as Partial<UserPreferences>:{}
 return {
  shooting_relation_default:candidate.shooting_relation_default==='SOLO'?'SOLO':'FRIEND',
  device_mode_default:candidate.device_mode_default==='DUAL'||candidate.device_mode_default==='SOLO_FIXED'?candidate.device_mode_default:'SINGLE',
  camera_facing_default:candidate.camera_facing_default==='user'?'user':'environment',
  voice_guidance_enabled:candidate.voice_guidance_enabled!==false,
  haptic_enabled:candidate.haptic_enabled!==false,
  composition_grid_enabled:candidate.composition_grid_enabled!==false,
  auto_processing_enabled:candidate.auto_processing_enabled!==false,
  open_fine_tune_after_processing:candidate.open_fine_tune_after_processing!==false
 }
}

export async function loadPreferences(storage:PreferenceStorage):Promise<UserPreferences>{return normalizePreferences(await storage.read())}
export async function savePreferences(storage:PreferenceStorage,value:UserPreferences):Promise<UserPreferences>{const normalized=normalizePreferences(value);await storage.write(normalized);return normalized}

export type SessionUIOverride=Partial<Pick<UserPreferences,'camera_facing_default'|'voice_guidance_enabled'|'haptic_enabled'|'composition_grid_enabled'>>
export function effectivePreferences(preferences:UserPreferences,override:SessionUIOverride):UserPreferences{return {...preferences,...override}}
export function resetSessionOverride():SessionUIOverride{return {}}
