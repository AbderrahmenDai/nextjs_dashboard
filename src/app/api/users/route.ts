import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: true,
      },
    });

    // Transform to match frontend interface if needed
    const formattedUsers = users.map((user: any) => ({
      ...user,
      department: user.department?.name || 'Unassigned', // Flatten department name for frontend display
      // Ensure role matches specific frontend types if strict, otherwise string is fine
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Ideally look up department ID by name if frontend sends name
    let departmentId = body.departmentId;
    if (!departmentId && body.department) {
      const dept = await prisma.department.findFirst({
        where: { name: body.department }
      });
      if (dept) departmentId = dept.id;
    }

    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
        departmentId: departmentId,
        status: body.status,
        avatarGradient: body.avatarGradient || "from-gray-500 to-slate-500",
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
