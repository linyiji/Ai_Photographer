import { View, Text } from '@tarojs/components'
import { getPlatformRuntime } from '../../platform/platform'
import { getProbeMessage } from '../../shared/runtimeProbe'
import './index.css'

export default function Index () {
  const platform = getPlatformRuntime()

  return (
    <View className='index'>
      <Text>AI Photographer</Text>
      <Text>Frontend Runtime Compatibility Spike</Text>
      <Text>Node L0 Ready</Text>
      <Text>Platform: {platform.name === 'wechat' ? 'WeChat' : 'H5'}</Text>
      <Text>{getProbeMessage(platform.name)}</Text>
    </View>
  )
}
