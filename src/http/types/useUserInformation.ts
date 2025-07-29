import { useQuery } from '@tanstack/react-query'

export type User = {
  id: number
  username: string
  position: string
  avatarURL: string
}

export function useUserInformation(token: string | null) {
  return useQuery<User>({
    queryKey: ['get-user', token],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/listUsers?token=${token}`)

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário')
      }

      const result: User = await response.json()
      return result
    },
  })
}
