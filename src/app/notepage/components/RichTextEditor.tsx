import React, { useState, useEffect, useRef } from 'react';
import { FiBold, FiItalic, FiList, FiLink, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Only set inner HTML if it's different to avoid cursor jump
    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleChange();
    editorRef.current?.focus();
  };

  const formatText = (format: string) => {
    execCommand(format);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="flex flex-col h-full">
      {showToolbar && (
        <div className="sticky top-0 z-10 bg-[rgb(var(--background))] border-b border-[rgb(var(--border))] p-2 overflow-x-auto scrollbar-hide">
          <div className="flex flex-wrap gap-1 md:gap-2">
            <button
              onClick={() => formatText('bold')}
              className="p-2 rounded-md hover:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] transition-colors"
              aria-label="Bold"
            >
              <FiBold />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 rounded-md hover:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] transition-colors"
              aria-label="Italic"
            >
              <FiItalic />
            </button>
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 rounded-md hover:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] transition-colors"
              aria-label="Bullet list"
            >
              <FiList />
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter the URL:');
                if (url) execCommand('createLink', url);
              }}
              className="p-2 rounded-md hover:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] transition-colors"
              aria-label="Insert link"
            >
              <FiLink />
            </button>
            <button
              onClick={() => execCommand('justifyLeft')}
              className="p-2 rounded-md hover:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] transition-colors"
              aria-label="Align left"
            >
              <FiAlignLeft />
            </button>
            <button
              onClick={() => execCommand('justifyCenter')}
              className="p-2 rounded-md hover:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] transition-colors"
              aria-label="Align center"
            >
              <FiAlignCenter />
            </button>
            <button
              onClick={() => execCommand('justifyRight')}
              className="p-2 rounded-md hover:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] transition-colors"
              aria-label="Align right"
            >
              <FiAlignRight />
            </button>
            <select
              onChange={(e) => {
                if (e.target.value) execCommand('formatBlock', e.target.value);
              }}
              className="p-2 rounded-md bg-[rgb(var(--secondary))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] text-sm focus:outline-none"
            >
              <option value="">Format</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="p">Paragraph</option>
            </select>
          </div>
        </div>
      )}
      
      <div 
        ref={editorRef} 
        contentEditable 
        className="flex-1 outline-none p-4 font-ubuntu text-[rgb(var(--foreground))] overflow-auto scrollbar-thin scrollbar-thumb-[rgb(var(--border))] scrollbar-track-transparent"
        data-placeholder={placeholder}
        onInput={handleChange}
        onPaste={handlePaste}
        onFocus={() => setShowToolbar(true)}
        onBlur={() => setTimeout(() => setShowToolbar(false), 100)}
      />
    </div>
  );
};

export default RichTextEditor; 