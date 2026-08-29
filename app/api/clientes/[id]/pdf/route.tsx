import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import path from "node:path";
import fs from "node:fs";
import { buscarClienteCompleto } from "@/app/actions/clientes";

export const runtime = "nodejs";

const ASSETS_DIR = path.join(process.cwd(), "assets", "pdf");
const LOGO = fs.readFileSync(path.join(ASSETS_DIR, "logo-hertz-energy.png"));

const NAVY = "#0B2149";
const GOLD = "#F2B705";

const LABEL_ZONA: Record<string, string> = { urbana: "Urbana", rural: "Rural" };
const LABEL_GRUPO: Record<string, string> = { A: "Grupo A (Alta Tensão)", B: "Grupo B (Baixa Tensão)" };
const LABEL_MODALIDADE: Record<string, string> = { verde: "Verde", azul: "Azul" };

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 60, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.5 },
  logoHeader: { width: 110, height: 29, objectFit: "contain", marginBottom: 16 },
  titulo: { fontSize: 16, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 2 },
  subtitulo: { fontSize: 9, color: "#6b7280", marginBottom: 16 },

  secao: { marginBottom: 14 },
  secaoTitulo: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#ffffff", backgroundColor: NAVY, paddingVertical: 5, paddingHorizontal: 8, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  campo: { width: "50%", marginBottom: 8, paddingRight: 8 },
  campoLabel: { fontSize: 8, color: "#6b7280" },
  campoValor: { fontSize: 10, color: "#1a1a1a", marginTop: 1 },

  fatura: { width: 280, height: 200, objectFit: "contain", borderWidth: 1, borderColor: "#d1d5db", marginTop: 6 },

  fotosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  fotoBox: { width: 150 },
  fotoImg: { width: 150, height: 110, objectFit: "cover", borderWidth: 1, borderColor: "#d1d5db" },
  fotoDesc: { fontSize: 8, color: "#6b7280", marginTop: 3 },

  footerBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: GOLD, paddingVertical: 8, alignItems: "center" },
  footerTexto: { fontSize: 8, color: NAVY, fontFamily: "Helvetica-Bold" },
});

function Campo({ label, valor }: { label: string; valor: string | number | null | undefined }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label}</Text>
      <Text style={styles.campoValor}>{valor || valor === 0 ? String(valor) : "—"}</Text>
    </View>
  );
}

function RelatorioClientePdf({ cliente: c, faturaUrl, fotos }: { cliente: any; faturaUrl: string | null; fotos: { id: string; descricao: string; url: string | null }[] }) {
  const dataFormatada = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={LOGO} style={styles.logoHeader} />
        <Text style={styles.titulo}>Relatório do Cliente — {c.nome}</Text>
        <Text style={styles.subtitulo}>Gerado em {dataFormatada}</Text>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Dados Pessoais / Empresariais</Text>
          <View style={styles.grid}>
            <Campo label="Nome / Razão Social" valor={c.nome} />
            <Campo label="CPF / CNPJ" valor={c.documento} />
            <Campo label="Consumo Médio" valor={c.consumo_kwh_mes != null ? `${c.consumo_kwh_mes} kWh/mês` : null} />
            <Campo label="Zona" valor={LABEL_ZONA[c.zona] ?? c.zona} />
            <Campo label="Concessionária" valor={c.concessionarias?.nome} />
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Endereço</Text>
          <View style={styles.grid}>
            <Campo label="CEP" valor={c.cep} />
            <Campo label="Rua" valor={c.rua} />
            <Campo label="Número" valor={c.numero} />
            <Campo label="Bairro" valor={c.bairro} />
            <Campo label="Cidade" valor={c.cidade} />
            <Campo label="UF" valor={c.uf} />
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Dados Técnicos</Text>
          <View style={styles.grid}>
            <Campo label="Tipo de Telhado" valor={c.tipo_telhado} />
            <Campo label="Estrutura do Telhado" valor={c.estrutura_telhado} />
            <Campo label="Grupo Tarifário" valor={LABEL_GRUPO[c.grupo_tarifario] ?? c.grupo_tarifario} />
            {c.grupo_tarifario === "B" && (
              <>
                <Campo label="Classe" valor={c.classe_b} />
                <Campo label="Tarifa TE+TUSD (R$/kWh)" valor={c.tarifa_kwh} />
              </>
            )}
            {c.grupo_tarifario === "A" && (
              <>
                <Campo label="Subgrupo" valor={c.subgrupo_a} />
                <Campo label="Modalidade" valor={LABEL_MODALIDADE[c.modalidade_tarifaria_a] ?? c.modalidade_tarifaria_a} />
                <Campo label="Tarifa Ponta (R$/kWh)" valor={c.tarifa_kwh_ponta} />
                <Campo label="Tarifa Fora Ponta (R$/kWh)" valor={c.tarifa_kwh_fora_ponta} />
              </>
            )}
          </View>
        </View>

        {c.observacoes && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Observações</Text>
            <Text style={{ fontSize: 9 }}>{c.observacoes}</Text>
          </View>
        )}

        {faturaUrl && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Fatura de Energia</Text>
            <Image src={faturaUrl} style={styles.fatura} />
          </View>
        )}

        {fotos.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Fotos do Site Survey</Text>
            <View style={styles.fotosGrid}>
              {fotos.map(
                (foto) =>
                  foto.url && (
                    <View key={foto.id} style={styles.fotoBox}>
                      <Image src={foto.url} style={styles.fotoImg} />
                      <Text style={styles.fotoDesc}>{foto.descricao}</Text>
                    </View>
                  )
              )}
            </View>
          </View>
        )}

        <View style={styles.footerBar} fixed>
          <Text style={styles.footerTexto}>HERTZ SOLAR · engenharia@hertzbr.com.br · 83-99607-0428 | 88-99845-1682</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const completo = await buscarClienteCompleto(id);

  if (!completo) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <RelatorioClientePdf cliente={completo.cliente} faturaUrl={completo.faturaUrl} fotos={completo.fotos} />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="cliente-${completo.cliente.nome.replace(/[^a-z0-9]+/gi, "-")}.pdf"`,
    },
  });
}
