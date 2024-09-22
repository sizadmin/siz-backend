import React from 'react';
import './WhatsAppPreview.css'; // Import CSS for styling

const TemplatePreview = ({ components }) => {
  return (
    <div className="whatsapp-preview">
      <h3>WhatsApp Template Preview</h3>
      <div className="whatsapp-chat">
        <div className="whatsapp-message">
          {components?.map((component, index) => (
            <div key={index} className="whatsapp-component">
              {component.type === 'HEADER' && component.parameters[0].imageUrl && (
                <div className="whatsapp-header">
                  <img src={component.parameters[0].imageUrl} alt="Header" style={{ height: 300, width: '100%' }} className="whatsapp-header-image" />
                </div>
              )}
              {component.type === 'BODY' && (
                <div className="whatsapp-body">
                  <p>{component.parameters.map((param) => param.text).join(' ')}</p>
                </div>
              )}
              {component.type === 'BUTTON' && (
                <div className="whatsapp-buttons">
                  {component.parameters.map((param, idx) => (
                    <button key={idx} className="whatsapp-button">
                      {param.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
