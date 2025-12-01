'use client';

import React, { useState, useEffect, useCallback } from 'react';

// =========================================================================
// 1. UTILITÁRIOS E CONSTANTES
// =========================================================================
const CHOICES_MULT = ['A', 'B', 'C', 'D', 'E'];
const CHOICES_BOOL = ['V', 'F'];
const COMPLETED_EXAMS_KEY = 'corrija-student-completed-v1';

// Componente visual da Bolha
const Bubble = ({ label, isMarked, onMark, disabled, colorClass = "blue" }) => {
  const baseColor = colorClass === "green" ? "bg-green-600 border-green-600" : "bg-blue-600 border-blue-600";
  const hoverColor = colorClass === "green" ? "hover:border-green-400" : "hover:border-blue-400";

  return (
    <label 
      className={`flex items-center select-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      onClick={() => !disabled && onMark(label)}
    >
      <div 
        className={`
          w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all font-bold shadow-sm
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

// =========================================================================
// 2. COMPONENTE: NOVA PROVA (MODAL CORRIGIDO)
// =========================================================================
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
            answer: '' 
        }));

        onCreate(subjectName, questionsPayload);
        onClose();
    };

    return (
        /* CORREÇÃO: Removido 'backdrop-blur-sm' para tirar o embaçado */
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-12 bg-black/60 overflow-y-auto">
            {/* Overlay */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] relative z-10 animate-scale-in">
                {/* Cabeçalho */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Criar Nova Disciplina</h3>
                        <p className="text-sm text-gray-500">Configure os detalhes da avaliação</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Corpo */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Disciplina</label>
                            <input 
                                type="text" 
                                value={subjectName} 
                                onChange={e => setSubjectName(e.target.value)} 
                                className="w-full p-3 border text-gray-900 border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all" 
                                placeholder="Ex: História - 2º Ano" 
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Total de Questões</label>
                            <input 
                                type="number" 
                                min="1" max="50"
                                value={numQuestions} 
                                onChange={handleNumQuestionsChange} 
                                className="w-full p-3 border text-gray-900 border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all" 
                            />
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
                                            <button 
                                                onClick={() => handleTypeChange(idx, 'multiple_choice')}
                                                className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all ${type === 'multiple_choice' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                A-E
                                            </button>
                                            <button 
                                                onClick={() => handleTypeChange(idx, 'true_false')}
                                                className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all ${type === 'true_false' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                V/F
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rodapé */}
                <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform active:scale-[0.98]">
                        Criar Prova
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 3. COMPONENTE: TELA DO ALUNO
// =========================================================================
const StudentExam = ({ examData, onFinishExam, onBack }) => {
    const [name, setName] = useState('');
    const [matricula, setMatricula] = useState('');
    const [answers, setAnswers] = useState([]); 
    const [showConfirm, setShowConfirm] = useState(false);
    const [examResult, setExamResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (examData && examData.questions) {
            setAnswers(new Array(examData.questions.length).fill(null));
        }
    }, [examData]);

    useEffect(() => {
        if (typeof window !== 'undefined' && examData) {
            const completed = JSON.parse(localStorage.getItem(COMPLETED_EXAMS_KEY) || '{}');
            if (completed[examData.id]) {
                setExamResult(completed[examData.id]);
                setIsLocked(true);
            }
        }
    }, [examData]);

    if (!examData || !examData.questions) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Prova Indisponível</h2>
                    <p className="text-gray-600 mb-6">Não foi possível carregar os dados da prova.</p>
                    <button onClick={onBack} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Voltar</button>
                </div>
            </div>
        );
    }

    const handleMark = (index, choice) => {
        if (examResult) return;
        setAnswers(prev => {
            const newAns = [...prev];
            newAns[index] = choice;
            return newAns;
        });
        setErrorMsg('');
    };

    const handlePreSubmit = () => {
        if (!name.trim() || !matricula.trim()) {
            setErrorMsg("Por favor, preencha seu Nome e Matrícula.");
            return;
        }
        const unansweredCount = answers.filter(a => a === null).length;
        if (unansweredCount > 0) {
            setErrorMsg(`Atenção: Você ainda não respondeu ${unansweredCount} questões!`);
            return;
        }
        setErrorMsg('');
        setShowConfirm(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: examData.id,
                    studentName: name,
                    matricula: matricula,
                    answers: answers
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Erro ao enviar');

            const finalResult = {
                score: data.score,
                hits: data.hits,
                total: data.total,
                studentId: name,
                matricula: matricula,
                timestamp: data.timestamp
            };

            const completed = JSON.parse(localStorage.getItem(COMPLETED_EXAMS_KEY) || '{}');
            completed[examData.id] = finalResult;
            localStorage.setItem(COMPLETED_EXAMS_KEY, JSON.stringify(completed));

            setExamResult(finalResult);
            setIsLocked(true);
            setShowConfirm(false);
            if (onFinishExam) onFinishExam(examData.id, finalResult);

        } catch (error) {
            setErrorMsg('Erro: ' + error.message);
            setShowConfirm(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (examResult) {
        const isPass = examResult.score >= 6.0;
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200 animate-fade-in-up">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl mb-4 ${isPass ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isPass ? '🎉' : '📝'}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Prova Finalizada!</h2>
                    <p className="text-gray-500 mb-6">Disciplina: <strong>{examData.subject}</strong></p>
                    <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Sua Nota</div>
                        <div className={`text-6xl font-extrabold mb-2 ${isPass ? 'text-green-600' : 'text-red-600'}`}>
                            {Number(examResult.score).toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-400">
                            {examResult.hits} acertos de {examResult.total} questões
                        </div>
                    </div>
                    {isLocked && <p className="text-xs text-amber-600 mb-6 bg-amber-50 p-2 rounded">Prova já realizada neste dispositivo.</p>}
                    <button onClick={onBack} className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-transform active:scale-95 shadow-lg">
                        Sair da Prova
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 md:p-6 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white">
                    <h1 className="text-2xl font-bold">Prova Digital</h1>
                    <p className="opacity-90 text-sm mt-1">Disciplina: <span className="font-bold text-yellow-300">{examData.subject}</span></p>
                </div>
                <div className="p-5 md:p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-5 rounded-xl border border-blue-100">
                        <div>
                            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Nome Completo</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="Seu nome aqui" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Matrícula</label>
                            <input type="text" value={matricula} onChange={e => setMatricula(e.target.value)} className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="Ex: 202301" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {examData.questions.map((question, idx) => {
                            const isVF = question.type === 'true_false';
                            const options = isVF ? CHOICES_BOOL : CHOICES_MULT;
                            return (
                                <div key={idx} className="flex flex-col md:flex-row md:items-center p-4 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 rounded-xl transition-all">
                                    <div className="flex items-center mb-3 md:mb-0 md:mr-6 min-w-[3rem]">
                                        <span className="text-lg font-bold text-gray-400">#{String(idx + 1).padStart(2, '0')}</span>
                                        {isVF && <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">V/F</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {options.map(choice => (
                                            <Bubble key={choice} label={choice} isMarked={answers[idx] === choice} onMark={() => handleMark(idx, choice)} colorClass={isVF ? "green" : "blue"} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="pt-6 border-t border-gray-100">
                        {errorMsg && (
                            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm flex items-center animate-pulse">
                                <span className="mr-2 text-xl">⚠️</span> {errorMsg}
                            </div>
                        )}
                        <button onClick={handlePreSubmit} disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg transition-transform active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Enviando Respostas...' : 'Finalizar Prova'}
                        </button>
                    </div>
                </div>
            </div>
            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Confirmar Envio?</h3>
                        <p className="text-gray-600 mb-6">
                            Você respondeu todas as <strong>{examData.questions.length} questões</strong>. <br/>
                            Deseja realmente finalizar?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">Revisar</button>
                            <button onClick={handleConfirmSubmit} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// =========================================================================
// 4. COMPONENTE: LISTA DE PROVAS (PAINEL PROFESSOR)
// =========================================================================
const ExamList = ({ exams, onCreateExam, onSelectExam, onDeleteExam }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        /* CORREÇÃO IMPORTANTE: Usando Fragment para tirar o Modal do container animado */
        <>
            <div className="space-y-8 animate-fade-in-up">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Minhas Provas</h2>
                        <p className="text-gray-500 text-sm">Gerencie suas avaliações digitais</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-transform active:scale-95 flex items-center"
                    >
                        <span className="text-2xl mr-2 leading-none">+</span> Nova Prova
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {exams.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                            <p className="text-lg">Nenhuma prova encontrada.</p>
                        </div>
                    ) : (
                        exams.map(exam => (
                            <div key={exam.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-800">{exam.subject}</h3>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">ID: {exam.id}</span>
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <span className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>{exam.questions?.length || 0} Questões</span>
                                        <span className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>{exam.resultsCount || 0} Respostas</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button onClick={() => onSelectExam(exam)} className="flex-1 md:flex-none bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-bold text-sm transition">
                                        Gerenciar
                                    </button>
                                    <button onClick={() => onDeleteExam(exam.id)} className="flex-1 md:flex-none bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-bold text-sm transition">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Separado e Fora do Contexto Animado */}
            {showModal && (
                <NovaProva 
                    onClose={() => setShowModal(false)} 
                    onCreate={onCreateExam} 
                />
            )}
        </>
    );
};

// =========================================================================
// 5. COMPONENTE: DETALHES E GABARITO
// =========================================================================
const ExamDetail = ({ exam, onUpdateExam, onBack, onSimulate }) => {
    const [fullExamData, setFullExamData] = useState(exam);
    const [tempKey, setTempKey] = useState([]);
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [msg, setMsg] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [hostUrl, setHostUrl] = useState('');

    const fetchDetails = useCallback(async () => {
        try {
            const res = await fetch(`/api/exams/${exam.id}`);
            const data = await res.json();
            if (!data.error) {
                setFullExamData(data);
                if (data.questions) {
                    setTempKey(data.questions.map(q => q.answer));
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, [exam.id]);

    useEffect(() => {
        if (typeof window !== 'undefined') setHostUrl(window.location.origin);
        fetchDetails();
    }, [fetchDetails]);

    const handleSaveKey = async () => {
        if (tempKey.some(k => !k)) {
            setMsg('Aviso: Algumas questões estão sem resposta definida.');
        }

        const updatedQuestions = fullExamData.questions.map((q, idx) => ({
            ...q,
            answer: tempKey[idx]
        }));

        setFullExamData(prev => ({ ...prev, questions: updatedQuestions }));
        onUpdateExam(exam.id, { ...fullExamData, questions: updatedQuestions });
        
        setIsEditingKey(false);
        setMsg('Gabarito salvo localmente (Implemente PUT no backend para persistir).');
        setTimeout(() => setMsg(''), 4000);
    };

    const examUrl = `${hostUrl}?examId=${exam.id}`;
    const results = fullExamData.results || [];
    const questions = fullExamData.questions || [];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="text-gray-500 hover:text-blue-600 flex items-center font-bold text-sm transition">
                    &larr; Voltar
                </button>
                <div className="flex gap-2">
                    <button onClick={() => setShowQR(true)} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center transition">
                        QR Code
                    </button>
                    <button onClick={onSimulate} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition">
                        Simular Aluno
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h1 className="text-3xl font-extrabold text-blue-800 mb-1">{fullExamData.subject}</h1>
                <p className="text-gray-500 text-xs font-mono bg-gray-100 inline-block px-2 py-1 rounded">ID: {fullExamData.id}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-1 flex flex-col h-full">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-700">Gabarito</h2>
                            <button 
                                onClick={() => isEditingKey ? handleSaveKey() : setIsEditingKey(true)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${isEditingKey ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                            >
                                {isEditingKey ? 'Salvar Alterações' : 'Editar Gabarito'}
                            </button>
                        </div>
                        
                        {msg && <div className="mb-3 p-2 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-100">{msg}</div>}

                        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[500px]">
                            {questions.map((q, idx) => {
                                const isVF = q.type === 'true_false';
                                const options = isVF ? CHOICES_BOOL : CHOICES_MULT;
                                const currentAnswer = isEditingKey ? tempKey[idx] : q.answer;

                                return (
                                    <div key={idx} className="flex items-center justify-between p-2 mb-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-400 w-6">#{idx+1}</span>
                                            <span className={`text-[10px] px-1 rounded font-bold ${isVF ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {isVF ? 'V/F' : 'A-E'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex gap-1">
                                            {options.map(opt => (
                                                <button
                                                    key={opt}
                                                    disabled={!isEditingKey}
                                                    onClick={() => {
                                                        const newK = [...tempKey];
                                                        newK[idx] = opt;
                                                        setTempKey(newK);
                                                    }}
                                                    className={`
                                                        w-7 h-7 text-xs rounded font-bold transition-all
                                                        ${currentAnswer === opt 
                                                            ? (isVF ? 'bg-purple-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md')
                                                            : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-100'}
                                                    `}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 flex flex-col h-full">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-700">Resultados dos Alunos <span className="ml-2 bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded-full">{results.length}</span></h2>
                            <button onClick={fetchDetails} className="text-blue-600 text-xs font-bold hover:underline">Atualizar</button>
                        </div>

                        {results.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl m-4">
                                <span className="text-4xl mb-2">📭</span>
                                <p>Aguardando envios...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                            <th className="py-3 pl-4 font-bold">Aluno</th>
                                            <th className="py-3 font-bold">Matrícula</th>
                                            <th className="py-3 font-bold text-right pr-4">Nota</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {results.map((res, i) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 pl-4 font-bold text-gray-700">{res.studentId}</td>
                                                <td className="py-3 text-gray-500 font-mono text-xs">{res.matricula}</td>
                                                <td className="py-3 text-right pr-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${res.score >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {Number(res.score).toFixed(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showQR && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-scale-in">
                        <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">✕</button>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Acesso do Aluno</h3>
                        <p className="text-sm text-gray-500 mb-4">Leia para iniciar a prova</p>
                        
                        <div className="bg-white p-3 border-2 border-gray-100 rounded-xl inline-block mb-6 shadow-inner">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(examUrl)}`} alt="QR Code" className="w-48 h-48" />
                        </div>

                        <div className="text-left bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                            <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Link para compartilhar</label>
                            <input 
                                type="text" 
                                value={examUrl} 
                                readOnly
                                className="w-full p-2 text-xs bg-white border border-blue-200 rounded text-gray-600 select-all"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400">Certifique-se que o aluno está na mesma rede se usar IP local.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// =========================================================================
// 6. COMPONENTE RAIZ (WRAPPER)
// =========================================================================
const AppWrapper = () => {
    const [view, setView] = useState('dashboard'); 
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState(null);

    const loadExams = useCallback(async () => {
        try {
            const res = await fetch('/api/exams');
            if (res.ok) {
                const data = await res.json();
                setExams(data);
            }
        } catch (e) {
            console.error('Erro ao conectar com API:', e);
        }
    }, []);

    useEffect(() => {
        loadExams();

        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const examIdParam = urlParams.get('examId');
            if (examIdParam) {
                fetch(`/api/exams/${examIdParam}`)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.error) {
                            setExams(prev => {
                                if (prev.find(e => e.id === data.id)) return prev;
                                return [...prev, data];
                            });
                            setSelectedExamId(data.id);
                            setView('student');
                        }
                    });
            }
        }
    }, [loadExams]);

    const handleCreateExam = async (subject, questionsPayload) => {
        try {
            const res = await fetch('/api/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject, 
                    questions: questionsPayload
                })
            });
            
            if(res.ok) loadExams();
            else alert('Erro ao criar prova');
            
        } catch (e) {
            console.error(e);
            alert('Falha na conexão');
        }
    };

    const handleDeleteExam = async (id) => {
        if(confirm('Tem certeza? Isso apagará a prova e todos os resultados.')) {
            try {
                await fetch(`/api/exams/${id}`, { method: 'DELETE' });
                loadExams();
                if (selectedExamId === id) {
                    setView('dashboard');
                    setSelectedExamId(null);
                }
            } catch(e) {
                alert('Erro ao excluir');
            }
        }
    };

    const currentExam = exams.find(e => e.id === selectedExamId);

    const renderContent = () => {
        if (view === 'student') {
            if (!currentExam && selectedExamId) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando dados da prova...</div>;
            
            return <StudentExam 
                examData={currentExam} 
                onFinishExam={() => {}} 
                onBack={() => { 
                    window.history.replaceState(null, '', window.location.pathname);
                    setView('dashboard'); 
                }} 
            />;
        }
        
        if (view === 'exam-detail') {
            if (!currentExam) { setView('dashboard'); return null; }
            return <ExamDetail 
                exam={currentExam} 
                onUpdateExam={(id, data) => setExams(prev => prev.map(e => e.id === id ? data : e))} 
                onBack={() => { setView('dashboard'); setSelectedExamId(null); }} 
                onSimulate={() => setView('student')} 
            />;
        }

        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
                <div className="max-w-5xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Painel do Professor</h1>
                        <p className="text-gray-500 mt-1">Sistema Corrija v2.0 &bull; Conectado ao Neon DB</p>
                    </header>
                    <ExamList 
                        exams={exams} 
                        onCreateExam={handleCreateExam} 
                        onSelectExam={(exam) => { setSelectedExamId(exam.id); setView('exam-detail'); }} 
                        onDeleteExam={handleDeleteExam} 
                    />
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
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background-color: transparent; }
            `}</style>
        </>
    );
};

export default AppWrapper;