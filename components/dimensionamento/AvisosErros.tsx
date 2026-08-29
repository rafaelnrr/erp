export function ErrosBloqueantes({ erros }: { erros: string[] }) {
  if (erros.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {erros.map((e, i) => (
        <div key={i} className="p-3 rounded-lg text-[13px] bg-[rgba(239,68,68,0.12)] border border-[#ef4444] text-[#fca5a5]">
          🛑 {e}
        </div>
      ))}
    </div>
  );
}

export function AvisosTecnicos({ avisos }: { avisos: string[] }) {
  if (avisos.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {avisos.map((a, i) => (
        <div key={i} className="p-2.5 rounded-lg text-[12px] bg-[rgba(245,158,11,0.1)] border border-[#f59e0b] text-[#fcd34d]">
          ⚠️ {a}
        </div>
      ))}
    </div>
  );
}
