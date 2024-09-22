import React, { useState } from 'react';
import TemplatePreview from './preview';

const TemplateForm = () => {
  const [templateName, setTemplateName] = useState('');
  const [languageCode, setLanguageCode] = useState('en_US');
  const [policy, setPolicy] = useState('deterministic');
  const [components, setComponents] = useState([]);

  const handleImageUpload = (e, compIndex) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedComponents = [...components];
        updatedComponents[compIndex].parameters[0].imageUrl = reader.result;
        setComponents(updatedComponents);
      };
      reader.readAsDataURL(file); // Convert image to base64 for simplicity
    }
  };

  const addComponent = (type) => {
    const newComponent = {
      type,
      parameters: type === 'HEADER' ? [{ type: 'image', imageUrl: '' }] : [{ type: 'text', text: '' }],
    };
    setComponents([...components, newComponent]);
  };

  const handleParameterChange = (compIndex, paramIndex, event) => {
    const updatedComponents = [...components];
    updatedComponents[compIndex].parameters[paramIndex][event.target.name] = event.target.value;
    setComponents(updatedComponents);
  };

  const handleAddParameter = (compIndex) => {
    const newParameter = { type: 'text', text: '', url: '' };
    const updatedComponents = [...components];
    updatedComponents[compIndex].parameters.push(newParameter);
    setComponents(updatedComponents);
  };

  const handleRemoveParameter = (compIndex, paramIndex) => {
    const updatedComponents = [...components];
    updatedComponents[compIndex].parameters.splice(paramIndex, 1);
    setComponents(updatedComponents);
  };

  const handleRemoveComponent = (compIndex) => {
    const updatedComponents = components.filter((_, index) => index !== compIndex);
    setComponents(updatedComponents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const templateData = {
      name: templateName,
      language: {
        code: languageCode,
        policy,
      },
      components: components.map((comp) => {
        if (comp.type === 'HEADER' && comp.parameters[0].imageUrl) {
          return {
            ...comp,
            parameters: [
              {
                type: 'image',
                image: {
                  link: comp.parameters[0].imageUrl,
                },
              },
            ],
          };
        }
        return comp;
      }),
    };

    console.log(templateData, 'temp');
    return;
    try {
      const response = await fetch('http://localhost:5000/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        alert('Template created successfully!');
      } else {
        alert('Failed to create template.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="d-flex justify-content-between">
      <div className="col-md-7">
        <form onSubmit={handleSubmit}>
          {/* Template Name */}
          <div style={{ marginBottom: '20px' }} className='justify-content-around d-flex'>
            <label>Template Name:</label>
            <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Enter template name" required />
          </div>

          {/* Language Code */}
          <div style={{ marginBottom: '20px' }} className='justify-content-around d-flex'>
            <label>Language Code:</label>
            <input type="text" value={languageCode} onChange={(e) => setLanguageCode(e.target.value)} placeholder="Enter language code (e.g., en_US)" required />
          </div>

          {/* Policy */}
          <div style={{ marginBottom: '20px' }} className='justify-content-around d-flex'>
            <label>Policy:</label>
            <select value={policy} onChange={(e) => setPolicy(e.target.value)}>
              <option value="deterministic">Deterministic</option>
              <option value="fallback">Fallback</option>
            </select>
          </div>

          {/* Components */}
          <h3>Components</h3>
          {components.map((component, compIndex) => (
            <div key={compIndex} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
              <h4>{component.type} Component</h4>
              {component.type === 'HEADER' && (
                <div>
                  <label>Upload Image:</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, compIndex)} required />
                  {component.parameters[0].imageUrl && <img src={component.parameters[0].imageUrl} alt="Selected" style={{ width: '100px', height: '100px', marginTop: '10px' }} />}
                </div>
              )}
              {component.type !== 'HEADER' &&
                component.parameters.map((param, paramIndex) => (
                  <div key={paramIndex} style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      name="text"
                      value={param.text}
                      placeholder="Enter text"
                      onChange={(e) => handleParameterChange(compIndex, paramIndex, e)}
                      required
                      style={{ marginRight: '10px' }}
                    />
                    {component.type === 'BUTTON' && (
                      <input type="url" name="url" value={param.url} placeholder="Enter URL (for button only)" onChange={(e) => handleParameterChange(compIndex, paramIndex, e)} />
                    )}
                    <button type="button" onClick={() => handleRemoveParameter(compIndex, paramIndex)}>
                      Remove Parameter
                    </button>
                  </div>
                ))}
              <button type="button" onClick={() => handleAddParameter(compIndex)}>
                Add Parameter
              </button>
              <button type="button" onClick={() => handleRemoveComponent(compIndex)}>
                Remove Component
              </button>
            </div>
          ))}
          <div style={{ marginBottom: '20px' }}>
            <button type="button" onClick={() => addComponent('HEADER')}>
              Add Header Component
            </button>
            <button type="button" onClick={() => addComponent('BODY')}>
              Add Body Component
            </button>
            <button type="button" onClick={() => addComponent('BUTTON')}>
              Add Button Component
            </button>
          </div>

          <button type="submit">Create Template</button>
        </form>
      </div>
      <div className="col-md-5">
        <TemplatePreview templateName={templateName} languageCode={languageCode} policy={policy} components={components} />
      </div>
    </div>
  );
};

export default TemplateForm;
