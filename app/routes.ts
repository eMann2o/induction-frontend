import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    // route("dashboard", "routes/hr/dashboard.tsx"),
    route("", "routes/login.tsx"),
    // index("routes/home.tsx"),
    // // route("sessions", "routes/hr/sessions.tsx"),
    // // route("departments", "routes/hr/departments.tsx"),
    // // route("trainings", "routes/hr/trainings.tsx"),
    // // route("reports", "routes/hr/reports.tsx"),
    // route("login", "routes/login.tsx"),
    // route("add-user", "routes/add-user.tsx"),
    route("add-trainee", "routes/hr/add-trainee.tsx"),
    // route("trainees", "routes/hr/trainees.tsx"),
    //route("create-session", "routes/hr/create-session.tsx"),
    route("add-training", "routes/hr/create-training.tsx"),
    // route("trainee-login", "routes/trainee-login.tsx"),
    // route("assessment", "routes/trainee/assessment.tsx"),
    // route("result", "routes/trainee/result.tsx"),
    route("session/:id", "routes/sessiondetails.tsx"),
    route("me", "routes/me.tsx"),

/*ADMIN ROUTES */    
    route("admin", "routes/admin/dashboard.tsx"),
    route("admin/sessions", "routes/admin/sessions.tsx"),
    route("admin/trainings", "routes/admin/trainings.tsx"),
    route("admin/users", "routes/admin/users.tsx"),
    route("admin/reports", "routes/admin/reports.tsx"),
    route("admin/new-user", "routes/admin/adduser.tsx"),
    route("admin/user/:id", "routes/admin/profile.tsx"),
    route("trainings/:id", "routes/view-training.tsx"),

/**FACILITATOR ROUTES */
    route("facilitator", "routes/facilitator/dashboard.tsx"),
    route("facilitator/session/:id", "routes/facilitator/sessiondetails.tsx"),


    /*HR ROUTES */
    route("hr", "routes/hr/dashboard.tsx"),
    route("hr/reports", "routes/hr/reports.tsx"),
    route("hr/inductions", "routes/hr/trainings.tsx"),
    route("hr/sessions", "routes/hr/sessions.tsx"),
    route("hr/new-session", "routes/hr/create-session.tsx"),   
    route("hr/users", "routes/hr/users.tsx"),
    route("hr/user/id", "routes/hr/profile.tsx"), 
    route("hr/new-user", "routes/hr/adduser.tsx"),
    route("hr/me", "routes/hr/me.tsx"),


    /*TRAINEE ROUTES */
    route("join-session/:id", "routes/trainee/join.tsx"),
    route("trainee/session/:id/questions", "routes/trainee/test.tsx"),
    route("trainee/session/:id/result", "routes/trainee/score.tsx"),

    /*HSE ROUTES */
    route("hse", "routes/hse/dashboard.tsx"),
    route("hse/trainings", "routes/hse/trainings.tsx"),
] satisfies RouteConfig;
