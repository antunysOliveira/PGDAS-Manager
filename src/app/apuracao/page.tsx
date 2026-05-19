'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { calcularApuracao, fmt, fmtDate, totalLiquido } from '@/lib/fiscal';
import { NotaFiscal, Apuracao, StatusNota } from '@/lib/types';
import { MOCK_NOTAS_TECH_ABRIL, MOCK_NOTAS_SERV_ABRIL } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Upload, FileText, CheckCircle2, ArrowRight, ArrowLeft,
  Trash2, AlertCircle, ExternalLink, RotateCcw, Loader2,
} from 'lucide-react';

const STEPS = ['Empresa & Período', 'Upload XML', 'Revisar Notas', 'Resumo & Transmissão'];

const STATUS_BADGE: Record<StatusNota, { label: string; color: string }> = {
  VALIDA: { label: 'Válida', color: 'bg-green-100 text-green-700' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
  DEVOLUCAO: { label: 'Devolução', color: 'bg-amber-100 text-amber-700' },
  EXCLUIDA: { label: 'Excluída', color: 'bg-slate-100 text-slate-500' },
};

const CAT_LABEL: Record<string, string> = {
  COMERCIO: 'Comércio',
  INDUSTRIA: 'Indústria',
  SERVICOS: 'Serviços',
  EXPORTACAO: 'Exportação',
};

const MOCK_NOTAS_BY_COMPANY: Record<string, NotaFiscal[]> = {
  c1: MOCK_NOTAS_TECH_ABRIL,
  c2: MOCK_NOTAS_SERV_ABRIL,
};

export default function ApuracaoPage() {
  const { companies, apuracoes, addApuracao, updateApuracao } = useStore();

  const [step, setStep] = useState(0);
  const [companyId, setCompanyId] = useState('');
  const [competencia, setCompetencia] = useState('2025-04');
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(false);
  const [apuracaoId, setApuracaoId] = useState<string | null>(null);
  const [transmitido, setTransmitido] = useState(false);
  const [checklist, setChecklist] = useState([false, false, false, false]);

  const company = companies.find((c) => c.id === companyId);

  const existingAp = apuracoes.find(
    (a) => a.companyId === companyId && a.competencia === competencia
  );

  function goNext() { setStep((s) => Math.min(s + 1, 3)); }
  function goBack() { setStep((s) => Math.max(s - 1, 0)); }

  function loadMockNotas() {
    setLoading(true);
    setTimeout(() => {
      const mockNotas = MOCK_NOTAS_BY_COMPANY[companyId] ?? [];
      setNotas(mockNotas);
      setLoading(false);
    }, 1200);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    loadMockNotas();
  }

  function removeNota(id: string) {
    setNotas((prev) => prev.map((n) => n.id === id ? { ...n, status: 'EXCLUIDA' } : n));
  }

  function apurar() {
    const { resumo, resumoCfop } = calcularApuracao(notas);
    const id = apuracaoId ?? `ap${Date.now()}`;
    const ap: Apuracao = {
      id,
      companyId,
      competencia,
      status: 'APURADA',
      notas,
      resumo,
      resumoCfop,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (apuracaoId) {
      updateApuracao(ap);
    } else {
      addApuracao(ap);
      setApuracaoId(id);
    }
    goNext();
  }

  function transmitir() {
    if (!apuracaoId) return;
    const ap = apuracoes.find((a) => a.id === apuracaoId);
    if (ap) updateApuracao({ ...ap, status: 'TRANSMITIDA', updatedAt: new Date().toISOString() });
    setTransmitido(true);
  }

  function reset() {
    setStep(0);
    setCompanyId('');
    setCompetencia('2025-04');
    setNotas([]);
    setApuracaoId(null);
    setTransmitido(false);
    setChecklist([false, false, false, false]);
  }

  const currentAp = apuracaoId ? apuracoes.find((a) => a.id === apuracaoId) : null;
  const notasVisiveis = notas.filter((n) => n.status !== 'EXCLUIDA');
  const notasValidas = notasVisiveis.filter((n) => n.status === 'VALIDA' || n.status === 'DEVOLUCAO');
  const notasCanceladas = notasVisiveis.filter((n) => n.status === 'CANCELADA');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Nova Apuração</h1>
        <p className="text-slate-500 text-sm mt-1">Importe os XMLs de NF-e e gere o resumo para o PGDAS-D</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2
                ${i < step ? 'bg-blue-600 border-blue-600 text-white' : i === step ? 'border-blue-600 text-blue-600' : 'border-slate-300 text-slate-400'}`}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 mx-2 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Empresa & Período */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Selecione a empresa e o período</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Empresa</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCompanyId(c.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      companyId === c.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-md flex items-center justify-center text-xs font-bold text-slate-600 mb-2">
                      {c.nomeFantasia.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm font-medium">{c.nomeFantasia}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.atividadePrincipal}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Competência (mês de referência)</label>
              <input
                type="month"
                className="border rounded-md px-3 py-2 text-sm"
                value={competencia}
                onChange={(e) => setCompetencia(e.target.value)}
              />
            </div>

            {existingAp && (
              <Alert>
                <AlertCircle size={16} />
                <AlertDescription>
                  Já existe uma apuração para <strong>{company?.nomeFantasia}</strong> em <strong>{competencia}</strong> com status <strong>{existingAp.status}</strong>.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button onClick={goNext} disabled={!companyId}>
                Próximo
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Importar XMLs de NF-e</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={loadMockNotas}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-blue-600">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="text-sm font-medium">Processando XMLs...</p>
                </div>
              ) : notas.length > 0 ? (
                <div className="flex flex-col items-center gap-3 text-green-600">
                  <CheckCircle2 size={32} />
                  <p className="text-sm font-medium">{notas.length} notas importadas</p>
                  <p className="text-xs text-slate-500">Clique para reimportar</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Upload size={32} />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Arraste os arquivos XML aqui</p>
                    <p className="text-xs text-slate-400 mt-1">ou clique para selecionar</p>
                  </div>
                  <p className="text-xs text-slate-400">Aceita múltiplos arquivos .xml</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-slate-400">ou</span>
              <Separator className="flex-1" />
            </div>

            <Button variant="outline" className="w-full" onClick={loadMockNotas} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              Carregar dados de exemplo ({company?.nomeFantasia})
            </Button>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={goBack}><ArrowLeft size={16} />Voltar</Button>
              <Button onClick={goNext} disabled={notas.length === 0 || loading}>
                Revisar notas
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Revisar Notas */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Revisar Notas Importadas</span>
              <div className="flex items-center gap-2 text-sm font-normal text-slate-500">
                <span className="text-green-600 font-medium">{notasValidas.length} válidas</span>
                {notasCanceladas.length > 0 && <span className="text-red-500">{notasCanceladas.length} canceladas</span>}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {notasVisiveis.map((nota) => {
                const cfg = STATUS_BADGE[nota.status];
                const isRemovable = nota.status !== 'CANCELADA';
                return (
                  <div key={nota.id} className={`flex items-center gap-3 p-3 rounded-lg border ${nota.status === 'CANCELADA' ? 'bg-red-50 border-red-200 opacity-70' : 'bg-white'}`}>
                    <FileText size={16} className="text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0 grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="font-mono font-medium">NF {nota.numeroNota}</p>
                        <p className="text-xs text-slate-500">{fmtDate(nota.dataEmissao)}</p>
                      </div>
                      <div className="col-span-2 min-w-0">
                        <p className="truncate font-medium">{nota.tipoNota === 'SAIDA' ? nota.nomeDestinatario : nota.nomeEmitente}</p>
                        <p className="text-xs text-slate-500 truncate">{nota.itens[0]?.cfop} – {nota.itens[0]?.descricao}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{fmt(nota.valorTotal)}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                    {isRemovable && (
                      <button
                        onClick={() => removeNota(nota.id)}
                        className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                        title="Remover nota"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={goBack}><ArrowLeft size={16} />Voltar</Button>
              <Button onClick={apurar} disabled={notasValidas.length === 0}>
                Apurar
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Resumo */}
      {step === 3 && currentAp && (
        <div className="space-y-6">
          {transmitido ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6 text-center">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-green-800">PGDAS registrado como transmitido!</h2>
                <p className="text-green-700 text-sm mt-2">Guarde o protocolo de transmissão no portal do Simples Nacional.</p>
                <Button variant="outline" className="mt-6" onClick={reset}>
                  <RotateCcw size={16} />
                  Nova apuração
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary cards */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Resumo da Apuração</h2>
                <div className="grid grid-cols-2 gap-4">
                  {currentAp.resumo.map((r) => (
                    <Card key={r.categoria}>
                      <CardContent className="pt-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-600">{CAT_LABEL[r.categoria] ?? r.categoria}</span>
                          <Badge variant="outline">{r.categoria}</Badge>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Receita Bruta</span>
                            <span className="font-medium">{fmt(r.receitaBruta)}</span>
                          </div>
                          {r.totalDevolucoes > 0 && (
                            <div className="flex justify-between text-red-500">
                              <span>Devoluções</span>
                              <span>- {fmt(r.totalDevolucoes)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Receita Líquida</span>
                            <span className="text-blue-600">{fmt(r.receitaLiquida)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-4 bg-slate-900 text-white">
                  <CardContent className="pt-5 flex items-center justify-between">
                    <span className="text-lg font-semibold">Total Geral Líquido</span>
                    <span className="text-2xl font-bold text-blue-400">{fmt(totalLiquido(currentAp.resumo))}</span>
                  </CardContent>
                </Card>
              </div>

              {/* CFOP Breakdown */}
              <Card>
                <CardHeader><CardTitle className="text-base">Detalhamento por CFOP</CardTitle></CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 border-b">
                        <th className="text-left py-2">CFOP</th>
                        <th className="text-left py-2">Descrição</th>
                        <th className="text-right py-2">Bruto</th>
                        <th className="text-right py-2">Devoluções</th>
                        <th className="text-right py-2 font-semibold">Líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAp.resumoCfop.map((r) => (
                        <tr key={r.cfop} className="border-b last:border-0">
                          <td className="py-2 font-mono font-medium">{r.cfop}</td>
                          <td className="py-2 text-slate-600">{r.descricao}</td>
                          <td className="py-2 text-right">{fmt(r.valorBruto)}</td>
                          <td className="py-2 text-right text-red-500">{r.devolucoes > 0 ? `- ${fmt(r.devolucoes)}` : '—'}</td>
                          <td className="py-2 text-right font-semibold">{fmt(r.liquido)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Transmissão Assistida */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base">Transmissão Assistida — PGDAS-D</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">Use os valores abaixo para preencher o PGDAS-D no portal do Simples Nacional.</p>

                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    {currentAp.resumo.map((r, i) => (
                      <div key={r.categoria} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checklist[i]}
                          onChange={() => setChecklist((prev) => { const n = [...prev]; n[i] = !n[i]; return n; })}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{CAT_LABEL[r.categoria] ?? r.categoria}</p>
                          <p className="text-xs text-slate-500">Receita Bruta: <span className="font-mono font-medium text-slate-800">{fmt(r.receitaBruta)}</span></p>
                          {r.totalDevolucoes > 0 && (
                            <p className="text-xs text-slate-500">Devoluções: <span className="font-mono font-medium text-red-600">{fmt(r.totalDevolucoes)}</span></p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href="https://www8.receita.fazenda.gov.br/SimplesNacional/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: 'outline' })}
                    >
                      Abrir Portal Simples Nacional
                      <ExternalLink size={14} />
                    </a>
                    <Button onClick={transmitir} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 size={16} />
                      Marcar como transmitido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
