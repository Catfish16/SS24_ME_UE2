import React from 'react';
import './App.css';
import PubMedSearch from "./PubMedSearch";
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className="App">
        <header className="App-header">
          <span className="App-title">
              DocSearch
          </span>
          <div>
              <button className="menu-button">
                  <a href="/">
                    Home
                  </a>
              </button>
              <button
                  className="menu-button"
              >
                  About
              </button>
              <span
                  className="menu-button"
              >
                  Resources
              </span>
              <span
                  className="menu-button"
              >
                  Support
              </span>
          </div>

      </header>
        <div className="content">
            <div className="prompt">
                Discover the Latest Medical Research and Clinical Guidelines
            </div>
           <PubMedSearch/>
        </div>
    </div>
  );
}

export default App;
