import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import "./index.css"
// Custom handler for phone button click
const handlePhoneClick = () => {
  // console.log('Phone icon clicked!');
};

// Editor component
const BodyFieldEditor = ({ text, onChange, addVariable, variables, removeVariable, maxCharacters = 950 }) => {
  const [bodyContent, setBodyContent] = useState(text);
  const [charCount, setCharCount] = useState(text.length); // Initialize with the length of initial text
  const quillRef = useRef(null); // Reference to Quill instance

  const handleBodyChange = (content) => {
    if (content.length <= maxCharacters) {
      setBodyContent(content);
      setCharCount(content.length); // Update character count
      let p = { target: { name: 'body', value: content } };
      onChange(p);
    } else {
      // Trim the content if it exceeds maxCharacters and update state
      // const trimmedContent = content.slice(0, maxCharacters);
      // setBodyContent(trimmedContent);
      setCharCount(maxCharacters);
      onChange({ target: { name: 'body', value: content.slice(0, maxCharacters) }});
    }
  };

  // Function to insert text into the editor
  const addVariable1 = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const cursorPosition = quill.getSelection().index;
      const variableLabel = variables[variables.length - 1].label.toString();
      const variableText = `{{${variableLabel}}}`;
      
      // Check if adding the variable exceeds the limit
      if (bodyContent.length + variableText.length <= maxCharacters) {
        quill.insertText(cursorPosition, variableText);
        quill.setSelection(cursorPosition + variableText.length); // Move the cursor after the inserted text
        handleBodyChange(quill.root.innerHTML); // Update the state and character count
      } else {
        alert(`Cannot add variable, it will exceed the maximum character limit of ${maxCharacters}.`);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Backspace' && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const selection = quill.getSelection();
      if (selection) {
        const cursorPosition = selection.index;
        const [leaf] = quill.getLeaf(cursorPosition - 1);
        const leafText = leaf?.text || '';

        // Check if the cursor is at the end of a variable-like text (e.g., {{1}})
        if (leafText.endsWith('}}')) {
          const variableStartIndex = leafText.lastIndexOf('{{');
          if (variableStartIndex !== -1) {
            const variableText = leafText.substring(variableStartIndex);
            quill.deleteText(cursorPosition - variableText.length, variableText.length);
            
            // Extract variable label
            const variableLabel = variableText.replace(/{{|}}/g, '');
            removeVariable(variableLabel);
            event.preventDefault();
          }
        }
      }
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule('toolbar');

      // Register custom button and handler
      toolbar.addHandler('phone', () => {
        handlePhoneClick();
        addVariable('add');
        addVariable1();
      });

      // Register keydown event for handling backspace
      quill.root.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        quill.root.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [quillRef, addVariable, removeVariable, variables]);

  useEffect(() => {
    setBodyContent(text);
    setCharCount(text.length); // Update character count when text prop changes
  },[text]);

  return (
    <div className="editor-wrapper" style={{ position: 'relative' }}>
      <ReactQuill
        ref={quillRef}
        value={bodyContent}
        onChange={handleBodyChange}
        style={{ height: '100px',background:'white' }} // Adjust the height as needed
        modules={{
          toolbar: {
            container: '#toolbar',
            handlers: {
              phone: handlePhoneClick,
            },
          },
        }}
        formats={['header', 'bold', 'italic', 'phone']}
      />
      <div id="toolbar" className="toolbar">
        <button className="ql-phone" style={{ width: 'fit-content' }}>
          Add Variable
        </button>
        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
      </div>
      <div className="char-count" style={{ position: 'absolute', bottom: 0, right: 0, padding: '5px', fontSize: '12px', color: '#555' }}>
        {charCount}/{maxCharacters}
      </div>
    </div>
  );
};

export default BodyFieldEditor;
