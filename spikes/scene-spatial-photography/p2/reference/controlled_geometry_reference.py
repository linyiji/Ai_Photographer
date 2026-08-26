"""Deterministic non-metric P2 reference. Writes scalar JSON only; no media."""
from __future__ import annotations
import argparse, json, time
from pathlib import Path
import cv2
import numpy as np

K = np.array([[520., 0., 320.], [0., 520., 240.], [0., 0., 1.]])
SCENARIOS = {
    "PURE_ROTATION": ((0., 0., 0.), 8.), "LOW_PARALLAX": ((.05, 0., 0.), 0.),
    "LATERAL_LEFT": ((-.22, 0., 0.), 0.), "LATERAL_RIGHT": ((.22, 0., 0.), 0.),
    "MOVE_FORWARD": ((0., 0., .60), 0.), "MOVE_BACKWARD": ((0., 0., -.90), 0.),
    "MIXED_ROTATE_TRANSLATE": ((.18, 0., .10), 5.), "WEAK_TEXTURE": ((.22, 0., 0.), 0.),
    "REPETITIVE_TEXTURE": ((.22, 0., 0.), 0.), "BLUR": ((.22, 0., 0.), 0.),
    "EXPOSURE_FAILURE": ((.22, 0., 0.), 0.), "INSUFFICIENT_FRAMES": ((.22, 0., 0.), 0.),
}
def rotation_y(deg: float) -> np.ndarray:
    a=np.deg2rad(deg); return np.array([[np.cos(a),0,np.sin(a)],[0,1,0],[-np.sin(a),0,np.cos(a)]])
def project(points: np.ndarray, r: np.ndarray, t: np.ndarray) -> tuple[np.ndarray,np.ndarray]:
    cam=(r@points.T+t.reshape(3,1)).T; uv=(K@cam.T).T; return uv[:,:2]/uv[:,2:],cam[:,2]
def med(values: np.ndarray) -> float: return float(np.median(values)) if len(values) else 0.
def classify(feature_count:int,inlier_ratio:float,median_parallax:float,p75:float,failure:str|None)->str:
    if feature_count<20 or inlier_ratio<.35 or failure: return "UNCLASSIFIED"
    if median_parallax<=.75 and p75<=1.5: return "ROTATION_DOMINANT"
    if median_parallax<2.: return "LOW_PARALLAX"
    return "TRANSLATION_EVIDENCE_PRESENT"
def run(name:str, seed:int=1729)->dict:
    started=time.perf_counter(); rng=np.random.default_rng(seed); cv2.setRNGSeed(seed)
    center,yaw=SCENARIOS[name]; center=np.asarray(center,float); r=rotation_y(yaw); t=-r@center
    n=180; points=np.column_stack((rng.uniform(-2.1,2.1,n),rng.uniform(-1.45,1.45,n),rng.uniform(3.5,8.5,n)))
    p1,z1=project(points,np.eye(3),np.zeros(3)); p2,z2=project(points,r,t)
    valid=(z1>0)&(z2>0)&(p1[:,0]>5)&(p1[:,0]<635)&(p1[:,1]>5)&(p1[:,1]<475)&(p2[:,0]>5)&(p2[:,0]<635)&(p2[:,1]>5)&(p2[:,1]<475)
    p1,p2=p1[valid],p2[valid]; failure=None
    if name in {"WEAK_TEXTURE","BLUR","EXPOSURE_FAILURE"}: p1,p2=p1[:12],p2[:12]
    if name=="REPETITIVE_TEXTURE" and len(p2): p2=np.roll(p2,17,axis=0)
    if name=="INSUFFICIENT_FRAMES": p1,p2=p1[:0],p2[:0]; failure="INSUFFICIENT_FRAMES"
    if len(p1)>=4:
        h,hmask=cv2.findHomography(p1,p2,cv2.RANSAC,3.0)
        if h is None: residual=np.array([]); hratio=0.
        else:
            projected=cv2.perspectiveTransform(p1.reshape(-1,1,2),h).reshape(-1,2); residual=np.linalg.norm(projected-p2,axis=1); hratio=float(hmask.mean())
    else: residual=np.array([]); hratio=0.; failure=failure or "INSUFFICIENT_FEATURES"
    median_parallax=med(residual); p75=float(np.percentile(residual,75)) if len(residual) else 0.
    category=classify(len(p1),hratio,median_parallax,p75,failure)
    pose_started=time.perf_counter(); recovered_center=np.array([np.nan]*3); pose_inliers=0; pose_ok=False; triangulated=0; positive=0.; reproj=None; pose_failure=None
    if category=="TRANSLATION_EVIDENCE_PRESENT" and len(p1)>=8:
        e,emask=cv2.findEssentialMat(p1,p2,K,cv2.RANSAC,.999,1.0)
        if e is not None:
            _,rr,tt,pmask=cv2.recoverPose(e,p1,p2,K,mask=emask); recovered_center=(-rr.T@tt).reshape(3); pose_inliers=int(np.count_nonzero(pmask)); pose_ok=pose_inliers>=20
            keep=pmask.ravel()>0; q1,q2=p1[keep],p2[keep]
            if len(q1)>=2:
                p4=cv2.triangulatePoints(K@np.hstack((np.eye(3),np.zeros((3,1)))),K@np.hstack((rr,tt)),q1.T,q2.T); xyz=(p4[:3]/p4[3]).T; zcam2=(rr@xyz.T+tt).T[:,2]
                finite=np.isfinite(xyz).all(axis=1); good=finite&(xyz[:,2]>0)&(zcam2>0); triangulated=int(good.sum()); positive=float(good.mean()) if len(good) else 0.
                if good.any():
                    rq1,_=project(xyz[good],np.eye(3),np.zeros(3)); rq2,_=project(xyz[good],rr,tt.reshape(3)); reproj=float(np.median(np.r_[np.linalg.norm(rq1-q1[good],axis=1),np.linalg.norm(rq2-q2[good],axis=1)]))
        else: pose_failure="ESSENTIAL_MATRIX_FAILED"
    pose_ms=(time.perf_counter()-pose_started)*1000
    expected=np.asarray(center); sign_ok=None
    if name in {"LATERAL_LEFT","LATERAL_RIGHT"}: sign_ok=bool(np.sign(recovered_center[0])==np.sign(expected[0])) if pose_ok else False
    if name in {"MOVE_FORWARD","MOVE_BACKWARD"}: sign_ok=bool(np.sign(recovered_center[2])==np.sign(expected[2])) if pose_ok else False
    stable=pose_ok and triangulated>=20 and positive>=.75 and reproj is not None and reproj<=2.0 and (sign_ok is not False)
    status="USABLE" if category=="TRANSLATION_EVIDENCE_PRESENT" and stable else ("PARTIAL" if pose_ok else "INSUFFICIENT")
    if category in {"ROTATION_DOMINANT","LOW_PARALLAX"}: status="INSUFFICIENT"
    reasons=[]
    if status=="USABLE": reasons=["ROBUST_CORRESPONDENCE","PARALLAX_PRESENT","POSE_AND_TRIANGULATION_VALIDATED"]
    elif category=="ROTATION_DOMINANT": reasons=["PURE_ROTATION_OR_HOMOGRAPHY_DOMINANT"]
    elif category=="LOW_PARALLAX": reasons=["LOW_PARALLAX"]
    else: reasons=[failure or pose_failure or "GEOMETRY_VALIDATION_FAILED"]
    return {"scenario":name,"status":status,"reason_codes":reasons,"parallax_classification":category,"feature_count":len(p1),"homography_inlier_ratio":round(hratio,4),"median_parallax_px":round(median_parallax,4),"p75_parallax_px":round(p75,4),"pose_inliers":pose_inliers,"recovered_camera_center_direction":[round(float(x),4) if np.isfinite(x) else None for x in recovered_center],"direction_sign_correct":sign_ok,"triangulated_point_count":triangulated,"positive_depth_ratio":round(positive,4),"reprojection_error_px":None if reproj is None else round(reproj,4),"metric_scale_available":False,"coordinate_convention":"CAMERA_X_RIGHT_Y_DOWN_Z_FORWARD","timing_ms":{"pose_and_triangulation":round(pose_ms,3),"total":round((time.perf_counter()-started)*1000,3)}}
def main()->None:
    parser=argparse.ArgumentParser(); parser.add_argument('--output',required=True); args=parser.parse_args()
    first=[run(name) for name in SCENARIOS]; second=[run(name) for name in SCENARIOS]
    stable_projection=lambda rows:[{k:v for k,v in row.items() if k!='timing_ms'} for row in rows]
    controlled=[x for x in first if x['scenario'] in {'LATERAL_LEFT','LATERAL_RIGHT','MOVE_FORWARD','MOVE_BACKWARD'}]
    output={"schema":"xfx.p2-controlled-geometry-evidence","schema_version":"0.1","opencv_version":cv2.__version__,"primary_pose_route":"RANSAC_ESSENTIAL_RECOVER_POSE_TRIANGULATION","results":first,"gates":{"deterministic":stable_projection(first)==stable_projection(second),"pure_rotation_false_usable":sum(x['status']=='USABLE' for x in first if x['scenario']=='PURE_ROTATION'),"low_parallax_false_usable":sum(x['status']=='USABLE' for x in first if x['scenario']=='LOW_PARALLAX'),"direction_sign_correct":all(x['direction_sign_correct'] is True for x in controlled),"direction_sign_cases":len(controlled)},"privacy":{"raw_media_persisted":False,"raw_media_uploaded":False,"provider_calls":0,"luna_calls":0}}
    path=Path(args.output); path.parent.mkdir(parents=True,exist_ok=True); path.write_text(json.dumps(output,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
if __name__=='__main__': main()
