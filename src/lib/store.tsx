'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Company, Apuracao, NotaFiscal } from './types';
import { MOCK_COMPANIES, MOCK_APURACOES } from './mock-data';

interface StoreState {
  companies: Company[];
  apuracoes: Apuracao[];
  addCompany: (c: Company) => void;
  updateCompany: (c: Company) => void;
  addApuracao: (a: Apuracao) => void;
  updateApuracao: (a: Apuracao) => void;
  getCompany: (id: string) => Company | undefined;
  getApuracao: (id: string) => Apuracao | undefined;
  getApuracoesByCompany: (companyId: string) => Apuracao[];
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [apuracoes, setApuracoes] = useState<Apuracao[]>(MOCK_APURACOES);

  const addCompany = (c: Company) => setCompanies((prev) => [...prev, c]);
  const updateCompany = (c: Company) =>
    setCompanies((prev) => prev.map((x) => (x.id === c.id ? c : x)));

  const addApuracao = (a: Apuracao) => setApuracoes((prev) => [...prev, a]);
  const updateApuracao = (a: Apuracao) =>
    setApuracoes((prev) => prev.map((x) => (x.id === a.id ? a : x)));

  const getCompany = (id: string) => companies.find((c) => c.id === id);
  const getApuracao = (id: string) => apuracoes.find((a) => a.id === id);
  const getApuracoesByCompany = (companyId: string) =>
    apuracoes.filter((a) => a.companyId === companyId);

  return (
    <StoreContext.Provider
      value={{
        companies, apuracoes,
        addCompany, updateCompany,
        addApuracao, updateApuracao,
        getCompany, getApuracao, getApuracoesByCompany,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}
