import {strict as assert} from 'node:assert'
import {readFile} from 'node:fs/promises'
import {test} from 'node:test'
import {aiStagePresentation,applyAIStageEvent,initialAIStageState,type AIStageEvent} from '../src/ai/aiStage'

const event=(state:AIStageEvent['state'],revision=1):AIStageEvent=>({eventId:`event-${state}`,jobId:'job-1',sessionId:'session-1',sessionRevision:revision,state,occurredAt:'2026-09-01T00:00:00Z'})

test('AI stage state exposes real named stages without fake percentages',()=>{
 for(const state of ['SUBJECT_ANALYZING','SCENE_LIGHT_ANALYZING','DIRECTOR_GENERATING','DIRECTOR_VALIDATING','CAPTURE_CHECKING','REALITY_PLUS_PLANNING','REALITY_PLUS_EDITING','REALITY_PLUS_VALIDATING'] as const){
  const presentation=aiStagePresentation(state)
  assert.ok(presentation.label)
  assert.equal(presentation.percentage,null)
 }
})

test('stale AI stage events cannot replace the active revision',()=>{
 const current=applyAIStageEvent(initialAIStageState,event('DIRECTOR_GENERATING',3))
 assert.deepEqual(applyAIStageEvent(current,event('SUBJECT_ANALYZING',2)),current)
})

test('terminal presentation states release the active job',()=>{
 const active=applyAIStageEvent(initialAIStageState,event('DIRECTOR_VALIDATING'))
 assert.equal(active.activeJobId,'job-1')
 const ready=applyAIStageEvent(active,event('PLANS_READY'))
 assert.equal(ready.activeJobId,null)
})

test('AI stage module contains no interval or percentage simulation',async()=>{
 const source=await readFile('src/ai/aiStage.ts','utf8')
 for(const token of ['setInterval','setTimeout','Math.random','progressPercent'])assert.equal(source.includes(token),false)
})
