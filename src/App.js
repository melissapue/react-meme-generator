import './App.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';

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
    'https://api.memegen.link/images/doge.png',
  );

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

  const handleGenerateClick = () => {
    const formattedTopText = topText.trim().replaceAll(' ', '_') || '_';
    const formattedBottomText = bottomText.trim().replaceAll(' ', '_') || '_';

    const newMemeUrl = `${selectedTemplate.icon.slice(
      0,
      selectedTemplate.icon.indexOf('.', 32),
    )}/${formattedTopText}/${formattedBottomText}.png`;

    setMemeUrl(newMemeUrl);
  };

  const handleDownloadClick = () => {
    const link = document.createElement('a');
    link.href = memeUrl;
    link.download = 'meme_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const options = templates.map((template) => ({
    value: template.id,
    label: template.name,
    icon: template.blank,
  }));

  return (
    <div className="Location">
      <h1>Meme Generator</h1>

      <a href={memeUrl} download>
        <img src={memeUrl} alt="Generated Meme" data-test-id="meme-image" />
      </a>

      <label htmlFor="meme-template" className="meme-template-label">
        Meme Template
      </label>
      <div className="select">
        <Select
          id="meme-template"
          options={options}
          components={{ Option: IconOption }}
          onChange={setSelectedTemplate}
          placeholder="Select a meme template"
        />
      </div>

      <label htmlFor="topText">Top text</label>
      <input
        id="topText"
        value={topText}
        onChange={(e) => setTopText(e.target.value)}
        placeholder="Enter top text"
      />
      <label htmlFor="bottomText">Bottom text</label>
      <input
        id="bottomText"
        value={bottomText}
        onChange={(e) => setBottomText(e.target.value)}
        placeholder="Enter bottom text"
      />

      <button
        onClick={handleGenerateClick}
        disabled={!selectedTemplate}
        data-test-id="generate-meme"
      >
        Generate Meme
      </button>
      <button onClick={handleDownloadClick}>Download Meme</button>
    </div>
  );
}

export default App;
