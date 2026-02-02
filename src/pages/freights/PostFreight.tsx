import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';

export function PostFreight() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estados do formulário baseados na sua tabela SQL
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    product: '',
    weight: '',
    vehicleType: '',
    bodyType: '',
    price: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Recupera o usuário logado para pegar o ID
      const storageUser = localStorage.getItem('@ChamaFrete:user');
      if (!storageUser) {
        alert("Sessão expirada. Faça login novamente.");
        return navigate('/login');
      }
      const user = JSON.parse(storageUser);

      // 2. Monta o payload conforme a tabela do banco
      const payload = {
        ...formData,
        user_id: user.id,
        isFeatured: 0, // Podemos mudar isso futuramente para fretes pagos
        weight: formData.weight ? parseFloat(formData.weight) : null,
        price: formData.price ? parseFloat(formData.price) : null,
      };

      const response = await api.post('freights', payload);

      if (response.data.success) {
        alert("Frete anunciado com sucesso!");
        navigate('/dashboard'); // Ou a tela de listagem
      } else {
        alert("Erro: " + response.data.error);
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Anunciar Nova Carga</h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Produto / Mercadoria</label>
          <input name="product" required onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" placeholder="Ex: Grãos, Peças automotivas..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Origem (Cidade/UF)</label>
          <input name="origin" required onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" placeholder="Ex: Itajaí, SC" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destino (Cidade/UF)</label>
          <input name="destination" required onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" placeholder="Ex: São Paulo, SP" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Peso (Toneladas/Kg)</label>
          <input name="weight" type="number" step="0.01" onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" placeholder="Ex: 15.5" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preço Oferecido (R$)</label>
          <input name="price" type="number" step="0.01" onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" placeholder="Ex: 2500.00" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Veículo</label>
          <select name="vehicleType" onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-black">
            <option value="">Selecione...</option>
            <option value="Bitrem">Bitrem</option>
            <option value="Carreta">Carreta</option>
            <option value="Truck">Truck</option>
            <option value="Toco">Toco</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Carroceria</label>
          <select name="bodyType" onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-black">
            <option value="">Selecione...</option>
            <option value="Grade Baixa">Grade Baixa</option>
            <option value="Graneleiro">Graneleiro</option>
            <option value="Baú">Baú</option>
            <option value="Sider">Sider</option>
          </select>
        </div>

        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            {loading ? 'Publicando...' : 'Publicar Frete'}
          </button>
        </div>
      </form>
    </div>
  );
}