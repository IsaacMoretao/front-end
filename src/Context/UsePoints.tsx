import { useState, useEffect } from 'react';
import { api } from '../lib/axios';

const usePoints = () => {
  const [pointsAdded, setPointsAdded] = useState<{ [key: number]: number[] }>(() => {
    const savedPoints = localStorage.getItem('pointsAdded');
    return savedPoints ? JSON.parse(savedPoints) : {};
  });

  useEffect(() => {
    localStorage.setItem('pointsAdded', JSON.stringify(pointsAdded));
  }, [pointsAdded]);

  useEffect(() => {
    Object.keys(pointsAdded).forEach((productId) => {
      const id = Number(productId);
      pointsAdded[id].forEach((timestamp) => {
        const timeLeft = 5 * 60 * 60 * 1000 - (Date.now() - timestamp);
        if (timeLeft > 0) {
          setTimeout(() => {
            setPointsAdded((prev) => {
              const updatedPoints = prev[id].filter((time) => time !== timestamp);
              return {
                ...prev,
                [id]: updatedPoints,
              };
            });
          }, timeLeft);
        }
      });
    });
  }, []);

  const handleAddPoint = async (productId: number) => {
    const currentTime = Date.now();
    if (!pointsAdded[productId] || pointsAdded[productId].length < 4) {
      try {
        const response = await api.put(`/addPoint/${productId}`, { pontos: 1 });

        if (response.status === 200) {
          setPointsAdded((prev) => ({
            ...prev,
            [productId]: [...(prev[productId] || []), currentTime],
          }));

          setTimeout(() => {
            setPointsAdded((prev) => {
              const updatedPoints = prev[productId].filter((time) => time !== currentTime);
              return {
                ...prev,
                [productId]: updatedPoints,
              };
            });
          }, 60 * 1000); // Remove after 1 minute
        }
      } catch (error) {
        console.error('Erro ao adicionar pontos:', error);
      }
    }
  };

  const handleRemovePoint = async (productId: number) => {
    if (pointsAdded[productId] && pointsAdded[productId].length > 0) {
      const latestTime = pointsAdded[productId][pointsAdded[productId].length - 1];
      const currentTime = Date.now();
  
      // Verifica se o ponto ainda está válido (dentro de 1 minuto)
      if (currentTime - latestTime <= 60 * 1000) {
        try {
          // Chame a API para remover um ponto, se necessário
          const response = await api.put(`/addPoint/${productId}`, { pontos: -1 });
  
          if (response.status === 200) {
            setPointsAdded((prev) => ({
              ...prev,
              [productId]: prev[productId].filter((time) => time !== latestTime),
            }));
          }
        } catch (error) {
          console.error('Erro ao remover pontos:', error);
        }
      } else {
        console.log('Ponto expirou e não pode ser removido.');
      }
    }
  };

  return { pointsAdded, handleAddPoint, handleRemovePoint };
};

export default usePoints;
