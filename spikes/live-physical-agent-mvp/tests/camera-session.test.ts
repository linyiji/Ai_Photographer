import assert from 'node:assert/strict';
import test from 'node:test';
import { CameraSessionGuard, ownsActiveCameraSession } from '../camera/session-guard.js';

test('new camera request invalidates an older switch request',()=>{const guard=new CameraSessionGuard();const rear=guard.beginRequest();const front=guard.beginRequest();assert.equal(guard.isCurrent(rear),false);assert.equal(guard.isCurrent(front),true);});
test('explicit stop invalidates an in-flight camera request',()=>{const guard=new CameraSessionGuard();const pending=guard.beginRequest();guard.invalidate();assert.equal(guard.isCurrent(pending),false);});
test('ended track may stop only its own active stream',()=>{const rear={} as MediaStream;const front={} as MediaStream;assert.equal(ownsActiveCameraSession(front,rear),false);assert.equal(ownsActiveCameraSession(front,front),true);});
