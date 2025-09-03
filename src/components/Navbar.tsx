import { cn } from '@/lib/utils'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState } from 'react'
import { QrCode, Settings } from 'lucide-react'
import SettingsModal from './SettingsModal'
import QRCodeModal from './QRCodeModal'

type Props = {
  className?: string
}

export default function Navbar({ className }: Props) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/results?q=${query.trim()}`)
    }
  }

  return (
    <nav className={cn('mb-10 p-3 bg-primary text-secondary', className)}>
      <div className="mx-auto max-w-[var(--max-app-w)] flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/icons/icon-128.png"
            alt="logo"
            width={40}
            height={40}
          />
          <p className="hidden md:block">Offliner</p>
        </Link>

        <form onSubmit={handleSearch} className="flex-grow max-w-lg">
          <Input
            type="search"
            placeholder="Search for videos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-secondary text-primary"
          />
        </form>

        <div className="flex items-center gap-3">
          <NavLink
            to="/audio"
            className={({ isActive }) =>
              isActive ? 'border-b-2 border-secondary' : ''
            }
          >
            Music
          </NavLink>
          <NavLink
            to="/videos"
            className={({ isActive }) =>
              isActive ? 'border-b-2 border-secondary' : ''
            }
          >
            Videos
          </NavLink>

          <NavLink
            to="/playlists"
            className={({ isActive }) =>
              isActive ? 'border-b-2 border-secondary' : ''
            }
          >
            Playlists
          </NavLink>

          <QRCodeModal>
            <Button variant="ghost" size="icon">
              <QrCode size={20} />
            </Button>
          </QRCodeModal>

          <SettingsModal>
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
          </SettingsModal>
        </div>
      </div>
    </nav>
  )
}
