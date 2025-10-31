import Footer from "~/components/footer"
import AdminNavbar from "~/components/navbar" 
import Title from "~/components/Title"

export default function Departments() {
    return (
        <div>
            <AdminNavbar />
      <Title title="Departments" />
<div>
    <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-6 py-20">
            <div className="flex flex-col gap-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Department Performance</h2>
                    <p className="mt-1 text-gray-500">Compare department performance across different metrics.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <p className="text-sm font-medium text-gray-500">Average Score</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">85%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">92%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <p className="text-sm font-medium text-gray-500">Number of Trainees</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">250</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-xl font-bold text-gray-900">Average Scores by Department</h3>
                        <div className="flex items-center gap-2">
                            <button className="bg-blue-500/20 text-blue-500 p-2 rounded-lg text-xs font-bold">TOP 5</button>
                            <button className="bg-gray-200 text-gray-600 p-2 rounded-lg text-xs font-bold">BOTTOM 5</button>
                        </div>
                    </div>
                    <div className="mt-6 space-y-5">
                        <div className="grid grid-cols-[100px_1fr_50px] items-center gap-4">
                            <p className="text-sm font-medium text-gray-600">Engineering</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full" ></div>
                            </div>
                            <p className="text-sm font-bold text-gray-900">88%</p>
                        </div>
                        <div className="grid grid-cols-[100px_1fr_50px] items-center gap-4">
                            <p className="text-sm font-medium text-gray-600">Marketing</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full" ></div>
                            </div>
                            <p className="text-sm font-bold text-gray-900">92%</p>
                        </div>
                        <div className="grid grid-cols-[100px_1fr_50px] items-center gap-4">
                            <p className="text-sm font-medium text-gray-600">Sales</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full" ></div>
                            </div>
                            <p className="text-sm font-bold text-gray-900">75%</p>
                        </div>
                        <div className="grid grid-cols-[100px_1fr_50px] items-center gap-4">
                            <p className="text-sm font-medium text-gray-600">HR</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full" ></div>
                            </div>
                            <p className="text-sm font-bold text-gray-900">95%</p>
                        </div>
                        <div className="grid grid-cols-[100px_1fr_50px] items-center gap-4">
                            <p className="text-sm font-medium text-gray-600">Finance</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full" ></div>
                            </div>
                            <p className="text-sm font-bold text-gray-900">82%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 overflow-x-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Attempts per Department (Heatmap Table)</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg" scope="col">Department</th>
                                <th className="px-6 py-3 text-center" scope="col">Monday</th>
                                <th className="px-6 py-3 text-center" scope="col">Tuesday</th>
                                <th className="px-6 py-3 text-center" scope="col">Wednesday</th>
                                <th className="px-6 py-3 text-center" scope="col">Thursday</th>
                                <th className="px-6 py-3 text-center rounded-r-lg" scope="col">Friday</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b">
                                <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" scope="row">Engineering</th>
                                <td className="px-6 py-4 text-center"><div className="heatmap-2 rounded-lg p-2">5</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-3 rounded-lg p-2">8</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-5 rounded-lg p-2">12</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-4 rounded-lg p-2">10</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-3 rounded-lg p-2">7</div></td>
                            </tr>
                            <tr className="bg-white border-b">
                                <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" scope="row">Marketing</th>
                                <td className="px-6 py-4 text-center"><div className="heatmap-1 rounded-lg p-2">3</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-2 rounded-lg p-2">6</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-4 rounded-lg p-2">9</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-3 rounded-lg p-2">7</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-2 rounded-lg p-2">5</div></td>
                            </tr>
                            <tr className="bg-white border-b">
                                <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" scope="row">Sales</th>
                                <td className="px-6 py-4 text-center"><div className="heatmap-3 rounded-lg p-2">7</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-4 rounded-lg p-2">10</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-6 rounded-lg p-2">15</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-5 rounded-lg p-2">12</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-4 rounded-lg p-2">9</div></td>
                            </tr>
                            <tr className="bg-white border-b">
                                <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" scope="row">HR</th>
                                <td className="px-6 py-4 text-center"><div className="heatmap-1 rounded-lg p-2">2</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-2 rounded-lg p-2">4</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-2 rounded-lg p-2">6</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-2 rounded-lg p-2">5</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-1 rounded-lg p-2">3</div></td>
                            </tr>
                            <tr className="bg-white">
                                <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" scope="row">Finance</th>
                                <td className="px-6 py-4 text-center"><div className="heatmap-2 rounded-lg p-2">4</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-3 rounded-lg p-2">7</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-4 rounded-lg p-2">10</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-3 rounded-lg p-2">8</div></td>
                                <td className="px-6 py-4 text-center"><div className="heatmap-2 rounded-lg p-2">6</div></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</div>
            <Footer />
        </div>
    )
}