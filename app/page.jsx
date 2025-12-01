'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Login from '@/app/components/Login'; // Certifique-se de que este componente existe

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

    if (!examData) return <div className="text-center p-10">Carregando prova...</div>;

    if (examResult) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Prova Enviada!</h2>
                <p className="text-gray-600 mb-6">Sua nota: <span className="font-bold text-blue-600 text-xl">{Number(examResult.score).toFixed(1)}</span></p>
                <button onClick={() => window.location.reload()} className="mt-4 w-full py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition">Nova Prova</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6">
                <h1 className="text-2xl font-bold text-blue-800 text-center">{examData.subject}</h1>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100" placeholder="Seu Nome Completo" />
                    <input type="text" value={matricula} onChange={e => setMatricula(e.target.value)} className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100" placeholder="Sua Matrícula" />
                </div>
                {examData.questions.map((q, idx) => (
                    <div key={idx} className="p-4 border rounded-xl bg-gray-50/50">
                        <span className="font-bold mr-3 text-gray-500">#{idx+1}</span>
                        {q.type === 'true_false' ? (
                            <div className="pl-4 space-y-2 mt-2">
                                {['a','b','c','d','e'].map((sub, sIdx) => (
                                    <div key={sub} className="flex gap-4 items-center justify-between sm:justify-start">
                                        <span className="font-mono text-gray-600 font-bold">{sub})</span>
                                        <div className="flex gap-2">
                                            {CHOICES_BOOL.map(c => <Bubble key={c} label={c} size="small" isMarked={answers[idx] && answers[idx][sIdx] === c} onMark={() => handleMark(idx, c, sIdx)} colorClass="green" />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-2 mt-2 justify-center sm:justify-start">{CHOICES_MULT.map(c => <Bubble key={c} label={c} isMarked={answers[idx] === c} onMark={() => handleMark(idx, c)} />)}</div>
                        )}
                    </div>
                ))}
                {errorMsg && <div className="text-red-500 text-center font-bold">{errorMsg}</div>}
                <button onClick={handlePreSubmit} disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition">{isSubmitting ? 'Enviando...' : 'Finalizar Prova'}</button>
            </div>
            <ConfirmModal isOpen={showConfirm} title="Finalizar Prova?" onConfirm={handleConfirmSubmit} onCancel={() => setShowConfirm(false)} message="Tem certeza que deseja enviar suas respostas? Não será possível alterar depois." />
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
        const updatedQuestions = fullExamData.questions.map((q, idx) => ({
            ...q,
            answer: tempKey[idx]
        }));

        try {
            const res = await fetch(`/api/exams/${exam.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({ questions: updatedQuestions })
            });

            if (res.ok) {
                setFullExamData(prev => ({ ...prev, questions: updatedQuestions }));
                onUpdateExam(exam.id, { ...fullExamData, questions: updatedQuestions });
                setIsEditingKey(false);
                setMsg('✅ Gabarito salvo com sucesso!');
            } else {
                const errData = await res.json();
                setMsg(`❌ Erro: ${errData.error}`);
            }
        } catch (e) {
            setMsg('❌ Erro de conexão.');
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
                <button onClick={onBack} className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-2">
                    <span>&larr;</span> Voltar
                </button>
                <div className="flex gap-2">
                    <button onClick={() => setShowQR(true)} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 8V4m0 4h2m4 0a2 2 0 100-4 2 2 0 000 4zm0 0v4m0 4h2m4 0a2 2 0 100-4 2 2 0 000 4zm0 0v4m0 4h2m4 0a2 2 0 100-4 2 2 0 000 4zm0 0v4" /></svg>
                        QR Code
                    </button>
                    <button onClick={onSimulate} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition">Simular</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h1 className="text-3xl font-extrabold text-blue-800">{fullExamData.subject}</h1>
                <p className="text-gray-500 text-xs font-mono bg-gray-100 px-2 py-1 rounded inline-block mt-2">ID: {fullExamData.id}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col h-full">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-700">Gabarito Oficial</h2>
                            <button onClick={() => isEditingKey ? handleSaveKey() : setIsEditingKey(true)} disabled={isSaving} className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${isEditingKey ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>{isSaving ? '...' : (isEditingKey ? 'Salvar' : 'Editar')}</button>
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
                    {results.length===0?<p className="text-center text-gray-400 py-10">Nenhum aluno enviou respostas ainda.</p>:(
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="text-gray-400 border-b"><th className="text-left py-2 font-medium">Aluno</th><th className="font-medium text-center">Matrícula</th><th className="text-right font-medium">Nota</th></tr></thead>
                                <tbody>{results.map((r,i)=><tr key={i} className="border-b hover:bg-gray-50"><td className="py-3 font-bold text-gray-700">{r.studentId}</td><td className="text-center text-gray-500">{r.matricula}</td><td className="text-right font-bold text-blue-600">{Number(r.score).toFixed(1)}</td></tr>)}</tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {showQR && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"><div className="bg-white p-8 rounded-2xl text-center relative max-w-sm w-full"><button onClick={()=>setShowQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">✕</button><h3 className="font-bold text-xl mb-4">Acesso do Aluno</h3><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(examUrl)}`} className="mx-auto border p-2 rounded-lg mb-4" /><p className="text-xs text-gray-500 mb-2">Peça para os alunos escanearem ou acesse:</p><input value={examUrl} readOnly className="w-full p-2 border rounded text-xs text-center bg-gray-50" onClick={(e)=>e.target.select()} /></div></div>}
        </div>
    );
};

const ExamList = ({ exams, onCreateExam, onSelectExam, onDeleteExam }) => {
    const [showModal, setShowModal] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);

    const handleDelete = async (id) => {
        onDeleteExam(id);
        setExamToDelete(null);
    };

    return (
        <>
            <div className="space-y-8 animate-fade-in-up">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Minhas Provas</h2>
                    <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition transform hover:-translate-y-0.5">+ Nova Prova</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {exams.length === 0 ? <p className="text-center text-gray-400 py-10 bg-white rounded-2xl border border-dashed">Nenhuma prova criada.</p> : exams.map(exam => (
                        <div key={exam.id} className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{exam.subject}</h3>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">ID: {exam.id}</span>
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">{exam.resultsCount || 0} envios</span>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => onSelectExam(exam)} className="flex-1 sm:flex-none bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm transition">Gerenciar</button>
                                <button onClick={() => setExamToDelete(exam)} className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm transition">Excluir</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showModal && <NovaProva onClose={() => setShowModal(false)} onCreate={onCreateExam} />}
            <ConfirmModal isOpen={!!examToDelete} title="Excluir Disciplina" message={`Tem certeza que deseja excluir "${examToDelete?.subject}"? Todos os resultados serão perdidos.`} confirmText="Sim, excluir" isDestructive={true} onConfirm={() => handleDelete(examToDelete.id)} onCancel={() => setExamToDelete(null)} />
        </>
    );
};

// Componente de Conteúdo separado para usar useSearchParams com Suspense
const Content = () => {
    const searchParams = useSearchParams();
    const examIdFromUrl = searchParams.get('examId');

    // Estado de Autenticação
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null); // <--- NOVO: Armazena o objeto do usuário (id, email)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const [view, setView] = useState('dashboard');
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [isLoadingUrlExam, setIsLoadingUrlExam] = useState(false);

    // Verificar login ao carregar
    useEffect(() => {
        // Se tem examId na URL, é aluno
        if (examIdFromUrl) {
            setIsCheckingAuth(false);
            return; 
        }

        const storedUser = localStorage.getItem('corrija_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser); // <--- Guardamos o usuário no estado
            setIsAuthenticated(true);
        }
        setIsCheckingAuth(false);
    }, [examIdFromUrl]);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('corrija_user');
        setUser(null);
        setIsAuthenticated(false);
        setExams([]); // Limpa as provas da tela
    };

    // Carrega provas (com Header de Autenticação)
    const loadExams = useCallback(async () => {
        if (!user && !examIdFromUrl) return; // Só carrega se tiver usuário ou for link de aluno
        
        // Se for professor logado, busca as DELE
        if (user) {
            try {
                const res = await fetch('/api/exams', {
                    headers: { 'x-user-id': user.id } // <--- IMPORTANTE: Enviando ID
                });
                if (res.ok) setExams(await res.json());
            } catch (e) { console.error('Erro load:', e); }
        }
    }, [user, examIdFromUrl]);

    // Efeito para carregar provas quando o usuário loga
    useEffect(() => {
        if (isAuthenticated && user) {
            loadExams();
        }
    }, [isAuthenticated, user, loadExams]);

    // Efeito para checar URL (Aluno) - INALTERADO
    useEffect(() => {
        if (examIdFromUrl) {
            setIsLoadingUrlExam(true);
            fetch(`/api/exams/${examIdFromUrl}`)
                .then(res => {
                    if(!res.ok) throw new Error('Prova não encontrada');
                    return res.json();
                })
                .then(data => {
                    setExams(prev => [...prev, data]);
                    setSelectedExamId(data.id);
                    setView('student');
                })
                .catch(err => {
                    alert("Erro: " + err.message);
                    window.location.href = '/';
                })
                .finally(() => setIsLoadingUrlExam(false));
        }
    }, [examIdFromUrl]);

    // Criar Prova (Com Header)
    const handleCreateExam = async (subject, questions) => {
        try {
            await fetch('/api/exams', { 
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-id': user.id // <--- IMPORTANTE
                }, 
                body: JSON.stringify({ subject, questions }) 
            });
            loadExams();
        } catch (e) { alert('Erro criar'); }
    };

    // Deletar Prova (Com Header)
    const handleDeleteExam = async (id) => {
        try {
            const res = await fetch(`/api/exams/${id}`, { 
                method: 'DELETE',
                headers: { 'x-user-id': user.id } // <--- IMPORTANTE
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Falha ao excluir');
            }
            loadExams();
            if (selectedExamId === id) { setView('dashboard'); setSelectedExamId(null); }
        } catch(e) {
            alert('Erro ao excluir: ' + e.message);
        }
    };

    // Atualizar Prova (Detail) precisa passar o updateExam que agora vai usar o ID também
    // No ExamDetail, precisamos injetar o header também.
    // Vamos modificar o render do ExamDetail abaixo.

    // RENDERIZAÇÃO
    if (isCheckingAuth || isLoadingUrlExam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (view === 'student') {
        const currentExam = exams.find(e => e.id === selectedExamId);
        return <StudentExam examData={currentExam} onFinishExam={()=>{}} onBack={()=>{
            if (isAuthenticated) {
                setView('dashboard');
                window.history.pushState({}, '', '/');
            } else {
                alert("Prova finalizada.");
                window.location.href = '/';
            }
        }} />;
    }

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    const currentExam = exams.find(e => e.id === selectedExamId);

    if (view === 'exam-detail' && currentExam) {
        // Passamos uma versão customizada do fetch/update para o ExamDetail ou
        // alteramos o componente ExamDetail para aceitar user.id.
        // A maneira mais limpa sem mexer no ExamDetail agora é sobrescrever o onUpdateExam
        // mas o ExamDetail faz o fetch PUT internamente.
        // CORREÇÃO RÁPIDA: Vamos alterar o ExamDetail para aceitar uma prop `userId` (veja abaixo)
        return <ExamDetail 
            exam={currentExam} 
            userId={user.id} // <--- Passando ID para o componente filho
            onUpdateExam={(id, data)=>setExams(prev=>prev.map(e=>e.id===id?data:e))} 
            onBack={()=>{setView('dashboard');setSelectedExamId(null)}} 
            onSimulate={()=>{setView('student')}} 
        />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-blue-900">Painel do Professor</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">{user.email}</span>
                        <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition">
                            Sair
                        </button>
                    </div>
                </header>
                <ExamList exams={exams} onCreateExam={handleCreateExam} onSelectExam={(e)=>{setSelectedExamId(e.id);setView('exam-detail')}} onDeleteExam={handleDeleteExam} />
            </div>
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Carregando aplicação...</div>}>
            <Content />
            <style jsx global>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
            `}</style>
        </Suspense>
    );
}