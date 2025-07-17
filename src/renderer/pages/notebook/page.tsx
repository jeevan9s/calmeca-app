import NoteSidebar from "@/renderer/components/NoteSidebar";
import Layout from "../../components/Layout";
import { MDXEditor } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

export default function Notebook() {
    console.log("Notebook page loaded")

    return (
        <div id = "notebook-page" className="min-h-screen bg-black/30">
            <Layout />
            <NoteSidebar />
    
        </div>
    )
}