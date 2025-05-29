import Titlebar from '../../components/Titlebar'
import '@/renderer/rsrc/styles/landing.css'

export default function Landing() {
  return (
    <div id="landing-page" className="flex flex-col h-screen items-center justify-center">
      <Titlebar />
      <div className="flex items-center justify-center">
        <div id="central-text-cntr" className="flex flex-col items-center gap-y-2">
          <div id="title-cntr">
            <h1 id="title">Calmeca</h1>
          </div>
          <div id="subtitle-cntr">
            <h2 id="subtitle">Click anywhere to launch.</h2>
          </div>
        </div>
      </div>
    </div>
  )
}
