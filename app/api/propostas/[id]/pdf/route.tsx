import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import path from "node:path";
import fs from "node:fs";
import { buscarPropostaParaPdf } from "@/app/actions/propostas";

export const runtime = "nodejs";

const ASSETS_DIR = path.join(process.cwd(), "assets", "pdf");
const asset = (relativePath: string) => fs.readFileSync(path.join(ASSETS_DIR, relativePath));

const LOGO = asset("logo-hertz-energy.png");
const CAPA = asset("capa-solar.jpg");
const CRONOGRAMA = asset("cronograma.png");
const LOGOS_FABRICANTES = [
  asset("logos/growatt.png"),
  asset("logos/canadian-solar.png"),
  asset("logos/solis.png"),
  asset("logos/jinko-solar.png"),
  asset("logos/saj.png"),
  asset("logos/ja-solar.png"),
];

const EMPRESA = {
  nomeLongo: "HERTZ SOLAR",
  email: "engenharia@hertzbr.com.br",
  telefones: "83-99607-0428 | 88-99845-1682",
  cidadeSede: "Feira de Santana",
};

const NAVY = "#0B2149";
const GOLD = "#F2B705";

const VANTAGENS = [
  "Pay Back rápido;",
  "Investimento com Rentabilidade Superior à Poupança e Tesouro (Selic);",
  "Garantia de Geração de 25 anos;",
  "Valorização da propriedade;",
  "Isenção da inflação de reajuste na Tarifa de Energia de até 14% anual;",
  "Energia Renovável;",
  "Crédito de carbono.",
];

const MARCA_PADRAO = {
  modulo: "TSUN ou NPLUS",
  inversor: "SAJ, Growatt, Canadian Solar, Solis, Jinko Solar ou JA Solar",
  estrutura: "Romagnole ou Solar Group",
};

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPayback(meses: number | null): string {
  if (meses == null || !Number.isFinite(meses)) return "—";
  const anos = Math.floor(meses / 12);
  const restoMeses = Math.round(meses % 12);
  const partes: string[] = [];
  if (anos > 0) partes.push(`${anos} ano${anos > 1 ? "s" : ""}`);
  if (restoMeses > 0 || anos === 0) partes.push(`${restoMeses} ${restoMeses === 1 ? "mês" : "meses"}`);
  return partes.join(" e ");
}

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 60, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.5 },

  // Capa
  capaPage: { padding: 0 },
  capaTopo: { paddingTop: 32, paddingHorizontal: 40, paddingBottom: 24 },
  capaLogo: { width: 150, height: 40, objectFit: "contain" },
  capaCliente: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 50 },
  capaFoto: { width: "100%", height: 400, objectFit: "cover" },
  capaBanner: { backgroundColor: NAVY, height: 80, alignItems: "center", justifyContent: "center" },
  capaBannerTexto: { color: "#ffffff", fontSize: 20, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  capaFooter: { backgroundColor: GOLD, flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 20 },
  capaFooterLinha: { color: NAVY, fontSize: 11, fontFamily: "Helvetica-Bold" },

  // Cronograma
  cronogramaPage: { padding: 0 },
  cronogramaImg: { width: "100%", height: "100%", objectFit: "cover" },

  // Conteúdo (páginas 3-7)
  logoHeader: { width: 110, height: 29, objectFit: "contain", marginBottom: 20 },
  dataLinha: { fontSize: 10, textAlign: "right", marginBottom: 4 },
  tituloPrincipal: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "center", marginVertical: 16 },
  h1: { fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 16, marginBottom: 6 },
  h2: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 3 },
  paragrafo: { fontSize: 10, marginBottom: 8, textAlign: "justify" },

  destaque: { backgroundColor: "#FEF3C7", paddingVertical: 6, paddingHorizontal: 8, marginBottom: 10, alignSelf: "flex-start" },
  destaqueTexto: { fontSize: 11, fontFamily: "Helvetica-Bold" },

  table: { width: "100%", marginTop: 8, marginBottom: 16, borderWidth: 1, borderColor: NAVY },
  tableHeader: { flexDirection: "row", backgroundColor: NAVY },
  tableHeaderTexto: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 9 },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#d1d5db" },
  tableRowAlt: { backgroundColor: "#F8F9FB" },
  colItem: { width: "8%", padding: 6, fontSize: 9 },
  colDesc: { width: "62%", padding: 6, fontSize: 9 },
  colUnd: { width: "12%", padding: 6, fontSize: 9, textAlign: "center" },
  colQtd: { width: "18%", padding: 6, fontSize: 9, textAlign: "center" },

  specsGrid: { marginTop: 4 },
  specLinha: { fontSize: 10, marginBottom: 4 },
  specLabel: { fontFamily: "Helvetica-Bold" },

  vantagemLinha: { flexDirection: "row", marginBottom: 5 },
  vantagemCheck: { color: "#16a34a", fontFamily: "Helvetica-Bold", marginRight: 6 },
  vantagemTexto: { fontSize: 10, flex: 1 },

  retornoBox: { marginTop: 6, marginBottom: 14 },
  retornoTexto: { fontSize: 14, fontFamily: "Helvetica-Bold", color: NAVY },

  logosGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 16, gap: 24, alignItems: "center" },
  logoFabricante: { width: 100, height: 40, objectFit: "contain" },

  investimentoBox: { marginTop: 10, marginBottom: 16, alignItems: "center" },
  investimentoTexto: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  investimentoAvista: { fontSize: 15, fontFamily: "Helvetica-Bold", backgroundColor: "#FEF3C7", paddingVertical: 6, paddingHorizontal: 10 },

  assinaturaBox: { marginTop: 60, alignItems: "center" },
  assinaturaNome: { fontSize: 11, fontFamily: "Helvetica-Bold", textAlign: "center", marginTop: 4 },

  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: GOLD,
    paddingVertical: 8,
    alignItems: "center",
  },
  footerTexto: { fontSize: 8, color: NAVY, fontFamily: "Helvetica-Bold" },
  pageNumber: {
    position: "absolute",
    bottom: 8,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
  },
});

function Rodape() {
  return (
    <View style={styles.footerBar} fixed>
      <Text style={styles.footerTexto}>{EMPRESA.email} · {EMPRESA.telefones}</Text>
    </View>
  );
}

function Numeracao() {
  return (
    <Text
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      fixed
    />
  );
}

function CabecalhoConteudo() {
  return <Image src={LOGO} style={styles.logoHeader} />;
}

function PropostaPdf({ snapshot, criadoEm }: { numero: number; snapshot: any; criadoEm: string | null }) {
  const dim = snapshot.dimensionamento;
  const itens: any[] = snapshot.itens ?? [];
  const servicos: any[] = snapshot.servicos ?? [];
  const todasLinhas = [
    ...itens.map((i) => ({ descricao: i.descricao, und: i.unidade ?? "un", qtd: i.quantidade })),
    ...servicos.map((s) => ({ descricao: s.nome, und: "serv", qtd: 1 })),
  ];

  const dataFormatada = new Date(criadoEm ?? snapshot.gerado_em).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const local = snapshot.cliente?.cidade || EMPRESA.cidadeSede;
  const eficienciaPct = dim?.perdas_pct != null ? 100 - dim.perdas_pct : null;

  const marcaModulo = dim?.modulo_fabricante || MARCA_PADRAO.modulo;
  const marcaInversor = dim?.inversor_fabricante || MARCA_PADRAO.inversor;
  const marcaEstrutura = dim?.estrutura_fabricante || MARCA_PADRAO.estrutura;

  return (
    <Document>
      {/* Página 1 — Capa */}
      <Page size="A4" style={styles.capaPage}>
        <View style={styles.capaTopo}>
          <Image src={LOGO} style={styles.capaLogo} />
          <Text style={styles.capaCliente}>Cliente: {(snapshot.cliente?.nome ?? "—").toUpperCase()}</Text>
        </View>
        <Image src={CAPA} style={styles.capaFoto} />
        <View style={styles.capaBanner}>
          <Text style={styles.capaBannerTexto}>PROPOSTA COMERCIAL</Text>
        </View>
        <View style={styles.capaFooter}>
          <Text style={styles.capaFooterLinha}>{EMPRESA.email}</Text>
          <Text style={styles.capaFooterLinha}>{EMPRESA.telefones}</Text>
        </View>
      </Page>

      {/* Página 2 — Cronograma */}
      <Page size="A4" style={styles.cronogramaPage}>
        <Image src={CRONOGRAMA} style={styles.cronogramaImg} />
      </Page>

      {/* Página 3 — Introdução */}
      <Page size="A4" style={styles.page}>
        <CabecalhoConteudo />
        <Text style={styles.dataLinha}>{local}, {dataFormatada}</Text>
        <Text style={styles.tituloPrincipal}>Proposta para Implantação de Usina Fotovoltaica</Text>

        <Text style={styles.h1}>1. Componentes do Sistema Fotovoltaico (SFV)</Text>

        <Text style={styles.h2}>O que é um SFV</Text>
        <Text style={styles.paragrafo}>
          É um sistema de geração de energia fotovoltaica (energia solar), que pode ser principalmente de dois tipos: OFF-GRID ou ON-GRID, isso significa que ele pode ser isolado ou conectado à rede de energia da concessionária. A vantagem de um sistema conectado à rede é que não tem a necessidade do uso de baterias, o que reduz o custo do investimento.
        </Text>

        <Text style={styles.h2}>Os módulos</Text>
        <Text style={styles.paragrafo}>
          Os módulos são os responsáveis por transformar a luz do sol em energia elétrica; essa energia gerada se dá em corrente contínua.
        </Text>

        <Text style={styles.h2}>O inversor</Text>
        <Text style={styles.paragrafo}>
          O papel do inversor é transformar a energia gerada pelos módulos, de corrente contínua para corrente alternada, que é a energia consumida nas edificações. O inversor também converte essa energia para o padrão da concessionária, interligando as duas fontes sem diferença de tensão ou frequência, além de possuir diversas proteções para o sistema fotovoltaico e para a rede da concessionária.
        </Text>

        <Text style={styles.h2}>A string box</Text>
        <Text style={styles.paragrafo}>
          A string box é uma caixa de proteção, onde ficam o DPS (dispositivo de proteção contra surtos) e as chaves seccionadoras do sistema fotovoltaico.
        </Text>

        <Text style={styles.h2}>O processo</Text>
        <Text style={styles.paragrafo}>
          A energia gerada nos módulos em corrente contínua passa pela string box e alimenta o inversor, que padroniza essa energia para as mesmas características fornecidas pela rede da distribuidora, permitindo usar os mesmos condutores para enviar a energia gerada para a edificação e para a rede.
        </Text>
        <Text style={styles.paragrafo}>
          A energia gerada e consumida instantaneamente na própria edificação não possui nenhuma taxa por kWh. Já a energia injetada na rede da concessionária gera um crédito, utilizável em até 60 meses quando o consumo interno superar a geração — esse crédito é consumido com os tributos vigentes.
        </Text>
        <Text style={styles.paragrafo}>
          A fatura de energia não chegará com custo zero: sempre haverá a taxa mínima da concessionária mais os impostos aplicáveis.
        </Text>

        <Rodape />
        <Numeracao />
      </Page>

      {/* Página 4 — Equipamentos e especificações */}
      <Page size="A4" style={styles.page}>
        <CabecalhoConteudo />

        <Text style={styles.paragrafo}>
          Proposta para implantação de uma Usina Fotovoltaica compreendendo: projeto, fornecimento de equipamentos e instalação da UFV de{" "}
          <Text style={{ fontFamily: "Helvetica-Bold" }}>{dim?.potencia_instalada_kwp ? dim.potencia_instalada_kwp.toFixed(2) : "—"} kWp</Text>, para atendimento da respectiva demanda:
        </Text>

        <View style={styles.destaque}>
          <Text style={styles.destaqueTexto}>
            Geração máxima mensal: {dim ? Math.round(dim.geracao_estimada).toLocaleString("pt-BR") : "—"} kWh
          </Text>
        </View>

        <Text style={styles.h1}>Equipamentos, Materiais e Serviços</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colItem, styles.tableHeaderTexto]}>Item</Text>
            <Text style={[styles.colDesc, styles.tableHeaderTexto]}>Descrição dos itens</Text>
            <Text style={[styles.colUnd, styles.tableHeaderTexto]}>Und</Text>
            <Text style={[styles.colQtd, styles.tableHeaderTexto]}>Qtd</Text>
          </View>
          {todasLinhas.map((linha, i) => (
            <View key={i} style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
              <Text style={styles.colItem}>{i + 1}</Text>
              <Text style={styles.colDesc}>{linha.descricao}</Text>
              <Text style={styles.colUnd}>{linha.und}</Text>
              <Text style={styles.colQtd}>{linha.qtd}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.h1}>2. Especificações Técnicas</Text>
        <View style={styles.specsGrid}>
          <Text style={styles.specLinha}><Text style={styles.specLabel}>Potência da Usina: </Text>{dim?.potencia_instalada_kwp ? `${dim.potencia_instalada_kwp.toFixed(2)} kWp` : "—"}</Text>
          <Text style={styles.specLinha}><Text style={styles.specLabel}>Potência dos Módulos: </Text>{dim?.modulo_potencia_w ? `${dim.modulo_potencia_w} W` : "—"}</Text>
          <Text style={styles.specLinha}><Text style={styles.specLabel}>Quantidade de Módulos: </Text>{dim?.qtde_modulos ?? "—"} unidades</Text>
          <Text style={styles.specLinha}><Text style={styles.specLabel}>Potência dos Inversores: </Text>{dim?.inversor_potencia_w ? `${(dim.inversor_potencia_w / 1000).toLocaleString("pt-BR")} kW` : "—"}</Text>
          <Text style={styles.specLinha}><Text style={styles.specLabel}>Quantidade de Inversores: </Text>{dim?.qtde_inversores ?? "—"} unidade(s)</Text>
          <Text style={styles.specLinha}><Text style={styles.specLabel}>Média HSP anual: </Text>{dim?.hsp ?? "—"} kWh/m².dia</Text>
          <Text style={styles.specLinha}>
            <Text style={styles.specLabel}>Geração Máxima de Energia: </Text>
            {dim ? Math.round(dim.geracao_estimada).toLocaleString("pt-BR") : "—"} kWh por mês
            {eficienciaPct != null ? ` considerando eficiência de ${eficienciaPct}%` : ""}
          </Text>
        </View>

        <Rodape />
        <Numeracao />
      </Page>

      {/* Página 5 — Estrutura, autonomia, retorno e vantagens */}
      <Page size="A4" style={styles.page}>
        <CabecalhoConteudo />

        <Text style={styles.h1}>3. Estrutura Necessária</Text>
        <Text style={styles.paragrafo}>
          Área estimada do sistema: <Text style={{ fontFamily: "Helvetica-Bold" }}>{dim?.area_estimada_m2 ? `${Math.round(dim.area_estimada_m2)} m²` : "—"}</Text>
        </Text>

        <Text style={styles.h1}>4. Autonomia</Text>
        <Text style={styles.paragrafo}>Eficiência considerada: {eficienciaPct != null ? `${eficienciaPct}%` : "—"}</Text>
        <View style={styles.destaque}>
          <Text style={styles.destaqueTexto}>Economia Mensal com Energia: {formatBRL(snapshot.economia_mensal ?? 0)}</Text>
        </View>
        <View style={styles.destaque}>
          <Text style={styles.destaqueTexto}>Economia Anual com Energia: {formatBRL(snapshot.economia_estimada_ano1 ?? 0)}</Text>
        </View>
        <Text style={[styles.paragrafo, { color: NAVY, fontFamily: "Helvetica-Bold", fontSize: 12 }]}>
          Economia total acumulada em 30 anos: {formatBRL(snapshot.economia_total_30_anos ?? 0)}
        </Text>
        <Text style={{ fontSize: 8, fontStyle: "italic", marginBottom: 10 }}>(Considerando inflação e reajuste de 4% ao ano) *</Text>

        <Text style={styles.h1}>5. Retorno do Investimento</Text>
        <View style={styles.retornoBox}>
          <Text style={styles.retornoTexto}>Tempo estimado de retorno do investimento: {formatPayback(snapshot.payback_meses)}</Text>
        </View>

        <Text style={styles.h1}>6. Vantagens e Benefícios</Text>
        {VANTAGENS.map((v, i) => (
          <View key={i} style={styles.vantagemLinha}>
            <Text style={styles.vantagemCheck}>•</Text>
            <Text style={styles.vantagemTexto}>{v}</Text>
          </View>
        ))}

        <Rodape />
        <Numeracao />
      </Page>

      {/* Página 6 — Marcas e garantias */}
      <Page size="A4" style={styles.page}>
        <CabecalhoConteudo />

        <Text style={styles.h1}>7. Marcas e Garantias</Text>
        <Text style={styles.paragrafo}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Módulos Fotovoltaicos: </Text>
          Marca: {marcaModulo}. Garantia de 25 anos na geração linear de energia e 12 anos contra defeito de fabricação.
        </Text>
        <Text style={styles.paragrafo}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Inversores de Frequência: </Text>
          Marca: {marcaInversor}, com monitoramento via wi-fi e aplicativo no celular. Garantia de 10 anos contra defeito de fabricação.
        </Text>
        <Text style={styles.paragrafo}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Estrutura Metálica: </Text>
          Marca: {marcaEstrutura}. Garantia de 10 anos contra defeitos de fabricação.
        </Text>
        <Text style={styles.paragrafo}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Serviços: </Text>
          Garantia de 1 ano para defeitos oriundos da instalação.
        </Text>

        <View style={styles.logosGrid}>
          {LOGOS_FABRICANTES.map((logo, i) => (
            <Image key={i} src={logo} style={styles.logoFabricante} />
          ))}
        </View>

        <Rodape />
        <Numeracao />
      </Page>

      {/* Página 7 — Condições, prazos e assinatura */}
      <Page size="A4" style={styles.page}>
        <CabecalhoConteudo />

        <Text style={styles.paragrafo}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Obs. 1: </Text>
          A proposta não inclui qualquer tipo de reparo necessário na instalação elétrica da edificação, ou no padrão de entrada, sendo de responsabilidade do cliente eventuais adequações para atendimento às normas da concessionária.
        </Text>
        <Text style={styles.paragrafo}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Obs. 2: </Text>
          A proposta poderá sofrer alterações após a vistoria da edificação.
        </Text>

        <Text style={styles.h1}>8. Prazos</Text>
        <Text style={styles.paragrafo}>Entrega do sistema: em até {snapshot.prazo_instalacao_dias ?? 90} dias.</Text>

        <Text style={styles.h1}>9. Condições e Pagamento</Text>
        <View style={styles.investimentoBox}>
          <Text style={styles.investimentoTexto}>INVESTIMENTO: {formatBRL(snapshot.valor_total ?? 0)}</Text>
          <Text style={styles.investimentoAvista}>À VISTA: {formatBRL(snapshot.valor_avista ?? snapshot.valor_total ?? 0)}</Text>
        </View>
        <Text style={[styles.paragrafo, { textAlign: "center", color: NAVY, fontFamily: "Helvetica-Bold" }]}>
          Consulte nossas condições de financiamento ou parcelamento.
        </Text>
        <Text style={[styles.paragrafo, { textAlign: "center" }]}>
          O cliente poderá financiar na instituição de sua preferência.
        </Text>

        <View style={styles.assinaturaBox}>
          <Text style={styles.paragrafo}>Atenciosamente,</Text>
          <Text style={styles.assinaturaNome}>{snapshot.nome_vendedor || "Equipe Comercial"}</Text>
          <Text style={styles.assinaturaNome}>{EMPRESA.nomeLongo}</Text>
        </View>

        <Rodape />
        <Numeracao />
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

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="proposta-${proposta.numero}.pdf"`,
    },
  });
}
