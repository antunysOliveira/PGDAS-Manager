'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { fmt, fmtCompetencia, totalLiquido } from '@/lib/fiscal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Building2, FileSearch, TrendingUp, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  RASCUNHO: { label: 'Rascunho', variant: 'secondary' as const, icon: Clock },
  APURADA: { label: 'Apurada', variant: 'default' as const, icon: AlertCircle },
  TRANSMITIDA: { label: 'Transmitida', variant: 'outline' as const, icon: CheckCircle2 },
};

export default function DashboardPage() {
  const { companies, apuracoes } = useStore();

  const transmitidas = apuracoes.filter((a) => a.status === 'TRANSMITIDA').length;
  const pendentes = apuracoes.filter((a) => a.status !== 'TRANSMITIDA').length;
  const totalFaturado = apuracoes
    .filter((a) => a.resumo.length > 0)
    .reduce((sum, a) => sum + totalLiquido(a.resumo), 0);

  const recentes = [...apuracoes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Visão geral das suas apurações</p>
        </div>
        <Link href="/apuracao" className={buttonVariants()}>
          <Plus size={16} />
          Nova Apuração
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Building2 size={18} className="text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold">{companies.length}</p>
                <p className="text-xs text-slate-500">Empresas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg"><Clock size={18} className="text-amber-600" /></div>
              <div>
                <p className="text-2xl font-bold">{pendentes}</p>
                <p className="text-xs text-slate-500">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 size={18} className="text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold">{transmitidas}</p>
                <p className="text-xs text-slate-500">Transmitidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp size={18} className="text-purple-600" /></div>
              <div>
                <p className="text-lg font-bold">{fmt(totalFaturado)}</p>
                <p className="text-xs text-slate-500">Faturamento líquido</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Apurações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentes.map((ap) => {
                  const company = companies.find((c) => c.id === ap.companyId);
                  const cfg = STATUS_CONFIG[ap.status];
                  const Icon = cfg.icon;
                  const liquido = totalLiquido(ap.resumo);
                  return (
                    <div key={ap.id} className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-slate-50 transition-colors">
                      <Icon size={16} className={ap.status === 'TRANSMITIDA' ? 'text-green-500' : ap.status === 'APURADA' ? 'text-blue-500' : 'text-amber-500'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{company?.nomeFantasia ?? '—'}</p>
                        <p className="text-xs text-slate-500">{fmtCompetencia(ap.competencia)}</p>
                      </div>
                      <div className="text-right">
                        {liquido > 0 && <p className="text-sm font-semibold">{fmt(liquido)}</p>}
                        <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Link href="/historico" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-center')}>
                  Ver todo histórico
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Empresas</CardTitle>
                <Link href="/empresas" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                  <Plus size={14} />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companies.map((c) => {
                  const aps = apuracoes.filter((a) => a.companyId === c.id);
                  const pendente = aps.some((a) => a.status !== 'TRANSMITIDA');
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg border">
                      <div className="w-8 h-8 bg-slate-200 rounded-md flex items-center justify-center text-xs font-bold text-slate-600">
                        {c.nomeFantasia.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.nomeFantasia}</p>
                        <p className="text-xs text-slate-500">{c.atividadePrincipal}</p>
                      </div>
                      {pendente && <div className="w-2 h-2 rounded-full bg-amber-400" title="Apuração pendente" />}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Link href="/empresas" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-center')}>
                  Gerenciar empresas
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 bg-blue-600 text-white border-0">
            <CardContent className="pt-6">
              <FileSearch size={24} className="mb-3 opacity-80" />
              <p className="font-semibold text-sm mb-1">Iniciar Apuração</p>
              <p className="text-xs opacity-70 mb-4">Faça upload dos XMLs de NF-e do período.</p>
              <Link href="/apuracao" className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'w-full justify-center')}>
                Começar agora
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
