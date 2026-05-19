export type AtividadePrincipal = 'COMERCIO' | 'INDUSTRIA' | 'SERVICOS' | 'MISTO';
export type StatusApuracao = 'RASCUNHO' | 'APURADA' | 'TRANSMITIDA';
export type TipoNota = 'ENTRADA' | 'SAIDA';
export type StatusNota = 'VALIDA' | 'CANCELADA' | 'DEVOLUCAO' | 'EXCLUIDA';
export type CategoriaFiscal = 'COMERCIO' | 'INDUSTRIA' | 'SERVICOS' | 'EXPORTACAO' | 'ENTRADA' | 'DEVOLUCAO';

export interface Company {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  atividadePrincipal: AtividadePrincipal;
  dataOpcaoSimples: string;
  ativo: boolean;
}

export interface ItemNota {
  id: string;
  cfop: string;
  descricao: string;
  valorProduto: number;
  valorDesconto: number;
  categoria: CategoriaFiscal;
}

export interface NotaFiscal {
  id: string;
  chaveNFe: string;
  numeroNota: string;
  dataEmissao: string;
  tipoNota: TipoNota;
  cnpjEmitente: string;
  nomeEmitente: string;
  cnpjDestinatario: string;
  nomeDestinatario: string;
  valorTotal: number;
  status: StatusNota;
  itens: ItemNota[];
}

export interface ResumoCategoria {
  categoria: CategoriaFiscal;
  receitaBruta: number;
  totalDevolucoes: number;
  receitaLiquida: number;
}

export interface ResumoCfop {
  cfop: string;
  descricao: string;
  categoria: CategoriaFiscal;
  valorBruto: number;
  devolucoes: number;
  liquido: number;
}

export interface Apuracao {
  id: string;
  companyId: string;
  competencia: string;
  status: StatusApuracao;
  notas: NotaFiscal[];
  resumo: ResumoCategoria[];
  resumoCfop: ResumoCfop[];
  createdAt: string;
  updatedAt: string;
}
