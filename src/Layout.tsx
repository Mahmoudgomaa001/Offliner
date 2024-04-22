import { Outlet } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'

export default function App() {
  return (
    <>
      <Navbar />

      <Outlet />

      <Toaster />
    </>
  )
}
