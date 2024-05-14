import './App.css';
import Alert from './components/Alert';
// import About from './components/About';
import Navbar from './components/Navbar';
import TextForm from './components/TextForms';
import React, { useState } from 'react'

function App() {
  const [mode, setMode] = useState('light');
  const toggleMode=()=>{
    if(mode === 'light'){
      setMode('dark');
      document.body.style.backgroundColor = 'grey';
    }else{
      setMode('light');
      document.body.style.backgroundColor = 'white';
    }
  }
  return (
    <>
      <Navbar title="EVTOR"  aboutText="About Evtor" mode={mode} toggleMode={toggleMode}/>
      <Alert alert="This is an Alert"/>
      <div className="container my-3">
        <TextForm heading="Enter your text here " mode={mode} />
        {/* <About/> */}
      </div>
    </>
  );
}

export default App;
