import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { buscarPropostaParaPdf } from "@/app/actions/propostas";

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1e293b" },
  header: { flexDirection: "row", justifyContent: "space-between", borderBottom: 3, borderBottomColor: "#16a34a", paddingBottom: 12, marginBottom: 20 },
  brand: { fontSize: 18, fontWeight: 700, color: "#0f172a" },
  subtitle: { fontSize: 9, color: "#64748b", marginTop: 2 },
  headerRight: { textAlign: "right" },
  numero: { fontSize: 10, fontWeight: 700, color: "#0f172a" },
  metaText: { fontSize: 9, color: "#64748b", marginTop: 2 },

  infoGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  infoBlock: { width: "48%" },
  sectionLabel: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: 6, letterSpacing: 0.5 },
  clienteNome: { fontSize: 11, fontWeight: 700, color: "#0f172a" },
  clienteLinha: { fontSize: 9, color: "#475569", marginTop: 2 },

  statGrid: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { width: "31%", textAlign: "center" },
  statValor: { fontSize: 14, fontWeight: 700, color: "#0f172a" },
  statLabel: { fontSize: 7.5, color: "#94a3b8", marginTop: 2 },

  beneficio: { backgroundColor: "#16a34a", borderRadius: 10, padding: 18, marginBottom: 20 },
  beneficioTitulo: { fontSize: 9, fontWeight: 700, color: "#dcfce7", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  beneficioGrid: { flexDirection: "row", justifyContent: "space-between" },
  beneficioCol: { width: "48%" },
  beneficioLabel: { fontSize: 8.5, color: "#dcfce7" },
  beneficioValor: { fontSize: 22, fontWeight: 700, color: "#ffffff", marginTop: 4 },
  beneficioNota: { fontSize: 7, color: "#dcfce7", marginTop: 10 },

  section: { marginBottom: 18 },
  tableHeader: { flexDirection: "row", paddingVertical: 5, backgroundColor: "#f1f5f9", paddingHorizontal: 6 },
  tableRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 6, borderBottom: 1, borderBottomColor: "#e2e8f0" },
  colDesc: { width: "55%" },
  colQtd: { width: "15%", textAlign: "right" },
  colUnit: { width: "15%", textAlign: "right" },
  colSub: { width: "15%", textAlign: "right" },
  headerText: { fontSize: 8, fontWeight: 700, color: "#64748b", textTransform: "uppercase" },

  servicosGrid: { flexDirection: "row", justifyContent: "space-between" },
  servicosCol: { width: "48%" },
  servicoLinha: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: 1, borderBottomColor: "#f1f5f9" },

  investimento: { borderWidth: 1.5, borderColor: "#0f172a", borderRadius: 10, padding: 16, marginTop: 4 },
  investimentoTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  investimentoLabel: { fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#64748b" },
  investimentoValor: { fontSize: 20, fontWeight: 700, color: "#0f172a" },
  condicoesGrid: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: 1, borderTopColor: "#e2e8f0" },
  condicaoCol: { width: "31%" },
  condicaoLabel: { fontSize: 7.5, color: "#94a3b8" },
  condicaoValor: { fontSize: 9, fontWeight: 700, color: "#0f172a", marginTop: 2 },

  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 7.5, color: "#94a3b8", textAlign: "center" },
});

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const LABEL_RECORRENCIA: Record<string, string> = { unico: "Único", mensal: "/mês", anual: "/ano" };
const LABEL_FORMA_PAGAMENTO: Record<string, string> = { avista: "À vista", financiado: "Financiado" };

function PropostaPdf({ numero, snapshot, criadoEm }: { numero: number; snapshot: any; criadoEm: string }) {
  const dataFormatada = new Date(criadoEm).toLocaleDateString("pt-BR");
  const validadeData = new Date(new Date(criadoEm).getTime() + (snapshot.validade_dias ?? 10) * 86400000).toLocaleDateString("pt-BR");
  const dim = snapshot.dimensionamento;

  const servicosUnicos = snapshot.servicos.filter((s: any) => s.recorrencia === "unico");
  const servicosRecorrentes = snapshot.servicos.filter((s: any) => s.recorrencia !== "unico");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CAPA / CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SolarFlow Pro</Text>
            <Text style={styles.subtitle}>{snapshot.titulo || "Proposta comercial de sistema fotovoltaico"}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.numero}>Proposta Nº {numero}</Text>
            <Text style={styles.metaText}>Emitida em {dataFormatada}</Text>
            <Text style={styles.metaText}>Válida até {validadeData}</Text>
          </View>
        </View>

        {/* CLIENTE + RESUMO DO SISTEMA */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <Text style={styles.sectionLabel}>Cliente</Text>
            <Text style={styles.clienteNome}>{snapshot.cliente.nome}</Text>
            {snapshot.cliente.documento && <Text style={styles.clienteLinha}>{snapshot.cliente.documento}</Text>}
            {snapshot.cliente.cidade && <Text style={styles.clienteLinha}>{snapshot.cliente.cidade}/{snapshot.cliente.uf}</Text>}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.sectionLabel}>Resumo do Sistema</Text>
            <View style={styles.statGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValor}>{dim?.potencia_instalada_kwp ? dim.potencia_instalada_kwp.toFixed(2) : "—"}</Text>
                <Text style={styles.statLabel}>kWp instalados</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValor}>{dim ? Math.round(dim.geracao_estimada) : "—"}</Text>
                <Text style={styles.statLabel}>kWh/mês</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValor}>{dim ? dim.qtde_modulos : "—"}</Text>
                <Text style={styles.statLabel}>módulos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* BENEFÍCIO FINANCEIRO */}
        {(snapshot.economia_estimada_ano1 || snapshot.payback_meses) && (
          <View style={styles.beneficio}>
            <Text style={styles.beneficioTitulo}>Seu Retorno com Energia Solar</Text>
            <View style={styles.beneficioGrid}>
              <View style={styles.beneficioCol}>
                <Text style={styles.beneficioLabel}>Economia estimada no 1º ano</Text>
                <Text style={styles.beneficioValor}>{snapshot.economia_estimada_ano1 ? formatBRL(snapshot.economia_estimada_ano1) : "—"}</Text>
              </View>
              <View style={styles.beneficioCol}>
                <Text style={styles.beneficioLabel}>Retorno do investimento (Payback)</Text>
                <Text style={styles.beneficioValor}>{snapshot.payback_meses ? `~${Math.round(snapshot.payback_meses)} meses` : "—"}</Text>
              </View>
            </View>
            <Text style={styles.beneficioNota}>
              Estimativa com base na tarifa cadastrada do cliente e na geração média mensal do sistema. Valores reais dependem de reajustes tarifários e do padrão de consumo.
            </Text>
          </View>
        )}

        {/* ESCOPO DE FORNECIMENTO */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Escopo de Fornecimento</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colDesc]}>Item</Text>
            <Text style={[styles.headerText, styles.colQtd]}>Qtd.</Text>
            <Text style={[styles.headerText, styles.colUnit]}>Preço Unit.</Text>
            <Text style={[styles.headerText, styles.colSub]}>Subtotal</Text>
          </View>
          {snapshot.itens.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.descricao}</Text>
              <Text style={styles.colQtd}>{item.quantidade}</Text>
              <Text style={styles.colUnit}>{formatBRL(item.preco_unitario)}</Text>
              <Text style={styles.colSub}>{formatBRL(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* SERVIÇOS */}
        {snapshot.servicos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.servicosGrid}>
              <View style={styles.servicosCol}>
                <Text style={styles.sectionLabel}>Serviços Inclusos</Text>
                {servicosUnicos.length === 0 && <Text style={{ fontSize: 9, color: "#94a3b8" }}>—</Text>}
                {servicosUnicos.map((s: any, i: number) => (
                  <View key={i} style={styles.servicoLinha}>
                    <Text>{s.nome}</Text>
                    <Text>{formatBRL(s.preco)}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.servicosCol}>
                <Text style={styles.sectionLabel}>Serviços Opcionais (assinatura)</Text>
                {servicosRecorrentes.length === 0 && <Text style={{ fontSize: 9, color: "#94a3b8" }}>—</Text>}
                {servicosRecorrentes.map((s: any, i: number) => (
                  <View key={i} style={styles.servicoLinha}>
                    <Text>{s.nome}</Text>
                    <Text>{formatBRL(s.preco)}{LABEL_RECORRENCIA[s.recorrencia]}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* INVESTIMENTO E CONDIÇÕES */}
        <View style={styles.investimento}>
          <View style={styles.investimentoTopo}>
            <Text style={styles.investimentoLabel}>Investimento Total</Text>
            <Text style={styles.investimentoValor}>{formatBRL(snapshot.valor_total)}</Text>
          </View>
          <View style={styles.condicoesGrid}>
            <View style={styles.condicaoCol}>
              <Text style={styles.condicaoLabel}>Pagamento</Text>
              <Text style={styles.condicaoValor}>
                {snapshot.forma_pagamento ? LABEL_FORMA_PAGAMENTO[snapshot.forma_pagamento] : "—"}
                {snapshot.forma_pagamento === "financiado" && snapshot.parcelas ? ` em ${snapshot.parcelas}x` : ""}
              </Text>
            </View>
            <View style={styles.condicaoCol}>
              <Text style={styles.condicaoLabel}>Prazo de instalação</Text>
              <Text style={styles.condicaoValor}>{snapshot.prazo_instalacao_dias ? `${snapshot.prazo_instalacao_dias} dias úteis` : "—"}</Text>
            </View>
            <View style={styles.condicaoCol}>
              <Text style={styles.condicaoLabel}>Validade da proposta</Text>
              <Text style={styles.condicaoValor}>{snapshot.validade_dias} dias</Text>
            </View>
          </View>
          {snapshot.condicoes_pagamento && (
            <Text style={{ fontSize: 8.5, color: "#475569", marginTop: 10 }}>{snapshot.condicoes_pagamento}</Text>
          )}
        </View>

        <Text style={styles.footer}>
          SolarFlow Pro · Proposta gerada automaticamente. Valores estimados a partir do catálogo vigente na data de emissão — não substitui projeto executivo.
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposta = await buscarPropostaParaPdf(id);

  if (!proposta) {
    return NextResponse.json({ error: "Proposta não encontrada ou ainda não finalizada." }, { status: 404 });
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
