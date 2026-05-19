'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Company, AtividadePrincipal } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Plus, Calendar, CheckCircle2 } from 'lucide-react';

const ATIVIDADES: AtividadePrincipal[] = ['COMERCIO', 'INDUSTRIA', 'SERVICOS', 'MISTO'];

const ATIVIDADE_COLOR: Record<AtividadePrincipal, string> = {
  COMERCIO: 'bg-blue-100 text-blue-700',
  INDUSTRIA: 'bg-orange-100 text-orange-700',
  SERVICOS: 'bg-purple-100 text-purple-700',
  MISTO: 'bg-slate-100 text-slate-700',
};

function formatCnpj(v: string) {
  return v
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
}

export default function EmpresasPage() {
  const { companies, addCompany, updateCompany } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState({ cnpj: '', razaoSocial: '', nomeFantasia: '', atividadePrincipal: 'COMERCIO' as AtividadePrincipal, dataOpcaoSimples: '' });

  function openNew() {
    setEditing(null);
    setForm({ cnpj: '', razaoSocial: '', nomeFantasia: '', atividadePrincipal: 'COMERCIO', dataOpcaoSimples: '' });
    setOpen(true);
  }

  function openEdit(c: Company) {
    setEditing(c);
    setForm({ cnpj: c.cnpj, razaoSocial: c.razaoSocial, nomeFantasia: c.nomeFantasia, atividadePrincipal: c.atividadePrincipal, dataOpcaoSimples: c.dataOpcaoSimples });
    setOpen(true);
  }

  function save() {
    if (!form.cnpj || !form.razaoSocial) return;
    if (editing) {
      updateCompany({ ...editing, ...form });
    } else {
      addCompany({ id: `c${Date.now()}`, ...form, ativo: true });
    }
    setOpen(false);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
          <p className="text-slate-500 text-sm mt-1">{companies.length} empresa(s) cadastrada(s)</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} />
          Nova Empresa
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {companies.map((c) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEdit(c)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600">
                  {c.nomeFantasia.slice(0, 2).toUpperCase()}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ATIVIDADE_COLOR[c.atividadePrincipal]}`}>
                  {c.atividadePrincipal}
                </span>
              </div>
              <div className="mt-3">
                <CardTitle className="text-base">{c.nomeFantasia}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{c.razaoSocial}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Building2 size={12} />
                  <span className="font-mono">{c.cnpj}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} />
                  <span>Simples desde {c.dataOpcaoSimples.split('-').reverse().join('/')}</span>
                </div>
                {c.ativo && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 size={12} />
                    <span>Ativa</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card
          className="border-dashed cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-center min-h-[180px]"
          onClick={openNew}
        >
          <div className="text-center text-slate-400">
            <Plus size={24} className="mx-auto mb-2" />
            <p className="text-sm">Adicionar empresa</p>
          </div>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar empresa' : 'Nova empresa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">CNPJ</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm font-mono"
                value={form.cnpj}
                onChange={(e) => setForm((f) => ({ ...f, cnpj: formatCnpj(e.target.value) }))}
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Razão Social</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.razaoSocial}
                onChange={(e) => setForm((f) => ({ ...f, razaoSocial: e.target.value }))}
                placeholder="Empresa Exemplo Ltda"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Nome Fantasia</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.nomeFantasia}
                onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))}
                placeholder="Empresa Exemplo"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Atividade Principal</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.atividadePrincipal}
                onChange={(e) => setForm((f) => ({ ...f, atividadePrincipal: e.target.value as AtividadePrincipal }))}
              >
                {ATIVIDADES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Data de Opção Simples</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.dataOpcaoSimples}
                onChange={(e) => setForm((f) => ({ ...f, dataOpcaoSimples: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={save}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
