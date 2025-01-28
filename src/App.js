import './App.css';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import Select, { components } from 'react-select';

// Custom Option component to display an icon alongside the text in the dropdown menu
const IconOption = (props) => {
  const { Option } = components;
  return (
    <Option {...props}>
      <img
        src={props.data.icon} // Using the icon URL for the image in the dropdown
        alt={props.data.label} // Adding alt text for accessibility purposes
        style={{ width: 36, marginRight: 10 }} // Small styling for the icon to align it
      />
      {props.data.label} {/* Display the label text */}
    </Option>
  );
};

function App() {
  // State to store the fetched templates
  const [templates, setTemplates] = useState([]);
  // State to keep track of the currently selected template, defaulting to 'doge'
  const [selectedTemplate, setSelectedTemplate] = useState('doge');
  // State for the user-entered top and bottom text
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  // URL for the generated meme
  const [memeUrl, setMemeUrl] = useState('');
  // State to track when the meme image is fully loaded
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Fetch meme templates from the API when the component mounts
  useEffect(() => {
    axios
      .get('https://api.memegen.link/templates')
      .then((response) => {
        setTemplates(response.data); // Store the list of templates in state
      })
      .catch((error) => {
        console.error('Error fetching meme templates:', error); // Log any errors
      });
  }, []);

  // Function to create the meme URL based on user input
  const regenerateMemeUrl = useCallback(
    (template, top = topText, bottom = bottomText) => {
      // Format the text: replace spaces with underscores and encode special characters
      const formattedTopText = encodeURIComponent(top.trim()) || '_';
      const formattedBottomText = encodeURIComponent(bottom.trim()) || '_';

      let newMemeUrl;

      // Check if a valid template is selected
      if (template && !template.startsWith('http')) {
        // Generate the URL with the selected template and user text
        newMemeUrl = `https://api.memegen.link/images/${template}/${formattedTopText}/${formattedBottomText}.png`;
      } else if (!template && (top || bottom)) {
        // Fallback if no template is selected but text is provided
        newMemeUrl = `https://api.memegen.link/images/noidea/highly_professional/${formattedTopText}/${formattedBottomText}.png`;
      } else {
        // Default URL if no template or text is provided
        newMemeUrl =
          'https://api.memegen.link/images/noidea/highly_professional/meme_generator.jpg';
      }

      setMemeUrl(newMemeUrl); // Update the meme URL
    },
    [topText, bottomText], // Dependencies to watch for changes
  );

  // Regenerate the meme URL whenever the selected template, top text, or bottom text changes
  useEffect(() => {
    regenerateMemeUrl(selectedTemplate, topText, bottomText);
  }, [selectedTemplate, topText, bottomText, regenerateMemeUrl]);

  // Handle changes to the selected meme template
  const handleTemplateChange = (selectedOption) => {
    const newTemplate = selectedOption?.value || ''; // Get the selected template or default to empty
    setSelectedTemplate(newTemplate);
    regenerateMemeUrl(newTemplate, topText, bottomText); // Update the meme URL
  };

  // Handle text input changes for top or bottom text
  const handleTextChange = (e, textType) => {
    const value = e.target.value;
    if (textType === 'top') {
      setTopText(value); // Update the top text state
      regenerateMemeUrl(selectedTemplate, value, bottomText); // Refresh the meme URL
    } else if (textType === 'bottom') {
      setBottomText(value); // Update the bottom text state
      regenerateMemeUrl(selectedTemplate, topText, value); // Refresh the meme URL
    }
  };

  // Trigger the download of the generated meme image
  const handleDownloadClick = async () => {
    if (!memeUrl) return; // Prevent download if there's no meme URL

    try {
      const response = await fetch(memeUrl); // Fetch the image
      const blob = await response.blob(); // Convert it to a blob

      // Create a temporary link for downloading
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob); // Create a URL from the blob
      link.download = 'meme_image.png'; // Set a default filename
      document.body.appendChild(link);
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up the link
    } catch (error) {
      console.error('Error downloading the meme:', error); // Log errors
    }
  };

  // Mark the image as loaded once it fully loads
  const handleImageLoad = () => {
    setIsImageLoaded(true); // Update the state to indicate the image is ready
  };

  // Prepare dropdown options with icons for each template
  const options = [
    {
      value: '',
      label: 'Choose meme', // Default option
      icon: 'https://api.memegen.link/images/noidea/highly_professional/meme_generator.jpg',
    },
    ...templates.map((template) => ({
      value: template.id.toLowerCase(),
      label: template.name,
      icon: template.blank, // Icon is the blank template
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
          onLoad={handleImageLoad} // Wait for the image to load
        />
      </a>

      <label htmlFor="meme-template">Meme template</label>
      <div className="select">
        <Select
          id="meme-template"
          options={options}
          components={{ Option: IconOption }} // Custom option component
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

      {/* Show download button only when the image is ready */}
      {isImageLoaded && <button onClick={handleDownloadClick}>Download</button>}
    </div>
  );
}

export default App;
