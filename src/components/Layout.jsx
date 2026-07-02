import { useNavigate } from 'react-router-dom'
import { LogOut, Dumbbell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Layout({ children, title, back }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        {back ? (
          <button onClick={() => navigate(back)} className="text-muted hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Dumbbell size={14} className="text-primary" />
            </div>
          </div>
        )}
        <h1 className="flex-1 font-bold text-white text-lg truncate">
          {title || 'Actio Pro'}
        </h1>
        <button onClick={signOut} className="text-muted hover:text-white transition-colors p-1">
          <LogOut size={18} />
        </button>
      </header>
      <main className="max-w-lg mx-auto px-4 pb-8">
        {children}
      </main>
    </div>
  )
}
