"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/card";
import { motion } from "framer-motion";
import { ExternalLink, Plus, Trash2, AlertCircle } from "lucide-react";
import { Course, Resource } from "@/services/db";
import { useEffect, useState } from "react";
import { updateCourse } from "@/services/core services/courseService";

interface ResourceBayProps {
  course: Course;
  className?: string;
}

export default function ResourceBay({ course, className }: ResourceBayProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadResources = () => {
      const courseResources: Resource[] = [];
      if (course.resources) {
        course.resources.forEach((link, i) =>
          courseResources.push({
            id: `link-${i}`,
            title: link.title,
            url: link.url,
            type: "link",
          }),
        );
      }
      setResources(courseResources);
      setIsLoading(false);
    };
    loadResources();
  }, [course]);

  const addLink = async () => {
    const title = newLinkTitle.trim();
    const url = newLinkUrl.trim();
    if (!title || !url || isSaving) return;

    const updatedLinks = [...(course.resources || []), { title, url }];

    setIsSaving(true);
    try {
      await updateCourse(course.id, { resources: updatedLinks });
      setResources((prev) => [
        ...prev,
        { id: `link-${prev.length}`, title, link: url, type: "link" },
      ]);
      setNewLinkTitle("");
      setNewLinkUrl("");
    } catch (err) {
      console.error("Failed to add resource link", err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLink = async (indexToRemove: number) => {
    if (isSaving) return;

    const updatedLinks = (course.resources || []).filter((_, i) => i !== indexToRemove);

    setIsSaving(true);
    try {
      await updateCourse(course.id, { resources: updatedLinks });
      setResources((prev) => prev.filter((_, i) => i !== indexToRemove));
    } catch (err) {
      console.error("Failed to delete resource link", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addLink();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="bg-zinc-400/10 shadow-sm shadow-black/20 h-80 sm:h-[18em] flex flex-col rounded-[1.25em] w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <CardTitle className="font-dm text-base font-semibold leading-tight">
                resources
              </CardTitle>
              <CardDescription className="font-dm text-white/40 text-xs">
                useful links & course materials
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3 overflow-auto pr-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="resource title"
              className="w-full flex items-center font-thin text-sm gap-2 bg-zinc-800/50 rounded-xl text-white font-dm h-10 border border-zinc-700/50 outline-none transition-colors focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 px-3"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <input
              type="text"
              placeholder="specify URL"
              className="w-full flex font-thin text-sm items-center gap-2 bg-zinc-800/50 rounded-xl text-white font-dm h-10 border border-zinc-700/50 outline-none transition-colors focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 px-3"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={addLink}
              disabled={isSaving}
              className="flex items-center justify-center gap-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl text-white font-dm text-sm h-10 px-3 flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={14} /> add
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="border border-zinc-700/50 bg-zinc-800/50 p-2 rounded-xl animate-pulse space-y-1.5"
                >
                  <div className="h-3 w-28 bg-zinc-700/60 rounded" />
                  <div className="h-2.5 w-40 bg-zinc-700/40 rounded" />
                </div>
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-2 py-3 rounded-2xl border border-dashed border-zinc-800 flex-1">
              <AlertCircle size={20} className="text-neutral-500" />
              <p className="text-neutral-400 text-sm font-dm">
                no resources added yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {resources.map((res, index) => (
                <div
                  key={res.id}
                  className="bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50transition-colors border border-zinc-700/50 p-2 rounded-xl flex items-center justify-between gap-2 min-w-0"
                >
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col min-w-0 flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                  >
                    <p className="font-semibold truncate" title={res.title}>
                      {res.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {res.url}
                    </p>
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteLink(index)}
                    disabled={isSaving}
                    title="Delete resource"
                    className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors flex-shrink-0 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end pb-3 pr-3">
          <a
            href="https://google.com/mail/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-dm text-sm font-thin flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-zinc-800 transition-colors px-3 py-1.5 text-white/80 hover:text-white"
          >
            course email <ExternalLink size={12} />
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  );
}