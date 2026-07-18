import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { TaskNode } from '@/modules/tasks/sorting'
import { TaskItemCard } from '@/modules/tasks/components/TaskItemCard'

interface ListProps {
  nodes: TaskNode[]
  /** Ручная сортировка включает drag&drop только внутри своей группы братьев/сестёр. */
  draggable: boolean
}

export function TaskTreeList({ nodes, draggable }: ListProps) {
  const content = (
    <div className="flex flex-col gap-0.5">
      {nodes.map((node) => (
        <TaskTreeNode key={node.task.id} node={node} draggable={draggable} />
      ))}
    </div>
  )

  if (!draggable) return content

  return (
    <SortableContext
      items={nodes.map((node) => node.task.id)}
      strategy={verticalListSortingStrategy}
    >
      {content}
    </SortableContext>
  )
}

function TaskTreeNode({ node, draggable }: { node: TaskNode; draggable: boolean }) {
  const sortable = useSortable({ id: node.task.id, disabled: !draggable })
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  }

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={sortable.isDragging ? 'opacity-50' : undefined}
    >
      <div className="flex items-start gap-1">
        {draggable && (
          <button
            type="button"
            {...sortable.attributes}
            {...sortable.listeners}
            className="mt-2 shrink-0 cursor-grab touch-none px-1 text-[var(--color-text-muted)]"
            aria-label="Перетащить для изменения порядка"
          >
            ⠿
          </button>
        )}
        <div className="min-w-0 flex-1">
          <TaskItemCard task={node.task} />
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="ml-6 border-l border-[var(--color-border)] pl-2">
          <TaskTreeList nodes={node.children} draggable={draggable} />
        </div>
      )}
    </div>
  )
}
