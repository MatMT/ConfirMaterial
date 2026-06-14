import React, { useState } from 'react';
import { Icon } from '@iconify/react';

interface ParagraphBlock {
    text: string;
    question: {
        text: string;
        correctOption: string;
        incorrectOptions: string[];
    };
}

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
    
    const [paragraphs, setParagraphs] = useState<ParagraphBlock[]>(initialData?.blocks?.paragraphs || [
        { text: '', question: { text: '', correctOption: '', incorrectOptions: ['', ''] } }
    ]);

    const handleAddParagraph = () => {
        setParagraphs([...paragraphs, { text: '', question: { text: '', correctOption: '', incorrectOptions: ['', ''] } }]);
    };

    const handleRemoveParagraph = (index: number) => {
        setParagraphs(paragraphs.filter((_, i) => i !== index));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                draft: isDraft,
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

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-base-100 p-6 rounded-box shadow-md max-w-4xl mx-auto border border-base-200 animate-fade-up">
            
            {/* Cabecera / Metadatos */}
            <div className="space-y-4 bg-base-200/50 p-6 rounded-box">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Icon icon="mdi:information-outline" className="w-6 h-6 text-primary" />
                    Información General
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Título de la Lección</span></label>
                        <input type="text" className="input input-bordered w-full" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ej: El significado del Perdón" />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Slug de URL</span>
                            <span className="label-text-alt text-base-content/50">Opcional</span>
                        </label>
                        <input type="text" className="input input-bordered w-full font-mono text-sm" value={slug} onChange={e => setSlug(e.target.value)} placeholder="04, mi-leccion (vacío usa el ID)" />
                    </div>
                </div>
                
                <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Descripción corta</span></label>
                    <textarea className="textarea textarea-bordered w-full" rows={2} value={description} onChange={e => setDescription(e.target.value)} required placeholder="Aparecerá en el resumen..."></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Autor</span></label>
                        <input type="text" className="input input-bordered w-full" value={author} onChange={e => setAuthor(e.target.value)} required />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Fecha (pubDate)</span></label>
                        <input type="text" className="input input-bordered w-full" value={date} onChange={e => setDate(e.target.value)} required placeholder="Jun 14 2026" />
                    </div>
                    <div className="form-control flex flex-col justify-end pb-2">
                        <label className="cursor-pointer label justify-start gap-4">
                            <input type="checkbox" className="toggle toggle-warning" checked={isDraft} onChange={e => setIsDraft(e.target.checked)} />
                            <span className="label-text font-semibold">Es un borrador (Oculto)</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="divider">Contenido</div>

            {/* Introducción */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Icon icon="mdi:format-text" className="w-5 h-5 text-secondary" />
                    Introducción
                </h3>
                <textarea className="textarea textarea-bordered w-full h-32" value={intro} onChange={e => setIntro(e.target.value)} required placeholder="Puedes usar formato Markdown (**, *, >, etc.)"></textarea>
            </div>

            {/* Párrafos y Preguntas */}
            <div className="space-y-8">
                {paragraphs.map((p, i) => (
                    <div key={i} className="p-6 border border-base-300 rounded-box bg-base-100 shadow-sm relative">
                        <div className="absolute top-4 right-4 flex gap-2">
                            <div className="badge badge-primary">Bloque {i + 1}</div>
                            {paragraphs.length > 1 && (
                                <button type="button" onClick={() => handleRemoveParagraph(i)} className="btn btn-xs btn-error btn-circle" title="Eliminar bloque">
                                    <Icon icon="mdi:close" className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-6 mt-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Contenido del Párrafo</span></label>
                                <textarea className="textarea textarea-bordered w-full h-24" value={p.text} onChange={e => handleParagraphChange(i, 'text', e.target.value)} required placeholder="Texto del párrafo en Markdown..."></textarea>
                            </div>

                            <div className="bg-base-200/50 p-4 rounded-lg border-l-4 border-accent">
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:help-circle" className="w-5 h-5 text-accent" />
                                    Pregunta Interactiva
                                </h4>
                                <div className="space-y-4">
                                    <div className="form-control">
                                        <input type="text" className="input input-bordered w-full font-medium" placeholder="Escribe la pregunta..." value={p.question.text} onChange={e => handleQuestionChange(i, 'text', e.target.value)} required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label py-1"><span className="label-text text-success font-bold text-xs uppercase tracking-wider">Opción Correcta</span></label>
                                        <input type="text" className="input input-bordered input-success w-full bg-success/5" placeholder="La respuesta correcta" value={p.question.correctOption} onChange={e => handleQuestionChange(i, 'correctOption', e.target.value)} required />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {p.question.incorrectOptions.map((opt, oIndex) => (
                                            <div key={oIndex} className="form-control">
                                                <label className="label py-1"><span className="label-text text-error font-bold text-xs uppercase tracking-wider">Opción Incorrecta {oIndex + 1}</span></label>
                                                <input type="text" className="input input-bordered input-error w-full bg-error/5" placeholder="Una respuesta falsa" value={opt} onChange={e => handleIncorrectOptionChange(i, oIndex, e.target.value)} required />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                <button type="button" onClick={handleAddParagraph} className="btn btn-outline btn-secondary w-full border-dashed">
                    <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
                    Añadir otro bloque de Párrafo + Pregunta
                </button>
            </div>

            <div className="divider">Cierre</div>

            {/* Conclusión */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Icon icon="mdi:flag-checkered" className="w-5 h-5 text-secondary" />
                    Conclusión
                </h3>
                <textarea className="textarea textarea-bordered w-full h-24" value={conclusion} onChange={e => setConclusion(e.target.value)} required placeholder="Cierre y resumen de la lección..."></textarea>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-base-300 flex justify-end gap-4 sticky bottom-4 bg-base-100/90 backdrop-blur p-4 rounded-box shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-10">
                <a href="/admin/lessons" className="btn btn-ghost">Cancelar</a>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary px-8">
                    {isSubmitting ? (
                        <span className="loading loading-spinner"></span>
                    ) : (
                        <Icon icon="mdi:content-save" className="w-5 h-5 mr-2" />
                    )}
                    Guardar Lección
                </button>
            </div>
        </form>
    );
}
