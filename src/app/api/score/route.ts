import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SCORE_FILE_PATH = path.join(process.cwd(), 'src/data/score.json');

export async function GET() {
  try {
    if (!fs.existsSync(SCORE_FILE_PATH)) {
      return NextResponse.json({ highScore: 0 });
    }
    const data = fs.readFileSync(SCORE_FILE_PATH, 'utf8');
    const { highScore } = JSON.parse(data);
    return NextResponse.json({ highScore: highScore || 0 });
  } catch (error) {
    console.error('Error reading score:', error);
    return NextResponse.json({ highScore: 0 });
  }
}

export async function POST(req: Request) {
  try {
    const { newScore } = await req.json();
    
    if (typeof newScore !== 'number') {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    let currentHigh = 0;
    if (fs.existsSync(SCORE_FILE_PATH)) {
      const data = fs.readFileSync(SCORE_FILE_PATH, 'utf8');
      currentHigh = JSON.parse(data).highScore || 0;
    }

    if (newScore > currentHigh) {
      fs.writeFileSync(SCORE_FILE_PATH, JSON.stringify({ highScore: newScore }, null, 2));
      return NextResponse.json({ success: true, highScore: newScore });
    }

    return NextResponse.json({ success: true, highScore: currentHigh });
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
