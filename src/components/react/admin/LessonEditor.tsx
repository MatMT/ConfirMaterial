import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

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
        // Trigger auto resize manually after programmatic value change
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
                <Icon icon="mdi:format-bold" className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Negrita</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Cursiva"
                onClick={() => insertMarkdown(textareaId, value, setValue, '*', '*')}
            >
                <Icon icon="mdi:format-italic" className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Cursiva</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Resaltar Texto"
                onClick={() => insertMarkdown(textareaId, value, setValue, '<mark>', '</mark>')}
            >
                <Icon icon="mdi:marker" className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Resaltar</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Cita / Destacado"
                onClick={() => insertMarkdown(textareaId, value, setValue, '> "', '"')}
            >
                <Icon icon="mdi:format-quote-close" className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Cita</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Lista de Viñetas"
                onClick={() => insertList(textareaId, value, setValue, false)}
            >
                <Icon icon="mdi:format-list-bulleted" className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Lista</span>
            </button>
            <button
                type="button"
                className="btn btn-xs btn-ghost gap-1 font-bold normal-case text-base-content/85 hover:bg-base-300"
                title="Lista Numerada"
                onClick={() => insertList(textareaId, value, setValue, true)}
            >
                <Icon icon="mdi:format-list-numbered" className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Numerada</span>
            </button>
        </div>
    );
};

export default function LessonEditor({ initialData = null }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [title, setTitle] = useState(initialData?.title || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [author, setAuthor] = useState(initialData?.author || '');
    const [date, setDate] = useState(initialData?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    const [isDraft, setIsDraft] = useState(initialData?.draft ?? false);
    
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

    const hasEmptyFields = !title.trim() || !description.trim() || !author.trim() || !date.trim() || !intro.trim() || !conclusion.trim() || paragraphs.some(p => !p.text.trim() || !p.question.text.trim() || !p.question.correctOption.trim() || p.question.incorrectOptions.some(opt => !opt.trim()));

    useEffect(() => {
        if (hasEmptyFields) {
            setIsDraft(true);
        } else if (!initialData?.id) {
            setIsDraft(false);
        }
    }, [hasEmptyFields]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const confirmMessage = "Los cambios tardarán entre 2 a 5 minutos en reflejarse debido a la actualización del sitio. ¿Estás seguro de que deseas guardar o agregar?";
        if (!window.confirm(confirmMessage)) {
            return;
        }

        let finalDraftStatus = isDraft;
        if (hasEmptyFields) {
            finalDraftStatus = true;
            setIsDraft(true);
            alert('Algunos campos están vacíos. La lección se guardará automáticamente como BORRADOR.');
        }

        setIsSubmitting(true);
        
        try {
            const id = initialData?.id || generateId();
            const finalSlug = slug.trim() || id;
            
            const payload = {
                id,
                slug: finalSlug,
                title,
                description,
                author,
                date,
                draft: finalDraftStatus,
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
                alert('¡Lección guardada exitosamente!');
                window.location.href = '/admin/lessons';
            } else {
                alert(`Error al guardar: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('Error de red al guardar la lección.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-resize initial layout execution if needed
    useEffect(() => {
        document.querySelectorAll('textarea').forEach((textarea) => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        });
    }, [paragraphs, intro, conclusion]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 bg-base-100 p-2 sm:p-6 pb-24 sm:pb-32 rounded-box sm:shadow-md max-w-4xl mx-auto border-0 sm:border border-base-200 animate-fade-up">
            
            {/* Cabecera / Metadatos */}
            <div className="space-y-4 bg-base-200/50 p-4 sm:p-6 rounded-box">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <Icon icon="mdi:information-outline" className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    Información General
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-xs sm:text-sm">Título de la Lección</span></label>
                        <input type="text" className="input input-bordered w-full text-sm sm:text-base" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: El significado del Perdón" />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-xs sm:text-sm">Autor</span></label>
                        <input type="text" className="input input-bordered w-full text-sm sm:text-base" value={author} onChange={e => setAuthor(e.target.value)} />
                    </div>
                </div>
                
                <div className="form-control">
                    <label className="label"><span className="label-text font-semibold text-xs sm:text-sm">Descripción corta</span></label>
                    <textarea 
                        className="textarea textarea-bordered w-full text-sm sm:text-base min-h-[4rem] overflow-hidden" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        onInput={autoResize}
                        onFocus={autoResize}
                        placeholder="Aparecerá en el resumen..."
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-xs sm:text-sm">Fecha (pubDate)</span></label>
                        <input type="text" className="input input-bordered w-full text-sm sm:text-base" value={date} onChange={e => setDate(e.target.value)} placeholder="Jun 14 2026" />
                    </div>
                    <div className="form-control flex flex-col justify-end pb-2">
                        <label className={`cursor-pointer label justify-start gap-4 ${hasEmptyFields ? 'opacity-60' : ''}`}>
                            <input type="checkbox" className="toggle toggle-warning toggle-sm sm:toggle-md" checked={isDraft} onChange={e => setIsDraft(e.target.checked)} disabled={hasEmptyFields} />
                            <span className="label-text font-semibold text-xs sm:text-sm">
                                Es borrador
                                {hasEmptyFields && <span className="block text-[10px] text-warning font-normal mt-0.5">Faltan datos por llenar</span>}
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="divider text-xs uppercase tracking-widest text-base-content/40">Contenido</div>

            {/* Introducción */}
            <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <Icon icon="mdi:format-text" className="w-5 h-5 text-secondary" />
                    Introducción
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
                    <div key={i} className="p-3 sm:p-6 border border-base-300 rounded-box bg-base-100 shadow-sm relative">
                        <div className="absolute top-3 right-3 flex gap-2">
                            <div className="badge badge-primary text-[10px] sm:text-xs">Bloque {i + 1} / 3</div>
                            <button type="button" onClick={() => handleClearParagraph(i)} className="btn btn-xs btn-error btn-outline border-none btn-circle bg-error/10 hover:bg-error hover:text-white transition-colors" title="Limpiar bloque">
                                <Icon icon="mdi:eraser" className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 mt-6">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold text-xs sm:text-sm">Contenido del Párrafo</span></label>
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

                            <div className="bg-base-200/50 p-3 sm:p-4 rounded-lg border-l-4 border-accent">
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <Icon icon="mdi:help-circle" className="w-4.5 h-4.5 text-accent" />
                                    Pregunta Interactiva
                                </h4>
                                <div className="space-y-3">
                                    <div className="form-control">
                                        <input type="text" className="input input-bordered w-full font-medium text-sm sm:text-base" placeholder="Escribe la pregunta..." value={p.question.text} onChange={e => handleQuestionChange(i, 'text', e.target.value)} />
                                    </div>
                                    <div className="form-control">
                                        <label className="label py-0.5"><span className="label-text text-success font-bold text-[10px] sm:text-xs uppercase tracking-wider">Opción Correcta</span></label>
                                        <input type="text" className="input input-bordered input-success w-full bg-success/5 text-sm sm:text-base" placeholder="La respuesta correcta" value={p.question.correctOption} onChange={e => handleQuestionChange(i, 'correctOption', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {p.question.incorrectOptions.map((opt, oIndex) => (
                                            <div key={oIndex} className="form-control">
                                                <label className="label py-0.5"><span className="label-text text-error font-bold text-[10px] sm:text-xs uppercase tracking-wider">Opción Incorrecta {oIndex + 1}</span></label>
                                                <input type="text" className="input input-bordered input-error w-full bg-error/5 text-sm sm:text-base" placeholder="Una respuesta falsa" value={opt} onChange={e => handleIncorrectOptionChange(i, oIndex, e.target.value)} />
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
                    <Icon icon="mdi:flag-checkered" className="w-5 h-5 text-secondary" />
                    Conclusión
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

            {/* Submit */}
            <div className="pt-4 sm:pt-6 border-t border-base-300 flex justify-end gap-3 sticky bottom-2 sm:bottom-4 bg-base-100/90 backdrop-blur p-3 rounded-box shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-10">
                <a href="/admin/lessons" className="btn btn-ghost btn-sm sm:btn-md">Cancelar</a>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary px-6 sm:px-8 btn-sm sm:btn-md">
                    {isSubmitting ? (
                        <span className="loading loading-spinner"></span>
                    ) : (
                        <Icon icon="mdi:content-save" className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    )}
                    Guardar Lección
                </button>
            </div>
        </form>
    );
}
