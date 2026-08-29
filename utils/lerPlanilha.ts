import ExcelJS from "exceljs";
import { Readable } from "node:stream";

/** Lê um .xlsx ou .csv (pelo nome do arquivo) e devolve a primeira planilha. Só deve ser chamado a partir de código server-side. */
export async function lerPlanilha(buffer: Buffer, nomeArquivo: string): Promise<ExcelJS.Worksheet | null> {
  const ehCsv = /\.csv$/i.test(nomeArquivo);

  if (ehCsv) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = await workbook.csv.read(Readable.from(buffer));
    return worksheet ?? null;
  }

  const workbook = new ExcelJS.Workbook();
  // exceljs traz sua própria cópia de @types/node, com um tipo Buffer incompatível em compilação (mas idêntico em runtime)
  await workbook.xlsx.load(buffer as any);
  return workbook.worksheets[0] ?? null;
}
