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
  const [selectedTemplate, setSelectedTemplate] = useState(''); // Start with no template selected
  const [topText, setTopText] = useState(''); // Default top text
  const [bottomText, setBottomText] = useState(''); // Default bottom text
  const [memeUrl, setMemeUrl] = useState(
    'https://api.memegen.link/images/noidea/highly_professional/meme_generator.jpg?watermark=MemeComplete.com&token=2ibib1bhzz941qk33lpj',
  ); // Default meme URL set to your image

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

  const regenerateMemeUrl = useCallback(
    (template, top = topText, bottom = bottomText) => {
      // Helper function to regenerate the meme URL
      const formattedTopText = encodeURIComponent(top.trim()) || '_';
      const formattedBottomText = encodeURIComponent(bottom.trim()) || '_';

      const isCustomTemplate = template && template.startsWith('http');
      const newMemeUrl = template
        ? isCustomTemplate
          ? template // For custom templates, use the provided URL
          : `https://api.memegen.link/images/${template}/${formattedTopText}/${formattedBottomText}.png`
        : `https://api.memegen.link/images/noidea/highly_professional/${formattedTopText}/${formattedBottomText}.png`; // Default meme URL if no template

      setMemeUrl(newMemeUrl);
    },
    [topText, bottomText],
  ); // Dependency on topText and bottomText

  const handleTemplateChange = (selectedOption) => {
    const newTemplate = selectedOption?.value || ''; // Set to empty if no template is selected
    setSelectedTemplate(newTemplate);
    regenerateMemeUrl(newTemplate || '', topText, bottomText); // Regenerate meme URL on template change
  };

  const handleTextChange = (e, textType) => {
    const value = e.target.value;
    if (textType === 'top') {
      setTopText(value);
      regenerateMemeUrl(selectedTemplate || '', value, bottomText);
    } else if (textType === 'bottom') {
      setBottomText(value);
      regenerateMemeUrl(selectedTemplate || '', topText, value);
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

  // Update the meme URL when the selected template or text changes
  useEffect(() => {
    if (!selectedTemplate && (topText || bottomText)) {
      // If there's no template but text is entered, default to the meme with text
      regenerateMemeUrl('', topText, bottomText);
    } else if (selectedTemplate) {
      // If a template is selected, use that template with the text
      regenerateMemeUrl(selectedTemplate, topText, bottomText);
    }
  }, [selectedTemplate, topText, bottomText, regenerateMemeUrl]);

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
