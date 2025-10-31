import { Link } from "react-router";
import Footer from "~/components/footer";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";

export default function Trainees() {
    return (
        <div>
            <AdminNavbar />
      <Title title="Trainees" />
            <div className="bg-background-light font-display text-gray-800">
                <div className="flex min-h-screen w-full flex-col">
                    <main className="flex-1">
                        <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
                            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                <h1 className="text-3xl font-bold text-gray-900">Trainee Management</h1>
                                <div className="flex items-center gap-2 rounded-md border border-gray-300 px-14 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                                    <span className="material-symbols-outlined text-base text-gray-400">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="flex-1 border-none outline-none bg-transparent px-10 text-gray-700 placeholder-gray-400"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Link to={"/add-trainee"}>
                                        <button className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                                            <span className="material-symbols-outlined text-base"> add </span>
                                            <span>Create User</span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-background-light shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" scope="col">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" scope="col">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" scope="col">Department</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" scope="col">Status</th>
                                            <th className="relative px-6 py-3" scope="col"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        <tr>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-cover bg-center"></div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">Jane Doe</div>
                                                        <div className="text-xs text-gray-500">jane.doe@example.com</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">Admin</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">Human Resources</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Active</span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 text-gray-500 hover:text-primary"><span className="material-symbols-outlined text-xl"> edit </span></button>
                                                    <button className="p-2 text-red-500 hover:text-red-700"><span className="material-symbols-outlined text-xl"> toggle_off </span></button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-gray-500">Showing 1 to 5 of 20 results</p>
                                <div className="flex items-center gap-1">
                                    <button className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                        <span className="material-symbols-outlined text-xl"> chevron_left </span>
                                    </button>
                                    <button className="rounded-md border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary">1</button>
                                    <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">2</button>
                                    <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">3</button>
                                    <button className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50">
                                        <span className="material-symbols-outlined text-xl"> chevron_right </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <Footer />

        </div>
    )
}