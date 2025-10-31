import { Link } from "react-router"
import AdminNavbar from "~/components/navbar"
import Title from "~/components/Title"

export default function AddTrainee() {
    return (
        <div>
            
            <AdminNavbar />
      <Title title="Create Induction" />
            <div className="bg-background-light font-display">
                <div className="flex h-auto min-h-screen w-full flex-col">
                    <div className="flex h-full grow flex-col">
                        <main className="flex-1 px-10 py-8">
                            <div className="mx-auto max-w-4xl">
                                <div className="mb-8">
                                    <Link to={"/trainees"} className="flex items-center py-15  gap-2 text-sm font-medium text-gray-600 hover:text-primary">
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        Back to Trainees
                                    </Link>
                                </div>
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900">Add New Trainee</h1>
                                    <p className="mt-1 text-gray-600">Register a new trainee and assign them to trainings and sessions.</p>
                                </div>
                                <div className="rounded-lg border border-primary/20 bg-white p-6 shadow-sm">
                                    <form className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <input className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="fullName" placeholder="e.g. Jane Doe" type="text" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Phone Number (for QR login)</label>
                                                <input className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="phoneNumber" placeholder="e.g. +1 234 567 890" type="tel" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Department/Team</label>
                                                <select className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="department">
                                                    <option>Select Department</option>
                                                    <option>Engineering</option>
                                                    <option>Sales</option>
                                                    <option>Marketing</option>
                                                    <option>Human Resources</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                                <input className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="role" type="text" value="Trainee" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Assigned Induction(s)</label>
                                            <select className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="assignedTrainings">
                                                <option>Compliance Induction</option>
                                                <option>Sales Induction</option>
                                                <option>Customer Service Induction</option>
                                                <option>Leadership Induction</option>
                                                <option>Technical Induction</option>
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">Select one or more trainings. Use Ctrl/Cmd + click to select multiple.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Assigned Session(s)</label>
                                            <select className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="assignedSessions">
                                                <option>Compliance Induction - Session 1 (2024-10-26)</option>
                                                <option>Compliance Induction - Session 2 (2024-11-02)</option>
                                                <option>---</option>
                                                <option>Sales Induction - Q4 Kick-off (2024-10-15)</option>
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">Sessions are filtered based on the selected training(s).</p>
                                        </div>
                                        <div className="flex justify-end gap-4 pt-4">
                                            <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" type="button">Cancel</button>
                                            <button className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" type="submit">
                                                <span className="material-symbols-outlined mr-2">person_add</span>
                                                Add Trainee
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

            </div>

        </div>
    )
}