import { Outlet, Link } from "react-router"

export default function Layout() {
    return (
        <div>
            <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4 h-16">
                    <Link to={"/"} className="text-2xl font-semibold text-space-cadet">Dashboard</Link>

                    <button className="md:hidden p-2 rounded-md hover:bg-gray-100">
                        <span className="material-symbols-rounded text-2xl">menu</span>
                    </button>

                    <nav className="hidden md:flex items-center space-x-6">
                        <Link to={"/"} className="flex items-center gap-2 px-3 py-2 rounded-md text-blue-ryb bg-blue-50 hover:bg-blue-100">
                            <span className="material-symbols-rounded">grid_view</span> Home
                        </Link>
                        <Link to={"/"} className="flex items-center gap-2 px-3 py-2 rounded-md text-onyx hover:bg-gray-100">
                            <span className="material-symbols-rounded">folder</span> Sessions
                        </Link>
                        <Link to={"/"} className="flex items-center gap-2 px-3 py-2 rounded-md text-onyx hover:bg-gray-100">
                            <span className="material-symbols-rounded">list</span> Trainings
                        </Link>
                        <Link to={"/"} className="flex items-center gap-2 px-3 py-2 rounded-md text-onyx hover:bg-gray-100">
                            <span className="material-symbols-rounded">settings</span> Departments
                        </Link>
                        <Link to={"/"} className="flex items-center gap-2 px-3 py-2 rounded-md text-onyx hover:bg-gray-100">
                            <span className="material-symbols-rounded">bar_chart</span> Reports
                        </Link>
                        <div className="flex items-center gap-4 ml-6">
                            <Link to={"/"} className="p-2 rounded-md text-onyx hover:bg-gray-100">
                                <span className="material-symbols-rounded">notifications</span>
                            </Link>
                            <Link to={"/"} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100">
                                <span className="material-symbols-rounded">accounts_circle</span>
                                <div>
                                    <p className="text-xs font-semibold text-onyx">Elizabeth F</p>
                                    <p className="text-xs text-cool-gray">Admin</p>
                                </div>
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 pt-20">
                <Outlet/>
            </main>

            <footer className="bg-white py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <ul className="flex flex-wrap gap-3 text-sm text-davys-gray">
                    </ul>
                    <p className="text-sm text-davys-gray">&copy; 2022 <Link to={"/"} className="hover:text-blue-ryb">ARL Ghana</Link>. All Rights Reserved</p>
                </div>
            </footer>
        </div>
    )
}