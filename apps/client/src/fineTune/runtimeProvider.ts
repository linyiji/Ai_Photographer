import {MainFineTuneRuntime} from './runtime'
import type {FineTuneRuntime} from './runtime'

export const createFineTuneRuntime=():FineTuneRuntime=>new MainFineTuneRuntime()
