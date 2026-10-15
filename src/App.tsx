import { Routes, Route } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Home from '@/pages/Home'
import Programs from '@/pages/Programs'
import ProgramDetails from '@/pages/ProgramDetails'
import GoodPractices from '@/pages/GoodPractices'
import GoodPracticeDetails from '@/pages/GoodPracticeDetails'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Preferences from '@/pages/Preferences'
import Favorites from '@/pages/Favorites'
import MyAccount from '@/pages/MyAccount'
import NotFound from '@/pages/NotFound'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo-principal" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/programas" element={<Programs />} />
          <Route path="/programas/:slug" element={<ProgramDetails />} />
          <Route path="/boas-praticas" element={<GoodPractices />} />
          <Route path="/boas-praticas/:slug" element={<GoodPracticeDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route
            path="/preferencias"
            element={
              <ProtectedRoute>
                <Preferences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favoritos"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minha-conta"
            element={
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
