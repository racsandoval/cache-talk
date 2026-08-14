import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { tv } from "tailwind-variants";

export interface ModalProps {
	small?: boolean;
	opened?: boolean;
	onClose?: () => void;
	children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = (props) =>
	createPortal(
		<div className={style().wrapper({ opened: props.opened })}>
			<button
				className={style().overlay({ opened: props.opened })}
				onClick={props.onClose}
				type="button"
			/>
			<div
				className={style().box({ opened: props.opened, small: props.small })}
			>
				<button
					className={style().close()}
					onClick={props.onClose}
					type="button"
				>
					<X />
				</button>
				{props.children}
			</div>
		</div>,
		document.getElementById("modal") as HTMLElement,
	);

export const style = tv({
	slots: {
		wrapper: "absolute invisible z-50",
		overlay:
			"fixed top-0 right-0 bottom-0 left-0 bg-foreground opacity-0 transition-all invisible duration-300",
		close: "absolute top-4 right-4 p-md text-foreground cursor-pointer",
		box: [
			"fixed top-[80px] left-[50%] translate-x-[-50%]  translate-y-[-50%]",
			"p-4 w-[90%] m-w-[90%] m-h-[80%] overflow-auto overscroll-contain",
			"bg-background rounded-lg opacity-0",
			"transition-all",
		],
	},
	variants: {
		opened: {
			true: {
				wrapper: "visible",
				overlay: "opacity-30 visible",
				box: "translate-y-[0%] opacity-100",
			},
		},
		small: {
			true: {
				box: "w-[50%] m-w-[50%]",
			},
		},
	},
});
