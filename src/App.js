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
  const [selectedTemplate, setSelectedTemplate] = useState('doge'); // Default to 'doge'
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

  const regenerateMemeUrl = (template, top = topText, bottom = bottomText) => {
    // Helper function to regenerate the meme URL
    const formattedTopText = top.trim().replaceAll(' ', '_') || '_';
    const formattedBottomText = bottom.trim().replaceAll(' ', '_') || '_';
    const newMemeUrl = `https://api.memegen.link/images/${template}/${formattedTopText}/${formattedBottomText}.png`;
    setMemeUrl(newMemeUrl);
  };

  const handleTemplateChange = (selectedOption) => {
    const newTemplate = selectedOption?.value || 'doge';
    setSelectedTemplate(newTemplate);
    regenerateMemeUrl(newTemplate);
  };

  const handleTextChange = (e, textType) => {
    // Update either topText or bottomText based on the input
    if (textType === 'top') {
      setTopText(e.target.value);
      regenerateMemeUrl(selectedTemplate, e.target.value, bottomText);
    } else if (textType === 'bottom') {
      setBottomText(e.target.value);
      regenerateMemeUrl(selectedTemplate, topText, e.target.value);
    }
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
    {
      value: 'doge',
      label: 'Choose Template',
      icon: 'https://api.memegen.link/images/doge.png',
    },
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
            selectedTemplate === 'doge'
              ? {
                  label: 'Choose Template',
                  value: 'doge',
                  icon: 'https://api.memegen.link/images/doge.png',
                }
              : options.find((option) => option.value === selectedTemplate)
          } // Show "Choose Template" initially
          placeholder="Choose Template"
          isSearchable // Make the dropdown searchable
        />
      </div>

      <label htmlFor="topText">Top text</label>
      <input
        id="topText"
        value={topText}
        onChange={(e) => handleTextChange(e, 'top')} // Update top text state and URL
        placeholder="Enter top text"
      />

      <label htmlFor="bottomText">Bottom text</label>
      <input
        id="bottomText"
        value={bottomText}
        onChange={(e) => handleTextChange(e, 'bottom')} // Update bottom text state and URL
        placeholder="Enter bottom text"
      />

      {/* Button to download the meme */}
      <button onClick={handleDownloadClick}>Download Meme</button>
    </div>
  );
}

export default App;
