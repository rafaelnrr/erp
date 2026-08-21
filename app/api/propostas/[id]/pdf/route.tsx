import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { buscarPropostaParaPdf } from "@/app/actions/propostas";

export const runtime = "nodejs";

// ==========================================================
// Dados fixos da empresa — mesmos em toda proposta gerada.
// (Ainda não há tela de configuração pra isso; editar aqui por enquanto.)
// ==========================================================
const EMPRESA = {
  nomeCurto: "HERTZ",
  nomeLongo: "HERTZ SOLAR",
  slogan: "ENERGIA E INOVAÇÃO",
  email: "engenharia@hertzbr.com.br",
  telefones: "83-99607-0428 | 88-99845-1682",
  cargoAssinatura: "Eng. Eletricista",
};

const BRANDS = ["Growatt", "Canadian Solar", "Solis", "Jinko Solar", "SAJ", "JA Solar"];

const ETAPAS = [
  { n: "01", titulo: "Proposta, negociação e contrato" },
  { n: "02", titulo: "Projeto e homologação na concessionária de energia" },
  { n: "03", titulo: "Instalação e comissionamento dos equipamentos" },
  { n: "04", titulo: "Vistoria e energização" },
  { n: "05", titulo: "Monitoramento e manutenção" },
];

const VANTAGENS = [
  "Pay Back rápido",
  "Investimento com Rentabilidade Superior à Poupança e Tesouro (Selic)",
  "Garantia de Geração de 25 anos",
  "Valorização da propriedade",
  "Isenção da inflação de reajuste na Tarifa de Energia de até 14% anual",
  "Energia Renovável",
  "Crédito de carbono",
];

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1e293b" },
  pageNavy: { backgroundColor: "#0b1d3a", padding: 40, fontFamily: "Helvetica", color: "#ffffff" },

  // capa
  capaHeader: { fontSize: 22, fontWeight: 700, color: "#0b1d3a" },
  capaSlogan: { fontSize: 8, color: "#64748b", marginTop: 2, letterSpacing: 1 },
  capaCliente: { fontSize: 14, fontWeight: 700, marginTop: 40, color: "#0b1d3a" },
  capaHero: { backgroundColor: "#0b1d3a", height: 340, marginTop: 30, marginHorizontal: -40, alignItems: "center", justifyContent: "center" },
  capaHeroSol: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#f5b83d" },
  capaBanner: { backgroundColor: "#0b1d3a", paddingVertical: 18, marginHorizontal: -40, alignItems: "center" },
  capaBannerTexto: { fontSize: 18, fontWeight: 700, color: "#ffffff", letterSpacing: 1 },
  capaFooter: { backgroundColor: "#f5b83d", paddingVertical: 14, marginHorizontal: -40, marginTop: "auto", alignItems: "center" },
  capaFooterTexto: { fontSize: 10, fontWeight: 700, color: "#0b1d3a" },

  // cronograma
  cronogramaTitulo: { fontSize: 20, fontWeight: 700, marginBottom: 30, lineHeight: 1.3 },
  etapaLinha: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  etapaCirculo: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "#f5b83d", backgroundColor: "#14b8a6", alignItems: "center", justifyContent: "center", marginRight: 16 },
  etapaNumero: { fontSize: 13, fontWeight: 700, color: "#0b1d3a" },
  etapaTitulo: { fontSize: 13, fontWeight: 700, marginBottom: 3 },
  etapaTexto: { fontSize: 10, color: "#cbd5e1", maxWidth: 380 },

  // texto corrido
  h1: { fontSize: 13, fontWeight: 700, marginBottom: 10 },
  h2: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 4 },
  paragrafo: { fontSize: 9.5, lineHeight: 1.5, marginBottom: 8, textAlign: "justify" },

  brand: { fontSize: 12, fontWeight: 700, color: "#0f172a" },
  dataLinha: { fontSize: 9, color: "#64748b", textAlign: "right", marginBottom: 14 },

  tableHeader: { flexDirection: "row", backgroundColor: "#0b1d3a", paddingVertical: 5, paddingHorizontal: 6 },
  tableHeaderText: { fontSize: 8, fontWeight: 700, color: "#ffffff", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderBottom: 1, borderBottomColor: "#e2e8f0" },
  tableRowAlt: { backgroundColor: "#f8fafc" },
  colItem: { width: "6%" },
  colDesc: { width: "72%" },
  colUnd: { width: "11%", textAlign: "center" },
  colQtd: { width: "11%", textAlign: "center" },

  specGrid: { marginTop: 4 },
  specLinha: { fontSize: 9.5, marginBottom: 3 },

  destaqueBox: { backgroundColor: "#fef9c3", padding: 8, marginVertical: 6 },
  destaqueTexto: { fontSize: 10, fontWeight: 700, color: "#0b1d3a" },

  retornoBox: { backgroundColor: "#e0e7ff", borderRadius: 8, padding: 14, marginTop: 8, alignItems: "center" },
  retornoTexto: { fontSize: 12, fontWeight: 700, color: "#1e3a8a" },

  vantagemLinha: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  vantagemMarcador: { width: 7, height: 7, borderRadius: 2, backgroundColor: "#16a34a", marginRight: 8 },
  vantagemTexto: { fontSize: 9.5, flex: 1 },

  brandsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20 },
  brandChip: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  brandChipTexto: { fontSize: 9, fontWeight: 700, color: "#475569" },

  investBox: { borderWidth: 2, borderColor: "#0b1d3a", borderRadius: 8, padding: 16, marginTop: 10, alignItems: "center" },
  investLabel: { fontSize: 10, color: "#475569" },
  investValor: { fontSize: 13, fontWeight: 700, color: "#0b1d3a", marginTop: 2 },
  avistaValor: { fontSize: 20, fontWeight: 700, color: "#0b1d3a", backgroundColor: "#fef08a", paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },

  assinaturaBox: { marginTop: 50, alignItems: "center" },
  assinaturaNome: { fontSize: 10, fontWeight: 700 },
  assinaturaCargo: { fontSize: 9, color: "#64748b" },

  footerBand: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#f5b83d", paddingVertical: 10, alignItems: "center" },
  footerBandTexto: { fontSize: 8.5, fontWeight: 700, color: "#0b1d3a" },
});

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatTempoRetorno(meses: number | null) {
  if (!meses) return "—";
  const anos = Math.floor(meses / 12);
  const restoMeses = Math.round(meses % 12);
  const partes: string[] = [];
  if (anos > 0) partes.push(`${anos} ano${anos > 1 ? "s" : ""}`);
  if (restoMeses > 0) partes.push(`${restoMeses} ${restoMeses > 1 ? "meses" : "mês"}`);
  return partes.join(" e ") || "menos de 1 mês";
}

function PropostaPdf({ numero, snapshot, criadoEm }: { numero: number; snapshot: any; criadoEm: string }) {
  const dim = snapshot.dimensionamento;
  const itens = snapshot.itens ?? [];
  const servicos = snapshot.servicos ?? [];
  const todasLinhas = [
    ...itens.map((i: any) => ({ descricao: i.descricao, und: "un", qtd: i.quantidade })),
    ...servicos.map((s: any) => ({ descricao: s.nome, und: "serv", qtd: 1 })),
  ];

  const dataFormatada = new Date(criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const local = snapshot.cliente?.cidade && snapshot.cliente?.uf ? `${snapshot.cliente.cidade}, ` : "";

  return (
    <Document>
      {/* PÁGINA 1 — CAPA */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{EMPRESA.nomeLongo}</Text>
        <Text style={styles.capaSlogan}>{EMPRESA.slogan}</Text>
        <Text style={styles.capaCliente}>Cliente: {(snapshot.cliente?.nome ?? "—").toUpperCase()}</Text>

        <View style={styles.capaHero}>
          <View style={styles.capaHeroSol} />
        </View>
        <View style={styles.capaBanner}>
          <Text style={styles.capaBannerTexto}>PROPOSTA COMERCIAL</Text>
        </View>
        <View style={styles.capaFooter}>
          <Text style={styles.capaFooterTexto}>{EMPRESA.email}  ·  {EMPRESA.telefones}</Text>
        </View>
      </Page>

      {/* PÁGINA 2 — CRONOGRAMA */}
      <Page size="A4" style={styles.pageNavy}>
        <Text style={styles.cronogramaTitulo}>CRONOGRAMA DO SEU{"\n"}PROJETO FOTOVOLTAICO</Text>
        {ETAPAS.map((e) => (
          <View key={e.n} style={styles.etapaLinha}>
            <View style={styles.etapaCirculo}>
              <Text style={styles.etapaNumero}>{e.n}</Text>
            </View>
            <View>
              <Text style={styles.etapaTitulo}>ETAPA {e.n}</Text>
              <Text style={styles.etapaTexto}>{e.titulo}</Text>
            </View>
          </View>
        ))}
      </Page>

      {/* PÁGINA 3 — O QUE É UM SFV */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{EMPRESA.nomeLongo}</Text>
        <View style={{ marginTop: 30 }}>
          <Text style={styles.h1}>1. Componentes do Sistema Fotovoltaico SFV.</Text>

          <Text style={styles.h2}>• O que é um SFV</Text>
          <Text style={styles.paragrafo}>
            É um sistema de geração de energia fotovoltaica (energia solar), pode ser principalmente de dois tipos: OFF-GRID ou
            ON-GRID, isso significa que ele pode ser isolado ou conectado à rede de energia da concessionária. A vantagem de um
            sistema conectado à rede é que não tem a necessidade do uso de baterias, significa então que o seu custo é menor.
          </Text>

          <Text style={styles.h2}>• Os módulos.</Text>
          <Text style={styles.paragrafo}>
            Os módulos são os responsáveis por transformar a luz do sol em energia elétrica, essa energia elétrica gerada se dá
            em corrente contínua.
          </Text>

          <Text style={styles.h2}>• O inversor.</Text>
          <Text style={styles.paragrafo}>
            O papel do inversor é transformar a energia gerada pelos módulos em corrente contínua para corrente alternada, que é
            a energia que consumimos nas nossas casas e edificações. O inversor consegue também converter essa energia para o
            padrão da concessionária, para que possa interligar as duas fontes sem que haja diferença de tensão ou frequência,
            além disso possui diversas proteções para o sistema fotovoltaico e a rede da concessionária, protegendo ambos os
            sistemas de eventuais transtornos.
          </Text>

          <Text style={styles.h2}>• A string box</Text>
          <Text style={styles.paragrafo}>
            A string box é uma caixa de proteção, onde ficam DPS (dispositivo de proteção contra surtos) e chaves seccionadoras
            do sistema fotovoltaico.
          </Text>

          <Text style={styles.h2}>• O Processo</Text>
          <Text style={styles.paragrafo}>
            A energia gerada nos módulos em corrente contínua passa pela string box e alimenta o inversor, simultaneamente o
            inversor padroniza essa energia para que tenha as mesmas características da energia fornecida pela rede da
            distribuidora, sendo assim ele consegue usar os mesmos condutores para enviar a energia gerada para a edificação e
            para a rede de distribuição.
          </Text>
          <Text style={styles.paragrafo}>
            A energia gerada pelo sistema é consumida instantaneamente dentro da edificação e não possui nenhuma taxa por kWh
            produzido/consumido; já a que é injetada para a rede da concessionária, quando o sistema gera mais energia do que o
            consumo interno, será efetivado um crédito para ser utilizado em uma eventual ocasião em que o consumo interno seja
            maior que a geração, com prazo de até 60 meses para utilização — essa energia será consumida com taxas de impostos.
          </Text>
          <Text style={styles.paragrafo}>
            A fatura de energia não vai chegar com custo zero, sempre haverá a taxa mínima da concessionária mais os impostos.
          </Text>
        </View>
      </Page>

      {/* PÁGINA 4 — ESCOPO TÉCNICO */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{EMPRESA.nomeLongo}</Text>
        <Text style={styles.dataLinha}>{local}{dataFormatada}</Text>

        <Text style={{ fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 14 }}>
          Proposta para Implantação de Usina Fotovoltaica
        </Text>

        <Text style={styles.paragrafo}>
          Proposta para implantação de uma Usina Fotovoltaica compreendendo: projeto, fornecimento de equipamentos e instalação
          da UFV de <Text style={{ fontWeight: 700 }}>{dim?.potencia_instalada_kwp ? dim.potencia_instalada_kwp.toFixed(2) : "—"} kWp</Text>, para atendimento da
          respectiva demanda:
        </Text>

        <View style={styles.destaqueBox}>
          <Text style={styles.destaqueTexto}>Geração máxima mensal: {dim ? Math.round(dim.geracao_estimada).toLocaleString("pt-BR") : "—"} kWh</Text>
        </View>

        <Text style={styles.h2}>Equipamentos, Materiais e Serviços:</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colItem]}>Item</Text>
          <Text style={[styles.tableHeaderText, styles.colDesc]}>Descrição dos itens</Text>
          <Text style={[styles.tableHeaderText, styles.colUnd]}>Und</Text>
          <Text style={[styles.tableHeaderText, styles.colQtd]}>Qtd</Text>
        </View>
        {todasLinhas.map((linha, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={styles.colItem}>{i + 1}</Text>
            <Text style={styles.colDesc}>{linha.descricao}</Text>
            <Text style={styles.colUnd}>{linha.und}</Text>
            <Text style={styles.colQtd}>{linha.qtd}</Text>
          </View>
        ))}

        <Text style={styles.h2}>2. Especificações Técnicas:</Text>
        <View style={styles.specGrid}>
          <Text style={styles.specLinha}>Potência da Usina: {dim?.potencia_instalada_kwp ? dim.potencia_instalada_kwp.toFixed(2) : "—"} kWp</Text>
          <Text style={styles.specLinha}>Quantidade de Módulos: {dim?.qtde_modulos ?? "—"} Unidades</Text>
          <Text style={styles.specLinha}>Média HSP: {dim?.hsp ?? "—"} kWh/m².dia</Text>
          <Text style={styles.specLinha}>
            Geração Máxima de Energia: {dim ? Math.round(dim.geracao_estimada).toLocaleString("pt-BR") : "—"} kWh por mês
            {dim?.perdas_pct ? ` considerando eficiência de ${100 - dim.perdas_pct}%` : ""}
          </Text>
        </View>
      </Page>

      {/* PÁGINA 5 — ESTRUTURA, AUTONOMIA, RETORNO, VANTAGENS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{EMPRESA.nomeLongo}</Text>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.h1}>3. Estrutura necessária:</Text>
          <Text style={styles.paragrafo}>
            Área estimada do sistema: <Text style={{ fontWeight: 700 }}>{dim?.area_estimada_m2 ? Math.round(dim.area_estimada_m2) : "—"} m²</Text>
          </Text>

          <Text style={styles.h1}>4. Autonomia</Text>
          {dim?.perdas_pct != null && <Text style={styles.paragrafo}>Eficiência considerada: {100 - dim.perdas_pct}%</Text>}
          <View style={styles.destaqueBox}>
            <Text style={styles.destaqueTexto}>Economia Mensal com Energia: {snapshot.economia_mensal ? formatBRL(snapshot.economia_mensal) : "—"}</Text>
          </View>
          <View style={styles.destaqueBox}>
            <Text style={styles.destaqueTexto}>Economia Anual com Energia: {snapshot.economia_estimada_ano1 ? formatBRL(snapshot.economia_estimada_ano1) : "—"}</Text>
          </View>
          <Text style={{ ...styles.paragrafo, marginTop: 6 }}>
            Economia total acumulada em 30 anos:{" "}
            <Text style={{ fontWeight: 700 }}>{snapshot.economia_total_30_anos ? formatBRL(snapshot.economia_total_30_anos) : "—"}</Text>
            {"\n"}
            <Text style={{ fontSize: 8, fontStyle: "italic", color: "#64748b" }}>(Considerando inflação e reajuste de 4% ao ano) *</Text>
          </Text>

          <Text style={styles.h1}>5. Retorno do Investimento:</Text>
          <View style={styles.retornoBox}>
            <Text style={styles.retornoTexto}>Tempo estimado de retorno do investimento: {formatTempoRetorno(snapshot.payback_meses)}.</Text>
          </View>

          <Text style={styles.h1}>6. Vantagens e Benefícios:</Text>
          {VANTAGENS.map((v, i) => (
            <View key={i} style={styles.vantagemLinha}>
              <View style={styles.vantagemMarcador} />
              <Text style={styles.vantagemTexto}>{v}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* PÁGINA 6 — MARCAS E GARANTIAS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{EMPRESA.nomeLongo}</Text>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.h1}>7. Marcas e Garantias:</Text>
          <Text style={styles.paragrafo}>
            • <Text style={{ fontWeight: 700 }}>Módulos Fotovoltaicos:</Text> Garantia de 25 anos na geração linear de energia e 12 anos contra defeito de fabricação;
          </Text>
          <Text style={styles.paragrafo}>
            • <Text style={{ fontWeight: 700 }}>Inversores de Frequência:</Text> monitoramento via wi-fi e App no celular, Garantia de 10 anos contra defeito de fabricação;
          </Text>
          <Text style={styles.paragrafo}>
            • <Text style={{ fontWeight: 700 }}>Estrutura metálica:</Text> Garantia de 10 anos contra defeitos de fabricação.
          </Text>
          <Text style={styles.paragrafo}>
            • <Text style={{ fontWeight: 700 }}>Serviços:</Text> Garantia de 1 ano para defeitos oriundos da instalação.
          </Text>

          <View style={styles.brandsGrid}>
            {BRANDS.map((b) => (
              <View key={b} style={styles.brandChip}>
                <Text style={styles.brandChipTexto}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* PÁGINA 7 — CONDIÇÕES, INVESTIMENTO, ASSINATURA */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{EMPRESA.nomeLongo}</Text>

        <View style={{ marginTop: 24 }}>
          <Text style={{ ...styles.paragrafo, fontStyle: "italic" }}>
            <Text style={{ fontWeight: 700 }}>Obs.1:</Text> A proposta não inclui qualquer tipo de reparo necessário na instalação
            elétrica da edificação, ou no padrão de entrada, sendo de responsabilidade do cliente caso existam possíveis
            adequações para atender as normas da concessionária.
          </Text>
          <Text style={{ ...styles.paragrafo, fontStyle: "italic" }}>
            <Text style={{ fontWeight: 700 }}>Obs.2:</Text> A proposta poderá sofrer alterações após a vistoria da edificação.
          </Text>

          <Text style={styles.h1}>8. Prazos:</Text>
          <Text style={styles.paragrafo}>
            Entrega do sistema: em até {snapshot.prazo_instalacao_dias ?? "—"} dias
          </Text>

          <Text style={styles.h1}>9. Condições e Pagamento:</Text>
          <View style={styles.investBox}>
            <Text style={styles.investLabel}>INVESTIMENTO</Text>
            <Text style={styles.investValor}>{formatBRL(snapshot.valor_total ?? 0)}</Text>
            <Text style={{ ...styles.investLabel, marginTop: 8 }}>À VISTA</Text>
            <Text style={styles.avistaValor}>{formatBRL(snapshot.valor_avista ?? snapshot.valor_total ?? 0)}</Text>
          </View>
          <Text style={{ ...styles.paragrafo, textAlign: "center", marginTop: 10, color: "#1e3a8a", fontWeight: 700 }}>
            Consulte nossas condições de financiamento ou parcelamento
          </Text>
          <Text style={{ ...styles.paragrafo, textAlign: "center", color: "#dc2626", fontWeight: 700, fontStyle: "italic" }}>
            O cliente poderá financiar na instituição de sua preferência.
          </Text>
          {snapshot.condicoes_pagamento && (
            <Text style={{ ...styles.paragrafo, textAlign: "center" }}>{snapshot.condicoes_pagamento}</Text>
          )}

          <View style={styles.assinaturaBox}>
            <Text style={{ fontSize: 9, color: "#64748b", marginBottom: 30 }}>Atenciosamente,</Text>
            <Text style={styles.assinaturaNome}>{EMPRESA.cargoAssinatura} {snapshot.nome_vendedor ?? ""}</Text>
            <Text style={styles.assinaturaCargo}>{EMPRESA.nomeLongo}</Text>
          </View>
        </View>

        <View style={styles.footerBand}>
          <Text style={styles.footerBandTexto}>{EMPRESA.email}   ·   {EMPRESA.telefones}</Text>
        </View>
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
