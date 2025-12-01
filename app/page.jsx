'use client';

import React, { useState, useEffect, useCallback } from 'react';

// =========================================================================
// 1. UTILITÁRIOS E CONSTANTES
// =========================================================================
const CHOICES_MULT = ['A', 'B', 'C', 'D', 'E'];
const CHOICES_BOOL = ['V', 'F'];

const Bubble = ({ label, isMarked, onMark, disabled, colorClass = "blue", size = "normal" }) => {
  const baseColor = colorClass === "green" ? "bg-green-600 border-green-600" : "bg-blue-600 border-blue-600";
  const hoverColor = colorClass === "green" ? "hover:border-green-400" : "hover:border-blue-400";
  const sizeClass = size === "small" ? "w-7 h-7 text-xs" : "w-9 h-9 text-base";

  return (
    <label 
      className={`flex items-center select-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      onClick={(e) => { e.preventDefault(); !disabled && onMark(label); }}
    >
      <div 
        className={`
          ${sizeClass} rounded-full border-2 flex items-center justify-center transition-all font-bold shadow-sm
          ${isMarked 
            ? `${baseColor} text-white` 
            : `bg-white border-gray-300 text-gray-500 ${hoverColor}`}
        `}
      >
        {label}
      </div>
    </label>
  );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar", isDestructive = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in border border-gray-100">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {isDestructive ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition text-sm">
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className={`flex-1 py-2.5 text-white rounded-xl font-bold shadow-md transition text-sm ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const NovaProva = ({ onClose, onCreate }) => {
    const [subjectName, setSubjectName] = useState('');
    const [numQuestions, setNumQuestions] = useState(10);
    const [questionTypes, setQuestionTypes] = useState(Array(10).fill('multiple_choice'));

    const handleNumQuestionsChange = (e) => {
        const value = parseInt(e.target.value, 10);
        const newNum = isNaN(value) ? 0 : Math.max(1, Math.min(50, value));
        setNumQuestions(newNum);
        setQuestionTypes(prev => {
            const newArr = new Array(newNum).fill('multiple_choice');
            for(let i=0; i < Math.min(prev.length, newArr.length); i++) {
                newArr[i] = prev[i];
            }
            return newArr;
        });
    };

    const handleTypeChange = (index, type) => {
        const newTypes = [...questionTypes];
        newTypes[index] = type;
        setQuestionTypes(newTypes);
    };

    const handleSubmit = () => {
        if (!subjectName.trim()) return alert("Digite o nome da disciplina");
        const questionsPayload = questionTypes.map(type => ({
            type: type,
            answer: type === 'true_false' ? [null, null, null, null, null] : '' 
        }));
        onCreate(subjectName, questionsPayload);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-12 bg-black/60 overflow-y-auto">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] relative z-10 animate-scale-in">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Criar Nova Disciplina</h3>
                        <p className="text-sm text-gray-500">Configure os detalhes da avaliação</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2">✕</button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Disciplina</label>
                            <input type="text" value={subjectName} onChange={e => setSubjectName(e.target.value)} className="w-full p-3 border text-gray-900 border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all" placeholder="Ex: História - 2º Ano" autoFocus />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Total de Questões</label>
                            <input type="number" min="1" max="50" value={numQuestions} onChange={handleNumQuestionsChange} className="w-full p-3 border text-gray-900 border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Configurar Tipos de Questão</label>
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {questionTypes.map((type, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                                        <span className="text-sm font-bold text-gray-500 w-8">#{String(idx + 1).padStart(2, '0')}</span>
                                        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                                            <button onClick={() => handleTypeChange(idx, 'multiple_choice')} className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all ${type === 'multiple_choice' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>A-E</button>
                                            <button onClick={() => handleTypeChange(idx, 'true_false')} className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all ${type === 'true_false' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>V/F (5x)</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition">Cancelar</button>
                    <button onClick={handleSubmit} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition">Criar Prova</button>
                </div>
            </div>
        </div>
    );
};

const StudentExam = ({ examData, onFinishExam, onBack }) => {
    // ... [O código do StudentExam permanece o mesmo para economizar espaço, se precisar me avise] ...
    // Vou incluir a versão simplificada para focar no problema
    const [name, setName] = useState('');
    const [matricula, setMatricula] = useState('');
    const [answers, setAnswers] = useState([]); 
    const [showConfirm, setShowConfirm] = useState(false);
    const [examResult, setExamResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (examData && examData.questions) {
            const initialAnswers = examData.questions.map(q => q.type === 'true_false' ? [null, null, null, null, null] : null);
            setAnswers(initialAnswers);
        }
    }, [examData]);

    const handleMark = (questionIdx, value, subIdx = null) => {
        if (examResult) return;
        setAnswers(prev => {
            const newAns = [...prev];
            if (subIdx !== null) {
                const currentArr = Array.isArray(newAns[questionIdx]) ? [...newAns[questionIdx]] : [null, null, null, null, null];
                currentArr[subIdx] = value;
                newAns[questionIdx] = currentArr;
            } else { newAns[questionIdx] = value; }
            return newAns;
        });
        setErrorMsg('');
    };

    const handlePreSubmit = () => {
        if (!name.trim() || !matricula.trim()) return setErrorMsg("Preencha Nome e Matrícula.");
        setShowConfirm(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId: examData.id, studentName: name, matricula, answers })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setExamResult({ ...data, studentId: name, matricula });
            setShowConfirm(false);
        } catch (error) { setErrorMsg('Erro: ' + error.message); setShowConfirm(false); } finally { setIsSubmitting(false); }
    };

    if (examResult) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <h2 className="text-2xl font-bold">Nota: {Number(examResult.score).toFixed(1)}</h2>
                <button onClick={onBack} className="mt-4 w-full py-3 bg-gray-800 text-white rounded-xl">Sair</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6">
                <h1 className="text-2xl font-bold text-blue-800">{examData.subject}</h1>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="p-3 border rounded-lg" placeholder="Nome" />
                    <input type="text" value={matricula} onChange={e => setMatricula(e.target.value)} className="p-3 border rounded-lg" placeholder="Matrícula" />
                </div>
                {examData.questions.map((q, idx) => (
                    <div key={idx} className="p-4 border rounded-xl">
                        <span className="font-bold mr-3">#{idx+1}</span>
                        {q.type === 'true_false' ? (
                            <div className="pl-4 space-y-2">
                                {['a','b','c','d','e'].map((sub, sIdx) => (
                                    <div key={sub} className="flex gap-2 items-center">
                                        <span className="font-mono">{sub})</span>
                                        {CHOICES_BOOL.map(c => <Bubble key={c} label={c} size="small" isMarked={answers[idx] && answers[idx][sIdx] === c} onMark={() => handleMark(idx, c, sIdx)} colorClass="green" />)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-2">{CHOICES_MULT.map(c => <Bubble key={c} label={c} isMarked={answers[idx] === c} onMark={() => handleMark(idx, c)} />)}</div>
                        )}
                    </div>
                ))}
                {errorMsg && <div className="text-red-500">{errorMsg}</div>}
                <button onClick={handlePreSubmit} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold">Finalizar</button>
            </div>
            <ConfirmModal isOpen={showConfirm} title="Finalizar?" onConfirm={handleConfirmSubmit} onCancel={() => setShowConfirm(false)} message="Confirmar envio?" />
        </div>
    );
};

const ExamDetail = ({ exam, onUpdateExam, onBack, onSimulate }) => {
    const [fullExamData, setFullExamData] = useState(exam);
    const [tempKey, setTempKey] = useState([]);
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [msg, setMsg] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [hostUrl, setHostUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchDetails = useCallback(async () => {
        try {
            const res = await fetch(`/api/exams/${exam.id}`);
            const data = await res.json();
            if (!data.error) {
                setFullExamData(data);
                if (data.questions) {
                    setTempKey(data.questions.map(q => {
                        if (q.type === 'true_false' && !Array.isArray(q.answer)) return [null, null, null, null, null];
                        return q.answer;
                    }));
                }
            }
        } catch (e) { console.error(e); }
    }, [exam.id]);

    useEffect(() => {
        if (typeof window !== 'undefined') setHostUrl(window.location.origin);
        fetchDetails();
    }, [fetchDetails]);

    const handleSaveKey = async () => {
        setIsSaving(true);
        console.log("FRONTEND: Iniciando salvamento..."); // LOG

        const updatedQuestions = fullExamData.questions.map((q, idx) => ({
            ...q,
            answer: tempKey[idx]
        }));

        console.log("FRONTEND: Dados a enviar:", updatedQuestions); // LOG

        try {
            const res = await fetch(`/api/exams/${exam.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: updatedQuestions })
            });

            console.log("FRONTEND: Status da resposta:", res.status); // LOG

            if (res.ok) {
                setFullExamData(prev => ({ ...prev, questions: updatedQuestions }));
                onUpdateExam(exam.id, { ...fullExamData, questions: updatedQuestions });
                setIsEditingKey(false);
                setMsg('✅ Gabarito salvo com sucesso!');
            } else {
                const errData = await res.json();
                console.error("FRONTEND: Erro da API:", errData); // LOG
                setMsg(`❌ Erro ao salvar: ${errData.error || 'Erro desconhecido'}`);
            }
        } catch (e) {
            console.error("FRONTEND: Erro de rede:", e); // LOG
            setMsg('❌ Erro de conexão ao salvar.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setMsg(''), 4000);
        }
    };

    const handleKeyChange = (questionIdx, val, subIdx = null) => {
        setTempKey(prev => {
            const newKey = [...prev];
            if (subIdx !== null) {
                const arr = Array.isArray(newKey[questionIdx]) ? [...newKey[questionIdx]] : [null, null, null, null, null];
                arr[subIdx] = val;
                newKey[questionIdx] = arr;
            } else { newKey[questionIdx] = val; }
            return newKey;
        });
    };

    const examUrl = `${hostUrl}?examId=${exam.id}`;
    const results = fullExamData.results || [];
    const questions = fullExamData.questions || [];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="text-gray-500 hover:text-blue-600 font-bold">&larr; Voltar</button>
                <div className="flex gap-2">
                    <button onClick={() => setShowQR(true)} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold">QR Code</button>
                    <button onClick={onSimulate} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold">Simular Aluno</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h1 className="text-3xl font-extrabold text-blue-800">{fullExamData.subject}</h1>
                <p className="text-gray-500 text-xs font-mono bg-gray-100 px-2 py-1 rounded">ID: {fullExamData.id}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col h-full">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-700">Gabarito</h2>
                            <button onClick={() => isEditingKey ? handleSaveKey() : setIsEditingKey(true)} disabled={isSaving} className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${isEditingKey ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>{isSaving ? 'Salvando...' : (isEditingKey ? 'Salvar' : 'Editar')}</button>
                        </div>
                        {msg && <div className={`mb-3 p-2 text-xs rounded border ${msg.includes('Erro') || msg.includes('❌') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{msg}</div>}
                        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[500px]">
                            {questions.map((q, idx) => {
                                const isVF = q.type === 'true_false';
                                const currentAnswer = isEditingKey ? tempKey[idx] : q.answer;
                                return (
                                    <div key={idx} className="p-3 mb-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex justify-between mb-2"><span className="font-bold text-gray-400">#{idx+1}</span></div>
                                        {isVF ? (
                                            <div className="grid grid-cols-5 gap-1">{['a','b','c','d','e'].map((s,si)=><div key={si} className="flex flex-col items-center"><span className="text-[10px]">{s}</span><div className="flex flex-col gap-1">{CHOICES_BOOL.map(o=><button key={o} disabled={!isEditingKey} onClick={()=>handleKeyChange(idx,o,si)} className={`w-6 h-6 text-[10px] rounded font-bold ${currentAnswer?.[si]===o?'bg-purple-600 text-white':'bg-white border text-gray-300'}`}>{o}</button>)}</div></div>)}</div>
                                        ) : (
                                            <div className="flex gap-1 justify-center">{CHOICES_MULT.map(o=><button key={o} disabled={!isEditingKey} onClick={()=>handleKeyChange(idx,o)} className={`w-8 h-8 text-xs rounded font-bold ${currentAnswer===o?'bg-blue-600 text-white':'bg-white border text-gray-400'}`}>{o}</button>)}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Resultados ({results.length})</h2>
                    {results.length===0?<p className="text-center text-gray-400 py-10">Sem envios.</p>:(
                        <table className="w-full text-sm">
                            <thead><tr className="text-gray-400 border-b"><th className="text-left py-2">Aluno</th><th>Matrícula</th><th className="text-right">Nota</th></tr></thead>
                            <tbody>{results.map((r,i)=><tr key={i} className="border-b"><td className="py-2 font-bold">{r.studentId}</td><td className="text-center">{r.matricula}</td><td className="text-right font-bold">{Number(r.score).toFixed(1)}</td></tr>)}</tbody>
                        </table>
                    )}
                </div>
            </div>
            {showQR && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"><div className="bg-white p-8 rounded-2xl text-center relative"><button onClick={()=>setShowQR(false)} className="absolute top-4 right-4">✕</button><h3 className="font-bold text-xl mb-4">QR Code</h3><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(examUrl)}`} className="mx-auto border p-2 rounded mb-4" /><input value={examUrl} readOnly className="w-full p-2 border rounded text-xs" /></div></div>}
        </div>
    );
};

const ExamList = ({ exams, onCreateExam, onSelectExam, onDeleteExam }) => {
    const [showModal, setShowModal] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);

    const handleDelete = async (id) => {
        console.log("FRONTEND: Tentando deletar ID:", id); // LOG
        onDeleteExam(id); // Chama a função que passamos do AppWrapper (que agora tem tratamento de erro)
        setExamToDelete(null);
    };

    return (
        <>
            <div className="space-y-8 animate-fade-in-up">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Minhas Provas</h2>
                    <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg">+ Nova Prova</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {exams.length === 0 ? <p className="text-center text-gray-400 py-10">Nenhuma prova.</p> : exams.map(exam => (
                        <div key={exam.id} className="bg-white p-5 rounded-2xl shadow-sm border flex justify-between items-center">
                            <div><h3 className="font-bold text-gray-800">{exam.subject}</h3><span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">ID: {exam.id}</span></div>
                            <div className="flex gap-2">
                                <button onClick={() => onSelectExam(exam)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm">Gerenciar</button>
                                <button onClick={() => setExamToDelete(exam)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm">Excluir</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showModal && <NovaProva onClose={() => setShowModal(false)} onCreate={onCreateExam} />}
            <ConfirmModal isOpen={!!examToDelete} title="Excluir Disciplina" message={`Excluir "${examToDelete?.subject}"?`} confirmText="Sim, excluir" isDestructive={true} onConfirm={() => handleDelete(examToDelete.id)} onCancel={() => setExamToDelete(null)} />
        </>
    );
};

const AppWrapper = () => {
    const [view, setView] = useState('dashboard'); 
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState(null);

    const loadExams = useCallback(async () => {
        try {
            const res = await fetch('/api/exams');
            if (res.ok) setExams(await res.json());
        } catch (e) { console.error('Erro load:', e); }
    }, []);

    useEffect(() => { loadExams(); }, [loadExams]);

    const handleCreateExam = async (subject, questions) => {
        try {
            await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, questions }) });
            loadExams();
        } catch (e) { alert('Erro criar'); }
    };

    // AQUI ESTÁ A LÓGICA DE DELETE CORRIGIDA
    const handleDeleteExam = async (id) => {
        console.log("FRONTEND (AppWrapper): Executando DELETE fetch para:", id); // LOG
        try {
            const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
            
            // Verifica se a API retornou erro
            if (!res.ok) {
                const data = await res.json();
                console.error("FRONTEND: Erro da API no delete:", data); // LOG
                throw new Error(data.error || 'Falha ao excluir');
            }

            console.log("FRONTEND: Delete sucesso!"); // LOG
            loadExams();
            if (selectedExamId === id) { setView('dashboard'); setSelectedExamId(null); }
        } catch(e) {
            alert('Erro ao excluir: ' + e.message);
        }
    };

    const currentExam = exams.find(e => e.id === selectedExamId);

    const renderContent = () => {
        if (view === 'student') return <StudentExam examData={currentExam} onFinishExam={()=>{}} onBack={()=>{setView('dashboard')}} />;
        if (view === 'exam-detail') return <ExamDetail exam={currentExam} onUpdateExam={(id, data)=>setExams(prev=>prev.map(e=>e.id===id?data:e))} onBack={()=>{setView('dashboard');setSelectedExamId(null)}} onSimulate={()=>{setView('student')}} />;
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
                <div className="max-w-5xl mx-auto">
                    <header className="mb-8"><h1 className="text-3xl font-extrabold text-blue-900">Painel do Professor</h1></header>
                    <ExamList exams={exams} onCreateExam={handleCreateExam} onSelectExam={(e)=>{setSelectedExamId(e.id);setView('exam-detail')}} onDeleteExam={handleDeleteExam} />
                </div>
            </div>
        );
    };

    return (
        <>
            {renderContent()}
            <style jsx global>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </>
    );
};

export default AppWrapper;