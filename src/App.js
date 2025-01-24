import './App.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

function App() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('doge'); // Default template is 'doge'
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [memeUrl, setMemeUrl] = useState(
    'https://api.memegen.link/images/doge.png', // Default meme URL is doge
  );

  // Fetch meme templates when component loads
  useEffect(() => {
    axios
      .get('https://api.memegen.link/templates')
      .then((response) => {
        setTemplates(response.data); // Set template list
      })
      .catch((error) => {
        console.error('Error fetching meme templates:', error);
      });
  }, []);

  // Helper function to generate meme URL based on input text and selected template
  const generateMemeUrl = () => {
    // Format top and bottom text (replace spaces with underscores)
    const formattedTopText = topText.trim().replaceAll(' ', '_') || '_';
    const formattedBottomText = bottomText.trim().replaceAll(' ', '_') || '_';

    // Determine the meme base URL based on selected template
    const memeBaseUrl =
      selectedTemplate === 'doge'
        ? 'https://api.memegen.link/images/doge'
        : `https://api.memegen.link/images/${selectedTemplate}`;

    // Generate the meme URL
    const newMemeUrl = `${memeBaseUrl}/${formattedTopText}/${formattedBottomText}.png`;
    setMemeUrl(newMemeUrl); // Update meme URL in state
  };

  // Generate meme URL whenever topText, bottomText, or selectedTemplate changes
  useEffect(() => {
    generateMemeUrl();
  }, [topText, bottomText, selectedTemplate]);

  // Handle template selection change
  const handleTemplateChange = (selectedOption) => {
    const newTemplate = selectedOption.value;
    setSelectedTemplate(newTemplate); // Update selected template
  };

  // Handle meme download
  const handleDownloadClick = () => {
    const link = document.createElement('a');
    link.href = memeUrl;
    link.download = 'meme_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create options for template selection dropdown
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
        <img src={memeUrl} alt="Generated Meme" data-test-id="meme-image" />
      </a>

      <label htmlFor="meme-template" className="meme-template-label">
        Meme template
      </label>
      <div className="select">
        <Select
          id="meme-template"
          options={options}
          onChange={handleTemplateChange} // Handle template selection change
          value={options.find((option) => option.value === selectedTemplate)} // Set selected template
          placeholder="Select a meme template"
        />
      </div>

      <label htmlFor="topText">Top text</label>
      <input
        id="topText"
        value={topText}
        onChange={(e) => setTopText(e.target.value)} // Update topText state on input change
        placeholder="Enter top text"
      />

      <label htmlFor="bottomText">Bottom text</label>
      <input
        id="bottomText"
        value={bottomText}
        onChange={(e) => setBottomText(e.target.value)} // Update bottomText state on input change
        placeholder="Enter bottom text"
      />

      {/* Button to generate the meme */}
      <button onClick={generateMemeUrl} disabled={!selectedTemplate}>
        Generate Meme
      </button>

      {/* Button to download the meme */}
      <button onClick={handleDownloadClick}>Download Meme</button>
    </div>
  );
}

export default App;
