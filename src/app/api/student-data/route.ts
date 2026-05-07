import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

const DATA_FILE = join(process.cwd(), 'src/app/student/data.json');

export async function GET() {
    try {
        const content = await readFile(DATA_FILE, 'utf-8');
        const data = JSON.parse(content);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        return NextResponse.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
