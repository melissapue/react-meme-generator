import './App.css';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import Select, { components } from 'react-select';

// Custom dropdown option component to include icons in the dropdown
const IconOption = (props) => {
  const { Option } = components;
  return (
    <Option {...props}>
      <img
        src={props.data.icon} // Icon for the dropdown
        alt={props.data.label} // Accessible alt text
        style={{ width: 36, marginRight: 10 }} // Image styling
      />
      {props.data.label} {/* Display the label next to the image */}
    </Option>
  );
};

function App() {
  // State variables to manage templates, user input, and image generation
  const [templates, setTemplates] = useState([]); // List of meme templates
  const [selectedTemplate, setSelectedTemplate] = useState('doge'); // Default template
  const [topText, setTopText] = useState(''); // Top text input
  const [bottomText, setBottomText] = useState(''); // Bottom text input
  const [memeUrl, setMemeUrl] = useState(''); // URL for the generated meme
  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track when image is fully loaded

  // Fetch meme templates when the component first renders
  useEffect(() => {
    axios
      .get('https://api.memegen.link/templates')
      .then((response) => {
        setTemplates(response.data); // Store fetched templates in state
      })
      .catch((error) => {
        console.error('Error fetching meme templates:', error); // Handle errors gracefully
      });
  }, []);

  // Function to regenerate the meme URL whenever inputs change
  const regenerateMemeUrl = useCallback(
    (template, top = topText, bottom = bottomText) => {
      // Format text: encode special characters and replace spaces with underscores
      const formattedTopText =
        encodeURIComponent(top.trim()).replace(/%20/g, '_') || '_';
      const formattedBottomText =
        encodeURIComponent(bottom.trim()).replace(/%20/g, '_') || '_';

      // Generate the correct URL based on user inputs
      let newMemeUrl;
      if (template && !template.startsWith('http')) {
        newMemeUrl = `https://api.memegen.link/images/${template}/${formattedTopText}/${formattedBottomText}.png`;
      } else if (!template && (top || bottom)) {
        newMemeUrl = `https://api.memegen.link/images/noidea/highly_professional/${formattedTopText}/${formattedBottomText}.png`;
      } else {
        // Fallback template when no inputs are provided
        newMemeUrl =
          'https://api.memegen.link/images/noidea/highly_professional/meme_generator.jpg?watermark=MemeComplete.com&token=2ibib1bhzz941qk33lpj';
      }

      setMemeUrl(newMemeUrl); // Update the meme URL in state
    },
    [topText, bottomText], // Dependencies to watch for changes
  );

  // Re-run the meme generation function whenever inputs change
  useEffect(() => {
    regenerateMemeUrl(selectedTemplate, topText, bottomText);
  }, [selectedTemplate, topText, bottomText, regenerateMemeUrl]);

  // Update the selected template when the user chooses a new one
  const handleTemplateChange = (selectedOption) => {
    const newTemplate = selectedOption?.value || ''; // Default to empty if no template selected
    setSelectedTemplate(newTemplate);
    regenerateMemeUrl(newTemplate, topText, bottomText); // Update URL immediately
  };

  // Update top or bottom text based on user input
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

  // Handle the download process for the generated meme
  const handleDownloadClick = async () => {
    if (!memeUrl) return; // Exit if there's no URL

    try {
      const response = await fetch(memeUrl); // Fetch the image from the URL
      const blob = await response.blob(); // Convert the response to a blob
      const link = document.createElement('a'); // Create a temporary link
      link.href = URL.createObjectURL(blob); // Create a download link for the blob
      link.download = 'meme_image.png'; // Set the default filename
      document.body.appendChild(link); // Append the link to the DOM
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up the DOM after the download
    } catch (error) {
      console.error('Error downloading the meme:', error); // Log any errors
    }
  };

  // Track when the image has fully loaded
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // Prepare options for the dropdown, including template icons
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
        <img
          src={memeUrl}
          alt="Generated Meme"
          data-test-id="meme-image"
          onLoad={handleImageLoad} // Mark image as loaded
        />
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

      {/* Only show the download button when the image is ready */}
      {isImageLoaded && <button onClick={handleDownloadClick}>Download</button>}
    </div>
  );
}

export default App;
