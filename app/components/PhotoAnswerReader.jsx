"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { readBubbleSheetFromImage } from "@/app/lib/omr";

const normalizeAnswer = (value) => (value ? String(value).toUpperCase() : "-");

export default function PhotoAnswerReader({
  isOpen,
  questions,
  onClose,
  onApply,
}) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [sheetMode, setSheetMode] = useState("two_column");
  const importInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl("");
      setIsAnalyzing(false);
      setError("");
      setResult(null);
      setSheetMode("two_column");
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const detectedCount = useMemo(() => {
    if (!result?.answers) return 0;
    return result.answers.filter(Boolean).length;
  }, [result]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setError("");
    setIsAnalyzing(true);
    setResult(null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);

    try {
      const analysis = await readBubbleSheetFromImage(
        selectedFile,
        questions,
        sheetMode
      );
      setResult(analysis);
    } catch (err) {
      setError(err.message || "Falha ao ler a foto.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openImportPicker = () => importInputRef.current?.click();
  const openCameraPicker = () => cameraInputRef.current?.click();

  const handleApply = () => {
    if (!result) return;
    onApply(result.answers, result.scorePreview, result.warnings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Leitura por foto
            </h3>
            <p className="text-sm text-slate-500">
              Envie a folha marcada e confira a nota antes de confirmar.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold"
          >
            Fechar
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-bold text-slate-700 block">
                      Foto da folha
                    </span>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={openImportPicker}
                        className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100"
                      >
                        Importar imagem
                      </button>
                      <button
                        type="button"
                        onClick={openCameraPicker}
                        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Tirar foto
                      </button>
                    </div>

                    <input
                      ref={importInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <label className="block mt-4">
                  <span className="text-sm font-bold text-slate-700">
                    Modelo da folha
                  </span>
                  <select
                    value={sheetMode}
                    onChange={(e) => setSheetMode(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="two_column">2 colunas (layout atual)</option>
                    <option value="one_column">1 coluna (1 a 10 em sequência)</option>
                  </select>
                </label>
                <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                  Melhor resultado com a folha inteira visível, sem corte e com
                  boa iluminação. Este modelo está calibrado para 10 questões
                  A-E, no estilo concurso.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              {(isAnalyzing || result) && (
                <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Resultado da leitura
                    </span>
                    {isAnalyzing && (
                      <span className="text-xs rounded-full bg-blue-50 text-blue-700 px-3 py-1 font-bold">
                        Analisando...
                      </span>
                    )}
                  </div>

                  {result && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="text-xs text-slate-500">
                            Questões detectadas
                          </div>
                          <div className="text-lg font-extrabold text-slate-900">
                            {detectedCount}/{questions.length}
                          </div>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3">
                          <div className="text-xs text-blue-700">
                            Nota estimada
                          </div>
                          <div className="text-lg font-extrabold text-blue-800">
                            {Number(result.scorePreview.score).toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {result.warnings?.length > 0 && (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                          <div className="font-bold mb-1">Atenção</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {result.warnings.map((warning) => (
                              <li key={warning}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {questions.map((question, index) => {
                          const detectedAnswer = normalizeAnswer(
                            result.answers?.[index]
                          );
                          const officialAnswer = normalizeAnswer(question?.answer);
                          const isMatch =
                            detectedAnswer !== "-" && detectedAnswer === officialAnswer;

                          return (
                          <div
                            key={index}
                            className={`rounded-xl border p-2 text-center ${
                              isMatch
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <div className="text-[10px] uppercase text-slate-400 font-bold">
                              Q{index + 1}
                            </div>
                            <div className="mt-1 text-[11px] text-slate-500">
                              Lido
                            </div>
                            <div className="text-sm font-extrabold text-slate-900">
                              {detectedAnswer}
                            </div>
                            <div className="mt-2 text-[11px] text-slate-500">
                              Oficial
                            </div>
                            <div className="text-sm font-extrabold text-blue-700">
                              {officialAnswer}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 min-h-[360px] flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Pré-visualização da foto da folha"
                  width={1200}
                  height={1600}
                  unoptimized
                  className="max-w-full max-h-[520px] object-contain rounded-xl shadow-md bg-white"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <div className="text-lg font-bold">Prévia da foto</div>
                  <p className="text-sm mt-2">
                    A imagem enviada aparece aqui para conferência.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!result || isAnalyzing}
            className="px-5 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            Aplicar respostas lidas
          </button>
        </div>
      </div>
    </div>
  );
}
