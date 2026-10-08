import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { AuthProvider } from "./context/AuthContext"
import { GamificationProvider } from "./context/GamificationContext"
import { Toaster } from "react-hot-toast"
import MainLayout from "./layouts/MainLayout"
import { ProtectedRoute, AdminRoute } from "./components/routing/ProtectedRoutes"

// Pages
import Home from "./pages/Home"
import Problems from "./pages/Problems"
import ProblemId from "./pages/ProblemId"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Profile from "./pages/Profile"
import SubmissionDetails from "./pages/SubmissionDetails"
import EvolutionDashboard from "./pages/EvolutionDashboard"
import VisualizerLayout from "./pages/VisualizerLayout"
import NotesWorkspace from "./pages/NotesWorkspace"
import ContestsList from "./pages/contests/ContestsList"
import ContestDetail from "./pages/contests/ContestDetail"
import ContestProblem from "./pages/contests/ContestProblem"

// Private Contest Pages
import ContestDashboard from "./pages/contests/private/ContestDashboard"
import CreateContest from "./pages/contests/private/CreateContest"
import JoinContest from "./pages/contests/private/JoinContest"
import ContestLobby from "./pages/contests/private/ContestLobby"
import ContestArena from "./pages/contests/private/ContestArena"
import ContestResult from "./pages/contests/private/ContestResult"
import ContestHistory from "./pages/contests/private/ContestHistory"

import UserAnalytics from "./pages/analytics/UserAnalytics"
import Leaderboard from "./pages/gamification/Leaderboard"

// Admin Layout and Pages
import AdminLayout from "./layouts/AdminLayout"
import AdminAnalytics from "./pages/admin/AdminAnalytics"
import AdminContestForm from "./pages/admin/ContestForm"
import AdminDashboard from "./pages/admin/Dashboard"
import QuestionsList from "./pages/admin/QuestionsList"
import QuestionForm from "./pages/admin/QuestionForm"
import QuestionPreview from "./pages/admin/QuestionPreview"
import QuestionTestCases from "./pages/admin/QuestionTestCases"
import UsersList from "./pages/admin/UsersList"
import AdminContestsList from "./pages/admin/AdminContestsList"
import AdminTestCasesList from "./pages/admin/AdminTestCasesList"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <GamificationProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  {/* Public Routes */}
                  <Route index element={<Home />} />
                  <Route path="problems" element={<Problems />} />
                  <Route path="problems/:id" element={<ProblemId />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="profile" element={<Profile />} />
                    <Route path="submissions/:id" element={<SubmissionDetails />} />
                    <Route path="problems/:id/evolution" element={<EvolutionDashboard />} />
                    <Route path="visualizer" element={<VisualizerLayout />} />
                    <Route path="notes" element={<NotesWorkspace />} />
                    <Route path="dashboard/analytics" element={<UserAnalytics />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="contests" element={<ContestsList />} />
                    <Route path="contests/dashboard" element={<ContestDashboard />} />
                    <Route path="contests/create-private" element={<CreateContest />} />
                    <Route path="contests/join" element={<JoinContest />} />
                    <Route path="contests/history" element={<ContestHistory />} />
                    <Route path="contests/:id/lobby" element={<ContestLobby />} />
                    <Route path="contests/:id/arena" element={<ContestArena />} />
                    <Route path="contests/:id/result" element={<ContestResult />} />
                    <Route path="contests/:id" element={<ContestDetail />} />
                    <Route path="contests/:contestId/problems/:problemId" element={<ContestProblem />} />
                    
                  </Route>
                </Route>

                {/* Admin Routes (Uses AdminLayout) */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="contests/new" element={<AdminContestForm />} />
                  <Route path="questions" element={<QuestionsList />} />
                  <Route path="questions/new" element={<QuestionForm />} />
                  <Route path="questions/:id/edit" element={<QuestionForm />} />
                  <Route path="questions/:id" element={<QuestionPreview />} />
                  <Route path="questions/:id/testcases" element={<QuestionTestCases />} />
                  <Route path="users" element={<UsersList />} />
                  <Route path="contests" element={<AdminContestsList />} />
                  <Route path="testcases" element={<AdminTestCasesList />} />
                </Route>
              </Routes>
            </div>
            <Toaster position="top-right" toastOptions={{ className: 'bg-card text-foreground border border-border' }} />
          </Router>
        </GamificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
