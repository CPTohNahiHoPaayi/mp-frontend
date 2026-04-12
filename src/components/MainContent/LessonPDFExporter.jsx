import React, { useState } from 'react';
import { Button, Text, Spinner } from '@chakra-ui/react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const PAGE = {
  w: 210,
  h: 297,
  mt: 32,
  mb: 28,
  ml: 28,
  mr: 28,
  headerY: 18,
  footerY: 288,
};
const CW = PAGE.w - PAGE.ml - PAGE.mr;

const C = {
  bg: '#FAFAF8',
  text: '#1A1A1A',
  textLight: '#555555',
  textMuted: '#888888',
  accent: '#0D7C66',
  accentLight: '#E8F5F0',
  codeBg: '#F4F4F0',
  codeBorder: '#E0E0DC',
  codeText: '#2D2D2D',
  inlineCodeBg: '#EEEEE8',
  rule: '#D4D4D0',
  correct: '#0D7C66',
  bulletColor: '#0D7C66',
};

const F = { title: 24, h1: 18, h2: 15, body: 10.5, code: 9, small: 8.5, tiny: 7.5 };

function bg(doc) {
  doc.setFillColor(C.bg);
  doc.rect(0, 0, PAGE.w, PAGE.h, 'F');
}

function header(doc, title, num) {
  if (num <= 1) return;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(F.tiny);
  doc.setTextColor(C.textMuted);
  const t = title.length > 60 ? title.slice(0, 57) + '...' : title;
  doc.text(t, PAGE.ml, PAGE.headerY);
  doc.text(`${num}`, PAGE.w - PAGE.mr, PAGE.headerY, { align: 'right' });
  doc.setDrawColor(C.rule);
  doc.setLineWidth(0.2);
  doc.line(PAGE.ml, PAGE.headerY + 3, PAGE.w - PAGE.mr, PAGE.headerY + 3);
}

function footer(doc) {
  doc.setDrawColor(C.rule);
  doc.setLineWidth(0.2);
  doc.line(PAGE.ml, PAGE.footerY - 4, PAGE.w - PAGE.mr, PAGE.footerY - 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(F.tiny);
  doc.setTextColor(C.textMuted);
  doc.text('TextToLearn', PAGE.ml, PAGE.footerY);
}

function np(doc, title, pc) {
  doc.addPage();
  const n = pc + 1;
  bg(doc);
  header(doc, title, n);
  footer(doc);
  return n;
}

function ensure(doc, y, need, title, pc) {
  if (y + need > PAGE.footerY - 10) {
    pc.v = np(doc, title, pc.v);
    return PAGE.mt;
  }
  return y;
}

function wrap(doc, text, w) {
  return doc.splitTextToSize(text, w);
}

// --- Markdown-aware paragraph rendering ---

function parseInlineSegments(text) {
  // Parse text into segments: { text, bold, code }
  const segments = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ text: text.slice(last, match.index), bold: false, code: false });
    }
    const m = match[0];
    if (m.startsWith('**')) {
      segments.push({ text: m.slice(2, -2), bold: true, code: false });
    } else if (m.startsWith('`')) {
      segments.push({ text: m.slice(1, -1), bold: false, code: true });
    }
    last = match.index + m.length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), bold: false, code: false });
  }
  return segments;
}

function measureSegments(doc, segments, fontSize) {
  let totalW = 0;
  for (const seg of segments) {
    doc.setFont(seg.code ? 'courier' : 'helvetica', seg.bold ? 'bold' : 'normal');
    doc.setFontSize(seg.code ? F.code : fontSize);
    totalW += doc.getTextWidth(seg.text);
  }
  return totalW;
}

function renderRichLine(doc, segments, x, y, fontSize) {
  let cx = x;
  for (const seg of segments) {
    if (seg.code) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(F.code);
      const tw = doc.getTextWidth(seg.text);
      // inline code background
      doc.setFillColor(C.inlineCodeBg);
      doc.roundedRect(cx - 0.5, y - 3, tw + 1, 4.5, 0.5, 0.5, 'F');
      doc.setTextColor(C.accent);
      doc.text(seg.text, cx, y);
      cx += tw;
    } else {
      doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(C.text);
      doc.text(seg.text, cx, y);
      cx += doc.getTextWidth(seg.text);
    }
  }
}

function renderMarkdownParagraph(doc, text, y, title, pc) {
  if (!text) return y;

  const lines = text.split('\n');

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      y += 3;
      continue;
    }

    // Check for bullet points
    const bulletMatch = trimmed.match(/^[\*\-•]\s+(.*)/);
    const isBullet = !!bulletMatch;
    const lineText = isBullet ? bulletMatch[1] : trimmed;

    const segments = parseInlineSegments(lineText);

    // For wrapping, we flatten to plain text, wrap, then re-render
    const plainText = segments.map(s => s.text).join('');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(F.body);
    const indent = isBullet ? 8 : 0;
    const wrappedLines = wrap(doc, plainText, CW - indent);

    for (let wi = 0; wi < wrappedLines.length; wi++) {
      y = ensure(doc, y, 6, title, pc);

      if (isBullet && wi === 0) {
        // Bullet dot
        doc.setFillColor(C.bulletColor);
        doc.circle(PAGE.ml + 2, y - 1, 0.8, 'F');
      }

      // For the first wrapped line, render with rich formatting
      // For continuation lines, render plain (simpler, avoids complexity)
      if (wi === 0 && segments.length > 1) {
        renderRichLine(doc, segments, PAGE.ml + indent, y, F.body);
      } else {
        // Check if this wrapped line contains bold/code parts
        const lineSegs = parseInlineSegments(wrappedLines[wi]);
        if (lineSegs.some(s => s.bold || s.code)) {
          renderRichLine(doc, lineSegs, PAGE.ml + indent, y, F.body);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(F.body);
          doc.setTextColor(C.text);
          doc.text(wrappedLines[wi], PAGE.ml + indent, y);
        }
      }
      y += 5.2;
    }
  }
  y += 3;
  return y;
}

// --- Block renderers ---

function renderTitlePage(doc, title, subtitle) {
  bg(doc);
  doc.setFillColor(C.accent);
  doc.rect(PAGE.ml, 55, 40, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(F.title);
  doc.setTextColor(C.text);
  const tLines = wrap(doc, title, CW);
  let y = 68;
  tLines.forEach(l => { doc.text(l, PAGE.ml, y); y += 10; });

  y += 4;
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(F.body);
    doc.setTextColor(C.textLight);
    doc.text(subtitle, PAGE.ml, y);
    y += 6;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(F.body);
  doc.setTextColor(C.textMuted);
  doc.text('Generated by TextToLearn', PAGE.ml, y);
  y += 6;
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), PAGE.ml, y);

  doc.setFillColor(C.accent);
  doc.rect(PAGE.ml, PAGE.footerY - 20, 20, 1.5, 'F');
  footer(doc);
}

function renderHeading(doc, text, y, title, pc, level) {
  y = ensure(doc, y, 18, title, pc);
  y += level === 1 ? 10 : 8;

  doc.setFillColor(C.accent);
  const barH = level === 1 ? 14 : 10;
  doc.rect(PAGE.ml, y - 4, 3, barH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(level === 1 ? F.h1 : F.h2);
  doc.setTextColor(C.text);
  const lines = wrap(doc, text, CW - 8);
  lines.forEach(l => { doc.text(l, PAGE.ml + 8, y + 4); y += level === 1 ? 8 : 7; });
  y += 4;
  return y;
}

function renderCode(doc, code, language, y, title, pc) {
  if (!code) return y;
  const codeLines = code.split('\n');
  y = ensure(doc, y, Math.min(codeLines.length * 4.5 + 20, 80), title, pc);
  y += 2;

  // Language label
  doc.setFont('courier', 'bold');
  doc.setFontSize(F.tiny);
  doc.setTextColor(C.textMuted);
  doc.text((language || 'code').toUpperCase(), PAGE.ml + 4, y + 3);
  y += 7;

  // Background
  const cH = codeLines.length * 4.5 + 8;
  doc.setFillColor(C.codeBg);
  doc.setDrawColor(C.codeBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(PAGE.ml, y - 2, CW, cH, 2, 2, 'FD');

  doc.setFont('courier', 'normal');
  doc.setFontSize(F.code);
  doc.setTextColor(C.codeText);
  y += 4;

  for (const line of codeLines) {
    y = ensure(doc, y, 5, title, pc);
    doc.text(line.length > 95 ? line.slice(0, 92) + '...' : line, PAGE.ml + 4, y);
    y += 4.5;
  }
  y += 6;
  return y;
}

function renderMCQ(doc, item, y, title, pc, qi) {
  y = ensure(doc, y, 40, title, pc);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(F.body);
  doc.setTextColor(C.accent);
  doc.text(`Q${qi}`, PAGE.ml, y + 1);
  doc.setTextColor(C.text);
  const qLines = wrap(doc, item.question, CW - 12);
  qLines.forEach(l => { doc.text(l, PAGE.ml + 10, y + 1); y += 5; });
  y += 3;

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  if (item.options) {
    item.options.forEach((opt, i) => {
      y = ensure(doc, y, 7, title, pc);
      const ok = i === item.correctAnswer;
      doc.setFillColor(ok ? C.accentLight : '#FFFFFF');
      doc.setDrawColor(ok ? C.correct : C.rule);
      doc.setLineWidth(0.3);
      doc.circle(PAGE.ml + 4, y - 1, 2.5, 'FD');
      doc.setFont('helvetica', ok ? 'bold' : 'normal');
      doc.setFontSize(F.small);
      doc.setTextColor(ok ? C.correct : C.text);
      doc.text(letters[i], PAGE.ml + 2.8, y + 0.3);
      const oLines = wrap(doc, opt, CW - 16);
      oLines.forEach((l, li) => doc.text(l, PAGE.ml + 12, y + li * 4.5));
      y += oLines.length * 4.5 + 2;
    });
  }

  if (item.explanation) {
    y += 2;
    y = ensure(doc, y, 12, title, pc);
    doc.setDrawColor(C.accent);
    doc.setLineWidth(0.4);
    doc.line(PAGE.ml, y, PAGE.ml + 15, y);
    y += 4;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(F.small);
    doc.setTextColor(C.textLight);
    const eLines = wrap(doc, item.explanation, CW - 4);
    eLines.forEach(l => { y = ensure(doc, y, 5, title, pc); doc.text(l, PAGE.ml + 2, y); y += 4.2; });
  }
  y += 6;
  return y;
}

// --- Generate single lesson PDF ---

function renderLessonContent(doc, contentData, y, title, pc) {
  let mcqCounter = 1;
  for (const item of contentData) {
    switch (item.type) {
      case 'heading':
        y = renderHeading(doc, item.text, y, title, pc, 2);
        break;
      case 'paragraph':
        y = renderMarkdownParagraph(doc, item.text, y, title, pc);
        break;
      case 'code':
        y = renderCode(doc, item.code, item.language, y, title, pc);
        break;
      case 'mcq':
        y = renderMCQ(doc, item, y, title, pc, mcqCounter++);
        break;
      case 'video':
        y = ensure(doc, y, 10, title, pc);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(F.small);
        doc.setTextColor(C.textMuted);
        doc.text(`Video: ${item.query}`, PAGE.ml, y);
        y += 8;
        break;
      default:
        break;
    }
  }
  return y;
}

function generateLessonPDF(contentData, fileName, lessonTitle) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pc = { v: 1 };

  renderTitlePage(doc, lessonTitle);
  pc.v = np(doc, lessonTitle, pc.v);
  renderLessonContent(doc, contentData, PAGE.mt, lessonTitle, pc);
  doc.save(fileName);
}

// --- Generate full course PDF ---

async function generateCoursePDF(courseId, courseTitle, meta, token, baseURL) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pc = { v: 1 };
  const bookTitle = courseTitle || 'Course';

  // Title page
  renderTitlePage(doc, bookTitle, `${meta.modules.length} Modules`);

  // Table of contents
  pc.v = np(doc, bookTitle, pc.v);
  let y = PAGE.mt;
  doc.setFillColor(C.accent);
  doc.rect(PAGE.ml, y - 4, 3, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(F.h2);
  doc.setTextColor(C.text);
  doc.text('Table of Contents', PAGE.ml + 8, y + 4);
  y += 16;

  for (let mIdx = 0; mIdx < meta.modules.length; mIdx++) {
    const mod = meta.modules[mIdx];
    y = ensure(doc, y, 8 + mod.lessons.length * 5, bookTitle, pc);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(F.body);
    doc.setTextColor(C.accent);
    doc.text(`Module ${mIdx + 1}`, PAGE.ml, y);
    doc.setTextColor(C.text);
    doc.text(mod.title, PAGE.ml + 20, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(F.small);
    doc.setTextColor(C.textLight);
    for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
      y = ensure(doc, y, 5, bookTitle, pc);
      doc.text(`${mIdx + 1}.${lIdx + 1}  ${mod.lessons[lIdx].title}`, PAGE.ml + 6, y);
      y += 5;
    }
    y += 4;
  }

  // Render each lesson
  for (let mIdx = 0; mIdx < meta.modules.length; mIdx++) {
    const mod = meta.modules[mIdx];

    // Module divider page
    pc.v = np(doc, bookTitle, pc.v);
    y = 80;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(F.body);
    doc.setTextColor(C.textMuted);
    doc.text(`MODULE ${mIdx + 1}`, PAGE.ml, y);
    y += 8;
    doc.setFillColor(C.accent);
    doc.rect(PAGE.ml, y, 30, 2, 'F');
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(F.h1);
    doc.setTextColor(C.text);
    const modLines = wrap(doc, mod.title, CW);
    modLines.forEach(l => { doc.text(l, PAGE.ml, y); y += 9; });

    for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
      try {
        const res = await axios.get(
          `${baseURL}/api/courses/${courseId}/module/${mIdx}/lesson/${lIdx}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const lesson = res.data.lesson;
        if (!lesson?.content) continue;

        // Start lesson on new page
        pc.v = np(doc, bookTitle, pc.v);
        y = PAGE.mt;

        // Lesson title as h1
        y = renderHeading(doc, lesson.title || `Lesson ${lIdx + 1}`, y, bookTitle, pc, 1);
        y = renderLessonContent(doc, lesson.content, y, bookTitle, pc);
      } catch (err) {
        console.error(`Failed to fetch lesson m${mIdx}/l${lIdx}:`, err);
      }
    }
  }

  doc.save(`${bookTitle.replace(/[^a-zA-Z0-9 ]/g, '')}.pdf`);
}

// --- Lesson-level button (used in bottom bar) ---

const LessonPDFExporter = ({ contentData, fileName = 'lesson.pdf', lessonTitle = 'Lesson' }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      color="var(--text-secondary)"
      _hover={{ color: 'var(--text-primary)', bg: 'var(--bg-hover)' }}
      rounded="lg"
      h={9}
      px={3}
      onClick={() => generateLessonPDF(contentData, fileName, lessonTitle)}
    >
      <Download size={16} />
      <Text ml={1.5} fontSize="xs" display={{ base: 'none', sm: 'block' }}>PDF</Text>
    </Button>
  );
};

// --- Course-level button (used in CourseCard) ---

export const CoursePDFButton = ({ courseId, courseTitle }) => {
  const { token } = useAuth();
  const baseURL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      // Fetch meta from first lesson
      const res = await axios.get(
        `${baseURL}/api/courses/${courseId}/module/0/lesson/0`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const meta = res.data.meta;
      if (!meta) throw new Error('No course meta found');
      await generateCoursePDF(courseId, courseTitle, meta, token, baseURL);
    } catch (err) {
      console.error('Course PDF failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="xs"
      color="var(--text-muted)"
      _hover={{ color: 'var(--accent)', bg: 'var(--bg-hover)' }}
      rounded="lg"
      h={7}
      px={2}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? <Spinner size="xs" /> : <Download size={12} />}
      <Text ml={1} fontSize="xs">{loading ? 'Generating...' : 'PDF'}</Text>
    </Button>
  );
};

export default LessonPDFExporter;
