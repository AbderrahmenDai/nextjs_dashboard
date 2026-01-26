import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedDept = await prisma.department.update({
      where: { id },
      data: {
        name: body.name,
        head: body.head,
        location: body.location,
        budget: body.budget,
        siteId: body.siteId,
        status: body.status,
        colorCallback: body.colorCallback,
      },
    });

    return NextResponse.json(updatedDept);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
