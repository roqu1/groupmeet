import { Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FriendsListPage from './pages/FriendsListPage';
import FindFriendsPage from './pages/FindFriendsPage';
import { ToastContainer } from 'react-toastify';
import UserProfilePage from './pages/UserProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import FriendRequestsPage from './pages/FriendRequestsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import 'react-toastify/dist/ReactToastify.css';
import GroupParticipantsListPage from './pages/GroupParticipantsListPage';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Public-Only Routes (redirect if logged in) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected Routes (redirect if not logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/friends" element={<FriendsListPage />} />
            <Route path="/find-friends" element={<FindFriendsPage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/friend-requests" element={<FriendRequestsPage />} />
            <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
            <Route path="/groups/:groupId/participants" element={<GroupParticipantsListPage />} />
          </Route>

          {/* ToDo: Not found page */}
        </Routes>
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
