import {WeChatFineTuneRuntime} from './wechatRuntime'
import type {FineTuneRuntime} from './runtime'

export const createFineTuneRuntime=():FineTuneRuntime=>new WeChatFineTuneRuntime()
