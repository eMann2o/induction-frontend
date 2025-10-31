export default function AddUser() {
    return (
        <div>
            <div className="bg-background-light font-display">
                <div className="flex h-auto min-h-screen w-full flex-col">
                    <div className="flex h-full grow flex-col">
                        <header className="flex items-center justify-between whitespace-nowrap border-b border-b-primary/20 px-10 py-3">
                            <div className="flex items-center gap-3 text-gray-800">
                                <div className="h-8 w-8 text-primary">
                                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_6_319)">
                                            <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_6_319">
                                                <rect fill="white" height="48" width="48"></rect>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold">Acme Co</h2>
                            </div>
                            <div className="flex flex-1 items-center justify-end gap-4">
                                <nav className="flex items-center gap-2">
                                    <a className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-primary/10 hover:text-primary" href="#">Home</a>
                                    <a className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-primary/10 hover:text-primary" href="#">Performance</a>
                                    <a className="rounded-lg px-4 py-2 text-sm font-medium text-primary bg-primary/10" href="#">People</a>
                                    <a className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-primary/10 hover:text-primary" href="#">Learn</a>
                                    <a className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-primary/10 hover:text-primary" href="#">Goals</a>
                                    <a className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-primary/10 hover:text-primary" href="#">Feedback</a>
                                </nav>
                                <div className="flex items-center gap-2">
                                    <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-primary/10 hover:text-primary">
                                        <span className="material-symbols-outlined text-2xl">notifications</span>
                                    </button>
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10"></div>
                                </div>
                            </div>
                        </header>
                        <main className="flex-1 px-10 py-8">
                            <div className="mx-auto max-w-4xl">
                                <div className="mb-8">
                                    <a className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary" href="#">
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        Back to Users
                                    </a>
                                </div>
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
                                    <p className="mt-1 text-gray-600">Add a new system user with elevated permissions.</p>
                                </div>
                                <div className="rounded-lg border border-primary/20 bg-white p-6 shadow-sm">
                                    <form className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <input className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="fullName" placeholder="e.g. John Smith" type="text" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                                <input className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="email" placeholder="e.g. john.smith@company.com" type="email" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                                                <input className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="phoneNumber" placeholder="e.g. +1 234 567 890" type="tel" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                                <select className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="department">
                                                    <option>Select Department (if applicable)</option>
                                                    <option>Engineering</option>
                                                    <option>Sales</option>
                                                    <option>Marketing</option>
                                                    <option>Human Resources</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                                <select className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="role">
                                                    <option>Select Role</option>
                                                    <option>Facilitator</option>
                                                    <option>HR</option>
                                                    <option>Admin</option>
                                                    <option>Super Admin</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                                <select className="mt-1 block w-full rounded-md border-primary/30 bg-white shadow-sm focus:border-primary focus:ring-primary" id="status">
                                                    <option value="active">Active</option>
                                                    <option value="suspended">Suspended</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Password</label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <input className="block w-full flex-1 rounded-none rounded-l-md border-primary/30 bg-white focus:border-primary focus:ring-primary" id="password" placeholder="Auto-generated or enter manually" type="text" />
                                                <button className="inline-flex items-center rounded-r-md border border-l-0 border-primary/30 bg-gray-50 px-3 text-sm text-gray-500 hover:bg-gray-100" type="button">
                                                    <span className="material-symbols-outlined text-base">autorenew</span>
                                                    <span className="ml-2 hidden sm:inline">Generate</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex h-5 items-center">
                                                <input aria-describedby="invite-description" className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary" id="inviteUser" name="inviteUser" type="checkbox" />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label className="font-medium text-gray-700">Send invitation email</label>
                                                <p className="text-gray-500" id="invite-description">The user will receive an email to set their own password.</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-4 pt-4">
                                            <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" type="button">Cancel</button>
                                            <button className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" type="submit">
                                                <span className="material-symbols-outlined mr-2">person_add</span>
                                                Add User
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