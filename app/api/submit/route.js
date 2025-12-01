// app/api/submit/route.js
import pool from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { examId, studentName, matricula, answers } = await request.json();

    const client = await pool.connect();

    // 1. Buscar a Prova
    const examRes = await client.query('SELECT questions FROM exams WHERE id = $1', [examId]);
    
    if (examRes.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Prova inválida' }, { status: 404 });
    }

    const questions = examRes.rows[0].questions;
    
    // 2. Calcular a Nota
    let hits = 0;
    const total = questions.length;
    
    for (let i = 0; i < total; i++) {
        const qType = questions[i].type;
        const correctAns = questions[i].answer; // Pode ser string "A" ou array ["V", "F", ...]
        const studentAns = answers[i];

        if (qType === 'true_false' && Array.isArray(correctAns)) {
            // Lógica para V/F (5 itens): O aluno só pontua se acertar a sequência EXATA inteira
            // Se preferir pontuação parcial, a lógica mudaria aqui.
            const isCorrectSequence = Array.isArray(studentAns) && 
                studentAns.length === correctAns.length &&
                correctAns.every((val, index) => val === studentAns[index]);
            
            if (isCorrectSequence) {
                hits++;
            }
        } else {
            // Lógica antiga para Múltipla Escolha (A-E)
            if ((studentAns || '').toUpperCase() === (correctAns || '').toUpperCase()) {
                hits++;
            }
        }
    }
    
    const score = (hits / total) * 10.0;

    // 3. Salvar o Resultado
    const insertQuery = `
      INSERT INTO results 
      (exam_id, student_name, matricula, score, hits, total_questions, student_answers)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const savedResult = await client.query(insertQuery, [
      examId, 
      studentName, 
      matricula, 
      score, 
      hits, 
      total, 
      JSON.stringify(answers)
    ]);
    
    client.release();

    return NextResponse.json({
      success: true,
      score: score,
      hits: hits,
      total: total,
      timestamp: savedResult.rows[0].submitted_at
    });

  } catch (error) {
    console.error('Erro na correção:', error);
    return NextResponse.json({ error: 'Erro ao processar prova' }, { status: 500 });
  }
}