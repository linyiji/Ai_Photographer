import {defineConfig,type UserConfigExport} from '@tarojs/cli'
import devConfig from './dev';import prodConfig from './prod'
export default defineConfig<'webpack5'>(async merge=>{
 const productMode=process.env.XFX_PRODUCT_MODE||'INTERNAL_DEMO'
 const apiBase=process.env.XFX_API_BASE||'http://127.0.0.1:8000'
 const outputRoot=process.env.TARO_ENV==='weapp'?'dist/weapp':process.env.TARO_ENV==='h5'?'dist/h5':'dist'
 const sceneSpatialMode=(process.env.SCENE_SPATIAL_MODE||'REAL').toUpperCase()
 if(!['REAL','FAKE','REPLAY'].includes(sceneSpatialMode))throw new Error(`SCENE_SPATIAL_MODE_UNSUPPORTED:${sceneSpatialMode}`)
 const base:UserConfigExport<'webpack5'>={projectName:'xfx-client',date:'2026-8-24',designWidth:390,deviceRatio:{390:1},sourceRoot:'src',outputRoot,framework:'react',compiler:'webpack5',cache:{enable:false},defineConstants:{__XFX_LAB_MODE__:JSON.stringify(process.env.XFX_LAB_MODE==='1'),__XFX_DIAGNOSTIC_MODE__:JSON.stringify(process.env.XFX_DIAGNOSTIC_MODE==='1'),__XFX_PRODUCT_MODE__:JSON.stringify(productMode),__XFX_API_BASE__:JSON.stringify(apiBase),__XFX_SCENE_SPATIAL_MODE__:JSON.stringify(sceneSpatialMode)},mini:{postcss:{pxtransform:{enable:true,config:{}},cssModules:{enable:false,config:{namingPattern:'module',generateScopedName:'[name]__[local]___[hash:base64:5]'}}}},h5:{publicPath:'/',staticDirectory:'static',postcss:{autoprefixer:{enable:true,config:{}},cssModules:{enable:false,config:{namingPattern:'module',generateScopedName:'[name]__[local]___[hash:base64:5]'}}}}}
 return merge({},base,process.env.NODE_ENV==='development'?devConfig:prodConfig)
})
