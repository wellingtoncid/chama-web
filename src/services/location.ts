import axios from 'axios';

// Busca todos os estados do Brasil
export const getStates = async () => {
  const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
  return response.data.map((state: any) => ({
    id: state.id,
    sigla: state.sigla,
    nome: state.nome
  }));
};

// Busca cidades baseado na sigla do estado
export const getCitiesByState = async (stateSigla: string) => {
  const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateSigla}/municipios`);
  return response.data.map((city: any) => city.nome);
};