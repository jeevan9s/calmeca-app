import TitleBar from '../../components/Titlebar'

export default function Dashboard() {
  console.log('Dashboard Page Loaded')
  return (
    <div id="dashboard-page" className="min-h-screen bg-black/40">
      <div id="titlebar-cntr">
        <TitleBar solidBackground={true} />
      </div>
    </div>
  )
}
