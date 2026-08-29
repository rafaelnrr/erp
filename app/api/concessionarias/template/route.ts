import ExcelJS from "exceljs";

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Concessionárias");

  sheet.columns = [{ header: "Nome", key: "nome", width: 30 }];
  sheet.getRow(1).font = { bold: true };

  sheet.addRow({ nome: "CPFL" });
  sheet.addRow({ nome: "Enel" });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modelo-concessionarias-hertz-solar.xlsx"',
    },
  });
}
