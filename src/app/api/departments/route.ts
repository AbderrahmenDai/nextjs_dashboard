import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const departments = await prisma.department.findMany();
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDept = await prisma.department.create({
      data: {
        name: body.name,
        head: body.head,
        location: body.location,
        employeeCount: body.employeeCount || 0,
        budget: body.budget,
        siteId: body.siteId,
        status: body.status,
        colorCallback: body.colorCallback,
      },
    });

    return NextResponse.json(newDept, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
