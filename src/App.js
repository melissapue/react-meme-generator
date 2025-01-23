import './App.css'; // Ensure the CSS file is imported
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';

function App() {
  const [data, setData] = useState([]);
  const [elementOutput, setElementOutput] = useState(
    'https://api.memegen.link/images/doge.png', // Default image (doge)
  );
  const [textTop, setTextTop] = useState('');
  const [textBottom, setTextBottom] = useState('');
  const [selectedOption, setSelectedOption] = useState(null); // Meme template selection

  useEffect(() => {
    axios.get('https://api.memegen.link/templates').then((result) => {
      setData(result.data);
      console.log(result.data);
    });
  }, []);

  let options = [];
  for (let i = 0; i <= data.length - 1; i++) {
    options.push({
      value: data[i].name,
      label: data[i].name,
      icon: data[i].blank,
    });
  }

  const generateClick = () => {
    if (selectedOption) {
      const newElementOutput =
        selectedOption.icon.slice(0, selectedOption.icon.indexOf('.', 32)) +
        '/' +
        textTop +
        '/' +
        textBottom +
        '.png';
      setElementOutput(newElementOutput);
    } else {
      console.error('Please select a meme template');
    }
  };

  const downloadUrl = () => {
    const url = elementOutput;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function () {
      if (this.status === 200) {
        const blob = this.response;
        const a = document.createElement('a');
        document.body.appendChild(a);
        const blobUrl = window.URL.createObjectURL(blob);
        a.href = blobUrl;
        a.download = 'meme_image.png';
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
        }, 0);
      }
    };
    xhr.send();
  };

  const { Option } = components;
  const IconOption = (props) => (
    <Option {...props}>
      <img src={props.data.icon} style={{ width: 36 }} alt={props.data.label} />
      {props.data.label}
    </Option>
  );

  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: 'rgb(225, 97, 61)',
      }}
    >
      <h1 style={{ fontFamily: 'Lexend Giga, sans-serif', color: '#f0dfce' }}>
        Meme Generator
      </h1>

      {/* Display generated meme */}
      <a href={elementOutput} download>
        <img src={elementOutput} alt="Meme" width="500" height="400" />
      </a>
      <br />

      {/* Meme template dropdown */}
      <div style={{ marginBottom: '20px' }}>
        <Select
          defaultValue={options[0]}
          options={options}
          components={{ Option: IconOption }}
          onChange={setSelectedOption}
        />
      </div>

      {/* Top Text Input */}
      <input
        type="text"
        placeholder="Enter Top Text"
        value={textTop}
        onChange={(event) => setTextTop(event.currentTarget.value)}
        style={{ padding: '10px', marginBottom: '10px' }}
      />
      <br />

      {/* Bottom Text Input */}
      <input
        type="text"
        placeholder="Enter Bottom Text"
        value={textBottom}
        onChange={(event) => setTextBottom(event.currentTarget.value)}
        style={{ padding: '10px', marginBottom: '20px' }}
      />
      <br />

      {/* Buttons */}
      <button
        onClick={generateClick}
        style={{
          padding: '10px 20px',
          backgroundColor: '#fee6e3',
          border: '2px solid #111',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
        disabled={!selectedOption} // Disable until template is selected
      >
        Generate Meme
      </button>
      <br />

      <button
        onClick={downloadUrl}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ffdeda',
          border: '2px solid #111',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Download
      </button>
    </div>
  );
}

export default App;
