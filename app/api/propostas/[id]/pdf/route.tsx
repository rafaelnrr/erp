import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { buscarPropostaParaPdf } from "@/app/actions/propostas";

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { marginBottom: 24, borderBottom: 2, borderBottomColor: "#16a34a", paddingBottom: 12 },
  brand: { fontSize: 18, fontWeight: 700, color: "#111827" },
  subtitle: { fontSize: 10, color: "#64748b", marginTop: 2 },
  numero: { fontSize: 10, color: "#16a34a", marginTop: 8 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 18, marginBottom: 8, color: "#111827" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#64748b" },
  value: { color: "#111827" },
  table: { marginTop: 6, borderTop: 1, borderTopColor: "#e2e8f0" },
  tableRow: { flexDirection: "row", borderBottom: 1, borderBottomColor: "#e2e8f0", paddingVertical: 6 },
  tableHeader: { flexDirection: "row", paddingVertical: 6, backgroundColor: "#f1f5f9" },
  col1: { width: "40%" },
  col2: { width: "20%", textAlign: "right" },
  col3: { width: "20%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  totalBox: { marginTop: 16, alignItems: "flex-end" },
  totalValue: { fontSize: 16, fontWeight: 700, color: "#16a34a" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#94a3b8", textAlign: "center" },
});

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PropostaPdf({ numero, snapshot, criadoEm }: { numero: number; snapshot: any; criadoEm: string }) {
  const dataFormatada = new Date(criadoEm).toLocaleDateString("pt-BR");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>SolarFlow Pro</Text>
          <Text style={styles.subtitle}>Proposta comercial de sistema fotovoltaico</Text>
          <Text style={styles.numero}>Proposta Nº {numero} — {dataFormatada}</Text>
        </View>

        <Text style={styles.sectionTitle}>Cliente</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{snapshot.cliente.nome}</Text>
        </View>
        {snapshot.cliente.documento && (
          <View style={styles.row}>
            <Text style={styles.label}>Documento</Text>
            <Text style={styles.value}>{snapshot.cliente.documento}</Text>
          </View>
        )}
        {snapshot.cliente.cidade && (
          <View style={styles.row}>
            <Text style={styles.label}>Local</Text>
            <Text style={styles.value}>{snapshot.cliente.cidade}/{snapshot.cliente.uf}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Dimensionamento</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Consumo considerado</Text>
          <Text style={styles.value}>{snapshot.dimensionamento.consumo_alvo} kWh/mês</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Geração mensal estimada</Text>
          <Text style={styles.value}>{Number(snapshot.dimensionamento.geracao_estimada).toFixed(0)} kWh</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo de ligação</Text>
          <Text style={styles.value}>{snapshot.dimensionamento.tipo_ligacao ?? "—"}</Text>
        </View>

        <Text style={styles.sectionTitle}>Itens da Proposta</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Item</Text>
            <Text style={styles.col2}>Qtd.</Text>
            <Text style={styles.col3}>Preço Unit.</Text>
            <Text style={styles.col4}>Subtotal</Text>
          </View>
          {snapshot.itens.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{item.fabricante} {item.modelo}</Text>
              <Text style={styles.col2}>{item.quantidade}</Text>
              <Text style={styles.col3}>{formatBRL(item.preco_unitario)}</Text>
              <Text style={styles.col4}>{formatBRL(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.label}>Valor Total Estimado</Text>
          <Text style={styles.totalValue}>{formatBRL(snapshot.valor_total)}</Text>
        </View>

        <Text style={styles.footer}>
          Documento gerado automaticamente pelo SolarFlow Pro. Valores estimados a partir do catálogo vigente na data de emissão — não substitui projeto executivo.
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposta = await buscarPropostaParaPdf(id);

  if (!proposta) {
    return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <PropostaPdf numero={proposta.numero} snapshot={proposta.snapshot} criadoEm={proposta.criado_em} />
  );

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="proposta-${proposta.numero}.pdf"`,
    },
  });
}
