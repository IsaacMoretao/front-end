// http/mutations/useRemovePoint.ts
import { useMutation } from '@tanstack/react-query'

interface RemovePointPayload {
  childId: number
}

export function useRemovePoint() {
  return useMutation({
    mutationKey: ['remove-point'],
    mutationFn: async ({ childId }: RemovePointPayload) => {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/deletePoint/${childId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao remover ponto');
      }

      return res.json();
    },
  });
}
