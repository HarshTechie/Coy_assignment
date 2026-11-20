import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Welcome from './pages/Welcome';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Onboarding (no tabs). Purely UI: there is one fixed demo user, no auth. */}
      <Route index element={<Welcome />} />
      <Route path="setup" element={<ProfileSetup />} />

      {/* Tabbed app */}
      <Route element={<AppLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="discover" element={<Discover />} />
        <Route path="matches" element={<Matches />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
