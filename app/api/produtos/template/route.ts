import ExcelJS from "exceljs";
import { CATEGORIAS_VALIDAS } from "@/utils/planilha";

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Produtos");

  sheet.columns = [
    { header: "SKU", key: "sku", width: 22 },
    { header: "Categoria", key: "categoria", width: 16 },
    { header: "Fabricante", key: "fabricante", width: 20 },
    { header: "Modelo", key: "modelo", width: 26 },
    { header: "Potência (W)", key: "potencia", width: 14 },
    { header: "CD / Origem", key: "cd", width: 14 },
    { header: "Preço (R$)", key: "preco", width: 14 },
    { header: "Quantidade", key: "quantidade", width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };

  sheet.addRow({
    sku: "MOD-EXEMPLO-550",
    categoria: "modulo",
    fabricante: "Canadian Solar",
    modelo: "HiKu6 CS6W-550MS",
    potencia: 550,
    cd: "CD-SP-01",
    preco: 620,
    quantidade: 240,
  });

  for (let i = 2; i <= 200; i++) {
    sheet.getCell(`B${i}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`"${CATEGORIAS_VALIDAS.join(",")}"`],
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modelo-produtos-hertz-solar.xlsx"',
    },
  });
}
