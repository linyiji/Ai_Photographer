import Taro from '@tarojs/taro'
import type {RuntimePlatform} from '../platform/model'
import {SceneSpatialCoordinator} from './coordinator'
import {createSceneSpatialProvider} from './providerFactory'
import {HttpSceneSpatialSessionGateway} from './sessionGateway'

function currentPlatform():RuntimePlatform{
 return Taro.getEnv()===Taro.ENV_TYPE.WEAPP?'WECHAT':'H5'
}

/** Main composition boundary. Construction has no camera, network, or UI side effects. */
export function createMainSceneSpatialRuntime():SceneSpatialCoordinator{
 return new SceneSpatialCoordinator(new HttpSceneSpatialSessionGateway(),createSceneSpatialProvider(currentPlatform()))
}
