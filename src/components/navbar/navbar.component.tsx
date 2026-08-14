import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { tv } from "tailwind-variants";

const NavbarWrapper = ({ children }: React.PropsWithChildren) => (
	<div className="w-full flex justify-center items-center py-4">
		<div className="max-w-7xl px-4 w-full flex gap-4">{children}</div>
	</div>
);

const NavbarItem = ({
	to,
	title,
	selected,
}: {
	to: string;
	title: string;
	selected?: boolean;
}) => {
	const { wrapper, link, background } = navbarItemStyles();

	return (
		<nav className={wrapper()}>
			<Link className="relative z-10" to={to}>
				<p className={link()}>{title}</p>
			</Link>
			{selected ? (
				<motion.div
					layoutId="navbar-item-selected"
					transition={{
						layout: {
							duration: 0.25,
							ease: "easeOut",
						},
					}}
					className={background()}
				/>
			) : null}
		</nav>
	);
};

const navbarItemStyles = tv({
	slots: {
		wrapper: "relative px-4 py-2",
		link: "text-md font-medium text-primary",
		background:
			"absolute w-full h-full bg-cyan-100 top-0 left-0 rounded-full z-0",
	},
});

export const Navbar = {
	Wrapper: NavbarWrapper,
	Item: NavbarItem,
};
