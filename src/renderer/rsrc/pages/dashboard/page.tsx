import Layout from '../../components/Layout'
import { useEffect } from 'react'
import { testRelativeTimestamps } from '../../../../test/testTimestamps'

export default function Dashboard() {
  console.log('Dashboard Page Loaded')

  useEffect(() => {
    testRelativeTimestamps()
  }, [])

  return (
    <div id="dashboard-page" className="min-h-screen bg-black/30">
      <Layout />
    </div>
  )
}
