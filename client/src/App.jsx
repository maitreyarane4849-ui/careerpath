import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import InterestQuiz from './pages/InterestQuiz';
import Results from './pages/Results';
import Roadmap from './pages/Roadmap';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={guard(<Dashboard />)} />
            <Route path="/profile" element={guard(<Profile />)} />
            <Route path="/interest-quiz" element={guard(<InterestQuiz />)} />
            <Route path="/results" element={guard(<Results />)} />
            <Route path="/results/:id" element={guard(<Results />)} />
            <Route path="/roadmap" element={guard(<Roadmap />)} />
            <Route path="/roadmap/report/:reportId" element={guard(<Roadmap />)} />
            <Route path="/roadmap/:id" element={guard(<Roadmap />)} />
            <Route path="/reports" element={guard(<Reports />)} />
            <Route path="/settings" element={guard(<Settings />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}