export type DocumentType = 'LISTADO_APORTE' | 'COMPROBANTE_BANCO' | 'DESCONOCIDO';

export function classify(text: string): DocumentType {
  const t = text.toLowerCase().replace(/\s+/g, ' ');

  // Check for listado patterns
  const isListado = (
    (t.includes('periodo') || t.includes('período')) &&
    (t.includes('aporte') || t.includes('aportes')) &&
    (t.includes('total') || t.includes('totales'))
  );

  // Check for comprobante patterns
  const isComprobante = (
    (t.includes('cbu') || t.includes('transferencia')) &&
    (t.includes('importe') || t.includes('monto')) &&
    (t.includes('referencia') || t.includes('operacion') || t.includes('operación'))
  );

  if (isListado && !isComprobante) return 'LISTADO_APORTE';
  if (isComprobante) return 'COMPROBANTE_BANCO';
  return 'DESCONOCIDO';
}