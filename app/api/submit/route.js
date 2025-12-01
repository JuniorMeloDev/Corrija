// app/api/submit/route.js
import pool from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Receber o campo 'university'
    const { examId, studentName, matricula, university, answers } = await request.json();

    const client = await pool.connect();

    // Buscar a Prova
    const examRes = await client.query('SELECT questions FROM exams WHERE id = $1', [examId]);
    
    if (examRes.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Prova inválida' }, { status: 404 });
    }

    const questions = examRes.rows[0].questions;
    
    // Calcular a Nota (Lógica V/F parcial + Múltipla Escolha)
    let hits = 0;
    const total = questions.length;
    
    for (let i = 0; i < total; i++) {
        const qType = questions[i].type;
        const correctAns = questions[i].answer;
        const studentAns = answers[i];

        if (qType === 'true_false' && Array.isArray(correctAns)) {
            if (Array.isArray(studentAns)) {
                correctAns.forEach((val, index) => {
                    if (val && studentAns[index] === val) {
                        hits += 0.2;
                    }
                });
            }
        } else {
            if ((studentAns || '').toUpperCase() === (correctAns || '').toUpperCase()) {
                hits += 1.0;
            }
        }
    }
    
    hits = parseFloat(hits.toFixed(2));
    const score = (hits / total) * 10.0;

    // 2. Inserir a universidade no banco
    const insertQuery = `
      INSERT INTO results 
      (exam_id, student_name, matricula, university, score, hits, total_questions, student_answers)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const savedResult = await client.query(insertQuery, [
      examId, 
      studentName, 
      matricula, 
      university || 'N/A', // Valor padrão se estiver vazio
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