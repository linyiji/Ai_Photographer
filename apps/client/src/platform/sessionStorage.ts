import Taro from '@tarojs/taro'

const SESSION_KEY='xfx-session'
export const sessionStorage={
  async read():Promise<string>{return Taro.getStorage({key:SESSION_KEY}).then(x=>String(x.data)).catch(()=> '')},
  async write(sessionId:string):Promise<void>{await Taro.setStorage({key:SESSION_KEY,data:sessionId})},
  async clear():Promise<void>{await Taro.removeStorage({key:SESSION_KEY})}
}
