import {
  BookOpen,
  Dumbbell,
  GraduationCap,
  Play,
  RotateCcw,
  Target,
  Zap,
} from "lucide-react";
import type { TaskType } from "@/lib/plan-data";

/** The task type icon. lucide only, monochrome, one stroke weight. */
const ICONS: Record<TaskType, typeof Play> = {
  video: Play,
  book: BookOpen,
  drill: Zap,
  workout: Dumbbell,
  review: RotateCcw,
  checkpoint: Target,
  tutor: GraduationCap,
};

export function TaskIcon({ type, className }: { type: TaskType; className?: string }) {
  const Icon = ICONS[type];
  return <Icon aria-hidden strokeWidth={2} className={className} />;
}
