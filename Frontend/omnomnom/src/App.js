// import logo from './logo.svg';
import './App.css';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import Waiting from './pages/Waiting';
import Genderdetect from './pages/Genderdetect';
function App() {
  return (
    <BrowserRouter>
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/room/:roomId" element={<Room />} />
  <Route path="/waiting" element={<Waiting />} />
  <Route path="/genderverify" element={<Genderdetect />} />
</Routes>
      </BrowserRouter>
  );
}

export default App;
