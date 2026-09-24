import { useCallback, useState } from 'react'
import { RolloverSection } from './RolloverSection'
import { PlanningSection } from './PlanningSection'

export function NightMode({
  endingDay,
  endingDayLabel,
  planningDay
}: {
  endingDay: string
  endingDayLabel: 'today' | 'yesterday'
  planningDay: string
}) {
  const [refreshSignal, setRefreshSignal] = useState(0)

  const handleCarried = useCallback(() => {
    setRefreshSignal((n) => n + 1)
  }, [])

  return (
    <div className="overlay-night-mode">
      <RolloverSection
        endingDay={endingDay}
        endingDayLabel={endingDayLabel}
        onCarried={handleCarried}
      />
      <PlanningSection planningDay={planningDay} refreshSignal={refreshSignal} />
    </div>
  )
}
