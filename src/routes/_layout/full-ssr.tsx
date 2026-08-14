import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";
import { TaskCard } from "#/components/task-card.component";
import { Button } from "#/components/ui/button";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { TaskDatasource } from "#/data/task.datasource";
import type { TaskInputModel, TaskModel } from "#/domain/task/task.model";
import { wait } from "#/lib/timer.utils";

export const Route = createFileRoute("/_layout/full-ssr")({
	component: RouteComponent,
});

type Tabs = "list" | "form";

function RouteComponent() {
	const [tab, setTab] = useState<Tabs>("list");

	const handleAddTask = async () => {
		await wait(500);
		setTab("form");
	};

	const handleBackToTaskList = async () => {
		await wait(500);
		setTab("list");
	};

	return (
		<div className="flex justify-center">
			<div className="w-xl">
				{tab === "list" ? (
					<TaskList onAddTask={handleAddTask} />
				) : (
					<TaskForm onBackToTaskList={handleBackToTaskList} />
				)}
			</div>
		</div>
	);
}

const TaskList = ({ onAddTask }: { onAddTask: () => void }) => {
	const { data, isFetching } = useQuery({
		queryKey: ["ssr-tasks"],
		queryFn: () => TaskDatasource("ssr").list(),
	});

	const queryClient = useQueryClient();

	const { mutate: deleteTask } = useMutation({
		mutationFn: (taskId: string) => TaskDatasource("ssr").remove(taskId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ssr-tasks"] });
		},
	});

	if (isFetching) {
		return;
	}

	return (
		<>
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-800">Tarefas</h2>
				<Button size="icon" onClick={onAddTask}>
					<Plus />
				</Button>
			</div>
			<div className="mt-6" />
			<ul className="space-y-4">
				{data?.map((task: TaskModel) => (
					<li key={task.id}>
						<TaskCard
							task={task}
							onDelete={() => {
								deleteTask(task.id);
							}}
						/>
					</li>
				))}
			</ul>
		</>
	);
};

const TaskForm = ({ onBackToTaskList }: { onBackToTaskList: () => void }) => {
	const { mutate: createTask } = useMutation({
		mutationFn: (task: TaskInputModel) =>
			TaskDatasource("ssr").create(task, 1300),
		onSuccess: () => {
			onBackToTaskList();
		},
	});

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const data = Object.fromEntries(new FormData(e.currentTarget));
		console.log(data);
		if (!data.title) {
			return;
		}

		const task: TaskInputModel = {
			title: data.title as string,
			description: data.description ? (data.description as string) : undefined,
		};

		createTask(task);
	};

	return (
		<>
			<div className="flex gap-4 items-center">
				<Button size="icon" onClick={onBackToTaskList}>
					<ChevronLeft />
				</Button>
				<h2 className="text-2xl font-bold text-gray-800">Criar tarefa</h2>
			</div>
			<div className="mt-6" />

			<form onSubmit={handleSubmit}>
				<Field>
					<FieldLabel>Título</FieldLabel>
					<Input required name="title" placeholder="Adicione uma tarefa" />
					<FieldError errors={[]} />
				</Field>

				<div className="mt-4" />

				<Field>
					<FieldLabel>Descrição</FieldLabel>
					<Textarea name="description" />
				</Field>

				<div className="mt-6" />

				<div className="flex justify-end">
					<Button type="submit">Criar tarefa</Button>
				</div>
			</form>
		</>
	);
};
