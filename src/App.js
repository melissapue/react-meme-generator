import './App.css'; // Ensure the CSS file is imported
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';

// Custom dropdown option with icons
const IconOption = (props) => {
  const { Option } = components;
  return (
    <Option {...props}>
      <img
        src={props.data.icon}
        alt={props.data.label}
        style={{ width: 36, marginRight: 10 }}
      />
      {props.data.label}
    </Option>
  );
};

function App() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [memeUrl, setMemeUrl] = useState(
    'https://api.memegen.link/images/doge.png', // Default image
  );

  // Fetch meme templates from the API
  useEffect(() => {
    axios
      .get('https://api.memegen.link/templates')
      .then((response) => {
        setTemplates(response.data);
      })
      .catch((error) => {
        console.error('Error fetching meme templates:', error);
      });
  }, []);

  // Generate meme URL
  const handleGenerateClick = () => {
    const formattedTopText = topText.trim().replaceAll(' ', '_') || '_';
    const formattedBottomText = bottomText.trim().replaceAll(' ', '_') || '_';

    const newMemeUrl = `${selectedTemplate.icon.slice(
      0,
      selectedTemplate.icon.indexOf('.', 32),
    )}/${formattedTopText}/${formattedBottomText}.png`;

    setMemeUrl(newMemeUrl);
  };

  // Download the generated meme
  const handleDownloadClick = () => {
    const link = document.createElement('a');
    link.href = memeUrl;
    link.download = 'meme_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Map templates into options for the dropdown
  const options = templates.map((template) => ({
    value: template.id,
    label: template.name,
    icon: template.blank,
  }));

  return (
    <div className="Location">
      <h1>Meme Generator</h1>

      {/* Display the generated meme */}
      <a href={memeUrl} download>
        <img src={memeUrl} alt="Generated Meme" />
      </a>

      {/* Dropdown for selecting meme templates */}
      <div className="select">
        <Select
          options={options}
          components={{ Option: IconOption }}
          onChange={setSelectedTemplate}
          placeholder="Select a meme template"
        />
      </div>

      {/* Input fields for top and bottom text */}
      <input
        placeholder="Enter Top Text"
        value={topText}
        onChange={(e) => setTopText(e.target.value)}
      />
      <input
        placeholder="Enter Bottom Text"
        value={bottomText}
        onChange={(e) => setBottomText(e.target.value)}
      />

      {/* Buttons */}
      <button onClick={handleGenerateClick} disabled={!selectedTemplate}>
        Generate Meme
      </button>
      <button onClick={handleDownloadClick}>Download Meme</button>
    </div>
  );
}

export default App;
