// app/api/exams/[id]/route.js
import pool from '@/app/lib/db';
import { NextResponse } from 'next/server';

// GET: Busca detalhes e resultados
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const client = await pool.connect();

    const examRes = await client.query('SELECT * FROM exams WHERE id = $1', [id]);
    if (examRes.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 });
    }

    const resultsRes = await client.query(
      'SELECT * FROM results WHERE exam_id = $1 ORDER BY submitted_at DESC', 
      [id]
    );
    client.release();

    const exam = examRes.rows[0];
    
    return NextResponse.json({
      id: exam.id,
      subject: exam.subject,
      questions: exam.questions, // Frontend precisa disso para renderizar as bolhas corretas (A-E ou V/F)
      results: resultsRes.rows.map(r => ({
        studentId: r.student_name,
        matricula: r.matricula,
        score: parseFloat(r.score),
        hits: r.hits,
        timestamp: r.submitted_at
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar detalhes:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE: Exclui uma prova
export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        const client = await pool.connect();
        await client.query('DELETE FROM exams WHERE id = $1', [id]);
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
    }
}