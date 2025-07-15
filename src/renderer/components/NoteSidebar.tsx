// sidebar to be rednerd on the notebook page

import { useState, useRef } from "react"
import { motion, AnimatePresence } from 'framer-motion'
import {PanelLeft, ChevronsRight} from 'lucide-react'



export default function NoteSidebar() {
    const [isOpen, setIsOpen] = useState(true)
    const [width, setWidth] = useState(180)
    const isResizing = useRef(false)

    const MIN_W = 128
    const ABS_MIN_W = 60
    const MAX_W = 256

    // logic 4 resizing 
    const handleMouseDown = () => {
        isResizing.current = true 
        document.addEventListener( 'mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return
        const newW = e.clientX 
        if (newW >= MIN_W && newW <= MAX_W) {
            setWidth(newW)
        }
    }

    const handleMouseUp = () => {
        isResizing.current = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }

    const handleResizeClick = (e: MouseEvent) => {
        setWidth(ABS_MIN_W)
    }

    const collapsed = width <= MIN_W 


   return (
        <>
            {isOpen ? (
                <motion.div
                    className="relative h-screen bg-black/40 flex flex-col"
                    animate={{ width }}
                    initial={false}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                >
<div className="p-2 text-white flex justify-between items-center">
                <AnimatePresence mode="wait">
                    {!collapsed ? (
                        <>
                            <motion.span
                                key="label"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                className="text-sm font-semibold font-raleway font-thin"
                            >
                                recent
                            </motion.span>
                            <motion.button
                                key="collapse"
                                onClick={handleResizeClick}
                                className="p-1 rounded-lg"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    scale: 1.05
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <PanelLeft className="w-4 h-4 text-white" strokeWidth={1.5} />
                            </motion.button>
                        </>
                    ) : (
                        <motion.button
                            key="expand"
                            onClick={() => setWidth(MAX_W)}
                            className="p-1 rounded-lg ml-5"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                scale: 1.05
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <ChevronsRight className="w-4 h-4 text-white" strokeWidth={2} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
                    <motion.div
                        onMouseDown={handleMouseDown}
                        className="absolute top-0 right-0 h-full cursor-ew-resize"
                        style={{ width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                        whileHover={{
                            backgroundColor: 'rgba(255, 255, 255, 0.13)',
                            scaleX: 1.6
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                </motion.div>
            ) : (
                <motion.div
                    className="h-screen bg-black/60 flex items-start"
                    initial={{ width: 0 }}
                    animate={{ width: 'auto' }}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                >
                </motion.div>
            )}
        </>
    )
}
