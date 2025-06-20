import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProjectFormProps = {
  onSubmit: (data: {
    name: string;
    description: string;
    platform: string;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
};

export default function ProjectForm({
  onSubmit,
  onCancel,
  isLoading,
}: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    platform: "Next.js",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.platform) newErrors.platform = "Platform is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const trimmedDescription = formData.description.trim();
      const finalFormData = {
        ...formData,
        description:
          trimmedDescription ||
          `${formData.name} is an application integrated with full-stack observability and error tracking.`,
      };

      onSubmit(finalFormData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Animation variants for form content
  const contentVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  // Animation variants for form fields
  const fieldVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
    exit: { opacity: 0, y: 10 },
  };

  return (
    <motion.div
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 h-full flex flex-col"
    >
      {/* Header */}
      <DialogHeader className="flex flex-row items-center justify-between mb-4">
        <div>
          <DialogTitle className="text-lg font-semibold text-white">
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            Set up your project details
          </DialogDescription>
        </div>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </DialogHeader>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <motion.div custom={0} variants={fieldVariants} className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white"
          >
            Project Name
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500 focus-visible:ring-0"
            disabled={isLoading}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-400 text-xs"
              >
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div custom={1} variants={fieldVariants} className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-white"
          >
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500 focus-visible:ring-0 min-h-[100px]"
            disabled={isLoading}
          />
          <AnimatePresence>
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-400 text-xs"
              >
                {errors.description}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div custom={2} variants={fieldVariants} className="space-y-2">
          <label
            htmlFor="platform"
            className="block text-sm font-medium text-white"
          >
            Platform
          </label>
          <Select
            value={formData.platform}
            onValueChange={(value) => {
              setFormData((prev) => ({ ...prev, platform: value }));
              setErrors((prev) => ({ ...prev, platform: "" }));
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus-visible:ring-0">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="Next.js">Next.js</SelectItem>
              <SelectItem value="React">React</SelectItem>
              <SelectItem value="Node.js">Node.js</SelectItem>
              <SelectItem value="Angular">Angular</SelectItem>
              <SelectItem value="Vue">Vue</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <AnimatePresence>
            {errors.platform && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-400 text-xs"
              >
                {errors.platform}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          custom={3}
          variants={fieldVariants}
          className="flex justify-between gap-3 pt-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 duration-300 transform hover:scale-105"
            >
              Create Project
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
}
