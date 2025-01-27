import './App.css';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
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
  const [selectedTemplate, setSelectedTemplate] = useState('doge'); // Default template is 'doge'
  const [topText, setTopText] = useState(''); // Default to empty
  const [bottomText, setBottomText] = useState(''); // Default to empty
  const [memeUrl, setMemeUrl] = useState(''); // Default meme URL is empty

  // Fetch templates on component load
  useEffect(() => {
    axios
      .get('https://api.memegen.link/templates')
      .then((response) => {
        setTemplates(response.data); // Store templates
      })
      .catch((error) => {
        console.error('Error fetching meme templates:', error);
      });
  }, []);

  // Regenerate meme URL when top/bottom text or template changes
  const regenerateMemeUrl = useCallback(
    (template, top = topText, bottom = bottomText) => {
      const formattedTopText = encodeURIComponent(top.trim()) || '_';
      const formattedBottomText = encodeURIComponent(bottom.trim()) || '_';

      let newMemeUrl;

      // If a template is selected and it's not a custom template
      if (template && !template.startsWith('http')) {
        newMemeUrl = `https://api.memegen.link/images/${template}/${formattedTopText}/${formattedBottomText}.png`;
      }
      // If no template is selected, use default meme
      else if (!template && (top || bottom)) {
        newMemeUrl = `https://api.memegen.link/images/noidea/highly_professional/${formattedTopText}/${formattedBottomText}.png`;
      }
      // Default meme if no text or template
      else {
        newMemeUrl =
          'https://api.memegen.link/images/noidea/highly_professional/meme_generator.jpg?watermark=MemeComplete.com&token=2ibib1bhzz941qk33lpj';
      }

      setMemeUrl(newMemeUrl);
    },
    [topText, bottomText], // Dependencies for regeneration
  );

  // Automatically update meme when top/bottom text or template changes
  useEffect(() => {
    regenerateMemeUrl(selectedTemplate, topText, bottomText);
  }, [selectedTemplate, topText, bottomText, regenerateMemeUrl]);

  const handleTemplateChange = (selectedOption) => {
    const newTemplate = selectedOption?.value || ''; // If no option, set to empty
    setSelectedTemplate(newTemplate);
    regenerateMemeUrl(newTemplate, topText, bottomText); // Update meme URL when template changes
  };

  const handleTextChange = (e, textType) => {
    const value = e.target.value;
    if (textType === 'top') {
      setTopText(value);
      regenerateMemeUrl(selectedTemplate, value, bottomText);
    } else if (textType === 'bottom') {
      setBottomText(value);
      regenerateMemeUrl(selectedTemplate, topText, value);
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
      value: '',
      label: 'Choose meme',
      icon: 'https://api.memegen.link/images/noidea/highly_professional/meme_generator.jpg?watermark=MemeComplete.com&token=2ibib1bhzz941qk33lpj',
    },
    ...templates.map((template) => ({
      value: template.id.toLowerCase(),
      label: template.name,
      icon: template.blank,
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
          components={{ Option: IconOption }}
          onChange={handleTemplateChange}
          value={options.find((option) => option.value === selectedTemplate)}
          placeholder="Choose Template"
          isSearchable
        />
      </div>

      <label htmlFor="topText">Top text</label>
      <input
        id="topText"
        value={topText}
        onChange={(e) => handleTextChange(e, 'top')}
        placeholder="Enter top text"
      />

      <label htmlFor="bottomText">Bottom text</label>
      <input
        id="bottomText"
        value={bottomText}
        onChange={(e) => handleTextChange(e, 'bottom')}
        placeholder="Enter bottom text"
      />

      <button onClick={handleDownloadClick}>Download Meme</button>
    </div>
  );
}

export default App;
