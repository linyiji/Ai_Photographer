import {API_BASE} from '../api/client'
import type {SceneSpatialBundle} from './contracts'
import type {SceneSpatialSessionGateway} from './coordinator'
import Taro from '@tarojs/taro'

export class HttpSceneSpatialSessionGateway implements SceneSpatialSessionGateway{
 async commitScan(sessionId:string,bundle:SceneSpatialBundle){
  const response=await Taro.request({url:`${API_BASE}/sessions/${sessionId}/scene-spatial/scans`,method:'POST',header:{'Content-Type':'application/json'},data:{scene_scan:bundle.sceneScan,frame_set:bundle.frameSet,direction_map:bundle.directionMap,view_evidence:bundle.viewEvidence,spatial_precheck:bundle.precheck}})
  if(response.statusCode>=400)throw new Error(`SCENE_SCAN_COMMIT_HTTP_${response.statusCode}`)
 }
}
