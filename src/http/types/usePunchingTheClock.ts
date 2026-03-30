import { useMutation } from '@tanstack/react-query'

interface PunchingTheClock {
  token: string
  latitude: number
  longitude: number
}

export function usePunchingTheClock() {
  return useMutation({
    mutationKey: ['punching-the-clock'],

    mutationFn: async ({ token, latitude, longitude }: PunchingTheClock) => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/punchingTheClock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            latitude,
            longitude,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao bater ponto')
      }

      return response.json()
    },
  })
}