import type { PrismaClient } from '@prisma/client';

function cleanNumber(value: string): number | null {
  const num = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
  return isNaN(num) ? null : num;
}

export async function parseListado(prisma: PrismaClient, documentId: string, text: string) {
  // Extract institution info
  const institutionMatch = text.match(/Institución[:\s]+([^\n]+)/i);
  const cuitMatch = text.match(/CUIT[:\s]+([\d-]+)/i);
  const periodMatch = text.match(/Per[ií]odo[:\s]+([^\n]+)/i);
  
  // Extract total
  const totalMatch = text.match(/Total[^\d]*([\d.,]+)/i);
  const total = totalMatch ? cleanNumber(totalMatch[1]) : null;

  // Create contribution batch
  const batch = await prisma.contributionBatch.create({
    data: {
      institutionName: institutionMatch?.[1]?.trim() || 'Desconocida',
      institutionCuit: cuitMatch?.[1]?.trim() || '',
      period: periodMatch?.[1]?.trim() || '',
      concept: 'Aporte sindical',
      personasCount: 0, // Will be updated after processing items
      totalAportesPeriodo: total || 0,
      reconciliationStatus: 'PENDIENTE',
      documentId
    }
  });

  // Extract items (simplified - adjust based on your actual format)
  const itemRegex = /(\d+)\s+([^\n]+?)\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)/g;
  let match;
  const items = [];

  while ((match = itemRegex.exec(text)) !== null) {
    const [_, legajo, nombre, remunerativo, aporte] = match;
    items.push({
      batchId: batch.id,
      fullNameRaw: nombre.trim(),
      legajosCount: 1,
      remunerativo: cleanNumber(remunerativo),
      aporteMonto: cleanNumber(aporte) || 0
    });
  }

  // Create items in batch
  if (items.length > 0) {
    await prisma.contributionItem.createMany({
      data: items
    });

    // Update batch with actual count
    await prisma.contributionBatch.update({
      where: { id: batch.id },
      data: { personasCount: items.length }
    });
  }

  return batch;
}