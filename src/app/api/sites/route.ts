import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
        include: {
            departments: true
        }
    });

    // We can verify if sites exist or seed them if empty
    if (sites.length === 0) {
        // Simple seed for Sites if running for first time
        await prisma.site.createMany({
            data: [
                { id: "TT", name: "TT", budget: 5000000, description: "Main Manufacturing Site" },
                { id: "TTG", name: "TTG", budget: 3500000, description: "Global Distribution Center" },
            ]
        });
        const seededSites = await prisma.site.findMany();
        return NextResponse.json(seededSites);
    }

    return NextResponse.json(sites);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        // Expecting { id: "TT", budget: 123 }
        
        const updatedSite = await prisma.site.update({
            where: { id: body.id },
            data: {
                budget: body.budget
            }
        });

        return NextResponse.json(updatedSite);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update site' }, { status: 500 });
    }
}
