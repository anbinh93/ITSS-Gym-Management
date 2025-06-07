import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn, selectCurrentUser } from './redux/authSlice'
import ProtectedRoute from './components/ProtectedRoute'

// Auth
import LoginPage from './pages/login/LoginPage'

// Admin
import AdminDashboard from './pages/admin/AdminDashboardPage'
import DevicePage from './pages/admin/AdminDevicePage'
import CustomerPage from './pages/admin/AdminCustomerPage'
import StaffPage from './pages/admin/AdminStaffPage'
import PackagePage from './pages/admin/AdminPackagePage'
import AdminPackageChangePage from './pages/admin/AdminPackageChangePage'
import ReportPage from './pages/admin/AdminReportPage'
import FeedbackPage from './pages/admin/AdminFeedbackPage'
import GymRoom from './pages/admin/AdminGymRoomPage'

// Coach
import Dashboard from './pages/coach/Dashboard'
import Clients from './pages/coach/Clients'
import Schedule from './pages/coach/Schedule'
import TrainingPrograms from './pages/coach/TrainingPrograms'
import TrainingProgress from './pages/coach/TrainingProgress'
import Profiles from './pages/coach/TrainingPrograms'
import EditProgressScreen from './pages/coach/EditProgressScreen'

// Staff
import StaffCustomerPage from './pages/staff/StaffCustomerPage'
import StaffFeedbackPage from './pages/staff/StaffFeedbackPage'
import StaffDevicePage from './pages/staff/StaffDevicePage'
import StaffGymRoomPage from './pages/staff/StaffGymRoomPage'
import StaffSubscriptionManagementPage from './pages/staff/StaffSubscriptionManagementPage'
import StaffDashboardPage from './pages/staff/StaffDashboardPage'

// User
import UserDashboard from './pages/user/UserDashBoard'
import UserSchedule from './pages/user/UserSchedule'
import UserProgress from './pages/user/UserProgress'
import UserMembership from './pages/user/UserMembership'
import UserPackageChangePage from './pages/user/UserPackageChangePage'
import UserReview from './pages/user/UserReview'
import UserProfile from './pages/user/UserProfile'

function App() {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const currentUser = useSelector(selectCurrentUser)

  // Helper component to redirect root path based on authentication
  const RootRedirect = () => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />
    }
    
    // Redirect to appropriate dashboard based on user role
    switch (currentUser?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />
      case 'staff':
        return <Navigate to="/staff/dashboard" replace />
      case 'coach':
        return <Navigate to="/coach/dashboard" replace />
      case 'user':
        return <Navigate to="/user/schedule" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return (
    <div className="App">
      <Routes>
        {/* Login Route */}
        <Route path='/login' element={<LoginPage />} />
        
        {/* Root redirect - no standalone homepage */}
        <Route path='/' element={<RootRedirect />} />
        
        {/* Admin Routes */}
        <Route path='/admin/dashboard' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path='/admin/device' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DevicePage />
          </ProtectedRoute>
        } />
        <Route path='/admin/customer' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CustomerPage />
          </ProtectedRoute>
        } />
        <Route path='/admin/staff' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StaffPage />
          </ProtectedRoute>
        } />
        <Route path='/admin/gymroom' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <GymRoom />
          </ProtectedRoute>
        } />
        <Route path='/admin/report' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReportPage />
          </ProtectedRoute>
        } />
        <Route path='/admin/package-management' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PackagePage />
          </ProtectedRoute>
        } />
        <Route path='/admin/package-change' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPackageChangePage />
          </ProtectedRoute>
        } />
        <Route path='/admin/feedback-management' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FeedbackPage />
          </ProtectedRoute>
        } />

        {/* Staff Routes */}
        <Route path='/staff/dashboard' element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffDashboardPage />
          </ProtectedRoute>
        } />
        <Route path='/staff/subscription-management' element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffSubscriptionManagementPage />
          </ProtectedRoute>
        } />
        <Route path='/staff/feedback-management' element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffFeedbackPage />
          </ProtectedRoute>
        } />
        <Route path='/staff/customer' element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffCustomerPage />
          </ProtectedRoute>
        } />
        <Route path='/staff/gymroom' element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffGymRoomPage />
          </ProtectedRoute>
        } />
        <Route path='/staff/device' element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffDevicePage />
          </ProtectedRoute>
        } />

        {/* Coach Routes */}
        <Route path='/coach/dashboard' element={
          <ProtectedRoute allowedRoles={['coach', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path='/coach/clients' element={
          <ProtectedRoute allowedRoles={['coach', 'admin']}>
            <Clients />
          </ProtectedRoute>
        } />
        <Route path='/coach/schedule' element={
          <ProtectedRoute allowedRoles={['coach', 'admin']}>
            <Schedule />
          </ProtectedRoute>
        } />
        <Route path='/coach/training-programs' element={
          <ProtectedRoute allowedRoles={['coach', 'admin']}>
            <TrainingPrograms />
          </ProtectedRoute>
        } />
        <Route path='/coach/progress' element={
          <ProtectedRoute allowedRoles={['coach', 'admin']}>
            <TrainingProgress />
          </ProtectedRoute>
        } />
        <Route path='/coach/profile' element={
          <ProtectedRoute allowedRoles={['coach', 'admin']}>
            <Profiles />
          </ProtectedRoute>
        } />
        <Route path='/coach/edit-progress' element={
          <ProtectedRoute allowedRoles={['coach', 'admin']}>
            <EditProgressScreen />
          </ProtectedRoute>
        } />

        {/* User Routes */}
        <Route path='/user/dashboard' element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path='/user/schedule' element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserSchedule />
          </ProtectedRoute>
        } />
        <Route path='/user/progress' element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserProgress />
          </ProtectedRoute>
        } />
        <Route path='/user/package' element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserMembership />
          </ProtectedRoute>
        } />
        <Route path='/user/package-change' element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserPackageChangePage />
          </ProtectedRoute>
        } />
        <Route path='/user/evaluate' element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserReview />
          </ProtectedRoute>
        } />
        <Route path='/user/profile' element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserProfile />
          </ProtectedRoute>
        } />

        {/* Catch all route - redirect to appropriate dashboard or login */}
        <Route path='*' element={<RootRedirect />} />
      </Routes>
    </div>
  )
}

export default App

