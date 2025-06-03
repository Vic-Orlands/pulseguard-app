import { useState } from "react";
import { Loader2 } from "lucide-react";
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
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.platform) newErrors.platform = "Platform is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Project Name
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="bg-black/30 border border-blue-900/40"
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="bg-black/30 border border-blue-900/40 min-h-[100px]"
        />
        {errors.description && (
          <p className="text-red-500 text-xs">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="platform" className="block text-sm font-medium">
          Platform
        </label>
        <Select
          value={formData.platform}
          onValueChange={(value) => {
            setFormData((prev) => ({ ...prev, platform: value }));
            setErrors((prev) => ({ ...prev, platform: "" }));
          }}
        >
          <SelectTrigger className="bg-black/30 border border-blue-900/40">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent className="border border-blue-900/40">
            <SelectItem value="Next.js">Next.js</SelectItem>
            <SelectItem value="React">React</SelectItem>
            <SelectItem value="Node.js">Node.js</SelectItem>
            <SelectItem value="Angular">Angular</SelectItem>
            <SelectItem value="Vue">Vue</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.platform && (
          <p className="text-red-500 text-xs">{errors.platform}</p>
        )}
      </div>

      <div className="flex justify-between gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Project"
          )}
        </Button>
      </div>
    </form>
  );
}
