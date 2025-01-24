import './App.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';

// Custom Option component to display an icon with the text in the dropdown
const IconOption = (props) => {
  const { Option } = components;
  return (
    <Option {...props}>
      <img
        src={props.data.icon} // The image for the option
        alt={props.data.label} // Alt text for accessibility
        style={{ width: 36, marginRight: 10 }} // Style for the image
      />
      {props.data.label} {/* The name of the option */}
    </Option>
  );
};

function App() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('doge'); // Default template is doge
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [memeUrl, setMemeUrl] = useState(
    'https://api.memegen.link/images/doge.png', // Default meme URL
  );

  useEffect(() => {
    // Fetch templates on component load
    axios
      .get('https://api.memegen.link/templates')
      .then((response) => {
        setTemplates(response.data); // Store templates
      })
      .catch((error) => {
        console.error('Error fetching meme templates:', error);
      });
  }, []);

  const handleTemplateChange = (selectedOption) => {
    const newTemplate = selectedOption?.value || 'doge'; // Default to 'doge' if no template selected
    setSelectedTemplate(newTemplate);

    // Update meme URL based on the selected template
    if (newTemplate === 'doge') {
      setMemeUrl('https://api.memegen.link/images/doge.png');
    } else {
      setMemeUrl(''); // Clear meme URL if another template is selected
    }
  };

  const handleGenerateClick = () => {
    // Format top and bottom text for the API
    const formattedTopText = topText.trim().replaceAll(' ', '_') || '_';
    const formattedBottomText = bottomText.trim().replaceAll(' ', '_') || '_';

    // Generate the meme URL based on the selected template and text
    const newMemeUrl = `https://api.memegen.link/images/${selectedTemplate || 'doge'}/${formattedTopText}/${formattedBottomText}.png`;
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

  // Map templates to options for the dropdown
  const options = [
    { value: 'doge', label: 'Choose Template' }, // Placeholder option
    ...templates.map((template) => ({
      value: template.id,
      label: template.name,
      icon: template.blank, // Use 'blank' URL as the preview image
    })),
  ];

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
          components={{ Option: IconOption }} // Use custom component for options
          onChange={handleTemplateChange} // Update template selection
          value={
            options.find((option) => option.value === selectedTemplate) || {
              value: 'doge',
              label: 'Choose Template',
            }
          } // Show selected template or default text
          placeholder="Choose Template"
        />
      </div>

      <label htmlFor="topText">Top text</label>
      <input
        id="topText"
        value={topText}
        onChange={(e) => setTopText(e.target.value)} // Update top text state
        placeholder="Enter top text"
      />

      <label htmlFor="bottomText">Bottom text</label>
      <input
        id="bottomText"
        value={bottomText}
        onChange={(e) => setBottomText(e.target.value)} // Update bottom text state
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
