import { cn } from '@/lib/utils'
import { NavLink, Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Settings } from 'lucide-react'
import SettingsModal from './SettingsModal'

type Props = {
  className?: string
}

export default function Navbar({ className }: Props) {
  return (
    <nav
      className={cn(
        'flex items-center justify-between mt-3 mb-10 mx-auto max-w-[700px]',
        className
      )}
    >
      <Link to="/" className="flex items-center gap-4">
        <img
          src="/images/icons/icon-128.png"
          alt="logo"
          width={40}
          height={40}
        />
      </Link>

      <div className="flex items-center gap-3">
        <NavLink
          to="/videos"
          className={({ isActive }) => (isActive ? 'font-semibold' : '')}
        >
          Videos
        </NavLink>

        <SettingsModal>
          <Button variant="ghost">
            <Settings size={20} />
          </Button>
        </SettingsModal>
      </div>
    </nav>
  )
}
