import json
from pathlib import Path

import pytest

from app.repository import Repository
from app.service import DomainError,SessionService

ROOT=Path(__file__).resolve().parents[3]

def ready_service(tmp_path):
    repository=Repository(tmp_path/'fine-tune.sqlite3');service=SessionService(repository,ROOT/'packages'/'scenario-fixtures'/'s01-storm-before-arrival.json');session=service.create();sid=session['session_id']
    with repository.connect() as connection:connection.execute("INSERT INTO stored_assets VALUES(?,?,?,?,?,?,?,?,?)",('upload-'+'a'*24,'image/jpeg',128,'b'*64,service.now(),'USER_AUTHORIZED_UPLOAD','local-asset://upload-source','source.jpg','source.jpg'))
    actions=[('SELECT_SHOOTING_RELATION',{}),('CONFIRM_DEVICE_MODE',{}),('ACCEPT_REALITY',{}),('GENERATE_TARGETS',{}),('SELECT_TARGET',{'candidate_id':'target-cinematic'}),('ACCEPT_SHOT_DIRECTION',{}),('ENTER_CAPTURE_WINDOW',{}),('CREATE_CAPTURE',{'uploaded_asset_id':'upload-'+'a'*24}),('ACCEPT',{}),('ACCEPT_REALITY_PLUS',{})]
    for index,(action,payload) in enumerate(actions):service.mutate(sid,action,payload,f'step-{index}')
    return repository,service,sid

def recipe(sid):return {'schema_version':'1.0.0','recipe_id':f'recipe-{sid}','session_id':sid,'source_asset_id':'asset-reality-plus-001','created_at':'2026-08-25T00:00:00+00:00','semantic_edit_allowed':False,'adjustments':[{'scope':'ALL','parameter':'BRIGHTNESS','value':.25},{'scope':'LOCAL_REGION','parameter':'WARMTH','value':.2,'region':{'id':'local-1','x':.2,'y':.2,'width':.4,'height':.4,'feather':.2}}]}

def test_recipe_create_read_reload_and_validation(tmp_path):
    _,service,sid=ready_service(tmp_path);saved=service.save_recipe(sid,recipe(sid),'save-1');assert saved['version']==1;assert service.get_recipe(sid)['recipe']['semantic_edit_allowed'] is False;assert service.save_recipe(sid,recipe(sid),'save-1')==saved
    invalid=recipe(sid);invalid['semantic_edit_allowed']=True
    with pytest.raises(DomainError) as error:service.save_recipe(sid,invalid,'save-invalid')
    assert error.value.code=='INVALID_RECIPE'

def test_finalize_is_idempotent_and_links_lineage(tmp_path):
    repository,service,sid=ready_service(tmp_path);saved=service.save_recipe(sid,recipe(sid),'save-1');derived='upload-'+'c'*24
    with repository.connect() as connection:connection.execute("INSERT INTO stored_assets VALUES(?,?,?,?,?,?,?,?,?)",(derived,'image/jpeg',256,'d'*64,service.now(),'USER_AUTHORIZED_UPLOAD','local-asset://derived','derived.jpg','derived.jpg'))
    payload={'adjustment_recipe_id':saved['recipe']['recipe_id'],'derived_upload_asset_id':derived,'runtime_version':'main-fine-tune-1.0.0','render_backend':'WORKER_OFFSCREENCANVAS','render_metrics':{'render_ms':12},'mask_identity':None};first=service.mutate(sid,'SAVE_ADJUSTMENT_RECIPE',payload,'finalize-1');second=service.mutate(sid,'SAVE_ADJUSTMENT_RECIPE',payload,'finalize-1');assert first==second
    final=service.get(sid);assert final['workflow_stage']=='FINAL';assert final['state']['my_final_photo']['adjustment_recipe_id']==saved['recipe']['recipe_id'];assert final['state']['final']['source_upload_asset_id']==derived;assert [asset['status'] for asset in final['assets'] if asset['kind']=='FINE_TUNE_DERIVED']==['DERIVED'];assert len([event for event in final['events'] if event['event_type']=='SAVE_ADJUSTMENT_RECIPE_COMMITTED'])==1

def test_source_invalidation_and_export_failure_do_not_create_final(tmp_path):
    repository,service,sid=ready_service(tmp_path);saved=service.save_recipe(sid,recipe(sid),'save-1')
    with pytest.raises(DomainError):service.mutate(sid,'SAVE_ADJUSTMENT_RECIPE',{'adjustment_recipe_id':saved['recipe']['recipe_id'],'derived_upload_asset_id':'upload-'+'e'*24,'runtime_version':'main-fine-tune-1.0.0'},'failed-final')
    state=service.get(sid);assert state['workflow_stage']=='FINE_TUNE';assert 'final' not in state['state']
    with repository.connect() as connection:connection.execute("UPDATE adjustment_recipes SET source_asset_id='stale-source' WHERE session_id=?",(sid,));connection.execute("INSERT INTO stored_assets VALUES(?,?,?,?,?,?,?,?,?)",('upload-'+'e'*24,'image/jpeg',10,'f'*64,service.now(),'USER_AUTHORIZED_UPLOAD','local-asset://stale','stale.jpg','stale.jpg'))
    with pytest.raises(DomainError) as error:service.mutate(sid,'SAVE_ADJUSTMENT_RECIPE',{'adjustment_recipe_id':saved['recipe']['recipe_id'],'derived_upload_asset_id':'upload-'+'e'*24,'runtime_version':'main-fine-tune-1.0.0'},'stale-final')
    assert error.value.code=='SOURCE_INVALIDATED'

def test_neutral_finalize_selects_source_without_derived_asset(tmp_path):
    _,service,sid=ready_service(tmp_path);neutral=recipe(sid);neutral['adjustments']=[];saved=service.save_recipe(sid,neutral,'save-neutral');service.mutate(sid,'SAVE_ADJUSTMENT_RECIPE',{'adjustment_recipe_id':saved['recipe']['recipe_id'],'runtime_version':'main-fine-tune-1.0.0','neutral':True},'finalize-neutral');final=service.get(sid);assert final['state']['my_final_photo']['selected_asset_id']=='asset-reality-plus-001';assert not [asset for asset in final['assets'] if asset['kind']=='FINE_TUNE_DERIVED']

def test_fine_tune_scenario_manifest_has_required_replays():
    matrix=json.loads((ROOT/'packages'/'scenario-fixtures'/'m03-fine-tune-scenarios-v1.json').read_text());assert {item['scenario_id'] for item in matrix['scenarios']}=={'FINE_TUNE_NEUTRAL','FINE_TUNE_GLOBAL','FINE_TUNE_PERSON_WITH_MASK','FINE_TUNE_BACKGROUND_WITH_MASK','FINE_TUNE_LOCAL','FINE_TUNE_COMBINED_WITH_MASK','FINE_TUNE_RECIPE_RELOAD','FINE_TUNE_MASK_UNAVAILABLE','FINE_TUNE_EXPORT_FAILURE','FINE_TUNE_SOURCE_INVALIDATION'}
