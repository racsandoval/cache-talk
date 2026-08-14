import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar/navbar.component";

export const Route = createFileRoute("/_layout")({ component: Layout });

function Layout() {
	const { pathname } = useLocation();

	return (
		<div className="flex flex-col h-screen bg-gray-50">
			<Navbar.Wrapper>
				<Navbar.Item
					to="/full-ssr"
					title="Full SSR"
					selected={pathname === "/full-ssr" || pathname === "/"}
				/>
				<Navbar.Item
					to="/ssr-with-modal"
					title="SSR with Modal"
					selected={pathname === "/ssr-with-modal"}
				/>
				<Navbar.Item
					to="/loading"
					title="Loading"
					selected={pathname === "/loading"}
				/>
				<Navbar.Item
					to="/cache"
					title="Optimistic"
					selected={pathname === "/cache"}
				/>
				<Navbar.Item
					to="/polish"
					title="Polish"
					selected={pathname === "/polish"}
				/>
			</Navbar.Wrapper>
			<div className="flex-1 w-full p-6">
				<Outlet />
			</div>
		</div>
	);
}
