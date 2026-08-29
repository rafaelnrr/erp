import ExcelJS from "exceljs";

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Serviços");

  sheet.columns = [
    { header: "Nome", key: "nome", width: 28 },
    { header: "Descrição", key: "descricao", width: 30 },
    { header: "Recorrência", key: "recorrencia", width: 14 },
    { header: "Tempo Execução", key: "tempo", width: 16 },
    { header: "Unidade Tempo", key: "unidade", width: 14 },
    { header: "Custo Interno", key: "custo", width: 14 },
    { header: "Preço de Venda", key: "preco", width: 16 },
    { header: "Ativo", key: "ativo", width: 10 },
  ];
  sheet.getRow(1).font = { bold: true };

  sheet.addRow({
    nome: "Limpeza de Módulos",
    descricao: "Limpeza semestral dos módulos fotovoltaicos",
    recorrencia: "mensal",
    tempo: 2,
    unidade: "horas",
    custo: 80,
    preco: 150,
    ativo: "sim",
  });

  for (let i = 2; i <= 200; i++) {
    sheet.getCell(`C${i}`).dataValidation = { type: "list", allowBlank: true, formulae: ['"unico,mensal,anual"'] };
    sheet.getCell(`E${i}`).dataValidation = { type: "list", allowBlank: true, formulae: ['"horas,dias"'] };
    sheet.getCell(`H${i}`).dataValidation = { type: "list", allowBlank: true, formulae: ['"sim,nao"'] };
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modelo-servicos-hertz-solar.xlsx"',
    },
  });
}
