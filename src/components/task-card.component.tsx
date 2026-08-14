import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";
import type { TaskInputModel, TaskModel } from "#/domain/task/task.model";
import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";

export const TaskCard = ({
	task,
	onDelete,
	isDeleteLoading = false,
	canLoadDelete = false,
}: {
	task: TaskModel;
	onDelete: () => void;
	isDeleteLoading?: boolean;
	canLoadDelete?: boolean;
}) => {
	const { wrapper } = taskCardStyles();

	return (
		<div className={wrapper()}>
			<div className="flex justify-between items-center">
				<h3 className="text-sm font-semibold text-primary truncate">
					{task.title}
				</h3>
				{canLoadDelete && isDeleteLoading ? (
					<Spinner className="size-4 text-destructive" />
				) : (
					<button type="button" onClick={onDelete}>
						<Trash2 className="text-destructive size-4" />
					</button>
				)}
			</div>
			{task.description ? (
				<>
					<div className="mt-2" />
					<p className="text-sm text-foreground">{task.description}</p>
				</>
			) : null}
			<div className="mt-2" />
			<p className="text-xs text-gray-400">
				{format(task.createdAt, "dd/MM/yyyy")}
			</p>
		</div>
	);
};

const polishCardAnimations = {
	default: {
		borderColor: "#005f78",
	},
	delete: {
		borderColor: "#C70036",
	},
};

export const PolishTaskCard = ({
	task,
	onDelete,
}: {
	task: TaskModel;
	onDelete: () => void;
}) => {
	const { wrapper } = taskCardStyles();

	const [cardBorderAnimation, setCardBorderAnimation] = useState(
		polishCardAnimations.default,
	);

	const handleDelete = (completed: boolean) => {
		if (!completed) {
			setCardBorderAnimation(polishCardAnimations.default);
			return;
		}

		onDelete();
	};

	return (
		<motion.div
			className={wrapper()}
			initial={false}
			animate={cardBorderAnimation}
			transition={{ duration: 1, ease: "linear" }}
		>
			<div className="flex justify-between items-center">
				<h3 className="text-sm font-semibold text-primary truncate">
					{task.title}
				</h3>
				<PolishDeleteCardButton
					onMouseDown={() => {
						setCardBorderAnimation(polishCardAnimations.delete);
					}}
					onMouseUp={handleDelete}
				/>
			</div>
			{task.description ? (
				<>
					<div className="mt-2" />
					<p className="text-sm text-foreground">{task.description}</p>
				</>
			) : null}
			<div className="mt-2" />
			<p className="text-xs text-gray-400">
				{format(task.createdAt, "dd/MM/yyyy")}
			</p>
		</motion.div>
	);
};

const PolishDeleteCardButton = ({
	onMouseDown,
	onMouseUp,
}: {
	onMouseDown: () => void;
	onMouseUp: (completed: boolean) => void;
}) => {
	const [isPressing, setIsPressing] = useState(false);
	const isCompletedRef = useRef(false);

	const handleMouseDown = () => {
		isCompletedRef.current = false;
		setIsPressing(true);
		onMouseDown();
	};

	const handleMouseUp = () => {
		setIsPressing(false);
		onMouseUp(isCompletedRef.current);
	};

	return (
		<button
			type="button"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
		>
			{isPressing ? (
				<div className="size-4 relative">
					<svg
						aria-label="Deletar tarefa"
						width="100%"
						height="100%"
						viewBox="0 0 100 100"
						style={{ transform: "rotate(-90deg)" }}
					>
						<circle
							cx="50%"
							cy="50%"
							r="45%"
							fill="transparent"
							stroke="#e6e6e6"
							strokeWidth="10"
						/>
						<motion.circle
							cx="50%"
							cy="50%"
							r="45%"
							fill="transparent"
							stroke="#C70036"
							strokeWidth="10"
							strokeLinecap="round"
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ duration: 1, ease: "linear" }}
							onAnimationComplete={() => {
								isCompletedRef.current = true;
							}}
						/>
					</svg>
				</div>
			) : (
				<Trash2 className="text-destructive size-4" />
			)}
		</button>
	);
};

export const TaskCardLoading = ({ task }: { task: TaskInputModel }) => {
	const { wrapper } = taskCardStyles();

	return (
		<div className={twMerge(wrapper(), "opacity-50")}>
			<div className="flex justify-between items-center">
				<h3 className="text-sm font-semibold text-primary truncate">
					{task.title}
				</h3>
				<Spinner className="size-4 text-primary" />
			</div>
			{task.description ? (
				<>
					<div className="mt-2" />
					<p className="text-sm text-foreground">{task.description}</p>
				</>
			) : null}
			<div className="mt-2" />
			<p className="text-xs text-gray-400">
				{format(new Date(), "dd/MM/yyyy")}
			</p>
		</div>
	);
};

const taskCardStyles = tv({
	slots: {
		wrapper: "p-4 rounded-md bg-card border border-primary",
	},
});

export const TaskCardSkeleton = () => <Skeleton className="w-full h-28" />;
