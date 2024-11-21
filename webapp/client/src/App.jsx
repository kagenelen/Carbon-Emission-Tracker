
/**
* @file React file containing routes for pages
*/

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import './theme.css';

import RequestPasswordReset from './components/RequestPasswordReset.jsx';
import TokenPasswordReset from './components/TokenPasswordReset.jsx';
import UserCreationForm from './components/UserCreationForm.jsx';
import Profile from './components/Profile.jsx';
import ChangeEmail from './components/ChangeEmail.jsx';
import ChangePassword from './components/ChangePassword.jsx';
import UserLoginForm from './components/UserLoginForm.jsx';
import ProjectList from './components/ProjectList.jsx';
import CreateProjectDetailsForm from './components/CreateProjectDetailsForm.jsx';
import EditProjectDetailsForm from './components/EditProjectDetailsForm.jsx';
import EditProjectDataForm from './components/EditProjectDataForm.jsx';
import ProjectDashboard from './components/ProjectDashboard.jsx';
import Leaderboard from './components/Leaderboard.jsx'
import ProjectSettings from './components/ProjectSettings.jsx';
import AdminUserList from './components/AdminUserList.jsx';
import ProjectDataPrediction from './components/ProjectDataPrediction.jsx'
import ScrollToTop from './components/ScrollToTop.jsx';

const App = () => {
  return (
    <Router>
        <Layout>
          <ScrollToTop /> {/* This will scroll to top on each route change */}
          <Routes>
            <Route path="/profile/:userId?" element={<Profile />} />
            <Route path="/change-email/:userId?" element={<ChangeEmail />} />
            <Route path="/register" element={<UserCreationForm />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/login/request-password-reset" element={<RequestPasswordReset />} />
            <Route path="/:userId/:token/login" element={<TokenPasswordReset />} />
            <Route path="/login" element={<UserLoginForm />} />
            <Route path="/projects/:userId?" element={<ProjectList />} />
            <Route path="/new-project-details" element={<CreateProjectDetailsForm />} />
            <Route path="/edit-project-details/" element={<EditProjectDetailsForm />} />
            <Route path="/project/:projectId/:userId?" element={<ProjectDashboard />} />
            <Route path="/edit-project-data/" element={<EditProjectDataForm />} />
            <Route path="/users" element={<AdminUserList />} />
            <Route path="/project/:projectId" element={<ProjectDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/project-settings/:projectId" element={<ProjectSettings />} />
            <Route path="/new-project-forecast" element={<ProjectDataPrediction />} />
            
            {/* Redirect from root path to /login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* Fallback route for 404 - optional */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};
export default App;
