import Layout from '../../components/Layout'
import { useEffect } from 'react'
import { seedDummyCourses } from '../../../../test/seedCourses'


export default function Dashboard() {
  console.log('Dashboard Page Loaded')

  useEffect(()=> {
    seedDummyCourses()
  }, [])

  return (
    <div id="dashboard-page" className="min-h-screen bg-black/30">
     <Layout />
    </div>
  )
}
