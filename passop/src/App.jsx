import './App.css';
import Navbar from './components/Navbar';
import Manager from './components/Manager';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <div className="min-h-[83vh]">
        <Manager />
      </div>
      <Footer />
    </>
  );
}

export default App;
