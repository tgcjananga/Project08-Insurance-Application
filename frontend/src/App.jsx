import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Plans from './pages/Plans';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import MyPolicies from './pages/customer/MyPolicies';
import MyClaims from './pages/customer/MyClaims';
import RequestPolicy from './pages/customer/RequestPolicy';
import FileClaim from './pages/customer/FileClaim';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagePlans from './pages/admin/ManagePlans';
import ManagePolicies from './pages/admin/ManagePolicies';
import ManageClaims from './pages/admin/ManageClaims';
import Customers from './pages/admin/Customers';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/plans" element={<Plans />} />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/policies"
            element={
              <ProtectedRoute>
                <MyPolicies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/claims"
            element={
              <ProtectedRoute>
                <MyClaims />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/request-policy/:planId"
            element={
              <ProtectedRoute>
                <RequestPolicy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/file-claim"
            element={
              <ProtectedRoute>
                <FileClaim />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <ProtectedRoute adminOnly>
                <ManagePlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/policies"
            element={
              <ProtectedRoute adminOnly>
                <ManagePolicies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/claims"
            element={
              <ProtectedRoute adminOnly>
                <ManageClaims />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute adminOnly>
                <Customers />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;