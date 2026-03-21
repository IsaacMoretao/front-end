import * as React from 'react'
import { Modal, Box, IconButton, CircularProgress, Alert, Stack, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useTheme } from '@mui/material/styles'
import { Point, useAllPointsByClassId } from '../http/types/usePointsByClassId'
import { BarChart } from '@mui/x-charts';

export type InfoPointsModalProps<T extends Point = Point> = {
  classId: number | null
  open: boolean
  onClose: () => void
  token?: string
  months?: number
  aggregate?: 'sum' | 'count'
  valueField?: string

  points?: T[]
}

function normalizeMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabelPT(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' })
    .format(date)
    .replace('.', '')
}

function extractNumericValue(item: any, aggregate: 'sum' | 'count', valueField?: string) {
  if (aggregate === 'count') return 1
  const candidates = valueField ? [valueField] : ['value', 'delta', 'points', 'amount', 'score']
  for (const key of candidates) {
    const v = item?.[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return 1
}

export function InfoPointsModal<T extends Point = Point>({
  classId,
  open,
  onClose,
  token,
  months = 12,
  aggregate = 'count',
  valueField,
}: InfoPointsModalProps<T>) {
  const theme = useTheme()

  const { data, isLoading, isError, error } = useAllPointsByClassId<T>(classId, {
    enabled: open && classId != null,
    token,
  })


  const { labels, values, total } = React.useMemo(() => {
    const now = new Date()
    const windowDates: Date[] = []
    for (let i = months - 1; i >= 0; i--) windowDates.push(new Date(now.getFullYear(), now.getMonth() - i, 1))

    const buckets = new Map<string, number>()
    for (const d of windowDates) buckets.set(normalizeMonthKey(d), 0)

    const list = data?.points ?? []
    console.log(data)
    for (const item of list as any[]) {
      const created = new Date(item.createdAt)
      const key = normalizeMonthKey(new Date(created.getFullYear(), created.getMonth(), 1))
      if (buckets.has(key)) {
        const current = buckets.get(key) ?? 0
        buckets.set(key, current + extractNumericValue(item, aggregate, valueField))
      }
    }

    const labels = windowDates.map((d) => monthLabelPT(d))
    const values = windowDates.map((d) => buckets.get(normalizeMonthKey(d)) ?? 0)
    const total = values.reduce((acc, n) => acc + n, 0)

    console.log("classId recebido:", classId)
    console.log("open:", open)

    return { labels, values, total }
  }, [data?.points, months, aggregate, valueField])


  return (
    <Modal open={open} onClose={onClose} aria-labelledby="info-pontos-title" aria-describedby="info-pontos-desc">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '92vw', sm: 560, md: 720 },
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: 3,
          boxShadow: 24,
          p: { xs: 2, sm: 3 },
          maxHeight: '85vh',
          overflow: 'auto',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Typography id="info-pontos-title" variant="h6" component="h2">
            Pontos por mês
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton aria-label="Fechar" onClick={onClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Typography id="info-pontos-desc" variant="body2" color="text.secondary" mb={2}>
          {aggregate === 'count' ? 'Contagem de registros por mês' : 'Total de pontos (soma) por mês'}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', height: 320 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">{error instanceof Error ? error.message : 'Erro ao carregar pontos'}</Alert>
        ) : (
          <>
            <Box sx={{ width: '100%', mb: 1 }}>
              <BarChart
                height={320}
                series={[{ data: values, label: aggregate === 'count' ? 'Registros' : 'Pontos' }]}
                xAxis={[{ data: labels, scaleType: 'band' }]}
                margin={{ top: 10, right: 20, bottom: 30, left: 40 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Total no período: <strong>{total}</strong>
            </Typography>
          </>
        )}
      </Box>
    </Modal>
  )
}

/**
 * Exemplo de uso:
 *
 * const [infoChartOpen, setInfoChartOpen] = React.useState(false)
 *
 * <button onClick={() => setInfoChartOpen(true)}>Info</button>
 * <InfoPointsModal
 *   classId={product.id}
 *   open={infoChartOpen}
 *   onClose={() => setInfoChartOpen(false)}
 *   months={12}
 *   aggregate="sum"
 * />
 */
