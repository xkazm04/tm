
"use client";

import { useState } from "react";
import { Button } from "./ui/button"
import { CheckCircle, AlertCircle, ServerCrash, Loader2 } from "lucide-react"; // Added Loader2
import { motion } from "framer-motion";

export function HealthCheckButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const checkHealth = async () => {
    setStatus("loading");
    try {
      const backendUrl = "http://localhost:8000/health"; // Changed port to 8000 for FastAPI default
      const response = await fetch(backendUrl);

      if (response.ok) {
        const data = await response.json();
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        const errorText = await response.text(); // Try to get more info
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (error) {
      setStatus("error");
      console.error("Health check failed:", error);
      let description = "Could not connect to the backend. ";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          description += "Please ensure the backend server is running on http://localhost:8000 and accessible. Check for CORS issues if the backend is running.";
        } else {
          description += `Error: ${error.message}`;
        }
      } else {
        description += "An unknown error occurred.";
      }
       // Reset status after a short delay
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <Loader2 className="mr-2 animate-spin" /> Checking...
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle className="mr-2 text-green-500" /> Healthy
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="mr-2" /> Check Failed
          </>
        );
      default:
        return (
           <>
            <ServerCrash className="mr-2" /> Check Backend Health
          </>
        );
    }
  };

  const getButtonVariant = () => {
     switch (status) {
      case "success":
        return "default"; // Use default which is styled as primary
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Button
        onClick={checkHealth}
        disabled={status === "loading"}
        variant={getButtonVariant()}
        className="transition-all duration-300 ease-in-out min-w-[200px]" // Added min-width
      >
        {getButtonContent()}
      </Button>
    </motion.div>
  );
}
