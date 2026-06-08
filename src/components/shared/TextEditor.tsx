import { useRef, useCallback } from 'react';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link, Quote } from 'lucide-react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const btnClass = 'p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 transition-colors';
const dividerClass = 'w-px h-5 mx-1 bg-slate-200 dark:bg-slate-700';

export default function TextEditor({ value, onChange, placeholder, rows = 20 }: TextEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  const wrap = useCallback((before: string, after: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    onChange(value.substring(0, start) + before + value.substring(start, end) + after + value.substring(end));
    setTimeout(() => ta.focus(), 0);
  }, [value, onChange]);

  const insert = useCallback((text: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    onChange(value.substring(0, start) + text + value.substring(ta.selectionEnd));
    setTimeout(() => ta.focus(), 0);
  }, [value, onChange]);

  const wrapLine = useCallback((open: string, close: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const line = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
    onChange(value.substring(0, lineStart) + open + line + close + '\n\n' + value.substring(lineEnd === -1 ? value.length : lineEnd));
    setTimeout(() => ta.focus(), 0);
  }, [value, onChange]);

  const makeList = useCallback((tag: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    if (!selected.trim()) {
      onChange(value.substring(0, start) + `\n<${tag}>\n  <li></li>\n</${tag}>\n` + value.substring(end));
    } else {
      const items = selected.split('\n').filter(Boolean).map(l => `  <li>${l}</li>`).join('\n');
      onChange(value.substring(0, start) + `\n<${tag}>\n${items}\n</${tag}>\n` + value.substring(end));
    }
    setTimeout(() => ta.focus(), 0);
  }, [value, onChange]);

  const addLink = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const selected = value.substring(ta.selectionStart, ta.selectionEnd);
    const text = selected || 'texto do link';
    wrap('<a href="https://" target="_blank" rel="noopener noreferrer">', text === 'texto do link' ? 'texto do link</a>' : '</a>');
  }, [value, wrap]);

  const addQuote = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const selected = value.substring(ta.selectionStart, ta.selectionEnd);
    if (!selected.trim()) { insert('\n<blockquote></blockquote>\n'); } else { wrap('<blockquote>', '</blockquote>'); }
  }, [value, wrap, insert]);

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <button type="button" title="Negrito" onClick={() => wrap('<strong>', '</strong>')} className={btnClass}>
          <Bold size={18} />
        </button>
        <button type="button" title="Itálico" onClick={() => wrap('<em>', '</em>')} className={btnClass}>
          <Italic size={18} />
        </button>
        <div className={dividerClass} />
        <button type="button" title="Título H2" onClick={() => wrapLine('<h2>', '</h2>')} className={btnClass}>
          <Heading2 size={18} />
        </button>
        <button type="button" title="Título H3" onClick={() => wrapLine('<h3>', '</h3>')} className={btnClass}>
          <Heading3 size={18} />
        </button>
        <div className={dividerClass} />
        <button type="button" title="Lista Ordenada" onClick={() => makeList('ol')} className={btnClass}>
          <ListOrdered size={18} />
        </button>
        <button type="button" title="Lista não ordenada" onClick={() => makeList('ul')} className={btnClass}>
          <List size={18} />
        </button>
        <div className={dividerClass} />
        <button type="button" title="Inserir Link" onClick={addLink} className={btnClass}>
          <Link size={18} />
        </button>
        <button type="button" title="Citação" onClick={addQuote} className={btnClass}>
          <Quote size={18} />
        </button>
        <div className="ml-auto text-[10px] text-slate-400 font-medium">HTML</div>
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white focus:outline-none resize-y font-sans min-h-[300px]"
        rows={rows}
      />
    </div>
  );
}
