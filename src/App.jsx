import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import TrainingPlanPage from '@/pages/TrainingPlanPage'
import DayWorkout from '@/pages/DayWorkout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-primary animate-pulse text-lg font-semibold">Actio Pro</div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Navigate to="/home" replace /></PrivateRoute>} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/plano/:id" element={<PrivateRoute><TrainingPlanPage /></PrivateRoute>} />
        <Route path="/treino/:planId/:dia" element={<PrivateRoute><DayWorkout /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
