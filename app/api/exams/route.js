// app/api/exams/route.js
import pool from '@/app/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// GET: Lista todas as provas e seus resultados
export async function GET() {
  try {
    const client = await pool.connect();
    
    const query = `
      SELECT 
        e.*, 
        (SELECT COUNT(*) FROM results r WHERE r.exam_id = e.id) as result_count 
      FROM exams e 
      ORDER BY e.created_at DESC
    `;
    
    const result = await client.query(query);
    client.release();

    const exams = result.rows.map(row => ({
      id: row.id,
      subject: row.subject,
      questions: row.questions, // Retorna a estrutura completa (tipos + respostas)
      resultsCount: parseInt(row.result_count)
    }));

    return NextResponse.json(exams);
  } catch (error) {
    console.error('Erro ao buscar provas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST: Cria uma nova prova
export async function POST(request) {
  try {
    const { subject, questions } = await request.json();
    
    // Validação básica
    if (!subject || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Gera um ID curto aleatório (ex: 'a1b2c3')
    const id = crypto.randomBytes(3).toString('hex');

    const client = await pool.connect();
    await client.query(
      'INSERT INTO exams (id, subject, questions) VALUES ($1, $2, $3)',
      [id, subject, JSON.stringify(questions)]
    );
    client.release();

    return NextResponse.json({ success: true, id: id });
  } catch (error) {
    console.error('Erro ao criar prova:', error);
    return NextResponse.json({ error: 'Erro ao criar prova' }, { status: 500 });
  }
}
