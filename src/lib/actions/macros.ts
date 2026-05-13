'use server'

import { prisma } from '@/lib/prisma'
import { MACROS } from '@/lib/macros'
import { revalidatePath } from 'next/cache'

// Mapeamento: chave do macro → categoria padrão
const DEFAULT_CATEGORY: Record<string, string> = {
  '.ret': 'complaint', '.sem': 'complaint', '.eas': 'complaint',
  '.inc': 'complaint', '.disp': 'complaint', '.hip': 'complaint',
  '.drc': 'clinicalNote', '.has': 'clinicalNote', '.dm': 'clinicalNote',
  '.nd': 'clinicalNote', '.ns': 'clinicalNote', '.glom': 'clinicalNote',
  '.nlit': 'clinicalNote', '.estab': 'clinicalNote', '.prog': 'clinicalNote',
  '.prot': 'clinicalNote', '.g1': 'clinicalNote', '.g2': 'clinicalNote',
  '.g3a': 'clinicalNote', '.g3b': 'clinicalNote', '.g4': 'clinicalNote',
  '.g5': 'clinicalNote', '.tfgest': 'clinicalNote', '.anemrc': 'clinicalNote',
  '.dmo': 'clinicalNote', '.acidmet': 'clinicalNote',
  '.ret1': 'conductText', '.ret3': 'conductText', '.ret6': 'conductText',
  '.mant': 'conductText', '.ajust': 'conductText', '.enc': 'conductText',
  '.hdenc': 'conductText', '.diet': 'conductText', '.hidr': 'conductText',
  '.peso': 'conductText', '.pa': 'conductText', '.nef': 'conductText',
  '.cond1': 'conductText', '.cond2': 'conductText', '.cond3a': 'conductText',
  '.cond3b': 'conductText', '.cond4': 'conductText', '.cond5': 'conductText',
  '.inicbicar': 'conductText', '.cpo': 'conductText', '.fav': 'conductText',
  '.trs': 'conductText',
  '.enal': 'meds', '.losa': 'meds', '.amlo': 'meds', '.furos': 'meds',
  '.spiro': 'meds', '.bicar': 'meds', '.calci': 'meds', '.epo': 'meds',
  '.ferro': 'meds', '.dapa': 'meds', '.empa': 'meds', '.fine': 'meds',
  '.alop': 'meds', '.citr': 'meds', '.seve': 'meds',
}

export type MacroRecord = {
  id: string
  key: string
  value: string
  category: string
  position: number
}

/**
 * Lista todos os macros do banco, ordenados por categoria e posição.
 * Se o banco estiver vazio, retorna os macros built-in sem salvar.
 */
export async function listMacros(): Promise<MacroRecord[]> {
  const rows = await prisma.textMacro.findMany({
    orderBy: [{ category: 'asc' }, { position: 'asc' }],
  })

  if (rows.length > 0) return rows

  // Banco vazio — retorna os built-ins como referência (não persiste)
  return MACROS.map((m, i) => ({
    id: `builtin-${i}`,
    key: m.key,
    value: m.value,
    category: DEFAULT_CATEGORY[m.key] ?? 'clinicalNote',
    position: i,
  }))
}

/**
 * Salva todos os macros built-in no banco (seed inicial).
 * Idempotente: não duplica se já existirem.
 */
export async function seedDefaultMacros(): Promise<void> {
  const existing = await prisma.textMacro.count()
  if (existing > 0) return

  await prisma.textMacro.createMany({
    data: MACROS.map((m, i) => ({
      key: m.key,
      value: m.value,
      category: DEFAULT_CATEGORY[m.key] ?? 'clinicalNote',
      position: i,
    })),
    skipDuplicates: true,
  })

  revalidatePath('/configuracoes/macros')
}

/**
 * Cria ou atualiza um macro pelo seu key.
 */
export async function upsertMacro(data: {
  key: string
  value: string
  category: string
  position?: number
}): Promise<MacroRecord> {
  if (!data.key.startsWith('.') || data.key.length < 2) {
    throw new Error('Chave inválida — deve começar com ponto e ter pelo menos 2 caracteres.')
  }
  if (!data.value.trim()) {
    throw new Error('O texto expandido não pode estar vazio.')
  }

  const macro = await prisma.textMacro.upsert({
    where: { key: data.key },
    update: { value: data.value, category: data.category },
    create: {
      key: data.key,
      value: data.value,
      category: data.category,
      position: data.position ?? 999,
    },
  })

  revalidatePath('/configuracoes/macros')
  return macro
}

/**
 * Remove um macro pelo id.
 */
export async function deleteMacro(id: string): Promise<void> {
  await prisma.textMacro.delete({ where: { id } })
  revalidatePath('/configuracoes/macros')
}

/**
 * Atualiza as posições de uma lista de macros (drag-and-drop / reordenação).
 */
export async function reorderMacros(
  items: { id: string; position: number }[]
): Promise<void> {
  await Promise.all(
    items.map(({ id, position }) =>
      prisma.textMacro.update({ where: { id }, data: { position } })
    )
  )
  revalidatePath('/configuracoes/macros')
}
