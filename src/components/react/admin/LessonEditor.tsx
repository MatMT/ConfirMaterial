import React, { useState, useEffect } from 'react';
import { 
    Bold, Italic, Highlighter, Quote, List, ListOrdered, 
    Info, FileText, Eraser, HelpCircle, Flag, Save, 
    Rocket, Globe, Sparkles, AlertCircle, FileEdit 
} from 'lucide-react';

interface ParagraphBlock {
    text: string;
    question: {
        text: string;
        correctOption: string;
        incorrectOptions: string[];
    };
}

const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement> | React.FocusEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
};

const insertMarkdown = (
    textareaId: string, 
    value: string, 
    setValue: (val: string) => void, 
    prefix: string, 
    suffix: string = ''
) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = prefix + (selectedText || 'texto') + suffix;
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setValue(newValue);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText || 'texto').length);
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, 0);
};

const insertList = (
    textareaId: string, 
    value: string, 
    setValue: (val: string) => void, 
    ordered: boolean = false
) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let replacement = '';
    if (selectedText) {
        const lines = selectedText.split('\n');
        replacement = lines.map((line, idx) => {
            const prefix = ordered ? `${idx + 1}. ` : '- ';
            if (line.trim().startsWith('-') || /^\d+\.\s/.test(line.trim())) {
                return line;
            }
            return prefix + line;
        }).join('\n');
    } else {
        replacement = ordered ? '1. elemento' : '- elemento';
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setValue(newValue);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, 0);
};

const MarkdownToolbar = ({ textareaId, value, setValue }: { textareaId: string, value: string, setValue: (val: string) => void }) => {
    return (
        <div className="flex flex-wrap gap-1 mb-0 bg-base-200 p-1 rounded-t-xl border border-base-300 border-b-0 w-full">
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Negrita"
                onClick={() => insertMarkdown(textareaId, value, setValue, '**', '**')}
            >
                <Bold className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Negrita</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Cursiva"
                onClick={() => insertMarkdown(textareaId, value, setValue, '*', '*')}
            >
                <Italic className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Cursiva</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Resaltar Texto"
                onClick={() => insertMarkdown(textareaId, value, setValue, '<mark>', '</mark>')}
            >
                <Highlighter className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Resaltar</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Cita / Destacado"
                onClick={() => insertMarkdown(textareaId, value, setValue, '> "', '"')}
            >
                <Quote className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Cita</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Lista de Viñetas"
                onClick={() => insertList(textareaId, value, setValue, false)}
            >
                <List className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Lista</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Lista Numerada"
                onClick={() => insertList(textareaId, value, setValue, true)}
            >
                <ListOrdered className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Numerada</span>
            </button>
        </div>
    );
};

const generateDescriptionFromIntro = (text: string) => {
    const plain = text
        .replace(/#+\s/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/<.*?>/g, '')
        .replace(/>\s/g, '')
        .replace(/\r?\n/g, ' ')
        .trim();
    if (!plain) return '';
    const firstPeriod = plain.indexOf('.');
    if (firstPeriod > 20 && firstPeriod < 180) {
        return plain.slice(0, firstPeriod + 1).trim();
    }
    return plain.length > 150 ? plain.slice(0, 147).trim() + '...' : plain;
};

export default function LessonEditor({ initialData = null }: { initialData?: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingAction, setSubmittingAction] = useState<'draft' | 'publish' | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    
    // Form state
    const [title, setTitle] = useState(initialData?.title || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [author, setAuthor] = useState(initialData?.author || '');
    const [date, setDate] = useState(initialData?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    
    // Initial draft status: if existing lesson, use its draft status (default false); if new, starts as draft true until published
    const [isDraft, setIsDraft] = useState<boolean>(() => {
        if (initialData?.id) {
            return initialData.draft ?? false;
        }
        return initialData?.draft ?? true;
    });
    
    const isAlreadyPublished = initialData?.id && initialData?.draft === false;

    const [intro, setIntro] = useState(initialData?.blocks?.intro || '');
    const [conclusion, setConclusion] = useState(initialData?.blocks?.conclusion || '');
    
    const [paragraphs, setParagraphs] = useState<ParagraphBlock[]>(() => {
        const initialParagraphs = initialData?.blocks?.paragraphs || [];
        const blocks = [...initialParagraphs];
        while (blocks.length < 3) {
            blocks.push({ text: '', question: { text: '', correctOption: '', incorrectOptions: ['', ''] } });
        }
        return blocks.slice(0, 3);
    });

    // LocalStorage Backup State
    const storageKey = initialData?.id ? `confir_lesson_backup_${initialData.id}` : `confir_lesson_backup_new`;
    const [hasBackup, setHasBackup] = useState(false);
    const [backupData, setBackupData] = useState<any>(null);
    const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

    // Detect backup on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && (parsed.title || parsed.intro || parsed.conclusion || (parsed.paragraphs && parsed.paragraphs.some((p: any) => p.text || p.question?.text)))) {
                    setBackupData(parsed);
                    setHasBackup(true);
                    if (parsed.lastSavedAt) {
                        setLastSavedTime(parsed.lastSavedAt);
                    }
                }
            }
        } catch (e) {
            console.error("Error al leer respaldo local:", e);
        }
    }, [storageKey]);

    // Auto-save to localStorage
    useEffect(() => {
        if (isSubmitting) return;

        const isEmpty = !title.trim() && !description.trim() && !intro.trim() && !conclusion.trim() && paragraphs.every(p => !p.text.trim() && !p.question.text.trim());
        if (isEmpty && !initialData?.id) return;

        const timer = setTimeout(() => {
            try {
                const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const backupObject = {
                    title,
                    slug,
                    description,
                    author,
                    date,
                    isDraft,
                    intro,
                    conclusion,
                    paragraphs,
                    lastSavedAt: nowStr
                };
                localStorage.setItem(storageKey, JSON.stringify(backupObject));
                setLastSavedTime(nowStr);
            } catch (e) {
                console.error("Error al guardar respaldo local:", e);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [title, slug, description, author, date, isDraft, intro, conclusion, paragraphs, isSubmitting, storageKey, initialData]);

    const handleRestoreBackup = () => {
        if (!backupData) return;
        if (backupData.title !== undefined) setTitle(backupData.title);
        if (backupData.slug !== undefined) setSlug(backupData.slug);
        if (backupData.description !== undefined) setDescription(backupData.description);
        if (backupData.author !== undefined) setAuthor(backupData.author);
        if (backupData.date !== undefined) setDate(backupData.date);
        if (backupData.isDraft !== undefined) setIsDraft(backupData.isDraft);
        if (backupData.intro !== undefined) setIntro(backupData.intro);
        if (backupData.conclusion !== undefined) setConclusion(backupData.conclusion);
        if (backupData.paragraphs !== undefined) setParagraphs(backupData.paragraphs);
        
        setHasBackup(false);
        alert("📥 ¡Trabajo restaurado con éxito desde tu respaldo local!");
    };

    const handleDiscardBackup = () => {
        try {
            localStorage.removeItem(storageKey);
        } catch (e) {}
        setHasBackup(false);
        setBackupData(null);
    };

    const handleClearParagraph = (index: number) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[index] = { text: '', question: { text: '', correctOption: '', incorrectOptions: ['', ''] } };
        setParagraphs(newParagraphs);
    };

    const handleParagraphChange = (index: number, field: string, value: string) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[index].text = value;
        setParagraphs(newParagraphs);
    };

    const handleQuestionChange = (index: number, field: string, value: string) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[index].question[field as keyof typeof newParagraphs[0]['question']] = value as never;
        setParagraphs(newParagraphs);
    };

    const handleIncorrectOptionChange = (pIndex: number, oIndex: number, value: string) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex].question.incorrectOptions[oIndex] = value;
        setParagraphs(newParagraphs);
    };

    const generateId = () => {
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yy}${mm}${dd}`;
    };

    const validateForPublish = (): string[] => {
        const errors: string[] = [];
        if (!title.trim()) errors.push('Título de la lección');
        if (!author.trim()) errors.push('Autor');
        if (!date.trim()) errors.push('Fecha (pubDate)');
        if (!intro.trim()) errors.push('Introducción');
        
        paragraphs.forEach((p, i) => {
            const num = i + 1;
            if (!p.text.trim()) errors.push(`Párrafo ${num}: Falta el contenido`);
            if (!p.question.text.trim()) errors.push(`Párrafo ${num}: Falta la pregunta`);
            if (!p.question.correctOption.trim()) errors.push(`Párrafo ${num}: Falta la opción correcta`);
            if (p.question.incorrectOptions.some(opt => !opt.trim())) {
                errors.push(`Párrafo ${num}: Faltan opciones incorrectas`);
            }
        });

        if (!conclusion.trim()) errors.push('Conclusión');
        return errors;
    };

    const saveLesson = async (saveAsDraft: boolean, overrideDescription?: string) => {
        setIsSubmitting(true);
        setSubmittingAction(saveAsDraft ? 'draft' : 'publish');

        try {
            const id = initialData?.id || generateId();
            const finalSlug = slug.trim() || id;
            const finalDesc = overrideDescription !== undefined ? overrideDescription : description;

            const payload = {
                id,
                slug: finalSlug,
                title: title.trim(),
                description: finalDesc.trim(),
                author: author.trim(),
                date: date.trim(),
                draft: saveAsDraft,
                blocks: {
                    intro,
                    paragraphs,
                    conclusion
                }
            };

            const response = await fetch('/api/admin/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                try {
                    localStorage.removeItem(storageKey);
                } catch (e) {}
                
                setIsDraft(saveAsDraft);
                alert(saveAsDraft 
                    ? '📝 ¡Borrador guardado exitosamente!\n\nNo será visible para los alumnos hasta que decidas publicarla.' 
                    : '🎉 ¡Lección publicada exitosamente!\n\nEstará visible para todos los alumnos en 2 a 5 minutos mientras Vercel actualiza el sitio.');
                
                window.location.href = '/admin/lessons';
            } else {
                alert(`❌ Error al guardar: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('❌ Error de red al comunicarse con el servidor.');
        } finally {
            setIsSubmitting(false);
            setSubmittingAction(null);
        }
    };

    const handleSaveDraft = async () => {
        if (!title.trim()) {
            alert('⚠️ Por favor escribe al menos el título de la lección para poder identificar tu borrador.');
            return;
        }

        const confirmMsg = initialData?.id
            ? '📝 ¿Deseas guardar los cambios de este BORRADOR?\n\nSeguirá sin ser visible para los alumnos hasta que decidas publicarla.'
            : '📝 ¿Deseas guardar esta lección como BORRADOR?\n\nNo será visible para los alumnos hasta que decidas publicarla.';

        if (!window.confirm(confirmMsg)) return;

        let finalDesc = description.trim();
        if (!finalDesc && intro.trim()) {
            finalDesc = generateDescriptionFromIntro(intro);
        }

        await saveLesson(true, finalDesc);
    };

    const handlePublish = async () => {
        const errors = validateForPublish();
        if (errors.length > 0) {
            setValidationErrors(errors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setValidationErrors([]);

        // Si la descripción está vacía, autogenerar desde la intro para no bloquear
        let finalDesc = description.trim();
        if (!finalDesc) {
            finalDesc = generateDescriptionFromIntro(intro) || title.trim();
            setDescription(finalDesc);
        }

        const confirmMsg = isAlreadyPublished
            ? '🚀 ¿Deseas actualizar la lección PUBLICADA?\n\nLos cambios se verán reflejados para todos los alumnos en 2 a 5 minutos.'
            : '🚀 ¿Deseas PUBLICAR esta lección?\n\nEstará visible para todos los alumnos en el sitio web (tardará de 2 a 5 minutos en compilarse en Vercel).';

        if (!window.confirm(confirmMsg)) return;

        await saveLesson(false, finalDesc);
    };

    // Auto-resize initial layout execution if needed
    useEffect(() => {
        document.querySelectorAll('textarea').forEach((textarea) => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        });
    }, [paragraphs, intro, conclusion]);

    return (
        <form onSubmit={e => e.preventDefault()} className="space-y-6 sm:space-y-8 bg-base-100 p-6 sm:p-8 pb-28 sm:pb-36 rounded-3xl shadow-xl w-full border border-base-200 animate-fade-up">
            
            {/* Banner de Errores de Validación al Publicar */}
            {validationErrors.length > 0 && (
                <div className="alert alert-warning shadow-lg rounded-2xl p-4 sm:p-5 border-2 border-warning/40 animate-fade-down">
                    <div className="flex items-start gap-3 w-full">
                        <AlertCircle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-bold text-base sm:text-lg">
                                No se puede publicar todavía: Faltan datos requeridos
                            </h3>
                            <p className="text-xs sm:text-sm text-base-content/80 mt-1">
                                Para que los alumnos puedan estudiar la lección completa, debes completar los siguientes campos:
                            </p>
                            <ul className="list-disc list-inside mt-2 text-xs sm:text-sm font-medium space-y-1 bg-base-100/70 p-3 rounded-xl border border-warning/20">
                                {validationErrors.map((err, i) => (
                                    <li key={i} className="text-error font-semibold">{err}</li>
                                ))}
                            </ul>
                            <div className="mt-3 text-xs text-base-content/70">
                                💡 <strong>Tip:</strong> Si aún estás preparando el contenido, puedes presionar <strong>"Guardar Borrador"</strong> al final de la página para guardar tu progreso sin perderlo.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Banner de Respaldo Encontrado */}
            {hasBackup && (
                <div className="alert bg-primary/10 border-2 border-primary/40 shadow-xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-down">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl animate-bounce">💡</div>
                        <div>
                            <h3 className="font-bold text-primary text-base sm:text-lg">Respaldo Local Detectado</h3>
                            <p className="text-xs sm:text-sm text-base-content/80 mt-0.5 leading-relaxed">
                                Borrador sin guardar encontrado{lastSavedTime ? ` (${lastSavedTime})` : ''}. ¿Deseas restaurarlo?
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
                        <button type="button" onClick={handleDiscardBackup} className="btn btn-outline btn-error btn-sm font-bold rounded-xl gap-1.5 shadow-2xs hover:bg-error hover:text-white transition-all">
                            <Eraser className="w-4 h-4" />
                            Descartar
                        </button>
                        <button type="button" onClick={handleRestoreBackup} className="btn btn-primary btn-sm font-bold shadow-md rounded-xl gap-1.5">
                            📥 Restaurar Respaldo
                        </button>
                    </div>
                </div>
            )}
            
            {/* Cabecera / Metadatos */}
            <div className="space-y-4 bg-base-200/50 p-4 sm:p-6 rounded-2xl border border-base-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-base-300">
                    <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <Info className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        Información General
                    </h2>
                    <div className="flex items-center gap-2">
                        {isDraft ? (
                            <span className="badge badge-warning badge-sm sm:badge-md font-bold gap-1.5 py-3 px-3">
                                <FileEdit className="w-3.5 h-3.5" /> Estado actual: Borrador
                            </span>
                        ) : (
                            <span className="badge badge-success text-white badge-sm sm:badge-md font-bold gap-1.5 py-3 px-3">
                                <Globe className="w-3.5 h-3.5" /> Estado actual: Publicada
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold text-xs sm:text-sm">
                                Título de la Lección <span className="text-error">*</span>
                            </span>
                        </label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full text-sm sm:text-base" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="Ej: El significado del Perdón" 
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold text-xs sm:text-sm">
                                Autor <span className="text-error">*</span>
                            </span>
                        </label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full text-sm sm:text-base" 
                            value={author} 
                            onChange={e => setAuthor(e.target.value)} 
                        />
                    </div>
                </div>
                
                <div className="form-control">
                    <div className="flex items-center justify-between pb-1">
                        <label className="label py-0">
                            <span className="label-text font-semibold text-xs sm:text-sm">
                                Descripción corta <span className="text-base-content/50 font-normal">(resumen en listado)</span>
                            </span>
                        </label>
                        {intro.trim() && (
                            <button
                                type="button"
                                onClick={() => {
                                    const generated = generateDescriptionFromIntro(intro);
                                    if (generated) setDescription(generated);
                                }}
                                className="btn btn-ghost btn-xs text-primary font-bold gap-1 hover:bg-primary/10 normal-case"
                                title="Generar resumen automático desde la introducción"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Autogenerar desde introducción</span>
                            </button>
                        )}
                    </div>
                    <textarea 
                        className="textarea textarea-bordered w-full text-sm sm:text-base min-h-[4rem] overflow-hidden" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        onInput={autoResize}
                        onFocus={autoResize}
                        placeholder="Aparecerá en el resumen de lecciones (si se deja en blanco al publicar, se generará de la introducción)..."
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold text-xs sm:text-sm">
                                Fecha (pubDate) <span className="text-error">*</span>
                            </span>
                        </label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full text-sm sm:text-base" 
                            value={date} 
                            onChange={e => setDate(e.target.value)} 
                            placeholder="Sep 18 2026" 
                        />
                    </div>
                    <div className="form-control flex flex-col justify-end pb-2">
                        <label className="cursor-pointer label justify-start gap-4">
                            <input 
                                type="checkbox" 
                                className="toggle toggle-warning toggle-sm sm:toggle-md" 
                                checked={isDraft} 
                                onChange={e => setIsDraft(e.target.checked)} 
                            />
                            <span className="label-text font-semibold text-xs sm:text-sm">
                                {isDraft ? (
                                    <span className="text-warning font-bold flex items-center gap-1.5">
                                        <FileEdit className="w-4 h-4" /> Guardar como Borrador
                                    </span>
                                ) : (
                                    <span className="text-success font-bold flex items-center gap-1.5">
                                        <Globe className="w-4 h-4" /> Marcar como Publicada
                                    </span>
                                )}
                                <span className="block text-[11px] text-base-content/60 font-normal mt-0.5">
                                    {isDraft ? 'No será visible para los alumnos' : 'Será visible en el listado de lecciones'}
                                </span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="divider text-xs uppercase tracking-widest text-base-content/40">Contenido</div>

            {/* Introducción */}
            <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-secondary" />
                    Introducción <span className="text-error">*</span>
                </h3>
                <div className="form-control">
                    <MarkdownToolbar textareaId="intro-textarea" value={intro} setValue={setIntro} />
                    <textarea 
                        id="intro-textarea" 
                        className="textarea textarea-bordered w-full min-h-[8rem] rounded-t-none text-sm sm:text-base overflow-hidden" 
                        value={intro} 
                        onChange={e => setIntro(e.target.value)} 
                        onInput={autoResize}
                        onFocus={autoResize}
                        placeholder="Puedes usar formato Markdown (**, *, >, etc.)"
                    />
                </div>
            </div>

            {/* Párrafos y Preguntas */}
            <div className="space-y-6 sm:space-y-8">
                {paragraphs.map((p, i) => (
                    <div key={i} className="p-3 sm:p-6 border border-base-300 rounded-2xl bg-base-100 shadow-sm relative">
                        <div className="absolute top-3 right-3 flex gap-2">
                            <div className="badge badge-primary text-[10px] sm:text-xs font-bold">Bloque {i + 1} / 3</div>
                            <button type="button" onClick={() => handleClearParagraph(i)} className="btn btn-xs btn-error btn-outline border-none btn-circle bg-error/10 hover:bg-error hover:text-white transition-colors" title="Limpiar bloque">
                                <Eraser className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 mt-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-xs sm:text-sm">
                                        Contenido del Párrafo {i + 1} <span className="text-error">*</span>
                                    </span>
                                </label>
                                <MarkdownToolbar 
                                    textareaId={`paragraph-textarea-${i}`} 
                                    value={p.text} 
                                    setValue={(val) => handleParagraphChange(i, 'text', val)} 
                                />
                                <textarea 
                                    id={`paragraph-textarea-${i}`} 
                                    className="textarea textarea-bordered w-full min-h-[6rem] rounded-t-none text-sm sm:text-base overflow-hidden" 
                                    value={p.text} 
                                    onChange={e => handleParagraphChange(i, 'text', e.target.value)} 
                                    onInput={autoResize}
                                    onFocus={autoResize}
                                    placeholder="Texto del párrafo en Markdown..."
                                />
                            </div>

                            <div className="bg-base-200/50 p-3 sm:p-4 rounded-xl border-l-4 border-accent">
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <HelpCircle className="w-4 h-4 text-accent" />
                                    Pregunta Interactiva <span className="text-error">*</span>
                                </h4>
                                <div className="space-y-3">
                                    <div className="form-control">
                                        <input 
                                            type="text" 
                                            className="input input-bordered w-full font-medium text-sm sm:text-base" 
                                            placeholder="Escribe la pregunta..." 
                                            value={p.question.text} 
                                            onChange={e => handleQuestionChange(i, 'text', e.target.value)} 
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label py-0.5">
                                            <span className="label-text text-success font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                                                Opción Correcta <span className="text-error">*</span>
                                            </span>
                                        </label>
                                        <input 
                                            type="text" 
                                            className="input input-bordered input-success w-full bg-success/5 text-sm sm:text-base" 
                                            placeholder="La respuesta correcta" 
                                            value={p.question.correctOption} 
                                            onChange={e => handleQuestionChange(i, 'correctOption', e.target.value)} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {p.question.incorrectOptions.map((opt, oIndex) => (
                                            <div key={oIndex} className="form-control">
                                                <label className="label py-0.5">
                                                    <span className="label-text text-error font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                                                        Opción Incorrecta {oIndex + 1} <span className="text-error">*</span>
                                                    </span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className="input input-bordered input-error w-full bg-error/5 text-sm sm:text-base" 
                                                    placeholder="Una respuesta incorrecta" 
                                                    value={opt} 
                                                    onChange={e => handleIncorrectOptionChange(i, oIndex, e.target.value)} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="divider text-xs uppercase tracking-widest text-base-content/40">Cierre</div>

            {/* Conclusión */}
            <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <Flag className="w-5 h-5 text-secondary" />
                    Conclusión <span className="text-error">*</span>
                </h3>
                <div className="form-control">
                    <MarkdownToolbar textareaId="conclusion-textarea" value={conclusion} setValue={setConclusion} />
                    <textarea 
                        id="conclusion-textarea" 
                        className="textarea textarea-bordered w-full min-h-[6rem] rounded-t-none text-sm sm:text-base overflow-hidden" 
                        value={conclusion} 
                        onChange={e => setConclusion(e.target.value)} 
                        onInput={autoResize}
                        onFocus={autoResize}
                        placeholder="Cierre y resumen de la lección..."
                    />
                </div>
            </div>

            {/* Barra de Acciones Sticky Inferior */}
            <div className="pt-4 sm:pt-6 border-t border-base-300 flex flex-col md:flex-row items-center justify-between gap-4 sticky bottom-2 sm:bottom-4 bg-base-100/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)] z-20 border border-base-200">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-base-content/70 font-medium w-full md:w-auto justify-center md:justify-start">
                    {/* Badge de estado en el footer */}
                    {isDraft ? (
                        <span className="badge badge-warning badge-sm sm:badge-md font-bold gap-1.5 py-2.5 px-3">
                            <FileEdit className="w-3.5 h-3.5" /> Modo Borrador
                        </span>
                    ) : (
                        <span className="badge badge-success text-white badge-sm sm:badge-md font-bold gap-1.5 py-2.5 px-3">
                            <Globe className="w-3.5 h-3.5" /> Modo Público
                        </span>
                    )}

                    {lastSavedTime ? (
                        <span className="flex items-center gap-1.5 text-success font-semibold text-xs">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                            💾 Respaldo local ({lastSavedTime})
                        </span>
                    ) : (
                        <span className="text-base-content/50 text-xs hidden sm:inline">
                            💡 Respaldo local activo
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
                    <a href="/admin/lessons" className="btn btn-ghost btn-sm sm:btn-md rounded-xl font-bold">
                        Cancelar
                    </a>

                    {/* Botón Guardar Borrador */}
                    <button 
                        type="button" 
                        onClick={handleSaveDraft}
                        disabled={isSubmitting} 
                        className="btn btn-outline btn-warning btn-sm sm:btn-md font-bold rounded-xl gap-2 shadow-sm hover:text-white"
                        title="Guardar borrador (no visible para alumnos)"
                    >
                        {isSubmitting && submittingAction === 'draft' ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>Guardar Borrador</span>
                    </button>

                    {/* Botón Publicar Lección */}
                    <button 
                        type="button" 
                        onClick={handlePublish}
                        disabled={isSubmitting} 
                        className="btn btn-primary btn-sm sm:btn-md font-bold shadow-lg rounded-xl gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                        title="Publicar lección para todos los alumnos"
                    >
                        {isSubmitting && submittingAction === 'publish' ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <Rocket className="w-4 h-4" />
                        )}
                        <span>{isAlreadyPublished ? 'Actualizar Lección' : 'Publicar Lección'}</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
