import { useRef, useCallback, useState, useLayoutEffect } from 'react';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link, Quote, Eye, Code, X } from 'lucide-react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const btnClass = 'p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 transition-colors';
const dividerClass = 'w-px h-5 mx-1 bg-slate-200 dark:bg-slate-700';

export default function TextEditor({ value, onChange, placeholder, rows = 20 }: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<'wysiwyg' | 'html'>('wysiwyg');
  const lastSyncedRef = useRef(value);
  const plainTextRef = useRef('');
  const pasteTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [showPasteOpt, setShowPasteOpt] = useState(false);

  useLayoutEffect(() => {
    if (tab === 'wysiwyg' && editorRef.current && value !== lastSyncedRef.current) {
      editorRef.current.innerHTML = value;
      lastSyncedRef.current = value;
    }
  }, [value, tab]);

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastSyncedRef.current = html;
      onChange(html);
    }
  }, [onChange]);

  const addLink = useCallback(() => {
    const url = prompt('URL do link:', 'https://');
    if (url) exec('createLink', url);
  }, [exec]);

  const addQuote = useCallback(() => {
    exec('formatBlock', 'blockquote');
  }, [exec]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastSyncedRef.current = html;
      onChange(html);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html && text && html !== text) {
      plainTextRef.current = text;
      document.execCommand('insertHTML', false, html);
      setShowPasteOpt(true);
      if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current);
      pasteTimerRef.current = setTimeout(() => setShowPasteOpt(false), 6000);
    } else {
      document.execCommand('insertText', false, text);
    }
  }, []);

  const pasteAsPlainText = useCallback(() => {
    if (!editorRef.current || !plainTextRef.current) return;
    editorRef.current.innerHTML = plainTextRef.current
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('\n');
    const html = editorRef.current.innerHTML;
    lastSyncedRef.current = html;
    onChange(html);
    setShowPasteOpt(false);
    plainTextRef.current = '';
  }, [onChange]);

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
      <div className="sticky top-20 lg:top-24 z-40 flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
        {showPasteOpt && (
          <div className="absolute left-0 right-0 top-full z-50 flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/40 border-b border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 animate-in slide-in-from-top-1 duration-200">
            <span className="font-medium">Colado com formatação</span>
            <button
              type="button"
              onClick={pasteAsPlainText}
              className="font-bold text-blue-600 dark:text-blue-300 hover:underline ml-auto"
            >
              Colar sem formatação
            </button>
            <button
              type="button"
              onClick={() => setShowPasteOpt(false)}
              className="p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <button type="button" title="Negrito" onClick={() => exec('bold')} className={btnClass}>
          <Bold size={18} />
        </button>
        <button type="button" title="Itálico" onClick={() => exec('italic')} className={btnClass}>
          <Italic size={18} />
        </button>
        <div className={dividerClass} />
        <button type="button" title="Título H2" onClick={() => exec('formatBlock', 'h2')} className={btnClass}>
          <Heading2 size={18} />
        </button>
        <button type="button" title="Título H3" onClick={() => exec('formatBlock', 'h3')} className={btnClass}>
          <Heading3 size={18} />
        </button>
        <div className={dividerClass} />
        <button type="button" title="Lista Ordenada" onClick={() => exec('insertOrderedList')} className={btnClass}>
          <ListOrdered size={18} />
        </button>
        <button type="button" title="Lista não ordenada" onClick={() => exec('insertUnorderedList')} className={btnClass}>
          <List size={18} />
        </button>
        <div className={dividerClass} />
        <button type="button" title="Inserir Link" onClick={addLink} className={btnClass}>
          <Link size={18} />
        </button>
        <button type="button" title="Citação" onClick={addQuote} className={btnClass}>
          <Quote size={18} />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab('wysiwyg')}
            className={`p-1.5 rounded-lg transition-colors ${tab === 'wysiwyg' ? 'bg-[#1f4ead] text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700'}`}
            title="Editor Visual"
          >
            <Eye size={18} />
          </button>
          <button
            type="button"
            onClick={() => setTab('html')}
            className={`p-1.5 rounded-lg transition-colors ${tab === 'html' ? 'bg-[#1f4ead] text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700'}`}
            title="Editar HTML"
          >
            <Code size={18} />
          </button>
        </div>
      </div>

      {tab === 'html' ? (
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white focus:outline-none resize-y font-mono text-sm min-h-[300px] rounded-b-xl"
          rows={rows}
        />
      ) : (
        <div className="overflow-hidden rounded-b-xl">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onPaste={handlePaste}
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-5
              prose-a:text-[#1f4ead] prose-a:no-underline hover:prose-a:underline prose-a:font-semibold
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full
              prose-blockquote:border-l-4 prose-blockquote:border-[#1f4ead] prose-blockquote:pl-5 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
              prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
              prose-ul:list-disc prose-ul:pl-6 prose-ul:my-5 prose-ul:space-y-1.5
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-5 prose-ol:space-y-1.5
              prose-li:text-slate-700 dark:prose-li:text-slate-300
              prose-hr:my-10 prose-hr:border-slate-200 dark:prose-hr:border-slate-700
              px-4 py-3 min-h-[300px] outline-none cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:cursor-text empty:before:pointer-events-none"
            data-placeholder={placeholder || 'Escreva seu artigo aqui...'}
          />
        </div>
      )}
    </div>
  );
}
