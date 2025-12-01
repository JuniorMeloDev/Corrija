// app/api/exams/[id]/route.js
import pool from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params;
  
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
      ownerId: exam.user_id,
      results: resultsRes.rows.map(r => ({
        id: r.id, // Importante para chaves do React
        studentId: r.student_name,
        matricula: r.matricula,
        university: r.university, // <--- Retornando Universidade
        studentAnswers: r.student_answers, // <--- Retornando Respostas do Aluno
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

// 2. PUT: Salva o Gabarito (PROTEGIDO - Só o dono)
export async function PUT(request, { params }) {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const { questions } = body; 

        if (!questions) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

        const client = await pool.connect();
        
        // Verifica se a prova pertence ao usuário antes de atualizar
        const result = await client.query(
            'UPDATE exams SET questions = $1 WHERE id = $2 AND user_id = $3',
            [JSON.stringify(questions), id, userId]
        );
        
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Prova não encontrada ou sem permissão' }, { status: 403 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Erro ao salvar alterações' }, { status: 500 });
    }
}

// 3. DELETE: Exclui prova (PROTEGIDO - Só o dono)
export async function DELETE(request, { params }) {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const client = await pool.connect();
        
        // Verifica propriedade primeiro (opcional, mas bom para garantir)
        const checkOwner = await client.query('SELECT id FROM exams WHERE id = $1 AND user_id = $2', [id, userId]);
        if (checkOwner.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Permissão negada ou prova inexistente' }, { status: 403 });
        }

        await client.query('DELETE FROM results WHERE exam_id = $1', [id]);
        await client.query('DELETE FROM exams WHERE id = $1', [id]);
        
        client.release();
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao excluir prova' }, { status: 500 });
    }
}