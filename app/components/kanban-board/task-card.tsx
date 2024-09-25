import { Id, Task } from "@/types"
import { Button } from "../ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from '@dnd-kit/utilities';
import { Ellipsis,Logs,MessageSquareText,Paperclip } from "lucide-react"

interface Props {
    task: Task,
    deleteTask: (id: Id) => void
}

const TaskCard = ({ task, deleteTask }: Props) => {
    const [mouseIsOver, setMouseIsOver] = useState(false);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type:"Task",
            task,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform)
    }

    if (isDragging) {
        return <div
            ref={setNodeRef}
            style={style}
            className="opacity-50 bg-slate-50 p-2.5 h-[280px]  items-center justify-between flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab
            border-2 border-dashed border-[black]"
        >
        </div>
    }


    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-slate-50 items-center justify-between  text-left rounded-xl  cursor-grab dark:bg-[#292828] dark:font-bold hover:border hover:border-solid hover:border-black" 
            onMouseEnter={() => setMouseIsOver(true)}
            onMouseLeave={() => setMouseIsOver(false)}
        >
            <div className="p-2.5 ">
            {task.content}
            </div>
            {/* card */}
            <div className=" w-[320px] h-[178px] border-2 rounded-[12px] mx-auto px-[12px] py-[12px] mb-3 dark:bg-black dark:font-normal">
                {/* 1 */}
                <ul className="flex justify-between pb-2">
                    <li>
                        <p className="text-[14px] font-black dark:text-[#fff]">
                            Design system update
                        </p>
                        <p className="text-[12px] dark:text-[#fff]">Dribbble marketing</p>
                    </li>
                    <li className="ml-[20px] flex justify-center items-center w-[26px] h-[26px] rounded-[50%] bg-[#ffffff] border-[.5px] border-[#c2c2c2] dark:text-[#fff]">
                        <Ellipsis
                            size={20}
                            strokeWidth={0.75}
                            className="dark:text-[black]"
                        />
                    </li>
                </ul>
                {/* 2 */}
                <ul className="flex justify-between items-center pb-1">
                    <li className="flex items-center w-[76px] h-[23px] ">
                        <Logs className="dark:text-[#fff]" />
                        <p className="text-[14px] ml-1 dark:text-[#fff]">Progress</p>
                    </li>
                    <li>
                        <p className="text-[14px] font-bold dark:text-[#fff] ">/10</p>
                    </li>
                </ul>
                {/* 3 */}
                <ul className="w-[100%] bg-[#ededed] h-1 mt-2">
                    <li className=" bg-[#ffa048] h-1 w-[80%] "></li>
                </ul>
                {/* 4 */}
                <ul className="flex justify-between py-4 ">
                    <Button className="bg-[#f4f4f7] text-[#878da7] font-bold">ABC </Button>

                    <ul className="flex hidden">
                        <li className="flex items-center mr-2">
                            <MessageSquareText size={14} className="text-[#a2a3a4]" />
                            <p className="text-[10px] ml-1 font-bold text-[#a2a3a4]">3</p>
                        </li>
                        <li className="flex items-center">
                            <Paperclip size={14} className="text-[#a2a3a4]" />
                            <p className="text-[10px] ml-1 font-bold text-[#a2a3a4]">3</p>
                        </li>
                    </ul>

                    <ul className="flex relative  ">
                        <li className="z-[1] bg-red-700 relative left-4 w-[30px] h-[30px] rounded-[50%] border-2 border-white"></li>

                        <li className="bg-black z-[2] relative left-2  w-[30px] h-[30px] rounded-[50%] border-2 border-white"></li>

                        <li className="bg-white z-[3]  flex justify-center items-center w-[30px] h-[30px] rounded-[50%] border-2 border-[#a2a3a4] font-bold text-[12px] dark:text-black">
                            +3
                        </li>
                    </ul>
                </ul>
                {/* 5 */}
            </div>
            {
                mouseIsOver &&
                <a
                    href="#"
                    onClick={() => deleteTask(task.id)}
                    
                >
                    <Trash2 size={24} strokeWidth={1}  className="ml-[16px] pb-1"/>
                </a>
            }
        </div>
    )
}

export default TaskCard