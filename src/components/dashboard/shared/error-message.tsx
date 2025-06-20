import { motion, AnimatePresence } from "framer-motion";

function CustomErrorMessage({ error }: { error: string | null }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6 p-4 bg-red-900/20 border border-red-900/40 rounded-lg text-red-400"
        >
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CustomErrorMessage;
