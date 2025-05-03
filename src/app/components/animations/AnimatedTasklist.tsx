import { useState, useEffect } from "react";
import { useLottie } from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCheckIcon, GithubIcon } from "lucide-react";
import tasklist from "./tasklist.json";
import { MorphingText } from "@/app/components/animations/morphing-text";

const AnimatedTasklist = () => {
    const [showCheckmark, setShowCheckmark] = useState(false);

    const options = {
        animationData: tasklist,
        loop: false
    };

    const { View } = useLottie(options);

    const texts = [
        "Welcome",
        "To",
        "TaskMaster",
    ];

    useEffect(() => {
        // Set a timeout to show the checkmark after 5 seconds
        const timer = setTimeout(() => {
            setShowCheckmark(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="absolute top-[30%] left-[40%]">
            <AnimatePresence mode="wait">
                {!showCheckmark ? (
                    <motion.div
                        key="lottie"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {View}
                    </motion.div>
                ) : (
                    <motion.div
                        className="text-green-300 transition-all ease-in-out relative"
                        key="checkmark"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1
                        }}
                        transition={{
                            stiffness: 300,
                            damping: 60,
                            bounce: 0.5,
                            duration: 0.5
                        }}
                    >
                        <div className="absolute top-10 left-10 cursor-pointer 
                        text-white hover:text-gray-500 transition-all ease-linear duration-300">
                            <GithubIcon size={30} />
                        </div>
                        <div className="flex cursor-pointer hover:text-gray-400  transition-all ease-linear duration-300">
                            <CheckCheckIcon size={180} />
                        </div>
                    </motion.div>
                )}
                {showCheckmark && 
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5 }}
                    className="text-green-200 w-full absolute top-[90%]
                    cursor-pointer hover:text-gray-400  transition-all ease-linear duration-300">
                    <MorphingText texts={texts} />
                </motion.div>}
            </AnimatePresence>
        </div>
    );
};

export default AnimatedTasklist;