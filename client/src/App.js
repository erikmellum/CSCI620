import React from 'react';
import logo from './logo.svg';
import './App.css';
const server = 'http://localhost:3001'

async function onClick() {
  const url = `${server}/maps`;
  const data = { latitude: 39.728958, longitude: -121.838783 };
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  const result = await response.text();
  const pdfUrl = `${ server }/${ result }`;
  window.open(pdfUrl);
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        
      </header>
      <button onClick={onClick}>Push to create map</button>
      <CreateMap></CreateMap>
      <MapList></MapList>
    </div>
  );
}

export default App;
