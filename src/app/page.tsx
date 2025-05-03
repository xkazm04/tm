"use client";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ClientPage } from "./components/ClientPage";
import AnimatedTasklist from "./components/animations/AnimatedTasklist";


export default function Home() {
	return (
		<>
			<SignedOut>
				<div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
					<div className="flex flex-col items-center gap-4">
						<SignInButton mode="modal">
							<button><AnimatedTasklist /></button>
						</SignInButton>
					</div>
				</div>
			</SignedOut>
			<SignedIn>
				<ClientPage />
			</SignedIn>
		</>
	);
}

