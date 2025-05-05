FealtyX Bug Tracker Demo
This is a simple demo of a bug tracking application built with React. It features user authentication (mock), task management with different roles (Developer, Manager), time logging, and a basic dashboard with a task trend chart.

The application uses React Router for navigation, Recharts for charting, and date-fns for date manipulation. Styling is handled using standard CSS and CSS Modules, without external libraries like Tailwind CSS.

Features
Mock User Authentication (Developer and Manager roles)

Task Creation, Viewing, Editing, and Deletion (role-based permissions)

Task Filtering and Sorting on the Dashboard

Time Logging for Tasks

Task Status Transitions (Open, In Progress, Pending Approval, Closed, Reopened)

Task History Tracking

Dashboard with Active Task Trend Chart

Responsive Layout (using standard CSS media queries)

Technologies Used
React

React Router (using HashRouter)

Recharts

date-fns

CSS Modules

Standard CSS

Setup and Installation
Clone the repository:

git clone <your-github-repo-url>
cd <your-repo-name>


(Replace <your-github-repo-url> and <your-repo-name> with your actual repository details)

Install dependencies:

npm install


Ensure CSS files are in place:
Make sure you have the following CSS files in your src directory alongside App.js:

global.css

Layout.module.css

UIComponents.module.css

Pages.module.css

TaskComponents.module.css
(These files were provided in the previous steps of our conversation).

Running Locally
To start the development server, run:

npm start


The application should open in your browser at http://localhost:3000 (or another available port).

Demo Credentials
The application uses mock authentication. You can log in with the following credentials:

Developer:

Username: developer

Password: password

Manager:

Username: manager

Password: password

Note: These are hardcoded for demonstration purposes only. Never use plain text passwords or mock authentication like this in a production application.

Project Structure
.
├── public/
├── src/
│   ├── App.js
│   ├── global.css         # Global styles
│   ├── Layout.module.css  # Styles for Header, Footer, App container
│   ├── UIComponents.module.css # Styles for Button, Input, Spinner etc.
│   ├── Pages.module.css   # Styles for specific pages (Login, Dashboard, NotFound)
│   ├── TaskComponents.module.css # Styles for Task related components (TaskItem, TaskForm etc.)
│   ├── index.js
│   └── ... other files
├── package.json
├── README.md
└── ... other files