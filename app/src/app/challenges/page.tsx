"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { trpc } from "~/server/trpc/client";
import { type serverClient } from "~/server/trpc/serverClient";
import { stringToColor } from "~/lib/color";
import useLocalStorage from "~/lib/useLocalStorage";

import { ImTicket } from "react-icons/im";
import { RiDraggable } from "react-icons/ri";
import { Button } from "~/components/ui/Button";

type Challenge = Awaited<
  ReturnType<ReturnType<typeof serverClient>["getChallenges"]>
>[0];

type Column = {
  id: UniqueIdentifier;
  title: string;
  static: boolean;
};

type Task = {
  id: UniqueIdentifier;
  columnId: UniqueIdentifier;
  challenge: Challenge;
};

export default function Page() {
  return (
    <main className="m-4">
      <KanbanBoard />
    </main>
  );
}

function KanbanBoard() {
  const challenges = trpc.getChallenges.useQuery();

  const [columns, setColumns] = useLocalStorage<Column[]>("columns", []);
  const columnsId = useMemo(
    () => columns.map((column) => column.id),
    [columns],
  );
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // fix hydration issue with document.body react portal
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor),
  );

  useEffect(() => {
    if (!challenges.data) return;

    setTasks((tasks) => {
      const newColumnId = (challenge: Challenge) => {
        const oldChallenge = tasks.find((task) => task.id === challenge.id);
        if (!oldChallenge) return challenge.category;
        if (oldChallenge.challenge.category !== challenge.category) {
          return challenge.category;
        }
        return oldChallenge.columnId;
      };

      const updatedTasks = tasks
        .filter((task) =>
          challenges.data.some((challenge) => challenge.id === task.id),
        )
        .map((task) => {
          const challenge = challenges.data.find(
            (challenge) => challenge.id === task.id,
          )!;
          return {
            id: challenge.id,
            columnId: newColumnId(challenge),
            challenge,
          };
        });

      const newTasks = challenges.data
        .filter((challenge) => !tasks.some((task) => task.id === challenge.id))
        .map((challenge) => ({
          id: challenge.id,
          columnId: newColumnId(challenge),
          challenge,
        }));

      const nextTasks = [...updatedTasks, ...newTasks];

      setColumns((columns) => {
        const columnsTitles = columns.map((column) => column.title);
        const newColumns = challenges.data
          .map((challenge) => challenge.category)
          .filter((category, index, array) => array.indexOf(category) === index)
          .filter((category) => !columnsTitles.includes(category))
          .map((category) => ({ id: category, title: category, static: true }));

        const filteredColumns = columns.filter(
          (column) =>
            !column.static ||
            nextTasks.some((task) => task.challenge.category === column.id),
        );

        return [...filteredColumns, ...newColumns];
      });

      return nextTasks;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges.data]);

  function deleteColumn(id: UniqueIdentifier) {
    setColumns((columns) => columns.filter((column) => column.id !== id));
    setTasks((tasks) =>
      tasks.map((task) => ({
        ...task,
        columnId:
          task.columnId === id ? task.challenge.category : task.columnId,
      })),
    );
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "column") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "task") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    if (active.data.current?.type === "task" && over.id === "placeholder") {
      const activeIndex = tasks.findIndex((task) => task.id === active.id);
      const newColumn: Column = {
        id: generateId(),
        title: `Column ${columns.length + 1}`,
        static: false,
      };

      setColumns((columns) => [...columns, newColumn]);
      setTasks((tasks) => {
        tasks[activeIndex].columnId = newColumn.id;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
      return;
    }

    if (active.data.current?.type === over.data.current?.type)
      setColumns((columns) => {
        const activeIndex = columns.findIndex(
          (column) => column.id === active.id,
        );

        const overIndex = columns.findIndex((column) => column.id === over.id);
        return arrayMove(columns, activeIndex, overIndex);
      });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const isActiveTask = active.data.current?.type === "task";
    if (!isActiveTask) return;

    const isOverTask = over.data.current?.type === "task";
    if (isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((task) => task.id === active.id);
        const overIndex = tasks.findIndex((task) => task.id === over.id);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
      return;
    }

    const isOverColumn = over.data.current?.type === "column";
    if (isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((task) => task.id === active.id);

        tasks[activeIndex].columnId = over.id;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
      return;
    }
  }

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      sensors={sensors}
    >
      <div className="flex gap-4">
        <div className="flex gap-4">
          <SortableContext items={columnsId}>
            {columns.map((column) => (
              <ColumnContainer
                key={column.id}
                column={column}
                deleteColumn={deleteColumn}
                tasks={tasks.filter((task) => task.columnId === column.id)}
              />
            ))}
            {activeTask && <AddColumnDrop />}
          </SortableContext>
        </div>
        {isMounted &&
          createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  tasks={tasks.filter(
                    (task) => task.columnId === activeColumn.id,
                  )}
                />
              )}
              {activeTask && <Task task={activeTask} />}
            </DragOverlay>,
            document.body,
          )}
      </div>
    </DndContext>
  );
}

const generateId = () => Math.floor(Math.random() * 10001);

function ColumnContainer({
  column,
  deleteColumn,
  tasks,
}: {
  column: Column;
  deleteColumn: (columnId: UniqueIdentifier) => void;
  tasks: Task[];
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", column },
  });

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const color = stringToColor(column.title);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "w-[500px] h-full flex flex-col rounded-md",
        isDragging && "opacity-70",
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={clsx(
          "p-4 bg-card font-bold m-1 rounded-md flex justify-between",
          color.background,
        )}
      >
        <span>{column.title}</span>
        {!column.static && (
          <Button onClick={() => deleteColumn(column.id)}>Delete</Button>
        )}
      </div>
      <div className="flex flex-grow flex-col gap-2 p-2">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function Task({ task }: { task: Task }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const color = stringToColor(task.challenge.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      key={task.id}
      className={clsx(
        "bg-card m-1 p-4 border-l-4",
        color.border,
        isDragging && "opacity-40",
      )}
    >
      <div className="flex justify-between">
        <div className="font-bold">
          <span className={color.text}>{task.challenge.category} / </span>
          <span>{task.challenge.name}</span>
          <span className="text-slate-400"> / easy / mbund</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <ImTicket className="w-5 h-5" />
          <RiDraggable {...attributes} {...listeners} className="w-5 h-5" />
        </div>
      </div>
      <p>{task.challenge.description}</p>
    </div>
  );
}

function AddColumnDrop() {
  const { setNodeRef, attributes, transform, transition, isOver, active } =
    useSortable({
      id: "placeholder",
      data: { type: "columnDrop" },
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isOver && active?.data.current?.type === "task")
    return (
      <div className="w-[200px] h-[200px] flex items-center justify-center bg-card ring-2 ring-primary rounded-md">
        Drop to add new column
      </div>
    );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="w-[200px] h-[200px] flex items-center justify-center bg-card rounded-md"
    >
      + Add Column
    </div>
  );
}
