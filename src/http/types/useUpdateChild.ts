// http/mutations/useUpdateChild.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UpdateChildPayload {
  id: number
  nome: string
  dateOfBirth: string
  points: number
  userId: number
}

export function useUpdateChild() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ['update-child'],
    mutationFn: async ({ id, nome, dateOfBirth, points, userId }: UpdateChildPayload) => {
      const body = {
        nome,
        dateOfBirth, // o servidor faz new Date(dateOfBirth)
        userId,
        points: Array.from({ length: Math.max(0, Number(points) || 0) }, () => ({})),
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/children/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || `Erro ao atualizar criança (${response.status})`)
      }

      return response.json()
    },
    // opcional: invalide queries relacionadas
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['children'] })
      qc.invalidateQueries({ queryKey: ['child', updated?.id] })
    },
  })
}
