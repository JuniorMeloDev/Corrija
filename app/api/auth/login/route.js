// app/api/auth/login/route.js
import pool from '@/app/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const client = await pool.connect();
    
    // Buscar usuário pelo email
    const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    client.release();

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const user = res.rows[0];

    // Verificar a senha
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Retorna sucesso
    return NextResponse.json({ 
      success: true, 
      user: { email: user.email, id: user.id } 
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}