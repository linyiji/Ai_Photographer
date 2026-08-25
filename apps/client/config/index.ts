import {defineConfig,type UserConfigExport} from '@tarojs/cli'
import devConfig from './dev';import prodConfig from './prod'
export default defineConfig<'webpack5'>(async merge=>{
 const base:UserConfigExport<'webpack5'>={projectName:'xfx-client',date:'2026-8-24',designWidth:750,deviceRatio:{375:2,750:1},sourceRoot:'src',outputRoot:'dist',framework:'react',compiler:'webpack5',cache:{enable:false},defineConstants:{__XFX_LAB_MODE__:JSON.stringify(process.env.XFX_LAB_MODE==='1')},mini:{postcss:{pxtransform:{enable:true,config:{}},cssModules:{enable:false,config:{namingPattern:'module',generateScopedName:'[name]__[local]___[hash:base64:5]'}}}},h5:{publicPath:'/',staticDirectory:'static',postcss:{autoprefixer:{enable:true,config:{}},cssModules:{enable:false,config:{namingPattern:'module',generateScopedName:'[name]__[local]___[hash:base64:5]'}}}}}
 return merge({},base,process.env.NODE_ENV==='development'?devConfig:prodConfig)
})
