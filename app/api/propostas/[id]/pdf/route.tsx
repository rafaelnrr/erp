import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { buscarPropostaParaPdf } from "@/app/actions/propostas";

export const runtime = "nodejs";

const EMPRESA = {
  nomeCurto: "HERTZ",
  nomeLongo: "HERTZ SOLAR",
  email: "engenharia@hertzbr.com.br",
  telefones: "83-99607-0428 | 88-99845-1682",
  assinatura: "Eng. Eletricista Raphael Macedo\nHERTZ SOLAR",
};

const VANTAGENS = [
  "Pay Back rápido;",
  "Investimento com Rentabilidade Superior à Poupança e Tesouro (Selic)",
  "Garantia de Geração de 25 anos",
  "Valorização da propriedade;",
  "Isenção da inflação de reajuste na Tarifa de Energia de até 14% anual;",
  "Energia Renovável.",
  "Crédito de carbono",
];

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#000000", lineHeight: 1.5 },
  header: { marginBottom: 30 },
  headerText: { fontSize: 11, fontWeight: "bold" },
  tituloPrincipal: { fontSize: 14, fontWeight: "bold", textAlign: "center", marginVertical: 20 },
  h1: { fontSize: 11, fontWeight: "bold", marginTop: 15, marginBottom: 5 },
  h2: { fontSize: 10, fontWeight: "bold", marginTop: 10, marginBottom: 3 },
  paragrafo: { fontSize: 10, marginBottom: 8, textAlign: "justify" },
  
  table: { width: "100%", marginTop: 10, marginBottom: 20 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", borderBottomStyle: "solid" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#000", borderBottomStyle: "solid", fontWeight: "bold" },
  colItem: { width: "10%", padding: 5 },
  colDesc: { width: "70%", padding: 5 },
  colUnd: { width: "10%", padding: 5, textAlign: "center" },
  colQtd: { width: "10%", padding: 5, textAlign: "center" },

  valoresBox: { marginTop: 20 },
  valorLinha: { fontSize: 12, fontWeight: "bold", marginBottom: 5 },
  
  assinaturaBox: { marginTop: 50, alignItems: "center" },
  assinaturaNome: { fontSize: 11, fontWeight: "bold", textAlign: "center" },
  
  footer: { position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "#666" }
});

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PropostaPdf({ numero, snapshot, criadoEm }: { numero: number; snapshot: any; criadoEm: string | null }) {
  const dim = snapshot.dimensionamento;
  const itens = snapshot.itens ?? [];
  const servicos = snapshot.servicos ?? [];
  const todasLinhas = [
    ...itens.map((i: any) => ({ descricao: i.descricao, und: "un", qtd: i.quantidade })),
    ...servicos.map((s: any) => ({ descricao: s.nome, und: "serv", qtd: 1 })),
  ];

  const dataFormatada = new Date(criadoEm ?? snapshot.gerado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const local = snapshot.cliente?.cidade ? snapshot.cliente.cidade : "Feira de Santana";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Cliente: {(snapshot.cliente?.nome ?? "—").toUpperCase()}</Text>
          <Text style={styles.headerText}>{local}, {dataFormatada}</Text>
        </View>

        <Text style={styles.tituloPrincipal}>Proposta para Implantação de Usina Fotovoltaica</Text>

        <Text style={styles.h1}>Componentes do Sistema Fotovoltaico SFV.</Text>

        <Text style={styles.h2}>O que é um SFV</Text>
        <Text style={styles.paragrafo}>
          É um sistema de geração de energia fotovoltaica (energia solar), pode ser principalmente de dois tipos: OFF-GRID ou ON-GRID, isso significa que ele pode ser isolado ou conectado à rede de energia da concessionária. A vantagem de um sistema conectado à rede é que não tem a necessidade do uso de baterias, significa então que o seu custo é menor.
        </Text>

        <Text style={styles.h2}>Os módulos.</Text>
        <Text style={styles.paragrafo}>
          Os módulos são os responsáveis por transformar a luz do sol em energia elétrica, essa energia elétrica gerada se dá em corrente contínua.
        </Text>

        <Text style={styles.h2}>O inversor.</Text>
        <Text style={styles.paragrafo}>
          O papel do inversor é transformar a energia gerada pelos módulos em corrente contínua para corrente alternada, que é a energia que consumimos nas nossas casas e edificações, o inversor, consegue também converter essa energia para o padrão da concessionária, para que possa interligar as duas fontes sem que haja diferença de tensão ou frequência, além disso, o inversor possui diversas proteções para o sistema fotovoltaico e a rede da concessionária, protegendo ambos os sistemas de eventuais transtornos.
        </Text>

        <Text style={styles.h2}>A string box</Text>
        <Text style={styles.paragrafo}>
          A string box é uma caixa de proteção, onde ficam DPS (dispositivo de proteção contra surtos) e chaves seccionadoras do sistema fotovoltaico.
        </Text>

        <Text style={styles.h2}>O Processo</Text>
        <Text style={styles.paragrafo}>
          A energia gerada nos módulos em corrente contínua passa pela string box e alimenta o inversor, simultaneamente o inversor padroniza essa energia para que tenha as mesmas características da energia que é fornecida pela rede da distribuidora, sendo assim ele consegue usar os mesmos condutores para enviar a energia gerada para a edificação e para a rede de distribuição.
        </Text>
        <Text style={styles.paragrafo}>
          A energia gerada pelo sistema é consumida instantaneamente dentro da edificação e não possui nenhuma taxa por kwh produzido/consumido, já a que é injetada para a rede da concessionaria, quando o sistema gera mais energia do que o consumo interno, será efetivado um credito para ser utilizado em uma eventual ocasião em que o consumo interno seja maior que a geração e tem o prazo de até 60 meses para utilização, essa energia será consumida com taxas de impostos.
        </Text>
        <Text style={styles.paragrafo}>
          A fatura de energia não vai chegar com custo zero, sempre haverá a taxa mínima da concessionária mais os impostos.
        </Text>

        <Text style={styles.footer}>{EMPRESA.nomeLongo} - {EMPRESA.email} - {EMPRESA.telefones}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.paragrafo}>
          Proposta para implantação de uma Usina Fotovoltaica compreendendo: projeto, fornecimento de equipamentos e instalação da UFV de: {dim?.potencia_instalada_kwp ? dim.potencia_instalada_kwp.toFixed(2) : "—"} kWp, para atendimento da respectiva demanda:
        </Text>
        <Text style={styles.paragrafo}>
          Geração máxima mensal: {dim ? Math.round(dim.geracao_estimada).toLocaleString("pt-BR") : "—"} kWh
        </Text>

        <Text style={styles.h1}>Equipamentos, Materiais e serviços:</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colDesc}>Descrição dos itens</Text>
            <Text style={styles.colUnd}>Und</Text>
            <Text style={styles.colQtd}>Qtd</Text>
          </View>
          {todasLinhas.map((linha, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colItem}>{i + 1}</Text>
              <Text style={styles.colDesc}>{linha.descricao}</Text>
              <Text style={styles.colUnd}>{linha.und}</Text>
              <Text style={styles.colQtd}>{linha.qtd}</Text>
            </View>
          ))}
        </View>

        {VANTAGENS.map((v, i) => (
          <Text key={i} style={styles.paragrafo}>• {v}</Text>
        ))}

        <Text style={styles.h1}>Marcas e Garantias:</Text>
        <Text style={styles.paragrafo}>
          Módulos Fotovoltaicos: Marca: TSUN ou NPLUS, Garantia de 25 anos na geração linear de energia e 12 anos contra defeito de fabricação;
        </Text>
        <Text style={styles.paragrafo}>
          Inversores de Frequência: Marca: SAJ monitoramento via wi-fi e App no Celular, Garantia de 10 anos contra defeito de fabricação;
        </Text>
        <Text style={styles.paragrafo}>
          Estrutura metálica: Marca romangnole ou solar group, garantia de 10 anos contra defeitos de fabricação.
        </Text>
        <Text style={styles.paragrafo}>
          Serviços: Garantia de 1 ano para defeitos oriundos da instalação.
        </Text>
        
        <Text style={styles.footer}>{EMPRESA.nomeLongo} - {EMPRESA.email} - {EMPRESA.telefones}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.paragrafo}>
          Obs.1: A proposta não inclui qualquer tipo de reparo necessário na instalação elétrica da edificação, ou no padrão de entrada, sendo de responsabilidade do cliente caso exista possíveis adequações para que atenda as normas da concessionária.
        </Text>
        <Text style={styles.paragrafo}>
          Obs. 2: A proposta poderá sofrer alterações após a vistoria da edificação.
        </Text>

        <Text style={styles.h1}>Prazos: Entrega do sistema: em até {snapshot.prazo_instalacao_dias ?? 90} dias</Text>

        <Text style={styles.h1}>Condições e Pagamento:</Text>
        <View style={styles.valoresBox}>
          <Text style={styles.valorLinha}>INVESTIMENTO: {formatBRL(snapshot.valor_total ?? 0)}</Text>
          <Text style={styles.valorLinha}>Á VISTA {formatBRL(snapshot.valor_avista ?? snapshot.valor_total ?? 0)}</Text>
        </View>
        <Text style={styles.paragrafo}>Consulte nossas condições de financiamento ou parcelamento</Text>
        <Text style={styles.paragrafo}>O cliente poderá financiar na instituição de sua preferência.</Text>

        <View style={styles.assinaturaBox}>
          <Text style={styles.paragrafo}>Atenciosamente,</Text>
          <Text style={styles.assinaturaNome}>{EMPRESA.assinatura}</Text>
        </View>

        <Text style={styles.footer}>{EMPRESA.nomeLongo} - {EMPRESA.email} - {EMPRESA.telefones}</Text>
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
