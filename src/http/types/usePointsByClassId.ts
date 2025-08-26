import { useQuery } from '@tanstack/react-query'

// Ajuste este tipo conforme o schema real de `points` no seu Prisma.
// Mantive campos mínimos + index signature para evitar quebre de tipo.
export type Point = {
  id: number
  classId: number
  createdAt: string
  [key: string]: any
}

export type GetPointsResponse<T = Point> = {
  classId: number
  points: T[]
}

type UsePointsOptions = {
  /** Quantidade de cliques do botão "mostrar mais" (cada clique traz +3 itens) */
  clicks?: number
  /** Força habilitar/desabilitar a query (além do check de classId) */
  enabled?: boolean
  /** Token opcional; se fornecido, é enviado como Bearer token no header */
  token?: string
}

/**
 * Busca paginada por cliques: o backend interpreta `mostrarMais` e retorna `clicks * 3` itens
 * ordenados por `createdAt` desc para a turma informada (`classId`).
 */
export function usePointsByClassId<T = Point>(
  classId: number | null,
  { clicks = 1, enabled = true, token }: UsePointsOptions = {}
) {
  return useQuery<GetPointsResponse<T>>({
    queryKey: ['get-points-by-class', classId, clicks, token],
    enabled: Boolean(classId) && enabled,
    queryFn: async () => {
      if (!classId) throw new Error('classId inválido')

      const url = new URL(`${import.meta.env.VITE_BASE_URL}/children/getPoints/${classId}`)
      if (clicks && Number.isFinite(clicks)) {
        url.searchParams.set('mostrarMais', String(clicks))
      }

      const response = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar pontos')
      }

      const result = (await response.json()) as GetPointsResponse<T>
      return result
    },
  })
}

/**
 * Busca todos os pontos da turma (`classId`), ordenados por `createdAt` desc.
 */
export function useAllPointsByClassId<T = Point>(
  classId: number | null,
  { enabled = true, token }: Omit<UsePointsOptions, 'clicks'> = {}
) {
  return useQuery<GetPointsResponse<T>>({
    queryKey: ['get-all-points-by-class', classId, token],
    enabled: Boolean(classId) && enabled,
    queryFn: async () => {
      if (!classId) throw new Error('classId inválido')

      const url = `${import.meta.env.VITE_BASE_URL}/children/getAllPoints/${classId}`
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar pontos (todos)')
      }

      const result = (await response.json()) as GetPointsResponse<T>
      return result
    },
  })
}

/**
 * \uD83D\uDCDD Exemplo rápido de uso:
 *
 * const [clicks, setClicks] = useState(1)
 * const { data, isLoading } = usePointsByClassId(42, { clicks })
 * // data?.points => itens (clicks * 3)
 * // para carregar mais: setClicks((c) => c + 1)
 *
 * const all = useAllPointsByClassId(42)
 * // all.data?.points => todos os registros
 */
