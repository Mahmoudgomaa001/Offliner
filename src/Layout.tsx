import { Outlet } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar className="px-4 md:px-0" />

      <div className="md:px-4">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>

      <Footer className="min-h-16" />
      <Toaster />
    </>
  )
}
