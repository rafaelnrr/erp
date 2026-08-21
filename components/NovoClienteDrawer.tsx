"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { criarCliente, listarValoresDistintos } from "@/app/actions/clientes";
import { buscarEnderecoPorCep } from "@/utils/cep";
import { CreatableSelect } from "@/components/CreatableSelect";
import { FileDropzone } from "@/components/FileDropzone";
import { SiteSurveyUpload, type FotoSurvey } from "@/components/SiteSurveyUpload";

const TIPOS_TELHADO_PADRAO = ["Cerâmica", "Fibra Cimento", "Metálico", "Laje", "Solo"];
const ESTRUTURAS_PADRAO = ["Madeira", "Metálica"];
const CONCESSIONARIAS_PADRAO = ["CPFL", "Enel", "Light", "Cemig", "Copel", "Coelba", "Celesc", "Equatorial", "Neoenergia"];

const TABS = [
  { id: "dados", label: "① Dados" },
  { id: "endereco", label: "② Endereço" },
  { id: "tecnico", label: "③ Técnico" },
  { id: "survey", label: "④ Survey" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function NovoClienteDrawer() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [aba, setAba] = useState<TabId>("dados");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [consumo, setConsumo] = useState("");

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [zona, setZona] = useState<"urbana" | "rural">("urbana");
  const [cepStatus, setCepStatus] = useState<"idle" | "buscando" | "nao-encontrado">("idle");

  const [concessionaria, setConcessionaria] = useState("");
  const [tipoTelhado, setTipoTelhado] = useState("");
  const [estruturaTelhado, setEstruturaTelhado] = useState("");
  const [fatura, setFatura] = useState<File | null>(null);
  const [observacoes, setObservacoes] = useState("");

  const [fotos, setFotos] = useState<FotoSurvey[]>([]);

  const [tiposTelhadoExtra, setTiposTelhadoExtra] = useState<string[]>([]);
  const [estruturasExtra, setEstruturasExtra] = useState<string[]>([]);

  useEffect(() => {
    if (!aberto) return;
    listarValoresDistintos("tipo_telhado").then(setTiposTelhadoExtra);
    listarValoresDistintos("estrutura_telhado").then(setEstruturasExtra);
  }, [aberto]);

  async function handleCepBlur() {
    if (cep.replace(/\D/g, "").length !== 8) return;
    setCepStatus("buscando");
    const endereco = await buscarEnderecoPorCep(cep);
    if (endereco) {
      setRua(endereco.logradouro);
      setBairro(endereco.bairro);
      setCidade(endereco.localidade);
      setUf(endereco.uf);
      setCepStatus("idle");
    } else {
      setCepStatus("nao-encontrado");
    }
  }

  const fotosSemDescricao = fotos.some((f) => f.descricao.trim() === "");
  const podeSalvar = nome.trim() !== "" && consumo !== "" && !fotosSemDescricao;

  function resetar() {
    setNome(""); setDocumento(""); setConsumo("");
    setCep(""); setRua(""); setNumero(""); setBairro(""); setCidade(""); setUf(""); setZona("urbana");
    setConcessionaria(""); setTipoTelhado(""); setEstruturaTelhado(""); setFatura(null); setObservacoes("");
    setFotos([]); setAba("dados"); setErro(null);
  }

  async function handleSalvar() {
    if (!podeSalvar) return;
    setSalvando(true);
    setErro(null);

    const fd = new FormData();
    fd.set("nome", nome);
    fd.set("documento", documento);
    fd.set("consumo_kwh_mes", consumo);
    fd.set("cep", cep);
    fd.set("rua", rua);
    fd.set("numero", numero);
    fd.set("bairro", bairro);
    fd.set("cidade", cidade);
    fd.set("uf", uf);
    fd.set("zona", zona);
    fd.set("concessionaria", concessionaria);
    fd.set("tipo_telhado", tipoTelhado);
    fd.set("estrutura_telhado", estruturaTelhado);
    fd.set("observacoes", observacoes);
    if (fatura) fd.set("fatura", fatura);
    for (const f of fotos) {
      fd.append("foto_arquivo", f.file);
      fd.append("foto_descricao", f.descricao);
    }

    const res = await criarCliente(fd);
    setSalvando(false);

    if (res.error) {
      setErro(res.error);
      return;
    }
    resetar();
    setAberto(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        + Novo Cliente
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="calc-pro h-full w-full max-w-lg overflow-y-auto bg-[#0b1220] border-l border-[#334155] flex flex-col">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                .calc-pro input, .calc-pro select, .calc-pro textarea {
                  width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #334155;
                  background: #0b1220; color: white; outline: none; font-size: 14px;
                }
                .calc-pro input:focus, .calc-pro select:focus, .calc-pro textarea:focus { border-color: #22c55e; }
              `,
              }}
            />

            <div className="flex items-center justify-between p-5 border-b border-[#1e293b]">
              <h2 className="text-white text-lg font-semibold">Novo Cliente</h2>
              <button onClick={() => setAberto(false)} className="text-[#94a3b8] hover:text-white">✕</button>
            </div>

            <div className="flex border-b border-[#1e293b] px-5 gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAba(t.id)}
                  className={`px-3 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                    aba === t.id ? "border-[#22c55e] text-white" : "border-transparent text-[#64748b] hover:text-[#cbd5e1]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-5 flex flex-col gap-4">
              {aba === "dados" && (
                <>
                  <div>
                    <label className="block text-[13px] text-[#cbd5e1] mb-2">Nome Completo *</label>
                    <input value={nome} onChange={(e) => setNome(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#cbd5e1] mb-2">CPF ou CNPJ</label>
                    <input value={documento} onChange={(e) => setDocumento(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#cbd5e1] mb-2">Consumo Médio (kWh/mês) *</label>
                    <input type="number" value={consumo} onChange={(e) => setConsumo(e.target.value)} />
                  </div>
                  <CreatableSelect
                    label="Concessionária"
                    value={concessionaria}
                    onChange={setConcessionaria}
                    options={CONCESSIONARIAS_PADRAO}
                    placeholder="Selecione ou digite..."
                  />
                  <div>
                    <label className="block text-[13px] text-[#cbd5e1] mb-2">Observações Complementares</label>
                    <textarea rows={4} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
                  </div>
                </>
              )}

              {aba === "endereco" && (
                <>
                  <div>
                    <label className="block text-[13px] text-[#cbd5e1] mb-2">CEP</label>
                    <input value={cep} onChange={(e) => setCep(e.target.value)} onBlur={handleCepBlur} placeholder="00000-000" />
                    {cepStatus === "buscando" && <p className="mt-1 text-[12px] text-[#64748b]">Buscando endereço...</p>}
                    {cepStatus === "nao-encontrado" && <p className="mt-1 text-[12px] text-[#f59e0b]">CEP não encontrado — preencha manualmente.</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[13px] text-[#cbd5e1] mb-2">Rua</label>
                      <input value={rua} onChange={(e) => setRua(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[13px] text-[#cbd5e1] mb-2">Número</label>
                      <input value={numero} onChange={(e) => setNumero(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] text-[#cbd5e1] mb-2">Bairro</label>
                      <input value={bairro} onChange={(e) => setBairro(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[13px] text-[#cbd5e1] mb-2">Cidade</label>
                      <input value={cidade} onChange={(e) => setCidade(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-[13px] text-[#cbd5e1] mb-2">UF</label>
                      <input value={uf} onChange={(e) => setUf(e.target.value)} maxLength={2} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[13px] text-[#cbd5e1] mb-2">Zona de Instalação</label>
                      <div className="flex rounded-lg border border-[#334155] overflow-hidden">
                        {(["urbana", "rural"] as const).map((z) => (
                          <button
                            key={z}
                            type="button"
                            onClick={() => setZona(z)}
                            className={`flex-1 py-2 text-[13px] capitalize transition-colors ${
                              zona === z ? "bg-[#22c55e] text-black font-semibold" : "bg-[#0b1220] text-[#94a3b8]"
                            }`}
                          >
                            {z}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {aba === "tecnico" && (
                <>
                  <CreatableSelect
                    label="Tipo de Telhado"
                    value={tipoTelhado}
                    onChange={setTipoTelhado}
                    options={Array.from(new Set([...TIPOS_TELHADO_PADRAO, ...tiposTelhadoExtra]))}
                  />
                  <CreatableSelect
                    label="Estrutura do Telhado"
                    value={estruturaTelhado}
                    onChange={setEstruturaTelhado}
                    options={Array.from(new Set([...ESTRUTURAS_PADRAO, ...estruturasExtra]))}
                  />
                  <FileDropzone label="Fatura de Energia" file={fatura} onChange={setFatura} />
                </>
              )}

              {aba === "survey" && <SiteSurveyUpload fotos={fotos} onChange={setFotos} />}
            </div>

            {erro && <p className="px-5 text-[13px] text-[#f87171]">{erro}</p>}

            <div className="p-5 border-t border-[#1e293b] flex justify-end gap-2">
              <button onClick={() => setAberto(false)} className="px-4 py-2 text-sm text-[#94a3b8]">
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={!podeSalvar || salvando}
                className="px-4 py-2 text-sm rounded-lg bg-[#22c55e] text-black font-semibold disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar Cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
