import type { RuntimeTarget } from '../shared/runtimeProbe'

export interface PlatformRuntime {
  name: RuntimeTarget
}

export function getPlatformRuntime(): PlatformRuntime {
  return {
    name: process.env.TARO_ENV === 'weapp' ? 'wechat' : 'h5'
  }
}
