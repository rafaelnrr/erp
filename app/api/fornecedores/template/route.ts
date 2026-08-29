import ExcelJS from "exceljs";

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Fornecedores");

  sheet.columns = [
    { header: "Nome", key: "nome", width: 30 },
    { header: "Documento", key: "documento", width: 20 },
    { header: "Telefone", key: "telefone", width: 18 },
    { header: "Email", key: "email", width: 28 },
  ];
  sheet.getRow(1).font = { bold: true };

  sheet.addRow({ nome: "Distribuidora Solar Norte", documento: "12.345.678/0001-90", telefone: "(11) 99999-0000", email: "contato@distribuidorasolar.com.br" });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modelo-fornecedores-hertz-solar.xlsx"',
    },
  });
}
