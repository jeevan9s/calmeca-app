"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/card";
import { Button } from "@/components/button";
import { motion } from "framer-motion";
import { ExternalLink, Plus } from "react-feather";
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

  useEffect(() => {
    const loadResources = () => {
      const courseResources: Resource[] = [];
      if (course.links) {
        course.links.forEach((link, i) =>
          courseResources.push({
            id: `link-${i}`,
            title: link.title,
            link: link.url,
            type: "link",
          })
        );
      }
      setResources(courseResources);
      setIsLoading(false);
    };
    loadResources();
  }, [course]);

  const addLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    const updatedLinks = [
      ...(course.links || []),
      { title: newLinkTitle.trim(), url: newLinkUrl.trim() },
    ];

    await updateCourse(course.id, { links: updatedLinks });
    setResources((prev) => [
      ...prev,
      { id: `link-${prev.length}`, title: newLinkTitle.trim(), link: newLinkUrl.trim(), type: "link" },
    ]);
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="bg-zinc-400/10 h-80 sm:h-[17em] flex flex-col rounded-lg w-full">
        <CardHeader>
          <CardTitle className="font-dm">resources</CardTitle>
          <CardDescription className="text-white/50 font-dm">
            useful links & course materials
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-2 overflow-auto pr-2">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="resource title"
              className="w-full sm:w-64 flex items-center font-thin text-sm gap-2 bg-zinc-800 rounded-xl text-white font-dm h-10 border-none outline-none transition-transform duration-200 ease-in-out focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 active:scale-95 px-2"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="specify URL"
              className="w-full sm:w-64 flex font-thin text-sm items-center gap-2 bg-zinc-800 rounded-xl text-white font-dm h-10 border-none outline-none transition-transform duration-200 ease-in-out focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 active:scale-95 px-2"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
            />
            <Button onClick={addLink} className="flex items-center gap-2 bg-zinc-800 rounded-xl text-white font-dm h-10 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-zinc-700 hover:text-white focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50 active:scale-95 px-2">
              <Plus size={14} /> add
            </Button>
          </div>

          {isLoading ? (
            <p className="text-neutral-400 text-sm">loading...</p>
          ) : resources.length === 0 ? (
            <p className="text-neutral-400 text-sm italic">no resources available</p>
          ) : (
            resources.map((res) => (
              <a
                key={res.id}
                href={res.link}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-zinc-700/50 p-2 rounded-xl hover:bg-zinc-800/50 transition-all cursor-pointer flex flex-col"
              >
                <p className="font-semibold">{res.title}</p>
                <p className="text-xs text-neutral-400">{res.link}</p>
              </a>
            ))
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-2 pb-2 pr-2">
          <Button
            className="font-thin font-dm hover:underline rounded-md"
            as="a"
            href="https://outlook.office.com/mail/"
            target="_blank"
            rel="noopener noreferrer"
          >
            course email <ExternalLink />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
