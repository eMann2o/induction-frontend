export default function TraineeLogin() {
    return (
        <div>
            <div className="bg-background-light font-display text-gray-800">
                <div className="flex h-screen">
                    <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12">
                        <div className="max-w-md mx-auto w-full">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-primary p-2 rounded-full">
                                    <span className="material-symbols-outlined text-white text-3xl">
                                        school
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Induction Session Login</h1>
                            </div>
                            <div className="bg-gray-100 p-6 rounded-lg mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Info</h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Induction Title</p>
                                        <p className="font-medium text-gray-900">Advanced Leadership Skills</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date &amp; Time</p>
                                        <p className="font-medium text-gray-900">October 26, 2023, 9:00 AM - 4:00 PM</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Trainer/Facilitator</p>
                                        <p className="font-medium text-gray-900">Jane Doe</p>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Login Form</h2>
                            <form action="#" className="space-y-6" method="POST">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone number or Employee ID</label>
                                    <div className="mt-1">
                                        <input className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-light" id="employee_id" name="employee_id" type="text" />
                                        <p className="mt-2 text-sm text-red-600 hidden" id="phone_error">Phone number required</p>
                                    </div>
                                </div>
                                <div>
                                    <button className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" type="submit">
                                        Join Session
                                    </button>
                                </div>
                                <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg hidden" id="assignment_error">
                                    <p className="text-sm text-red-700">You are not assigned to this session. Please contact your manager or HR for assistance.</p>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="hidden lg:block lg:w-1/2 bg-cover bg-center">
                        <div className="w-full h-full bg-black/25"></div>
                    </div>
                </div>

            </div>

        </div>
    )
}