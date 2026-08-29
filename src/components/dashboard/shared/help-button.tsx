import { HugeiconsIcon } from "@/components/phosphor-icons";
import { LifebuoyIcon } from "@/components/phosphor-icons";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HelpButton() {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-10"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <button
        className="btn-primary rounded-full h-14 w-14 shadow-none"
        title="Help"
      >
        <HugeiconsIcon icon={LifebuoyIcon} className="h-6 w-6" />
      </button>
    </motion.div>
  );
}
