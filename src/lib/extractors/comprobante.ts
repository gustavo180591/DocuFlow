import type { PrismaClient } from '@prisma/client';

function cleanNumber(value: string): number | null {
  const num = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
  return isNaN(num) ? null : num;
}

export async function parseComprobante(prisma: PrismaClient, documentId: string, text: string) {
  // Extract transfer details
  const cbuMatch = text.match(/CBU[:\s]+([\d-]+)/i);
  const cuitMatch = text.match(/CUIT[:\s]+([\d-]+)/i);
  const referenciaMatch = text.match(/Referencia[:\s]+([^\n]+)/i);
  const operacionMatch = text.match(/Operaci[oó]n[:\s]+([^\n]+)/i);
  const fechaMatch = text.match(/Fecha[:\s]+([\d/]+)/i);
  const importeMatch = text.match(/Importe[^\d]*([\d.,]+)/i);

  // Create bank transfer record
  const transfer = await prisma.bankTransfer.create({
    data: {
      beneficiaryName: null, // Could be extracted if available
      beneficiaryCuit: cuitMatch?.[1]?.trim() || null,
      cbu: cbuMatch?.[1]?.trim() || null,
      fecha: fechaMatch?.[1] ? new Date(fechaMatch[1]) : null,
      nroOperacion: operacionMatch?.[1]?.trim() || null,
      nroReferencia: referenciaMatch?.[1]?.trim() || null,
      importe: importeMatch ? cleanNumber(importeMatch[1]) || 0 : 0,
      documentId
    }
  });

  return transfer;
}