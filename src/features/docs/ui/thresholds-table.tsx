import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EXERCISE_IDS, getExercise } from "@/features/rep-counter/domain/exercises"

export function ThresholdsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Exercise</TableHead>
          <TableHead>Joints (angle at middle)</TableHead>
          <TableHead>down ≤</TableHead>
          <TableHead>up ≥</TableHead>
          <TableHead>dwell</TableHead>
          <TableHead>visibility ≥</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {EXERCISE_IDS.map(getExercise).map((d) => (
          <TableRow key={d.id}>
            <TableCell>{d.label}</TableCell>
            <TableCell>{d.joints.map((j) => j.join("–")).join(", ")}</TableCell>
            <TableCell>{d.downAngle}°</TableCell>
            <TableCell>{d.upAngle}°</TableCell>
            <TableCell>{d.minDwellMs} ms</TableCell>
            <TableCell>{d.minVisibility}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
