import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
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
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ProjectFormProps } from "@/types/project";

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
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
    }),
    exit: { opacity: 0, y: 10 },
  };

  return (
    <motion.div
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-5 h-full flex flex-col"
    >
      {/* Header */}
      <DialogHeader className="flex flex-row items-center justify-between mb-4">
        <div>
          <DialogTitle className="text-sm font-bold text-foreground">
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Set up your project details
          </DialogDescription>
        </div>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" />
        </button>
      </DialogHeader>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-3.5 flex-1">
        <motion.div custom={0} variants={fieldVariants} className="space-y-1">
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-foreground/80"
          >
            Project Name
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground focus:border-primary focus-visible:ring-0 h-8"
            disabled={isLoading}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-destructive text-[11px]"
              >
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div custom={1} variants={fieldVariants} className="space-y-1">
          <label
            htmlFor="description"
            className="block text-xs font-semibold text-foreground/80"
          >
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground focus:border-primary focus-visible:ring-0 min-h-[90px]"
            disabled={isLoading}
          />
          <AnimatePresence>
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-destructive text-[11px]"
              >
                {errors.description}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div custom={2} variants={fieldVariants} className="space-y-1">
          <label
            htmlFor="platform"
            className="block text-xs font-semibold text-foreground/80"
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
            <SelectTrigger className="bg-background border border-border text-foreground text-xs focus:border-primary focus-visible:ring-0 h-8">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border text-foreground">
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
                className="text-destructive text-[11px]"
              >
                {errors.platform}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          custom={3}
          variants={fieldVariants}
          className="flex justify-between gap-3 pt-3"
        >
          <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full border border-border text-foreground hover:bg-muted text-xs h-8 shadow-none font-semibold"
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-xs h-8 font-semibold shadow-none"
            >
              Create Project
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
}
