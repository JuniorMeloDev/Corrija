// app/api/exams/route.js
import pool from '@/app/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// GET: Lista APENAS as provas do usuário logado
export async function GET(request) {
  try {
    // Pega o ID do usuário enviado pelo Frontend
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
    }

    const client = await pool.connect();
    
    const query = `
      SELECT 
        e.*, 
        (SELECT COUNT(*) FROM results r WHERE r.exam_id = e.id) as result_count 
      FROM exams e 
      WHERE e.user_id = $1 
      ORDER BY e.created_at DESC
    `;
    
    const result = await client.query(query, [userId]);
    client.release();

    const exams = result.rows.map(row => ({
      id: row.id,
      subject: row.subject,
      questions: row.questions,
      resultsCount: parseInt(row.result_count)
    }));

    return NextResponse.json(exams);
  } catch (error) {
    console.error('Erro ao buscar provas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST: Cria uma nova prova vinculada ao usuário
export async function POST(request) {
  try {
    const userId = request.headers.get('x-user-id');
    const { subject, questions } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    if (!subject || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const id = crypto.randomBytes(3).toString('hex');

    const client = await pool.connect();
    await client.query(
      'INSERT INTO exams (id, subject, questions, user_id) VALUES ($1, $2, $3, $4)',
      [id, subject, JSON.stringify(questions), userId]
    );
    client.release();

    return NextResponse.json({ success: true, id: id });
  } catch (error) {
    console.error('Erro ao criar prova:', error);
    return NextResponse.json({ error: 'Erro ao criar prova' }, { status: 500 });
  }
}