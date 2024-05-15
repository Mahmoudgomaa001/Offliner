import { Outlet } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'

export default function App() {
  return (
    <>
      <Navbar className="px-4 md:px-0" />

      <div className="md:px-4">
        <Outlet />
      </div>

      <Toaster />
    </>
  )
}
