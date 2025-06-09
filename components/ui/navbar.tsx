import Link from 'next/link'
import { Github } from 'lucide-react'
import { Button } from './button'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Scanalyze
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              asChild
            >
              <Link href="https://github.com/yourusername/scanalyze" target="_blank">
                <Github className="size-5 mr-2" />
                GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
} 