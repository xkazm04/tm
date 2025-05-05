"use client";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import dynamic from 'next/dynamic';
import { DoorClosedIcon } from "lucide-react";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css"; 
const ClientPage = dynamic(() => import("./components/ClientPage").then(mod => mod.ClientPage), { ssr: false });
const AnimatedTasklist = dynamic(() => import("./components/animations/AnimatedTasklist"), { ssr: false });

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
				 <CopilotKit publicApiKey={`${process.env.NEXT_PUBLIC_COPILOT_API_KEY}`}>
					<ClientPage />
				</CopilotKit>
			</SignedIn>
		</>
	);
}

