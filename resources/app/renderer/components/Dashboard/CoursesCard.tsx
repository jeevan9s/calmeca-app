"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/card";
import { Button } from "@/components/button";
import { motion } from "framer-motion";
import { ExternalLink } from "react-feather";
import { Course } from "@/services/db";
import { useEffect, useState } from "react";
import MiniCourseCard from "../Courses/miniCourseCard";
import { getAllCourses } from "@/services/core services/courseService";
import { Link } from "react-router-dom";

export default function CoursesCard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const allCourses = await getAllCourses();
        setCourses(allCourses);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="bg-zinc-400/10 h-80 sm:h-84 flex flex-col rounded-lg">
        <CardHeader>
          <CardTitle className="font-nun">courses</CardTitle>
          <CardDescription className="text-white/50 font-dm">currently taking</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-wrap gap-2 overflow-auto">
          {isLoading ? (
            <p className="text-neutral-400 text-sm">loading...</p>
          ) : (
            courses
              .filter(course => course.title && course.title.trim() !== "" && course.code && course.code.trim() !== "")
              .map((course) => (
                <MiniCourseCard
                  key={course.id}
                  name={course.title}
                  code={course.code}
                  color={course.color || "#8B0000"}
                  course={course}
                />
              ))
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pb-2 pr-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/courseoverview" className="no-underline">
              <Button className="font-thin font-dm hover:underline rounded-md">
                course overview <ExternalLink />
              </Button>
            </Link>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
