import { AnimatePresence, motion } from "framer-motion"
import { BarChart2, ClipboardList, LayoutDashboardIcon, Menu, NotebookPen, Scale, Users } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

const SIDEBAR_ITEMS =[
    {
        name:"Dashboard", 
        icon:LayoutDashboardIcon, 
        color:"#040E46", href:"/"
    },
    {
        name:"Patient", icon:Users, color:"#040E46", href:"/patientPage"
    },
    {
        name:"Consultation List", icon:ClipboardList, color:"#040E46", href:"/consultationPage"
    },
    {
        name:"Create Form", icon:NotebookPen, color:"#040E46", href:"/createPage"
    },
    
]

function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen]= useState(true)
  return (
    <motion.div
    className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'} `}
    animate ={{width: isSidebarOpen ? 256 : 80}}
    >
        <div className="h-full bg-sky-300 backdrop-blur-md p-4 flex flex-col ">
            <motion.button 
            whileHover={{scale:1.1}}
            whileTap={{scale: 0.9}} 
            onClick={()=> setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover: bg-sky-300 transition-colors max-w-fit ">
                <Menu size={24} color="#040E46"/>
            </motion.button>
            <nav className="mt-8 flex-grow">
                {SIDEBAR_ITEMS.map((item)=>(
                    <Link key={item.href} to={item.href}>
                     <motion.div
                     className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                        <item.icon size={20} style={{color: item.color, minWidth: "20px"}}/>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span
                                className='ml-4 whitespace-nowrap text-[#040E46]'
                                initial={{opacity: 0, width:0}}
                                animate={{opacity: 1, width:"auto"}}
                                exit={{opacity: 0, width:0}}
                                transition={{duration:0.2, delay:0.3}}
                                >
                                {item.name}
                                </motion.span>)}
                        </AnimatePresence>
                     </motion.div>

                    </Link>

                ))}
            </nav>
        </div>
    </motion.div>
  )
}

export default Sidebar
