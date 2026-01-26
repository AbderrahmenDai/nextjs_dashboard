import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Handle department name to ID lookup if necessary
    let departmentId = body.departmentId;
    if (!departmentId && body.department) {
      const dept = await prisma.department.findFirst({
        where: { name: body.department }
      });
      if (dept) departmentId = dept.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        departmentId: departmentId,
        status: body.status,
        // Update password only if provided
        ...(body.password ? { password: body.password } : {}),
      },
      include: {
          department: true
      }
    });

    return NextResponse.json({
        ...updatedUser,
        department: updatedUser.department?.name || "Unassigned"
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
