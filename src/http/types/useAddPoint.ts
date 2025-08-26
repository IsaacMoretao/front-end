// http/mutations/useAddPoint.ts
import { useMutation } from '@tanstack/react-query'

interface AddPointPayload {
  childId: number
  userId: string
}

export function useAddPoint() {
  return useMutation({
    mutationKey: ['add-point'],
    mutationFn: async ({ childId, userId }: AddPointPayload) => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/addPoint/${childId}/${userId}`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao adicionar ponto')
      }

      return response.json()
    },
  })
}
