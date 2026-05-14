import * as React from "react";
import { motion, Variants, TargetAndTransition, Easing } from "framer-motion";

const letterAnimation: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.06,
      duration: 0.4,
      ease: ["easeOut"] as Easing[],
    },
  }),
};

export const trailingDotsAnimation: Variants = {
  animate: (i: number): TargetAndTransition => ({
    opacity: [0, 1, 0, 0],
    transition: {
      delay: i * 0.3,
      duration: 1.2,
      ease: ["easeInOut"],
      repeat: Infinity,
      repeatType: "loop",
    },
  }),
};

interface IProps {
  text?: string;
}

const LoadingAnimation = ({ text = "Loading" }: IProps) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
    <motion.div className="flex space-x-1 text-3xl font-semibold text-gray-900 select-none mb-6">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="initial"
          animate="animate"
          variants={letterAnimation}
        >
          {char}
        </motion.span>
      ))}

      {[...Array(3)].map((_, i) => (
        <motion.span
          key={`trail-dot-${i}`}
          custom={i}
          initial={{ opacity: 0 }}
          animate="animate"
          variants={trailingDotsAnimation}
          className="inline-block"
          style={{ marginLeft: 2, color: "blue", fontSize: "25px" }}
        >
          .
        </motion.span>
      ))}
    </motion.div>
  </div>
);

export default React.memo(LoadingAnimation);
LoadingAnimation.displayName = "LoadingAnimation";
