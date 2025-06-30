import Layout from '../../components/Layout'
import { useEffect } from 'react'
// import { seedDummyCourses } from '../../../../test/seedCourses'
// import { seedDummyAssignments } from '../../../../test/seedAssignments'


export default function Dashboard() {
  console.log('Dashboard Page Loaded')

  useEffect(()=> {
    // seedDummyCourses()
    // seedDummyAssignments()
  }, [])

  return (
    <div id="dashboard-page" className="min-h-screen bg-black/30">
     <Layout />
    </div>
  )
}
