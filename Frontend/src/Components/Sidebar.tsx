import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList, LayoutDashboardIcon, LogOutIcon, Menu, NotebookPen, Users } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const SIDEBAR_ITEMS = [
    { name: "Dashboard", icon: LayoutDashboardIcon, color: "#040E46", href: "/dashboardPage" },
    { name: "Patient", icon: Users, color: "#040E46", href: "/patientPage" },
    { name: "Consultation List", icon: ClipboardList, color: "#040E46", href: "/consultationPage" },
    { name: "Create Form", icon: NotebookPen, color: "#040E46", href: "/createForm" },
    { name: "Logout", icon: LogOutIcon, color: "#040E46", href: "/" }
];

function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const adminName = "Admin";

    return (
        <motion.div
            className={`relative z-10 transition-all duration-170 ease-linear flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
            animate={{ width: isSidebarOpen ? 256 : 55 }}
        >
            <div className="h-full bg-sky-300 backdrop-blur-md flex flex-col">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-full bg-sky-300 transition-colors max-w-fit"
                >
                    <Menu size={24} color="#040E46" />
                </motion.button>
                <div className="h-20 flex items-center p-4 bg-gradient-to-t from-sky-400 to-emerald-300">
                    <FaUserCircle size={50} color="#040E46" />
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                className="ml-4 text-xl font-reboto font-medium text-[#040E46] whitespace-nowrap"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2, delay: 0.4 }}
                                
                            >
                                <span>Welcome, {adminName}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <nav className="flex-grow">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link key={item.href} to={item.href}>
                                <motion.div
                                    className={`flex items-center p-4 text-sm font-medium border-transparent hover:bg-sky-500 hover:shadow-2xl transition-colors mb-2 ${isActive ? 'bg-gradient-to-t from-sky-400 to-emerald-300 text-white' : 'text-[#040E46]'}`}
                                >
                                    <item.icon size={20} style={isActive ? {color: 'white', minWidth: "20px"} : {color: item.color, minWidth: "20px"}} />
                                    <AnimatePresence>
                                        {isSidebarOpen ? (
                                            <motion.span
                                                className="ml-4 whitespace-nowrap"
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2, delay: 0.4 }}
                                            >
                                                {item.name}
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                className="ml-4 whitespace-nowrap"
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2, delay: 0.3 }}
                                            >
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </motion.div>
    );
}

export default Sidebar;
