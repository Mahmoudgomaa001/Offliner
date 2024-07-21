import { cn } from '@/lib/utils'
import { Github, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = {
  className?: string
}

export default function Footer({ className }: Props) {
  return (
    <footer className={cn('p-3 mt-12 bg-[#c3e5fb]', className)}>
      <div className="flex justify-between max-w-[800px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/icons/icon-128.png"
            alt="logo"
            width={40}
            height={40}
          />
          <p className="text-[#063658]">Offliner</p>
        </Link>

        <div className="flex items-center gap-5 text-[#063658]">
          <a target="_blank" href="https://www.linkedin.com/in/laassari">
            <Linkedin />
          </a>
          <a target="_blank" href="https://github.com/laassari/offliner">
            <Github />
          </a>
        </div>
      </div>
    </footer>
  )
}
