"use client";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import { ClientPage } from "./components/ClientPage";
import AnimatedTasklist from "./components/animations/AnimatedTasklist";
import { DoorClosedIcon } from "lucide-react";

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
				<div className="flex flex-row justify-between">
					<SignOutButton>
						<button
							title={'Sign out'} 
							className="hover:cursor-pointer hover:brightness-50 transition-all duration-200 ease-linear
							 text-white font-bold py-2 px-4 rounded">
							<DoorClosedIcon />
						</button>
					</SignOutButton>
				</div>
				<ClientPage />
			</SignedIn>
		</>
	);
}

