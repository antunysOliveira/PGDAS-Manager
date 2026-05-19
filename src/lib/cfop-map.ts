import { CategoriaFiscal } from './types';

export const CFOP_MAP: Record<string, { descricao: string; categoria: CategoriaFiscal }> = {
  '1101': { descricao: 'Compra para industrialização', categoria: 'ENTRADA' },
  '1102': { descricao: 'Compra para comercialização', categoria: 'ENTRADA' },
  '1201': { descricao: 'Devolução de venda (estadual)', categoria: 'DEVOLUCAO' },
  '2101': { descricao: 'Compra para industrialização (outro estado)', categoria: 'ENTRADA' },
  '2102': { descricao: 'Compra para comercialização (outro estado)', categoria: 'ENTRADA' },
  '2201': { descricao: 'Devolução de venda (interestadual)', categoria: 'DEVOLUCAO' },
  '3201': { descricao: 'Devolução de venda (importação)', categoria: 'DEVOLUCAO' },
  '5101': { descricao: 'Venda de produção do estabelecimento', categoria: 'COMERCIO' },
  '5102': { descricao: 'Venda de mercadoria adquirida', categoria: 'COMERCIO' },
  '5111': { descricao: 'Venda de produção própria – industrialização', categoria: 'INDUSTRIA' },
  '5114': { descricao: 'Venda de produção própria – encomenda', categoria: 'INDUSTRIA' },
  '5117': { descricao: 'Venda de ativo imobilizado', categoria: 'INDUSTRIA' },
  '5301': { descricao: 'Prestação de serviço (estadual)', categoria: 'SERVICOS' },
  '5302': { descricao: 'Prestação de serviço (estadual)', categoria: 'SERVICOS' },
  '5303': { descricao: 'Prestação de serviço (estadual)', categoria: 'SERVICOS' },
  '5405': { descricao: 'Venda de mercadoria com ST', categoria: 'COMERCIO' },
  '5933': { descricao: 'Prestação de serviço tributado pelo ISSQN', categoria: 'SERVICOS' },
  '6101': { descricao: 'Venda interestadual de produção', categoria: 'COMERCIO' },
  '6102': { descricao: 'Venda interestadual de mercadoria', categoria: 'COMERCIO' },
  '6301': { descricao: 'Prestação de serviço (interestadual)', categoria: 'SERVICOS' },
  '7101': { descricao: 'Venda para exportação (produção)', categoria: 'EXPORTACAO' },
  '7102': { descricao: 'Venda para exportação (mercadoria)', categoria: 'EXPORTACAO' },
};

export const CFOP_DEVOLUTION = ['1201', '2201', '3201'];

export function getCfopCategoria(cfop: string): CategoriaFiscal {
  return CFOP_MAP[cfop]?.categoria ?? 'ENTRADA';
}

export function getCfopDescricao(cfop: string): string {
  return CFOP_MAP[cfop]?.descricao ?? `CFOP ${cfop}`;
}
