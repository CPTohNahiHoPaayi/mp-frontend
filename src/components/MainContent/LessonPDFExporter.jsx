import React, { useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ContentItem = ({ item }) => {
  switch (item.type) {
    case 'heading':
      return <h2 className="heading">✧ {item.text}</h2>;
    case 'paragraph':
      const formatParagraph = (text) => {
        return text
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
          .replace(/\n/g, '<br />');
      };
      return (
        <p
          className="paragraph"
          dangerouslySetInnerHTML={{ __html: formatParagraph(item.text) }}
        />
      );
    case 'code':
      return (
        <div className="code-block" aria-label={`Code snippet in ${item.language}`}>
          <pre><code>{item.code}</code></pre>
        </div>
      );
    case 'video':
      return <p className="video-placeholder">▶️ Video suggestion: "{item.query}"</p>;
    case 'mcq':
      return (
        <div className="mcq">
          <p className="mcq-question">{item.question}</p>
          <ul className="mcq-options">
            {item.options.map((option, index) => (
              <li key={index} className={index === item.correctAnswer ? 'correct' : ''}>
                {option}
              </li>
            ))}
          </ul>
          <p className="mcq-explanation"><strong>Explanation:</strong> {item.explanation}</p>
        </div>
      );
    default:
      return null;
  }
};

const LessonPDFExporter = ({ contentData, fileName = 'lesson.pdf' }) => {
  const contentRef = useRef(null);

  const handleDownloadPdf = () => {
    const content = contentRef.current;
    if (!content) return;

    // Show by setting height to auto
    content.style.height = 'auto';
    content.style.padding="2em";
    // Wait for DOM to paint
    requestAnimationFrame(() => {
      html2canvas(content, {
        scale: 2,
        backgroundColor: '#212121',
        useCORS: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(fileName);

        // Shrink back to height 0 after export
        content.style.height = '0';
        content.style.padding="0em";
      });
    });
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');

      .pdf-content {
        background-color: #212121;
        color: #dcdcdc;
        font-family: 'Fira Code', monospace;
        width: 800px;
        height: 0;
        overflow: hidden;
      }

      .heading {
        color: #c5a5ff;
        font-size: 1.8em;
        border-bottom: 1px solid #444;
        padding-bottom: 0.5rem;
        margin-top: 2rem;
        margin-bottom: 1.5rem;
      }

      .paragraph {
        font-size: 1em;
        line-height: 1.8;
      }

      .paragraph strong {
        color: #e0e0e0;
      }

      .inline-code {
        background-color: #333;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
        color: #89b3f7;
      }

      .code-block {
        background-color: #282c34;
        border-radius: 5px;
        padding: 1rem;
        margin: 1.5rem 0;
        overflow-x: auto;
        border: 1px solid #444;
      }

      .code-block pre, .code-block code {
        font-family: 'Fira Code', monospace;
      }

      .video-placeholder {
        background-color: #2a2a2a;
        border-left: 4px solid #c5a5ff;
        padding: 1rem;
        margin: 1.5rem 0;
      }

      .mcq {
        background-color: #282c34;
        border: 1px solid #444;
        border-radius: 5px;
        padding: 1.5rem;
        margin: 2rem 0;
      }

      .mcq-question {
        font-weight: bold;
        color: #e0e0e0;
      }

      .mcq-options {
        list-style-type: none;
        padding: 0;
      }

      .mcq-options li {
        padding: 0.5rem;
        margin: 0.5rem 0;
        border: 1px solid #555;
        border-radius: 4px;
      }

      .mcq-options li.correct {
        border-color: #4caf50;
        background-color: rgba(76, 175, 80, 0.1);
      }

      .mcq-explanation {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #444;
        color: #aaa;
        font-size: 0.9em;
      }

      .mcq-explanation strong {
        color: #ccc;
      }

      .download-button {
        background: linear-gradient(135deg, #7e57c2, #673ab7);
        color: #ffffff;
        border: none;
        padding: 14px 28px;
        font-size: 16px;
        font-family: 'Fira Code', monospace;
        border-radius: 8px;
        cursor: pointer;
        
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease;
      }

      .download-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(103, 58, 183, 0.3);
        background: linear-gradient(135deg, #9575cd, #5e35b1);
      }

      .download-button:focus {
        outline: 2px solid #c5a5ff;
        outline-offset: 4px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <button className="download-button" onClick={handleDownloadPdf}>
        Download as PDF
      </button>

      <div ref={contentRef} className="pdf-content">
        {contentData.map((item, index) => (
          <ContentItem key={index} item={item} />
        ))}
      </div>
    </>
  );
};

export default LessonPDFExporter;
