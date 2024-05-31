import React from 'react';
import './App.css';
import PubMedSearch from "./PubMedSearch";

function App() {
  return (
    <div className="App">
      <header className="App-header">
          <h4>
              Title
          </h4>
      </header>
        <main className="App">
           <PubMedSearch/>
        </main>
    </div>
  );
}

export default App;
