export type RuntimePlatform='H5'|'WECHAT'|'TEST'
export type SupportLevel='SUPPORTED'|'PARTIAL'|'UNSUPPORTED'|'UNVERIFIED_REAL_DEVICE'
export type ImplementationType='FAKE'|'REAL'|'EXPERIMENTAL'|'UNAVAILABLE'
export type CapabilityName='CameraAdapter'|'FrameAdapter'|'SceneScanAdapter'|'AlbumAdapter'|'ShareAdapter'|'HapticAdapter'|'VoiceOutputAdapter'|'AuthAdapter'|'PaymentAdapter'|'DeviceMotionAdapter'|'StorageAdapter'|'NetworkAdapter'
export type PlatformResult<T=unknown>={ok:boolean;code:'OK'|'PERMISSION_DENIED'|'CAMERA_PERMISSION_DENIED'|'ALBUM_PERMISSION_DENIED'|'LOCATION_PERMISSION_DENIED'|'PLATFORM_UNSUPPORTED'|'PLATFORM_API_UNAVAILABLE'|'USER_CANCELLED'|'PLATFORM_TIMEOUT'|'NETWORK_UNAVAILABLE'|'UPLOAD_FAILED'|'STORAGE_FAILURE'|'SAVE_TO_ALBUM_DENIED'|'INVALID_ASSET'|'SHARE_FAILURE'|'CAMERA_FAILURE'|'CAPTURE_FAILED';supportLevel:SupportLevel;value?:T;message?:string}
export type AdapterDescriptor={capabilityName:CapabilityName;adapterId:string;adapterVersion:string;platform:RuntimePlatform;available:boolean;supportLevel:SupportLevel;reason:string;provenance:{implementationSource:'MAIN_M04'|'MAIN_SCENE_SPATIAL_V02';runtimeSupport:SupportLevel}}
export type CapabilitySelection={capabilityName:string;selectedAdapter:string;implementationType:ImplementationType;supportLevel:SupportLevel;sourceTrack:string;acceptanceLevel:string;platform:RuntimePlatform;version:string}

export function implementationType(level:SupportLevel):ImplementationType{
 if(level==='SUPPORTED')return 'REAL'
 if(level==='PARTIAL'||level==='UNVERIFIED_REAL_DEVICE')return 'EXPERIMENTAL'
 return 'UNAVAILABLE'
}

export function selectionFrom(descriptor:AdapterDescriptor):CapabilitySelection{
 return {capabilityName:descriptor.capabilityName,selectedAdapter:descriptor.adapterId,implementationType:implementationType(descriptor.supportLevel),supportLevel:descriptor.supportLevel,sourceTrack:descriptor.provenance.implementationSource,acceptanceLevel:descriptor.supportLevel,platform:descriptor.platform,version:descriptor.adapterVersion}
}

export function normalizedFailure<T=unknown>(kind:PlatformResult['code'],supportLevel:SupportLevel='PARTIAL',message?:string):PlatformResult<T>{
 return {ok:false,code:kind,supportLevel,message}
}
