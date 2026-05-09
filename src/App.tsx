import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages - using lazy loading to prevent crashes and circular dependencies
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const Books = lazy(() => import('./pages/Books').then(m => ({ default: m.Books })));
const BookDetail = lazy(() => import('./pages/BookDetail').then(m => ({ default: m.BookDetail })));
const MyBooks = lazy(() => import('./pages/MyBooks').then(m => ({ default: m.MyBooks })));
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Scanner = lazy(() => import('./pages/Scanner').then(m => ({ default: m.Scanner })));
const AdminCopies = lazy(() => import('./pages/AdminCopies').then(m => ({ default: m.AdminCopies })));
const KnowledgeGraph = lazy(() => import('./pages/KnowledgeGraph').then(m => ({ default: m.KnowledgeGraph })));
const Marketplace = lazy(() => import('./pages/Marketplace').then(m => ({ default: m.Marketplace })));
const SocialFeed = lazy(() => import('./pages/SocialFeed').then(m => ({ default: m.SocialFeed })));
const GlobalDashboard = lazy(() => import('./pages/GlobalDashboard').then(m => ({ default: m.GlobalDashboard })));
const PublicCopy = lazy(() => import('./pages/PublicCopy').then(m => ({ default: m.PublicCopy })));
const LMS = lazy(() => import('./pages/LMS').then(m => ({ default: m.LMS })));
const KnowledgePassport = lazy(() => import('./pages/KnowledgePassport').then(m => ({ default: m.KnowledgePassport })));
const SmartStudy = lazy(() => import('./pages/SmartStudy').then(m => ({ default: m.SmartStudy })));
const PeerMatchmaking = lazy(() => import('./pages/PeerMatchmaking').then(m => ({ default: m.PeerMatchmaking })));
const ResourceHub = lazy(() => import('./pages/ResourceHub').then(m => ({ default: m.ResourceHub })));
const PredictiveIntelligence = lazy(() => import('./pages/PredictiveIntelligence').then(m => ({ default: m.PredictiveIntelligence })));
const LiveHeatmap = lazy(() => import('./pages/LiveHeatmap').then(m => ({ default: m.LiveHeatmap })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const LibraryCatalog = lazy(() => import('./pages/LibraryCatalog').then(m => ({ default: m.LibraryCatalog })));
const AddBook = lazy(() => import('./pages/AddBook').then(m => ({ default: m.AddBook })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const AILibrarian = lazy(() => import('./pages/AILibrarian').then(m => ({ default: m.AILibrarian })));
const VisualKnowledgeGraph = lazy(() => import('./pages/VisualKnowledgeGraph').then(m => ({ default: m.VisualKnowledgeGraph })));
const ARIAPlanner = lazy(() => import('./pages/ARIAPlanner').then(m => ({ default: m.ARIAPlanner })));
const ARIAIntelligence = lazy(() => import('./pages/ARIAIntelligence').then(m => ({ default: m.PDFIntelligence })));
const CareerDNA = lazy(() => import('./pages/CareerDNA').then(m => ({ default: m.CareerDNA })));
const CampusIntelligence = lazy(() => import('./pages/CampusIntelligence').then(m => ({ default: m.CampusIntelligence })));

const LoadingFallback = () => (
  <div style={{ background: '#0f172a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 900 }}>ACADEMIC OS</h1>
      <p style={{ color: '#64748b' }}>Initializing Neural Core...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/copy/:token" element={<PublicCopy />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/books" element={<Books />} />
              <Route path="/my-books" element={<MyBooks />} />
              <Route path="/lms" element={<LMS />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/feed" element={<SocialFeed />} />
              <Route path="/global" element={<GlobalDashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              {/* Next-Gen Features */}
              <Route path="/passport" element={<KnowledgePassport />} />
              <Route path="/study" element={<SmartStudy />} />
              <Route path="/peers" element={<PeerMatchmaking />} />
              <Route path="/resources" element={<ResourceHub />} />
              <Route path="/intelligence" element={<PredictiveIntelligence />} />
              <Route path="/heatmap" element={<LiveHeatmap />} />
              <Route path="/catalog" element={<LibraryCatalog />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/librarian" element={<AILibrarian />} />
              <Route path="/graph" element={<VisualKnowledgeGraph />} />
              <Route path="/aria-planner" element={<ARIAPlanner />} />
              <Route path="/aria-intelligence" element={<ARIAIntelligence />} />
              <Route path="/career-dna" element={<CareerDNA />} />
              <Route path="/campus-intel" element={<CampusIntelligence />} />
            </Route>

            {/* Book Details — no sidebar */}
            <Route element={<ProtectedRoute useSidebarLayout={false} />}>
              <Route path="/book/:id" element={<BookDetail />} />
            </Route>

            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/copies" element={<AdminCopies />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
