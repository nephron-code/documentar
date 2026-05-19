import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      birthDate: true,
      sex: true,
      diagnosis: true,
      etiology: true,
      ckdStage: true,
      albuminuria: true,
      comorbidities: true,
    },
  })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patient)
}
