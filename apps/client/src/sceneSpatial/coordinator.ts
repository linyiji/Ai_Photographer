import type {SceneGeometryRequestV01,SceneSpatialBundle,SceneSpatialCompletion} from './contracts'
import type {PreparedGeometryFrame,SceneSpatialPort} from './port'

export interface SceneSpatialRun{state:'VIEW_READY_GEOMETRY_PENDING';viewEvidence:SceneSpatialBundle['viewEvidence'];completion:Promise<SceneSpatialCompletion>;supersede():void}
export interface SceneSpatialSessionGateway{commitScan(sessionId:string,bundle:SceneSpatialBundle):Promise<void>}
export class SceneSpatialCoordinator{
 private active:AbortController|null=null
 constructor(private readonly gateway:SceneSpatialSessionGateway,private readonly provider:SceneSpatialPort){}
 start(sessionId:string,bundle:SceneSpatialBundle,request:SceneGeometryRequestV01,frames:readonly PreparedGeometryFrame[]):SceneSpatialRun{
  this.active?.abort('CLIENT_SUPERSEDED');const controller=new AbortController();this.active=controller
  const completion=(async():Promise<SceneSpatialCompletion>=>{
   try{
    await this.gateway.commitScan(sessionId,bundle)
    if(controller.signal.aborted)return {event:'GEOMETRY_SUPERSEDED',spatialEvidence:null,viewPathUsable:true}
    const result=await this.provider.analyze(sessionId,request,frames,controller.signal)
    return {event:result.spatialEvidence.status==='INSUFFICIENT'?'SPATIAL_EVIDENCE_INSUFFICIENT':'SPATIAL_EVIDENCE_AVAILABLE',spatialEvidence:result.spatialEvidence,viewPathUsable:true}
   }catch(error){return {event:controller.signal.aborted?'GEOMETRY_SUPERSEDED':'GEOMETRY_FAILED',spatialEvidence:null,viewPathUsable:true,errorCode:error instanceof Error?error.message:String(error)}}
  })()
  return {state:'VIEW_READY_GEOMETRY_PENDING',viewEvidence:bundle.viewEvidence,completion,supersede:()=>controller.abort('CLIENT_SUPERSEDED')}
 }
}
