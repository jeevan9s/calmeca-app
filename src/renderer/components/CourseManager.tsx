// composable accessible course manager page
import { addCourse } from "@/services/core services/courseService";
import { Course } from "@/services/db";
import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";


export type newCourseInput = Omit<
  Course,
  "id" | "createdOn" | "archived" | "updatedOn" | "updatedFrom"
>;
type courseManagerProps = {
  isOpen: boolean;
  onClose: () => void;
  course?: Course;
  onCreate: (course: Course) => void;
};

export default function CourseManager({
  isOpen,
  onClose,
  course,
  onCreate,
}: courseManagerProps) {
console.log('hello')
  const [inputs, setInputs] = useState<newCourseInput>({
    name: "",
    courseId: "",
    type: "",
    description: "",
    endsOn: new Date(),
    color: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = <K extends keyof newCourseInput>(
    field: K,
    value: newCourseInput[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (course) setInputs(course);
    else
      setInputs({
        name: "",
        courseId: "",
        type: "",
        description: "",
        endsOn: new Date(),
        color: "#000000",
      });
  }, [course, isOpen]);

  const handleSubmit = async () => {
    if (!inputs.name.trim()) return;

    setLoading(true);
    try {
      const course = await addCourse({
        ...inputs,
        name: inputs.name.trim(),
        description: inputs.description?.trim() || "",
      });
      onCreate(course);
      setInputs({
        name: "",
        description: "",
        courseId: "",
        type: "",
        endsOn: new Date(),
        color: "",
      });
      onClose();
    } catch (err) {
      console.error("Failed to add course:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setInputs({
      name: "",
      description: "",
      courseId: "",
      type: "",
      endsOn: new Date(),
      color: "",
    });
    onClose();
  };


return (
    <Transition appear show={isOpen} as = {Fragment}>
        <Dialog as="div" className="relative z-50" onClose = {onClose}>
            <p>hello</p>

        </Dialog>
    </Transition>

)
}
