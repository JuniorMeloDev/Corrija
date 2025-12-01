// app/api/exams/[id]/route.js
import pool from '@/app/lib/db';
import { NextResponse } from 'next/server';

// 1. GET: Busca detalhes
export async function GET(request, { params }) {
  const { id } = await params; // <--- CORREÇÃO AQUI (Adicionado await)
  
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
      questions: exam.questions,
      results: resultsRes.rows.map(r => ({
        studentId: r.student_name,
        matricula: r.matricula,
        score: parseFloat(r.score),
        hits: r.hits,
        timestamp: r.submitted_at
      }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// 2. PUT: Salva o Gabarito
export async function PUT(request, { params }) {
    const { id } = await params; // <--- CORREÇÃO AQUI (Adicionado await)
    console.log(`[API] 🟡 Iniciando PUT para prova ID: ${id}`); 

    try {
        const body = await request.json();
        const { questions } = body; 

        if (!questions) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }

        const client = await pool.connect();
        
        // Query de atualização
        const result = await client.query(
            'UPDATE exams SET questions = $1 WHERE id = $2',
            [JSON.stringify(questions), id]
        );
        
        client.release();

        if (result.rowCount === 0) {
            console.warn(`[API] ⚠️ Aviso: Nenhuma prova encontrada com ID ${id} para atualizar.`);
            return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[API] 💥 ERRO CRÍTICO NO PUT:', error);
        return NextResponse.json({ error: 'Erro ao salvar alterações', details: error.message }, { status: 500 });
    }
}

// 3. DELETE: Exclui prova
export async function DELETE(request, { params }) {
    const { id } = await params; // <--- CORREÇÃO AQUI (Adicionado await)
    console.log(`[API] 🔴 Iniciando DELETE para prova ID: ${id}`);

    try {
        const client = await pool.connect();
        
        await client.query('DELETE FROM results WHERE exam_id = $1', [id]);
        const result = await client.query('DELETE FROM exams WHERE id = $1', [id]);
        
        client.release();
        
        if (result.rowCount === 0) {
             return NextResponse.json({ error: 'Prova não encontrada para exclusão' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] 💥 ERRO CRÍTICO NO DELETE:', error);
        return NextResponse.json({ error: 'Erro ao excluir prova', details: error.message }, { status: 500 });
    }
}