import {strict as assert} from 'node:assert'
import {test} from 'node:test'
import {AdapterDescriptor,implementationType,normalizedFailure,selectionFrom} from '../src/platform/model'

const descriptor:AdapterDescriptor={capabilityName:'StorageAdapter',adapterId:'development-local-storage-v1',adapterVersion:'1.0.0',platform:'H5',available:true,supportLevel:'SUPPORTED',reason:'authorized upload',provenance:{implementationSource:'MAIN_M04',runtimeSupport:'SUPPORTED'}}

test('registry selection promotes accepted supported adapter to REAL',()=>{assert.equal(selectionFrom(descriptor).implementationType,'REAL')})
test('partial and unverified adapters remain EXPERIMENTAL',()=>{assert.equal(implementationType('PARTIAL'),'EXPERIMENTAL');assert.equal(implementationType('UNVERIFIED_REAL_DEVICE'),'EXPERIMENTAL')})
test('unsupported adapters remain unavailable',()=>{assert.equal(implementationType('UNSUPPORTED'),'UNAVAILABLE')})
test('error normalization preserves controlled unsupported result',()=>{assert.deepEqual(normalizedFailure('PLATFORM_UNSUPPORTED','UNSUPPORTED'),{ok:false,code:'PLATFORM_UNSUPPORTED',supportLevel:'UNSUPPORTED',message:undefined})})
test('final action capability state remains honest',()=>{const selection=selectionFrom({...descriptor,capabilityName:'AlbumAdapter',supportLevel:'PARTIAL'});assert.equal(selection.implementationType,'EXPERIMENTAL');assert.equal(selection.supportLevel,'PARTIAL')})
