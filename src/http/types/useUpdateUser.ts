// http/mutations/useUpdateUser.ts
import { useMutation } from '@tanstack/react-query'

interface UpdateUserPayload {
  id: string
  username: string
  password?: string
  avatar?: File | null
}

export function useUpdateUser() {
  return useMutation({
    mutationKey: ['update-user'],
    mutationFn: async ({ id, username, password, avatar }: UpdateUserPayload) => {
      const formData = new FormData()
      formData.append('username', username)
      if (password) formData.append('password', password)
      if (avatar) formData.append('avatar', avatar)

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/updateUser/${id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar usuário')
      }

      return response.json()
    },
  })
}
