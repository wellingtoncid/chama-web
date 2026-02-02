import React, { useEffect, useState } from 'react';
import { api } from '../../api/api';

export default function Marketplace() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/listings').then(res => setItems(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Marketplace Chama Frete</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item: any) => (
          <div key={item.id} className="border rounded-lg overflow-hidden shadow">
            <img src={`${process.env.REACT_APP_API_URL}/${item.main_image}`} alt={item.title} className="h-48 w-full object-cover" />
            <div className="p-4">
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-green-600 font-bold">R$ {item.price}</p>
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded">Ver Detalhes</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}