import { useForm } from "@tanstack/react-form";
import {
	useMutation,
	useMutationState,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
	PolishTaskCard,
	TaskCardLoading,
	TaskCardSkeleton,
} from "#/components/task-card.component";
import { Button } from "#/components/ui/button";
import { Field, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Spinner } from "#/components/ui/spinner";
import { Textarea } from "#/components/ui/textarea";
import { TaskDatasource } from "#/data/task.datasource";
import type { TaskInputModel, TaskModel } from "#/domain/task/task.model";

export const Route = createFileRoute("/_layout/polish")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex justify-center">
			<div className="w-xl">
				<TaskList />
			</div>
		</div>
	);
}

const TaskList = () => {
	const [isCreating, setIsCreating] = useState(false);

	const toggleCreating = () => setIsCreating((prev) => !prev);

	const { data, isLoading } = useQuery({
		queryKey: ["polish-tasks"],
		queryFn: () => TaskDatasource("polish").list(),
	});

	const queryClient = useQueryClient();

	const { mutate: deleteTask } = useMutation({
		mutationFn: (taskId: string) => TaskDatasource("polish").remove(taskId),
		onMutate: async (data, context) => {
			await context.client.cancelQueries({ queryKey: ["polish-tasks"] });
			queryClient.setQueryData(["polish-tasks"], (old: TaskModel[]) =>
				old.filter((task) => task.id !== data),
			);
		},
	});

	const variables = useMutationState({
		filters: { mutationKey: ["addPolishTodo"], status: "pending" },
		select: (mutation) => mutation.state.variables as TaskInputModel,
	});

	return (
		<>
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-800">Tarefas</h2>
				<Button size="icon" onClick={toggleCreating}>
					<motion.div animate={{ rotate: isCreating ? 45 : 0 }}>
						<Plus />
					</motion.div>
				</Button>
			</div>
			<div className="mt-6" />
			<AnimatePresence>
				{isCreating ? (
					<motion.div
						className="overflow-hidden"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ ease: "easeOut" }}
					>
						<div className="p-4 border border-primary rounded-md">
							<TaskForm onSubmit={() => setIsCreating(false)} />
						</div>
						<div className="h-6" />
					</motion.div>
				) : null}
			</AnimatePresence>
			<ul>
				{isLoading ? (
					<>
						<TaskCardSkeleton />
						<div className="h-4" />
						<TaskCardSkeleton />
						<div className="h-4" />
						<TaskCardSkeleton />
					</>
				) : (
					<>
						{variables.map((task: TaskInputModel) => (
							<motion.li layout key={crypto.randomUUID()}>
								<TaskCardLoading task={task} />
								<div className="h-4" />
							</motion.li>
						))}
						<AnimatePresence>
							{data?.map((task: TaskModel) => (
								<motion.li
									layout
									key={task.id}
									className="overflow-hidden"
									initial={false}
									animate={{
										height: "auto",
										opacity: 1,
									}}
									exit={{ height: 0, opacity: 0 }}
									transition={{ ease: "easeIn" }}
								>
									<PolishTaskCard
										task={task}
										onDelete={() => {
											deleteTask(task.id);
										}}
									/>
									<div className="h-4" />
								</motion.li>
							))}
						</AnimatePresence>
					</>
				)}
			</ul>
		</>
	);
};

const TaskForm = ({ onSubmit }: { onSubmit: () => void }) => {
	const queryClient = useQueryClient();

	const { mutate: createTask, isPending } = useMutation<
		TaskModel,
		Error,
		TaskInputModel
	>({
		mutationFn: (task: TaskInputModel) =>
			TaskDatasource("polish").create(task, 1300),
		onMutate: () => {
			onSubmit();
		},
		onSuccess: async (data: TaskModel) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });
			queryClient.setQueryData(["polish-tasks"], (old: TaskModel[]) => [
				data,
				...old,
			]);
		},
		mutationKey: ["addPolishTodo"],
	});

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
		},
		onSubmit: ({ value: task }: { value: TaskInputModel }) => {
			createTask(task);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<form.Field
				name="title"
				validators={{
					onSubmit: ({ value }) =>
						!value ? "Título é obrigatório" : undefined,
				}}
				children={(field) => (
					<Field className="gap-1">
						<Input
							aria-invalid={field.state.meta.errors.length > 0}
							name={field.name}
							value={field.state.value}
							onChange={(e) => {
								console.log(e.target.value);
								field.handleChange(e.target.value);
							}}
							placeholder="Título"
						/>
						<FieldError
							errors={field.state.meta.errors.map((error) => ({
								message: error,
							}))}
						/>
					</Field>
				)}
			/>

			<div className="mt-4" />

			<form.Field
				name="description"
				children={(field) => (
					<Field>
						<Textarea
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Descrição"
						/>
					</Field>
				)}
			/>

			<div className="mt-4" />

			<div className="flex justify-end">
				<Button type="submit" disabled={isPending}>
					{isPending ? <Spinner data-icon="inline-start" /> : null}
					Criar
				</Button>
			</div>
		</form>
	);
};
