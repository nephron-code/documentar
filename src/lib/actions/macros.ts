'use server'

import { prisma } from '@/lib/prisma'
import { MACROS } from '@/lib/macros'
import { revalidatePath } from 'next/cache'

// Mapeamento: chave do macro → categoria padrão
const DEFAULT_CATEGORY: Record<string, string> = {
  '//ret': 'complaint', '//sem': 'complaint', '//eas': 'complaint',
  '//inc': 'complaint', '//disp': 'complaint', '//hip': 'complaint',
  '//nic': 'complaint', '//hema': 'complaint', '//olig': 'complaint',
  '//colic': 'complaint', '//qdrc': 'complaint', '//qhas': 'complaint',
  '//qdm': 'complaint', '//qglom': 'complaint', '//qlit': 'complaint',
  '//ef': 'complaint', '//efsem': 'complaint', '//efed': 'complaint',
  '//drc': 'clinicalNote', '//has': 'clinicalNote', '//dm': 'clinicalNote',
  '//nd': 'clinicalNote', '//ns': 'clinicalNote', '//glom': 'clinicalNote',
  '//nlit': 'clinicalNote', '//estab': 'clinicalNote', '//prog': 'clinicalNote',
  '//prot': 'clinicalNote', '//g1': 'clinicalNote', '//g2': 'clinicalNote',
  '//g3a': 'clinicalNote', '//g3b': 'clinicalNote', '//g4': 'clinicalNote',
  '//g5': 'clinicalNote', '//tfgest': 'clinicalNote', '//tfgq': 'clinicalNote',
  '//tfgm': 'clinicalNote', '//anemrc': 'clinicalNote', '//anemfe': 'clinicalNote',
  '//dmo': 'clinicalNote', '//acidmet': 'clinicalNote', '//hipk': 'clinicalNote',
  '//hypok': 'clinicalNote', '//protr': 'clinicalNote', '//protp': 'clinicalNote',
  '//avdrc': 'clinicalNote', '//avnd': 'clinicalNote',
  '//qhasr': 'clinicalNote', '//adhasr': 'clinicalNote', '//tecpa': 'clinicalNote',
  '//mapa': 'clinicalNote', '//mrpa': 'clinicalNote', '//saos': 'clinicalNote',
  '//haldos': 'clinicalNote', '//doppler': 'clinicalNote', '//feocro': 'clinicalNote',
  '//hasrescl': 'clinicalNote', '//avhasr': 'clinicalNote',
  '//ret1': 'conductText', '//ret3': 'conductText', '//ret6': 'conductText',
  '//mant': 'conductText', '//ajust': 'conductText', '//enc': 'conductText',
  '//hdenc': 'conductText', '//diet': 'conductText', '//hidr': 'conductText',
  '//peso': 'conductText', '//pa': 'conductText', '//nef': 'conductText',
  '//cond1': 'conductText', '//cond2': 'conductText', '//cond3a': 'conductText',
  '//cond3b': 'conductText', '//cond4': 'conductText', '//cond5': 'conductText',
  '//inicbicar': 'conductText', '//cpo': 'conductText', '//fav': 'conductText',
  '//trs': 'conductText', '//espadd': 'conductText', '//hasrond': 'conductText',
  '//hasrret': 'conductText', '//diurtico': 'conductText', '//bloqca': 'conductText',
  '//enal': 'meds', '//losa': 'meds', '//amlo': 'meds', '//furos': 'meds',
  '//spiro': 'meds', '//bicar': 'meds', '//calci': 'meds', '//epo': 'meds',
  '//ferro': 'meds', '//dapa': 'meds', '//empa': 'meds', '//fine': 'meds',
  '//alop': 'meds', '//citr': 'meds', '//seve': 'meds',
  '//chlort': 'meds', '//indap': 'meds', '//cloni': 'meds', '//hidral': 'meds',
  '//mino': 'meds', '//doxaz': 'meds', '//bisop': 'meds', '//carve': 'meds',
}

export type MacroRecord = {
  id: string
  key: string
  value: string
  category: string
  position: number
}

/**
 * Lista todos os macros do banco, mesclados com os built-ins que ainda não foram salvos.
 * Garante que adicionar um macro customizado não apaga os built-ins da listagem.
 */
export async function listMacros(): Promise<MacroRecord[]> {
  const rows = await prisma.textMacro.findMany({
    orderBy: [{ category: 'asc' }, { position: 'asc' }],
  })

  // Built-ins que não estão no banco aparecem como fallback (posição alta)
  const dbKeys = new Set(rows.map(r => r.key))
  const builtinFallbacks: MacroRecord[] = MACROS
    .filter(m => !dbKeys.has(m.key))
    .map((m, i) => ({
      id: `builtin:${m.key}`,
      key: m.key,
      value: m.value,
      category: DEFAULT_CATEGORY[m.key] ?? 'clinicalNote',
      position: 1000 + i,
    }))

  return [...rows, ...builtinFallbacks].sort((a, b) => {
    const catDiff = a.category.localeCompare(b.category)
    return catDiff !== 0 ? catDiff : a.position - b.position
  })
}

/**
 * Salva todos os macros built-in no banco (seed inicial).
 * Idempotente: não duplica se já existirem.
 */
export async function seedDefaultMacros(): Promise<void> {
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
  if (!data.key.startsWith('//') || data.key.length < 3) {
    throw new Error('Chave inválida — deve começar com // e ter pelo menos 1 caractere após (ex: //ret).')
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
 * Remove um macro pelo id. Macros built-in (id começa com "builtin:") não existem no banco —
 * retorna silenciosamente (o chamador remove do estado local).
 */
export async function deleteMacro(id: string): Promise<void> {
  if (id.startsWith('builtin:')) return
  await prisma.textMacro.delete({ where: { id } })
  revalidatePath('/configuracoes/macros')
}

/**
 * Migra macros com prefixo "." (formato antigo) para "//" (formato novo).
 * Retorna a quantidade de macros migrados.
 */
export async function migrateMacroPrefixes(): Promise<number> {
  const old = await prisma.textMacro.findMany({ where: { key: { startsWith: '.' } } })
  let migrated = 0
  for (const m of old) {
    const newKey = '//' + m.key.slice(1)
    await prisma.textMacro.upsert({
      where: { key: newKey },
      update: { value: m.value, category: m.category },
      create: { key: newKey, value: m.value, category: m.category, position: m.position },
    })
    await prisma.textMacro.delete({ where: { id: m.id } })
    migrated++
  }
  revalidatePath('/configuracoes/macros')
  return migrated
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
