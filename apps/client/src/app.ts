import './app.css'
import {createMainSceneSpatialRuntime} from './sceneSpatial/runtime'

// Capability composition only: workflows opt in by calling start; importing App never starts a scan.
export const mainSceneSpatialRuntime=createMainSceneSpatialRuntime()
export default function App({children}:{children:React.ReactNode}){return children}
