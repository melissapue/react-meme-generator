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

  useEffect(() => {
    // Fetch the templates when the component loads
    axios
      .get('https://api.memegen.link/templates')
      .then((response) => {
        setTemplates(response.data); // Save the template data to state
      })
      .catch((error) => {
        console.error('Error fetching meme templates:', error);
      });
  }, []);

  const handleGenerateClick = () => {
    // Format the top and bottom text (replace spaces with underscores)
    const formattedTopText = topText.trim().replaceAll(' ', '_') || '_';
    const formattedBottomText = bottomText.trim().replaceAll(' ', '_') || '_';

    // If no template is selected, default to 'doge' meme template
    const memeBaseUrl =
      selectedTemplate === 'doge'
        ? 'https://api.memegen.link/images/doge' // Use doge meme template
        : `https://api.memegen.link/images/${selectedTemplate}`; // Use selected template if it's not doge

    const newMemeUrl = `${memeBaseUrl}/${formattedTopText}/${formattedBottomText}.png`;
    setMemeUrl(newMemeUrl); // Set the generated meme URL
  };

  const handleDownloadClick = () => {
    const link = document.createElement('a');
    link.href = memeUrl;
    link.download = 'meme_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create options for the select dropdown
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
          onChange={setSelectedTemplate} // Set the selected template when changed
          value={selectedTemplate} // Set the value of the select to the selected template
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
      <button
        onClick={handleGenerateClick}
        disabled={!selectedTemplate} // Disable if no template is selected
      >
        Generate Meme
      </button>

      {/* Button to download the meme */}
      <button onClick={handleDownloadClick}>Download Meme</button>
    </div>
  );
}

export default App;
