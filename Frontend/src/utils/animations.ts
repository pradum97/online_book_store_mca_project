import { TargetAndTransition } from "framer-motion";

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 1): TargetAndTransition => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: ["easeOut"],
    },
  }),
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};
