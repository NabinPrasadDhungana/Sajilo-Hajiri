import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import './App.css';
import Register from './components/Register';
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Default route to prevent "No routes matched location '/'" */}
 <Route exact path="/" element={<Home />} />        
        {/* Your existing route */}
  

        <Route exact path="/Register" element={<Register showAlert={(msg, type) => alert(`${msg}`)} />} />
          
      </Routes>
    </BrowserRouter>
  );
}

export default App;
