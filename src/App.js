import './App.css';
import Alert from './components/Alert';
import About from './components/About';
import Navbar from './components/Navbar';
import TextForm from './components/TextForms';
import React, { useState } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";


function App() {
  const [mode, setMode] = useState('light');
  const [alert, setalert] = useState(null);

  const showAlert =(message,type)=>{
    setalert({
      message:message,
      type: type
    })
    setTimeout(() => {
      setalert(null)
    }, 1000);
    
  }
  const toggleMode = () => {
    if (mode === 'light') {
      setMode('dark');
      document.body.style.backgroundColor = 'grey';
      showAlert("Dark Mode has been enable","success");
    } else {
      setMode('light');
      document.body.style.backgroundColor = 'white';
      showAlert("Light Mode has been Enabled","success")
    }


  }
  return (
    <>
      <Navbar title="EVTOR" aboutText="About Evtor" mode={mode} toggleMode={toggleMode} />
      <Alert alert={alert} />
      <div className="container my-3">
        <TextForm showAlert={showAlert} heading="Enter your text here " mode={mode} />
        <About/>
      </div>
    </>
  );
}

export default App;
