import TitleBar from '../../components/Titlebar'
import Sidebar from '../../components/Sidebar'

export default function Dashboard() {
  console.log('Dashboard Page Loaded')
  return (
    <div id="dashboard-page" className="min-h-screen bg-black/30">
      <div id="titlebar-cntr">
        <TitleBar solidBackground={true} outline = {true}/>
        <Sidebar />
      </div>
    </div>
  )
}
