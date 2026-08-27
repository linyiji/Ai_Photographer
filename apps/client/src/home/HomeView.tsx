import {Button,Image,ScrollView,Text,View} from '@tarojs/components'
import type {SessionSummary} from '../api/client'
import heroTitle from '../assets/home/hero-title-calligraphy.png'
import landmark from '../assets/home/landmark-guangzhou-tower.png'
import './HomeView.css'

type Props={
 active:SessionSummary[];completedCount:number;busy:boolean;notice:string;error:string
 onLive:()=>void;onReference:()=>void;onMethod:(method:{method_id:string;title:string;tag:string})=>void
 onResume:(item:SessionSummary)=>void;onWorks:()=>void;onSettings:()=>void
}

const methods=[
 {method_id:'walk_capture',title:'轻松行走抓拍',subtitle:'边走边拍，更自然',tag:'自然 · 全身'},
 {method_id:'environment_half',title:'环境半身',subtitle:'人物更突出',tag:'人物突出'},
 {method_id:'rail_side',title:'靠栏杆侧身拍',subtitle:'适合栏杆与步道',tag:'生活感 · 侧身'}
]

export function HomeView(props:Props){
 return <View className='homeV1'>
  <View className='homeTop'><Text className='homeWordmark'>向风行</Text><Button className='homeAvatar' onClick={props.onSettings}>我的</Button></View>
  <View className='homeHero'>
   <View className='homeSky'/><View className='homeSun'/>
   <Image className='homeLandmark' mode='aspectFit' src={landmark}/>
   <View className='homeCopyLayer'><Text className='homeLocation'>广州 · 晴天</Text><Image className='homeTitleArt' mode='widthFix' src={heroTitle}/><Text className='homeSubtitle'>真实场景出发，选择你的拍摄方式</Text></View>
  </View>
  <View className='homeEntryRow'><Button className='homeLive' disabled={props.busy} onClick={props.onLive}>打开相机拍摄</Button><Button className='homeReference' disabled={props.busy} onClick={props.onReference}>参考图拍摄</Button></View>
  {props.active.length>0&&<View className='homeResume'><Text className='homeSectionTitle'>继续上次拍摄</Text>{props.active.slice(0,2).map(item=><Button className='homeResumeCard' key={item.session_id} onClick={()=>props.onResume(item)}>继续 · {item.workflow_stage}</Button>)}</View>}
  <Text className='homeSectionTitle'>推荐拍法</Text>
  <ScrollView className='methodRail' scrollX enhanced showScrollbar={false}>{methods.map(item=><Button className='methodCard' key={item.method_id} onClick={()=>props.onMethod(item)}><Text className='methodTag'>{item.tag}</Text><Text className='methodTitle'>{item.title}</Text><Text className='methodSubtitle'>{item.subtitle}</Text></Button>)}</ScrollView>
  {props.notice&&<View className='homeNotice'>{props.notice}</View>}{props.error&&<View className='homeError'>{props.error}</View>}
  <View className='homeTabs'><View className='homeTab active'><Text>首页</Text></View><View className='homeTab' onClick={props.onWorks}><Text>作品 {props.completedCount||''}</Text></View><View className='homeTab' onClick={props.onSettings}><Text>我的</Text></View></View>
 </View>
}
