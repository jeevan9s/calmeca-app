import { Routes, Route } from 'react-router-dom';
import Landing from './pages/landing/page';
import Dashboard from './pages/dashboard/page';
import GoogleTest from './pages/test/page';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<GoogleTest />} />
    </Routes>
  );
}
