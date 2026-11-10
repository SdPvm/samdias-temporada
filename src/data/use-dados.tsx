import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { carregarDados } from './fonte';
import type { DadosTemporada } from './tipos';

type Estado = {
  dados: DadosTemporada | null;
  erro: string | null;
  /** true durante o "puxar para atualizar". */
  atualizando: boolean;
  atualizar: () => Promise<void>;
};

const ContextoDados = createContext<Estado | null>(null);

function mensagemDeErro(e: unknown): string {
  return e instanceof Error ? e.message : 'Não foi possível carregar os dados.';
}

/** Carrega os dados uma vez e compartilha entre as três abas. */
export function DadosProvider({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<DadosTemporada | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState(false);

  // Primeira carga, ao abrir o app.
  useEffect(() => {
    let ativo = true;
    carregarDados()
      .then((novos) => {
        if (!ativo) return;
        setDados(novos);
        setErro(null);
      })
      .catch((e: unknown) => {
        if (ativo) setErro(mensagemDeErro(e));
      });
    return () => {
      ativo = false;
    };
  }, []);

  // Puxar para atualizar, em qualquer aba.
  const atualizar = useCallback(async () => {
    setAtualizando(true);
    try {
      setDados(await carregarDados());
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setAtualizando(false);
    }
  }, []);

  return (
    <ContextoDados.Provider value={{ dados, erro, atualizando, atualizar }}>
      {children}
    </ContextoDados.Provider>
  );
}

export function useDados(): Estado {
  const estado = useContext(ContextoDados);
  if (!estado) {
    throw new Error('useDados precisa estar dentro de <DadosProvider>.');
  }
  return estado;
}
