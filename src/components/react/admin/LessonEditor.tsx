import React, { useState, useEffect } from 'react';
import { 
    Bold, Italic, Highlighter, Quote, List, ListOrdered, 
    FileText, Eraser, HelpCircle, Flag, Save, 
    Rocket, Sparkles, AlertCircle, CheckCircle2, 
    ChevronRight, ChevronLeft 
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
        <div className="flex flex-wrap gap-1 mb-0 bg-base-200/80 p-1 rounded-t-xl border border-base-300 border-b-0 w-full">
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-slate-700 hover:bg-base-300"
                title="Negrita"
                onClick={() => insertMarkdown(textareaId, value, setValue, '**', '**')}
            >
                <Bold className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Negrita</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-slate-700 hover:bg-base-300"
                title="Cursiva"
                onClick={() => insertMarkdown(textareaId, value, setValue, '*', '*')}
            >
                <Italic className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Cursiva</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-slate-700 hover:bg-base-300"
                title="Resaltar Texto"
                onClick={() => insertMarkdown(textareaId, value, setValue, '<mark>', '</mark>')}
            >
                <Highlighter className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Resaltar</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-slate-700 hover:bg-base-300"
                title="Cita"
                onClick={() => insertMarkdown(textareaId, value, setValue, '> "', '"')}
            >
                <Quote className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Cita</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-slate-700 hover:bg-base-300"
                title="Lista"
                onClick={() => insertList(textareaId, value, setValue, false)}
            >
                <List className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Lista</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-slate-700 hover:bg-base-300"
                title="Numerada"
                onClick={() => insertList(textareaId, value, setValue, true)}
            >
                <ListOrdered className="w-3.5 h-3.5 text-primary" />
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
    // Stepper Wizard state: 1: General + Intro, 2: Bloques, 3: Cierre + Publicación
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    const [activeBlockIndex, setActiveBlockIndex] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    
    // Form state
    const [title, setTitle] = useState(initialData?.title || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [author, setAuthor] = useState(initialData?.author || '');
    const [date, setDate] = useState(initialData?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    
    // Single draft status state
    const [isDraft, setIsDraft] = useState<boolean>(() => {
        if (initialData?.id) {
            return initialData.draft ?? false;
        }
        return false; // Por defecto publicada para nuevas lecciones
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
                const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        if (!title.trim()) errors.push('Título de la lección (Paso 1)');
        if (!author.trim()) errors.push('Autor (Paso 1)');
        if (!date.trim()) errors.push('Fecha (Paso 1)');
        if (!intro.trim()) errors.push('Introducción (Paso 1)');
        
        paragraphs.forEach((p, i) => {
            const num = i + 1;
            if (!p.text.trim()) errors.push(`Bloque ${num}: Falta el contenido (Paso 2)`);
            if (!p.question.text.trim()) errors.push(`Bloque ${num}: Falta la pregunta interactiva (Paso 2)`);
            if (!p.question.correctOption.trim()) errors.push(`Bloque ${num}: Falta la opción correcta (Paso 2)`);
            if (p.question.incorrectOptions.some(opt => !opt.trim())) {
                errors.push(`Bloque ${num}: Faltan opciones incorrectas (Paso 2)`);
            }
        });

        if (!conclusion.trim()) errors.push('Conclusión (Paso 3)');
        return errors;
    };

    const saveLesson = async (saveAsDraft: boolean, overrideDescription?: string) => {
        setIsSubmitting(true);

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
                    ? '📝 ¡Borrador guardado exitosamente!\n\nNo será visible para los alumnos hasta que decidas publicarlo.' 
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
        }
    };

    const handleSubmitAction = async () => {
        if (isDraft) {
            // Guardar como borrador
            if (!title.trim()) {
                alert('⚠️ Por favor escribe al menos el título de la lección para identificar el borrador.');
                setCurrentStep(1);
                return;
            }
            const confirmMsg = '📝 ¿Deseas guardar esta lección como BORRADOR?\n\nNo será visible para los alumnos hasta que decidas publicarla.';
            if (!window.confirm(confirmMsg)) return;

            let finalDesc = description.trim();
            if (!finalDesc && intro.trim()) {
                finalDesc = generateDescriptionFromIntro(intro);
            }
            await saveLesson(true, finalDesc);
        } else {
            // Publicar
            const errors = validateForPublish();
            if (errors.length > 0) {
                setValidationErrors(errors);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            setValidationErrors([]);

            let finalDesc = description.trim();
            if (!finalDesc) {
                finalDesc = generateDescriptionFromIntro(intro) || title.trim();
                setDescription(finalDesc);
            }

            const confirmMsg = isAlreadyPublished
                ? '🚀 ¿Deseas actualizar la lección PUBLICADA?\n\nLos cambios estarán visibles para los alumnos en 2 a 5 minutos.'
                : '🚀 ¿Deseas PUBLICAR esta lección?\n\nEstará visible para todos los alumnos en el sitio (2 a 5 minutos de compilación).';

            if (!window.confirm(confirmMsg)) return;

            await saveLesson(false, finalDesc);
        }
    };

    // Auto-resize initial layout
    useEffect(() => {
        document.querySelectorAll('textarea').forEach((textarea) => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        });
    }, [paragraphs, intro, conclusion, currentStep, activeBlockIndex]);

    return (
        <div className="space-y-4 bg-base-100 p-4 sm:p-6 pb-28 rounded-2xl sm:rounded-3xl shadow-sm border border-base-200">
            
            {/* 1. Stepper Visual en 3 Pasos */}
            <div className="flex items-center justify-between p-1.5 bg-base-200/60 rounded-2xl border border-base-200 gap-1 select-none">
                <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className={`flex items-center justify-center gap-1.5 flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        currentStep === 1
                            ? 'bg-white text-primary shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        currentStep === 1 ? 'bg-primary text-white' : 'bg-slate-300 text-slate-700'
                    }`}>1</span>
                    <span className="truncate">General</span>
                </button>

                <span className="text-slate-300 text-xs">─</span>

                <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className={`flex items-center justify-center gap-1.5 flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        currentStep === 2
                            ? 'bg-white text-primary shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        currentStep === 2 ? 'bg-primary text-white' : 'bg-slate-300 text-slate-700'
                    }`}>2</span>
                    <span className="truncate">Bloques</span>
                </button>

                <span className="text-slate-300 text-xs">─</span>

                <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className={`flex items-center justify-center gap-1.5 flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        currentStep === 3
                            ? 'bg-white text-primary shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        currentStep === 3 ? 'bg-primary text-white' : 'bg-slate-300 text-slate-700'
                    }`}>3</span>
                    <span className="truncate">Cierre</span>
                </button>
            </div>

            {/* Banner de Errores de Validación al Publicar */}
            {validationErrors.length > 0 && (
                <div className="alert alert-warning shadow-sm rounded-2xl p-4 border border-warning/40 animate-fade-down">
                    <div className="flex items-start gap-2.5 w-full">
                        <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                        <div className="flex-1 text-xs sm:text-sm">
                            <h4 className="font-bold text-slate-900">
                                Falta completar campos para publicar:
                            </h4>
                            <ul className="list-disc list-inside mt-1.5 font-medium space-y-0.5 text-error">
                                {validationErrors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Banner de Respaldo Encontrado */}
            {hasBackup && (
                <div className="alert bg-primary/5 border border-primary/20 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                        <span>💡</span>
                        <span className="truncate">Borrador local detectado{lastSavedTime ? ` (${lastSavedTime})` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={handleDiscardBackup} className="btn btn-ghost btn-xs text-error font-bold">
                            Descartar
                        </button>
                        <button type="button" onClick={handleRestoreBackup} className="btn btn-primary btn-xs font-bold rounded-lg">
                            Restaurar
                        </button>
                    </div>
                </div>
            )}

            {/* ──────── PASO 1: INFORMACIÓN GENERAL + INTRODUCCIÓN ──────── */}
            {currentStep === 1 && (
                <div className="space-y-4 animate-fade">
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-bold text-xs sm:text-sm text-slate-700">
                                Título de la Lección <span className="text-error">*</span>
                            </span>
                        </label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full text-sm rounded-xl" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="Ej: El significado del Perdón" 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-bold text-xs sm:text-sm text-slate-700">
                                    Autor <span className="text-error">*</span>
                                </span>
                            </label>
                            <input 
                                type="text" 
                                className="input input-bordered w-full text-sm rounded-xl" 
                                value={author} 
                                onChange={e => setAuthor(e.target.value)} 
                            />
                        </div>
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-bold text-xs sm:text-sm text-slate-700">
                                    Fecha (pubDate) <span className="text-error">*</span>
                                </span>
                            </label>
                            <input 
                                type="text" 
                                className="input input-bordered w-full text-sm rounded-xl" 
                                value={date} 
                                onChange={e => setDate(e.target.value)} 
                                placeholder="Sep 18 2026" 
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <div className="flex items-center justify-between py-1">
                            <label className="label py-0">
                                <span className="label-text font-bold text-xs sm:text-sm text-slate-700">
                                    Descripción corta
                                </span>
                            </label>
                            {intro.trim() && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const gen = generateDescriptionFromIntro(intro);
                                        if (gen) setDescription(gen);
                                    }}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 py-0.5"
                                    title="Generar resumen desde la introducción"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>✨ Autogenerar</span>
                                </button>
                            )}
                        </div>
                        <textarea 
                            className="textarea textarea-bordered w-full text-sm min-h-[4rem] rounded-xl overflow-hidden" 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            onInput={autoResize}
                            onFocus={autoResize}
                            placeholder="Resumen para el catálogo (opcional, se autogenera si se deja vacío)..."
                        />
                    </div>

                    {/* Introducción */}
                    <div className="space-y-2 pt-2 border-t border-base-200">
                        <label className="label py-0">
                            <span className="label-text font-bold text-xs sm:text-sm text-slate-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-primary" />
                                Introducción de la Lección <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="form-control">
                            <MarkdownToolbar textareaId="intro-textarea" value={intro} setValue={setIntro} />
                            <textarea 
                                id="intro-textarea" 
                                className="textarea textarea-bordered w-full min-h-[7rem] rounded-t-none rounded-b-xl text-sm overflow-hidden" 
                                value={intro} 
                                onChange={e => setIntro(e.target.value)} 
                                onInput={autoResize}
                                onFocus={autoResize}
                                placeholder="Escribe la introducción en Markdown..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ──────── PASO 2: BLOQUES DE APRENDIZAJE ──────── */}
            {currentStep === 2 && (
                <div className="space-y-4 animate-fade">
                    {/* Selector de Pestañas de Bloque */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-base-200">
                        {paragraphs.map((p, idx) => {
                            const isActive = activeBlockIndex === idx;
                            const isFilled = !!(p.text.trim() && p.question.text.trim() && p.question.correctOption.trim());
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveBlockIndex(idx)}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all shrink-0 select-none ${
                                        isActive
                                            ? 'bg-primary text-white border-primary shadow-xs'
                                            : isFilled
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-base-200/80 text-slate-600 border-base-300 hover:bg-base-300'
                                    }`}
                                >
                                    <span>Bloque {idx + 1}</span>
                                    {isFilled && <span className="text-[11px]">✓</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bloque Activo */}
                    {(() => {
                        const i = activeBlockIndex;
                        const p = paragraphs[i];
                        return (
                            <div className="space-y-4 pt-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Contenido del Bloque {i + 1} de 3 <span className="text-error">*</span>
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleClearParagraph(i)} 
                                        className="btn btn-ghost btn-xs text-error font-medium gap-1"
                                        title="Limpiar este bloque"
                                    >
                                        <Eraser className="w-3.5 h-3.5" />
                                        <span>Limpiar bloque</span>
                                    </button>
                                </div>

                                <div className="form-control">
                                    <MarkdownToolbar 
                                        textareaId={`paragraph-textarea-${i}`} 
                                        value={p.text} 
                                        setValue={(val) => handleParagraphChange(i, 'text', val)} 
                                    />
                                    <textarea 
                                        id={`paragraph-textarea-${i}`} 
                                        className="textarea textarea-bordered w-full min-h-[6rem] rounded-t-none rounded-b-xl text-sm overflow-hidden" 
                                        value={p.text} 
                                        onChange={e => handleParagraphChange(i, 'text', e.target.value)} 
                                        onInput={autoResize}
                                        onFocus={autoResize}
                                        placeholder="Escribe el contenido del párrafo en Markdown..."
                                    />
                                </div>

                                {/* Pregunta Interactiva Asociada al Bloque */}
                                <div className="p-3.5 sm:p-4 rounded-2xl bg-base-200/60 border border-base-300/80 space-y-3">
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                                        <HelpCircle className="w-4 h-4 text-primary" />
                                        Pregunta Interactiva del Bloque {i + 1} <span className="text-error">*</span>
                                    </h4>

                                    <div className="form-control">
                                        <input 
                                            type="text" 
                                            className="input input-bordered w-full text-sm rounded-xl bg-white" 
                                            placeholder="Escribe la pregunta interactiva..." 
                                            value={p.question.text} 
                                            onChange={e => handleQuestionChange(i, 'text', e.target.value)} 
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label py-0.5">
                                            <span className="label-text text-emerald-700 font-bold text-[11px] uppercase tracking-wider">
                                                ✓ Opción Correcta <span className="text-error">*</span>
                                            </span>
                                        </label>
                                        <input 
                                            type="text" 
                                            className="input input-bordered input-success w-full bg-emerald-50/60 text-sm rounded-xl" 
                                            placeholder="Respuesta correcta" 
                                            value={p.question.correctOption} 
                                            onChange={e => handleQuestionChange(i, 'correctOption', e.target.value)} 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {p.question.incorrectOptions.map((opt, oIndex) => (
                                            <div key={oIndex} className="form-control">
                                                <label className="label py-0.5">
                                                    <span className="label-text text-rose-700 font-bold text-[11px] uppercase tracking-wider">
                                                        ✕ Opción Incorrecta {oIndex + 1} <span className="text-error">*</span>
                                                    </span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className="input input-bordered input-error w-full bg-rose-50/50 text-sm rounded-xl" 
                                                    placeholder={`Respuesta incorrecta ${oIndex + 1}`} 
                                                    value={opt} 
                                                    onChange={e => handleIncorrectOptionChange(i, oIndex, e.target.value)} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Botones de Navegación Rápida entre Bloques */}
                                <div className="flex items-center justify-between pt-1">
                                    {activeBlockIndex > 0 ? (
                                        <button
                                            type="button"
                                            onClick={() => setActiveBlockIndex(activeBlockIndex - 1)}
                                            className="btn btn-ghost btn-xs text-slate-600 font-bold gap-1"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                            <span>Bloque {activeBlockIndex}</span>
                                        </button>
                                    ) : <div />}

                                    {activeBlockIndex < 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveBlockIndex(activeBlockIndex + 1)}
                                            className="btn btn-ghost btn-xs text-primary font-bold gap-1 ml-auto"
                                        >
                                            <span>Bloque {activeBlockIndex + 2}</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* ──────── PASO 3: CIERRE Y PUBLICACIÓN ──────── */}
            {currentStep === 3 && (
                <div className="space-y-4 animate-fade">
                    {/* Conclusión */}
                    <div className="space-y-2">
                        <label className="label py-0">
                            <span className="label-text font-bold text-xs sm:text-sm text-slate-700 flex items-center gap-1.5">
                                <Flag className="w-4 h-4 text-primary" />
                                Conclusión de la Lección <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="form-control">
                            <MarkdownToolbar textareaId="conclusion-textarea" value={conclusion} setValue={setConclusion} />
                            <textarea 
                                id="conclusion-textarea" 
                                className="textarea textarea-bordered w-full min-h-[7rem] rounded-t-none rounded-b-xl text-sm overflow-hidden" 
                                value={conclusion} 
                                onChange={e => setConclusion(e.target.value)} 
                                onInput={autoResize}
                                onFocus={autoResize}
                                placeholder="Escribe la conclusión y cierre en Markdown..."
                            />
                        </div>
                    </div>

                    {/* Selector Único de Estado (Sin redundancias) */}
                    <div className="p-4 bg-base-100 rounded-2xl border border-base-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h4 className="font-bold text-sm sm:text-base text-slate-800">
                                Estado al Guardar
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {isDraft 
                                    ? '🟡 Borrador: Oculto para alumnos (ideal si aún falta revisar)' 
                                    : '🟢 Publicada: Visible para todos los alumnos del curso'}
                            </p>
                        </div>
                        <div className="join bg-base-200/80 p-1 rounded-xl border border-base-300 shrink-0 self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setIsDraft(true)}
                                className={`join-item btn btn-sm rounded-lg font-bold border-none transition-all ${
                                    isDraft ? 'bg-warning text-white shadow-xs' : 'btn-ghost text-slate-600'
                                }`}
                            >
                                Borrador
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDraft(false)}
                                className={`join-item btn btn-sm rounded-lg font-bold border-none transition-all ${
                                    !isDraft ? 'bg-success text-white shadow-xs' : 'btn-ghost text-slate-600'
                                }`}
                            >
                                Publicada
                            </button>
                        </div>
                    </div>

                    {/* Resumen Rápido Previo */}
                    <div className="p-3.5 bg-base-200/40 rounded-2xl border border-base-200 text-xs space-y-1 text-slate-600">
                        <div className="font-bold text-slate-800 text-xs sm:text-sm mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Resumen de la Lección
                        </div>
                        <div><strong>Título:</strong> {title || '(Sin título)'}</div>
                        <div><strong>Autor:</strong> {author || '(Sin autor)'}</div>
                        <div><strong>Bloques completados:</strong> {paragraphs.filter(p => p.text.trim() && p.question.text.trim()).length} de 3</div>
                        <div><strong>Estado final:</strong> {isDraft ? '🟡 Guardar como Borrador' : '🟢 Publicar en el sitio'}</div>
                    </div>
                </div>
            )}

            {/* ──────── BARRA INFERIOR FIJA PLANA (< 60px) ──────── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-base-100/95 backdrop-blur-md border-t border-base-200 px-4 py-2.5 sm:py-3 shadow-lg flex items-center justify-between h-14 sm:h-16">
                <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-3">
                    {/* Izquierda: Respaldo discreto */}
                    <div className="text-xs text-slate-500 font-medium truncate flex items-center gap-1.5">
                        {lastSavedTime ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold truncate">
                                <span>💾</span>
                                <span className="hidden sm:inline">Guardado local</span>
                                <span>{lastSavedTime}</span>
                            </span>
                        ) : (
                            <span className="truncate hidden sm:inline">💡 Respaldo activo</span>
                        )}
                    </div>

                    {/* Derecha: Botones de navegación contextuales */}
                    <div className="flex items-center gap-2 shrink-0">
                        {currentStep === 1 && (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className="btn btn-primary btn-sm sm:btn-md rounded-xl font-bold gap-1 px-4 sm:px-6 shadow-sm"
                            >
                                <span>Siguiente: Bloques</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}

                        {currentStep === 2 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="btn btn-ghost btn-sm sm:btn-md rounded-xl font-bold text-slate-600"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>General</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(3)}
                                    className="btn btn-primary btn-sm sm:btn-md rounded-xl font-bold gap-1 px-4 sm:px-6 shadow-sm"
                                >
                                    <span>Siguiente: Cierre</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    className="btn btn-ghost btn-sm sm:btn-md rounded-xl font-bold text-slate-600"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Bloques</span>
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={handleSubmitAction}
                                    className={`btn btn-sm sm:btn-md rounded-xl font-bold gap-1.5 px-5 sm:px-7 shadow-md ${
                                        isDraft ? 'btn-warning text-white' : 'btn-primary'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : isDraft ? (
                                        <Save className="w-4 h-4" />
                                    ) : (
                                        <Rocket className="w-4 h-4" />
                                    )}
                                    <span>
                                        {isDraft 
                                            ? 'Guardar Borrador' 
                                            : (isAlreadyPublished ? 'Actualizar Lección' : 'Publicar Lección')}
                                    </span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
