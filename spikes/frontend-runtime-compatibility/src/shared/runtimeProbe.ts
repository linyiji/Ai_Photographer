export type RuntimeTarget = 'wechat' | 'h5'

export function getProbeMessage(target: RuntimeTarget) {
  return `XFX runtime probe: ${target}`
}
