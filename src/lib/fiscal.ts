import { NotaFiscal, ResumoCategoria, ResumoCfop, CategoriaFiscal } from './types';
import { getCfopCategoria, getCfopDescricao } from './cfop-map';

const RECEITA_CATS: CategoriaFiscal[] = ['COMERCIO', 'INDUSTRIA', 'SERVICOS', 'EXPORTACAO'];

export function calcularApuracao(notas: NotaFiscal[]): {
  resumo: ResumoCategoria[];
  resumoCfop: ResumoCfop[];
} {
  const ativas = notas.filter((n) => n.status !== 'CANCELADA' && n.status !== 'EXCLUIDA');

  const cfopAgg: Record<string, ResumoCfop> = {};

  for (const nota of ativas) {
    for (const item of nota.itens) {
      const cat = getCfopCategoria(item.cfop);
      if (!RECEITA_CATS.includes(cat) && cat !== 'DEVOLUCAO') continue;

      if (!cfopAgg[item.cfop]) {
        cfopAgg[item.cfop] = {
          cfop: item.cfop,
          descricao: getCfopDescricao(item.cfop),
          categoria: cat,
          valorBruto: 0,
          devolucoes: 0,
          liquido: 0,
        };
      }

      const val = item.valorProduto - item.valorDesconto;
      if (cat === 'DEVOLUCAO') {
        cfopAgg[item.cfop].devolucoes += val;
      } else {
        cfopAgg[item.cfop].valorBruto += val;
      }
    }
  }

  for (const r of Object.values(cfopAgg)) {
    r.liquido = r.valorBruto - r.devolucoes;
  }

  const resumoCfop = Object.values(cfopAgg).filter((r) => RECEITA_CATS.includes(r.categoria));

  const catAgg: Partial<Record<CategoriaFiscal, ResumoCategoria>> = {};
  for (const c of resumoCfop) {
    if (!catAgg[c.categoria]) {
      catAgg[c.categoria] = { categoria: c.categoria, receitaBruta: 0, totalDevolucoes: 0, receitaLiquida: 0 };
    }
    catAgg[c.categoria]!.receitaBruta += c.valorBruto;
  }

  // Apply devoluções (CFOP 1201/2201/3201) — abate do COMERCIO por default no mock
  for (const nota of ativas) {
    if (nota.status === 'DEVOLUCAO') {
      for (const item of nota.itens) {
        const cat = getCfopCategoria(item.cfop);
        if (cat !== 'DEVOLUCAO') continue;
        const target: CategoriaFiscal = 'COMERCIO';
        if (catAgg[target]) {
          catAgg[target]!.totalDevolucoes += item.valorProduto - item.valorDesconto;
        }
      }
    }
  }

  for (const r of Object.values(catAgg)) {
    if (r) r.receitaLiquida = r.receitaBruta - r.totalDevolucoes;
  }

  return {
    resumo: Object.values(catAgg).filter(Boolean) as ResumoCategoria[],
    resumoCfop,
  };
}

export function totalLiquido(resumo: ResumoCategoria[]): number {
  return resumo.reduce((s, r) => s + r.receitaLiquida, 0);
}

export function fmt(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function fmtCompetencia(competencia: string): string {
  const [year, month] = competencia.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(month) - 1]}/${year}`;
}

export function fmtDate(iso: string): string {
  const [year, month, day] = iso.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}
