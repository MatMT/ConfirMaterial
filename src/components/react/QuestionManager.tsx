import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Icon } from '@iconify/react';

export default function QuestionManager() {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isSessionLoaded, setIsSessionLoaded] = useState(false);

    // Edit state
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [editText, setEditText] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setIsSessionLoaded(true);
            return;
        }
        setUserId(session.user.id);
        setIsSessionLoaded(true);

        const { data, error } = await supabase
            .from('student_questions')
            .select('*')
            .eq('user_id', session.user.id);

        if (!error && data) {
            setQuestions(data);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim() || !userId) return;

        setIsSubmitting(true);
        setAlert(null);

        try {
            const { error } = await supabase.from('student_questions').insert({
                user_id: userId,
                question: newQuestion.trim(),
                status: 'pending'
            });

            if (error) throw error;

            setAlert({ type: 'success', message: '¡Pregunta enviada correctamente! La revisaremos en clase.' });
            setNewQuestion('');
            fetchQuestions(); // Refresh list
        } catch (err) {
            console.error("Supabase Error:", err);
            setAlert({ type: 'error', message: 'No pudimos enviar tu pregunta en este momento. Por favor, intenta de nuevo más tarde.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setAlert(null), 5000);
        }
    };

    const openEditModal = (q) => {
        setEditingQuestionId(q.id);
        setEditText(q.question);
    };

    const closeEditModal = () => {
        setEditingQuestionId(null);
        setEditText('');
    };

    const handleSaveEdit = async () => {
        if (!editText.trim() || !editingQuestionId) return;

        setIsSavingEdit(true);
        try {
            const { error } = await supabase
                .from('student_questions')
                .update({ question: editText.trim() })
                .eq('id', editingQuestionId);

            if (error) throw error;
            
            fetchQuestions();
            closeEditModal();
        } catch (err) {
            console.error("Error updating question", err);
        } finally {
            setIsSavingEdit(false);
        }
    };

    const sortedQuestions = [...questions].sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return (
        <div className="card bg-base-100 shadow-xl border border-base-200 lg:col-span-3 hover:shadow-2xl transition-all duration-300 animate-fade-up">
            <div className="card-body p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Icon icon="mdi:message-question-outline" className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="card-title text-2xl">¿Tienes alguna pregunta para la clase?</h2>
                            <p className="text-sm text-base-content/60 mt-1">Déjanos tu duda y la resolveremos en nuestra próxima sesión en vivo.</p>
                        </div>
                    </div>
                    
                    {/* Botón para abrir modal si hay preguntas */}
                    {questions.length > 0 && (
                        <button 
                            onClick={() => document.getElementById('questions_modal').showModal()} 
                            className="btn btn-outline btn-sm md:btn-md shrink-0 border-base-300 shadow-sm"
                        >
                            <Icon icon="mdi:format-list-bulleted" className="w-5 h-5 mr-1" />
                            Mis Preguntas ({questions.length})
                        </button>
                    )}
                </div>

                {/* Formulario de nueva pregunta */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <textarea 
                        className="textarea textarea-bordered textarea-lg w-full bg-base-200/50 focus:bg-base-100 transition-colors shadow-inner" 
                        placeholder={isSessionLoaded && !userId ? "Debes iniciar sesión para enviar preguntas" : "Escribe tu pregunta aquí..."}
                        rows={4}
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        required
                        disabled={!userId}
                    ></textarea>
                    
                    <div className="flex justify-between items-center mt-2">
                        <div>
                            {isSessionLoaded && !userId && (
                                <span className="text-sm text-error font-medium">Inicia sesión para poder enviar tus preguntas.</span>
                            )}
                        </div>
                        <button type="submit" disabled={isSubmitting || !userId} className="btn btn-primary px-8 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                            {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : <Icon icon="mdi:send" className="w-5 h-5 mr-2" />}
                            Enviar Pregunta
                        </button>
                    </div>
                    
                    {alert && (
                        <div className={`alert ${alert.type === 'success' ? 'alert-success text-white' : 'alert-error text-white'} mt-2 animate-fade-up border-none shadow-md`}>
                            <Icon icon={alert.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'} className="w-6 h-6 shrink-0" />
                            <span className="font-medium text-sm">{alert.message}</span>
                        </div>
                    )}
                </form>
            </div>

            {/* Modal Principal: Lista de Preguntas */}
            <dialog id="questions_modal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
                <div className="modal-box w-full max-w-2xl bg-base-100 p-0 overflow-hidden">
                    <div className="p-6 border-b border-base-200 bg-base-100/95 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <Icon icon="mdi:format-list-bulleted" className="w-6 h-6 text-primary" />
                            Historial de Preguntas
                        </h3>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} 
                                className="btn btn-sm btn-ghost bg-base-200"
                            >
                                <Icon icon={sortOrder === 'desc' ? 'mdi:sort-clock-descending-outline' : 'mdi:sort-clock-ascending-outline'} className="w-4 h-4" />
                                {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguas'}
                            </button>
                            <form method="dialog">
                                <button className="btn btn-sm btn-circle btn-ghost bg-base-200" onClick={closeEditModal}>✕</button>
                            </form>
                        </div>
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4 bg-base-50 scrollbar-thin scrollbar-thumb-base-300 hover:scrollbar-thumb-base-400">
                        {sortedQuestions.map((q) => (
                            <div key={q.id}>
                                {editingQuestionId === q.id ? (
                                    <div className="bg-primary/5 p-4 rounded-xl flex flex-col gap-3 border border-primary/20 shadow-inner animate-fade-in">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon icon="mdi:pencil-circle" className="text-primary w-5 h-5" />
                                            <span className="font-bold text-sm text-primary">Editando pregunta...</span>
                                        </div>
                                        <textarea 
                                            className="textarea textarea-bordered w-full text-base bg-base-100 focus:border-primary shadow-sm" 
                                            rows={3}
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            autoFocus
                                        ></textarea>
                                        <div className="flex justify-end gap-2 mt-1">
                                            <button onClick={closeEditModal} className="btn btn-sm btn-ghost rounded-full">Cancelar</button>
                                            <button onClick={handleSaveEdit} disabled={isSavingEdit || !editText.trim()} className="btn btn-sm btn-primary rounded-full px-6 shadow-sm">
                                                {isSavingEdit ? <span className="loading loading-spinner loading-xs"></span> : 'Guardar'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-base-100 p-4 rounded-xl flex flex-col gap-3 relative group transition-all hover:bg-base-200 hover:shadow-md border border-base-200">
                                        <div className="flex justify-between items-start gap-4">
                                            <p className="text-base-content/90 whitespace-pre-wrap leading-relaxed">{q.question}</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className={`badge badge-sm font-semibold shadow-sm ${q.status === 'answered' ? 'badge-success text-white' : 'badge-warning'}`}>
                                                    {q.status === 'answered' ? 'Respondida' : 'Pendiente'}
                                                </div>
                                                {q.status === 'pending' && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => openEditModal(q)} 
                                                        className="btn btn-ghost btn-xs btn-square text-primary md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-base-200/50 hover:bg-primary hover:text-white"
                                                        title="Editar pregunta"
                                                    >
                                                        <Icon icon="mdi:pencil" className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-base-content/40 font-medium">
                                            <Icon icon="mdi:clock-outline" className="w-3 h-3" />
                                            {new Date(q.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop bg-black/40">
                    <button onClick={closeEditModal}>cerrar</button>
                </form>
            </dialog>
        </div>
    );
}
