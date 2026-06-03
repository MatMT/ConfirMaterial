import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Icon } from '@iconify/react';

export default function QuestionManager() {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const [userId, setUserId] = useState(null);

    // Edit state
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editText, setEditText] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        setUserId(session.user.id);

        const { data, error } = await supabase
            .from('student_questions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

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
        setEditingQuestion(q);
        setEditText(q.question);
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
        setEditText('');
    };

    const handleSaveEdit = async () => {
        if (!editText.trim() || !editingQuestion) return;

        setIsSavingEdit(true);
        try {
            const { error } = await supabase
                .from('student_questions')
                .update({ question: editText.trim() })
                .eq('id', editingQuestion.id);

            if (error) throw error;
            
            fetchQuestions();
            closeEditModal();
        } catch (err) {
            console.error("Error updating question", err);
        } finally {
            setIsSavingEdit(false);
        }
    };

    return (
        <div className="card bg-base-100 shadow-xl border border-base-200 lg:col-span-3 hover:shadow-2xl transition-all duration-300 animate-fade-up">
            <div className="card-body">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Icon icon="mdi:message-question-outline" className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="card-title text-2xl">¿Tienes alguna pregunta para la clase?</h2>
                            <p className="text-sm text-base-content/60">Déjanos tu duda y la resolveremos en nuestra próxima sesión en vivo.</p>
                        </div>
                    </div>
                    
                    {/* Botón para abrir modal si hay preguntas */}
                    {questions.length > 0 && (
                        <button 
                            onClick={() => document.getElementById('questions_modal').showModal()} 
                            className="btn btn-outline btn-sm md:btn-md shrink-0"
                        >
                            <Icon icon="mdi:format-list-bulleted" className="w-5 h-5 mr-1" />
                            Mis Preguntas ({questions.length})
                        </button>
                    )}
                </div>

                {/* Formulario de nueva pregunta */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <textarea 
                        className="textarea textarea-bordered textarea-lg w-full bg-base-200/50 focus:bg-base-100 transition-colors" 
                        placeholder="Escribe tu pregunta aquí..."
                        rows={4}
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        required
                    ></textarea>
                    
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary px-8 rounded-full shadow-lg hover:scale-105 transition-transform">
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
            <dialog id="questions_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box w-full max-w-3xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Icon icon="mdi:format-list-bulleted" className="w-5 h-5 text-primary" />
                        Historial de Preguntas
                    </h3>
                    
                    <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                        {questions.map((q) => (
                            <div key={q.id} className="bg-base-200 p-4 rounded-xl flex flex-col gap-2 relative group">
                                <div className="flex justify-between items-start gap-4">
                                    <p className="text-base-content/90 whitespace-pre-wrap">{q.question}</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`badge badge-sm ${q.status === 'answered' ? 'badge-success' : 'badge-warning'}`}>
                                            {q.status === 'answered' ? 'Respondida' : 'Pendiente'}
                                        </div>
                                        {q.status === 'pending' && (
                                            <button 
                                                type="button"
                                                onClick={() => openEditModal(q)} 
                                                className="btn btn-ghost btn-xs btn-square text-primary md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                                title="Editar pregunta"
                                            >
                                                <Icon icon="mdi:pencil" className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs text-base-content/40">
                                    {new Date(q.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>cerrar</button>
                </form>
            </dialog>

            {/* Sub-modal: Editar Pregunta */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-base-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-up">
                        <div className="p-4 border-b border-base-200 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Editar Pregunta</h3>
                            <button onClick={closeEditModal} className="btn btn-sm btn-circle btn-ghost">✕</button>
                        </div>
                        <div className="p-4">
                            <textarea 
                                className="textarea textarea-bordered w-full text-base" 
                                rows={4}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="p-4 bg-base-200/50 border-t border-base-200 flex justify-end gap-2">
                            <button onClick={closeEditModal} className="btn btn-ghost">Cancelar</button>
                            <button onClick={handleSaveEdit} disabled={isSavingEdit || !editText.trim()} className="btn btn-primary">
                                {isSavingEdit ? <span className="loading loading-spinner loading-sm"></span> : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
