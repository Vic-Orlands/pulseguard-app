import { motion, AnimatePresence } from "framer-motion";

function CustomErrorMessage({ error }: { error: string | null }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="banner-error mb-6"
        >
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CustomErrorMessage;
