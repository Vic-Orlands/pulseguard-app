import { Button } from "@/components/ui/button";
import { LifeBuoy } from "lucide-react";
import { motion } from "motion/react";

export default function HelpButton() {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-10"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        size="lg"
        className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
      >
        <LifeBuoy className="h-6 w-6" />
      </Button>
    </motion.div>
  );
}
