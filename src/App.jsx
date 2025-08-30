import {Routes, Route} from 'react-router-dom'
import Login from './pages/Login.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import Register from './pages/Register.jsx'
import AuthCallback from "./pages/AuthCallback.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx"
import { AuthProvider } from './context/AuthContext.jsx'

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path={"/register"}
            element={<Register />}
          />
          <Route
            path="/auth/callback"
            element={<AuthCallback />}
          />
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App
