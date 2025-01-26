import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import LogsManagement from "./pages/LogsManagement.tsx";
import Anomalies from "./pages/Anomalies.tsx";
import Notifications from "./pages/Notifications.tsx";
import Feedback from "./pages/Feedback.tsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<LogsManagement />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
