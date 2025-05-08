import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VehicleTracking from './pages/VehicleTracking';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VehicleTracking />} />
      </Routes>
    </Router>
  );
}

export default App;
