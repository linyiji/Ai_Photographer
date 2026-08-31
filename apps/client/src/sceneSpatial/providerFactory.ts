import type {RuntimePlatform} from '../platform/model'
import type {SpatialEvidenceV02} from './contracts'
import {FakeSceneSpatialAdapter,RealSceneSpatialAdapter,ReplaySceneSpatialAdapter,type SceneSpatialPort} from './port'
import {FetchSceneSpatialTransport,WeChatSceneSpatialTransport} from './transport'

export function createSceneSpatialProvider(platform:RuntimePlatform,replay:Record<string,SpatialEvidenceV02>={}):SceneSpatialPort{
 if(__XFX_SCENE_SPATIAL_MODE__==='FAKE')return new FakeSceneSpatialAdapter()
 if(__XFX_SCENE_SPATIAL_MODE__==='REPLAY')return new ReplaySceneSpatialAdapter(replay)
 return new RealSceneSpatialAdapter(platform==='WECHAT'?new WeChatSceneSpatialTransport():new FetchSceneSpatialTransport())
}
