import axios from 'axios';

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  nome: string;
}

// Busca todos os estados do Brasil
export const getStates = async (): Promise<IBGEState[]> => {
  const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
  return response.data.map((state: IBGEState) => ({
    id: state.id,
    sigla: state.sigla,
    nome: state.nome
  }));
};

// Busca cidades baseado na sigla do estado
export const getCitiesByState = async (stateSigla: string): Promise<string[]> => {
  const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateSigla}/municipios`);
  return response.data.map((city: IBGECity) => city.nome);
};