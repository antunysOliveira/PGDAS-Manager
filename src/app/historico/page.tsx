'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { fmt, fmtCompetencia, fmtDate, totalLiquido } from '@/lib/fiscal';
import { Apuracao } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Clock, AlertCircle, Eye, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_CONFIG = {
  RASCUNHO: { label: 'Rascunho', icon: Clock, color: 'text-amber-500' },
  APURADA: { label: 'Apurada', icon: AlertCircle, color: 'text-blue-500' },
  TRANSMITIDA: { label: 'Transmitida', icon: CheckCircle2, color: 'text-green-500' },
};

const CAT_LABEL: Record<string, string> = {
  COMERCIO: 'Comércio',
  INDUSTRIA: 'Indústria',
  SERVICOS: 'Serviços',
  EXPORTACAO: 'Exportação',
};

export default function HistoricoPage() {
  const { companies, apuracoes } = useStore();
  const [filterCompany, setFilterCompany] = useState('');
  const [selected, setSelected] = useState<Apuracao | null>(null);
  const [notasExpanded, setNotasExpanded] = useState(false);

  const filtered = apuracoes
    .filter((a) => !filterCompany || a.companyId === filterCompany)
    .sort((a, b) => b.competencia.localeCompare(a.competencia));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Histórico de Apurações</h1>
        <p className="text-slate-500 text-sm mt-1">{apuracoes.length} apuração(ões) registrada(s)</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
        >
          <option value="">Todas as empresas</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.nomeFantasia}</option>)}
        </select>
        <span className="text-sm text-slate-500">{filtered.length} resultado(s)</span>
      </div>

      <div className="space-y-3">
        {filtered.map((ap) => {
          const company = companies.find((c) => c.id === ap.companyId);
          const cfg = STATUS_CONFIG[ap.status];
          const Icon = cfg.icon;
          const liquido = totalLiquido(ap.resumo);

          return (
            <Card key={ap.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <Icon size={20} className={cfg.color} />

                  <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="font-semibold text-sm">{company?.nomeFantasia ?? '—'}</p>
                      <p className="text-xs text-slate-500 font-mono">{company?.cnpj}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{fmtCompetencia(ap.competencia)}</p>
                      <p className="text-xs text-slate-500">{ap.notas.length > 0 ? `${ap.notas.length} notas` : 'Sem notas'}</p>
                    </div>
                    <div>
                      {liquido > 0 ? (
                        <>
                          <p className="text-sm font-semibold text-blue-600">{fmt(liquido)}</p>
                          <p className="text-xs text-slate-500">Receita líquida</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400">Não apurado</p>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelected(ap); setNotasExpanded(false); }}
                      >
                        <Eye size={14} />
                        Ver resumo
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <FileText size={40} className="mx-auto mb-3 opacity-40" />
            <p>Nenhuma apuração encontrada</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selected && (() => {
            const company = companies.find((c) => c.id === selected.companyId);
            const cfg = STATUS_CONFIG[selected.status];
            const Icon = cfg.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon size={18} className={cfg.color} />
                    {company?.nomeFantasia} — {fmtCompetencia(selected.competencia)}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Badge variant="outline">{cfg.label}</Badge>
                    <span>Criado em {fmtDate(selected.createdAt)}</span>
                  </div>

                  {selected.resumo.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {selected.resumo.map((r) => (
                          <div key={r.categoria} className="rounded-lg border p-4">
                            <p className="font-semibold text-sm mb-2">{CAT_LABEL[r.categoria] ?? r.categoria}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-slate-500">Receita Bruta</span><span>{fmt(r.receitaBruta)}</span></div>
                              {r.totalDevolucoes > 0 && <div className="flex justify-between text-red-500"><span>Devoluções</span><span>- {fmt(r.totalDevolucoes)}</span></div>}
                              <Separator />
                              <div className="flex justify-between font-bold"><span>Receita Líquida</span><span className="text-blue-600">{fmt(r.receitaLiquida)}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-900 text-white rounded-lg p-4 flex justify-between">
                        <span className="font-semibold">Total Geral Líquido</span>
                        <span className="font-bold text-blue-400">{fmt(totalLiquido(selected.resumo))}</span>
                      </div>

                      {selected.resumoCfop.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-2">Detalhamento por CFOP</p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-slate-500 border-b">
                                <th className="text-left py-1.5">CFOP</th>
                                <th className="text-left py-1.5">Descrição</th>
                                <th className="text-right py-1.5">Bruto</th>
                                <th className="text-right py-1.5">Líquido</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selected.resumoCfop.map((r) => (
                                <tr key={r.cfop} className="border-b last:border-0">
                                  <td className="py-1.5 font-mono">{r.cfop}</td>
                                  <td className="py-1.5 text-slate-600">{r.descricao}</td>
                                  <td className="py-1.5 text-right">{fmt(r.valorBruto)}</td>
                                  <td className="py-1.5 text-right font-medium">{fmt(r.liquido)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Apuração ainda não processada.</p>
                  )}

                  {selected.notas.length > 0 && (
                    <div>
                      <button
                        className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                        onClick={() => setNotasExpanded((x) => !x)}
                      >
                        {notasExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        Notas utilizadas ({selected.notas.length})
                      </button>
                      {notasExpanded && (
                        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                          {selected.notas.map((n) => (
                            <div key={n.id} className="flex items-center gap-2 text-xs p-2 bg-slate-50 rounded">
                              <span className="font-mono">NF {n.numeroNota}</span>
                              <span className="text-slate-400">{fmtDate(n.dataEmissao)}</span>
                              <span className="flex-1 truncate text-slate-600">{n.tipoNota === 'SAIDA' ? n.nomeDestinatario : n.nomeEmitente}</span>
                              <span className="font-medium">{fmt(n.valorTotal)}</span>
                              <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                                n.status === 'VALIDA' ? 'bg-green-100 text-green-700' :
                                n.status === 'CANCELADA' ? 'bg-red-100 text-red-700' :
                                n.status === 'DEVOLUCAO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                              }`}>{n.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
