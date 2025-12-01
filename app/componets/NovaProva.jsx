'use client';

import React, { useState, useEffect } from 'react';

const NovaProva = ({ isOpen, onClose, onCreate }) => {
    // Estados locais do formulário
    const [subjectName, setSubjectName] = useState('');
    const [numQuestions, setNumQuestions] = useState(10);
    const [questionTypes, setQuestionTypes] = useState(Array(10).fill('multiple_choice'));

    // Reseta o form quando abre/fecha
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSubjectName('');
            setNumQuestions(10);
            setQuestionTypes(Array(10).fill('multiple_choice'));
        }
    }, [isOpen]);

    // Sincroniza tamanho do array de tipos com o número de questões
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQuestionTypes(prev => {
            const newArr = new Array(Number(numQuestions)).fill('multiple_choice');
            // Preserva escolhas anteriores
            for(let i=0; i < Math.min(prev.length, newArr.length); i++) {
                newArr[i] = prev[i];
            }
            return newArr;
        });
    }, [numQuestions]);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Overlay clicável para fechar (opcional) */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] relative z-10 animate-scale-in">
                {/* Cabeçalho */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 m">Criar Nova Disciplina</h3>
                        <p className="text-sm text-gray-500">Configure os detalhes da avaliação</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Corpo com Scroll */}
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
                                onChange={e => setNumQuestions(Number(e.target.value))} 
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

                {/* Rodapé Fixo */}
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

export default NovaProva;