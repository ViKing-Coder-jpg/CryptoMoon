import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Predictions from './pages/Predictions';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="predictions" element={<Predictions />} />
        {/* Fallback to Home for demo purposes */}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
