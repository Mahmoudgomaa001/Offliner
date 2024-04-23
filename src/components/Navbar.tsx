import { cn } from '@/lib/utils'
import { NavLink, Link } from 'react-router-dom'

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
        <span>V-Loader</span>
      </Link>

      <div className="flex gap-3">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? 'font-semibold' : '')}
        >
          Home
        </NavLink>
        <NavLink
          to="/videos"
          className={({ isActive }) => (isActive ? 'font-semibold' : '')}
        >
          Videos
        </NavLink>
      </div>
    </nav>
  )
}
