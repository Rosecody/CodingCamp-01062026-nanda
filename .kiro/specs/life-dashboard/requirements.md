# Requirements Document

## Introduction

The To-Do List Life Dashboard is a single-page web application built with HTML, CSS, and Vanilla JavaScript. It helps users organize their day through five integrated widgets: a live clock/greeting, a Pomodoro-style focus timer, a to-do list, and a quick links panel. All user data is persisted entirely in the browser's Local Storage — no backend required. Bonus features include a light/dark mode toggle, a customizable greeting name, and duplicate task prevention.

---

## Glossary

- **Dashboard**: The single-page web application rendered by `index.html`.
- **Greeting_Widget**: The UI component that displays the current time, date, and a personalized greeting message.
- **Clock**: The live digital clock element inside the Greeting_Widget.
- **Focus_Timer**: The Pomodoro-style countdown timer widget.
- **Todo_List**: The widget that manages the user's task items.
- **Task**: A single to-do item with text content and a completion state.
- **Quick_Links**: The widget that displays and manages user-defined shortcut buttons to external URLs.
- **Link**: A single quick-link item with a label and a URL.
- **Local_Storage**: The browser's `localStorage` Web API used for all data persistence.
- **Theme**: The visual color mode of the Dashboard, either "light" or "dark".
- **User_Name**: A customizable string entered by the user, used in the greeting message.

---

## Requirements

### Requirement 1: Live Clock and Date Display

**User Story:** As a user, I want to see the current time and date at a glance, so that I can stay oriented throughout my day.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Clock SHALL display the current local time in HH:MM:SS format using the device's local timezone.
2. WHILE the Dashboard is open, THE Clock SHALL update the displayed time every 1 second using the device's local timezone.
3. WHEN the Dashboard loads, THE Greeting_Widget SHALL display the current date in the format "DayOfWeek, MonthName DD, YYYY" (e.g., "Monday, July 14, 2025") using the device's local timezone.

---

### Requirement 2: Time-Based Greeting

**User Story:** As a user, I want to see a greeting that reflects the time of day, so that the Dashboard feels personal and contextually relevant.

#### Acceptance Criteria

1. WHEN the Dashboard loads and the local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
2. WHEN the Dashboard loads and the local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
3. WHEN the Dashboard loads and the local hour is between 18:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
4. WHEN the Dashboard loads and the local hour is between 21:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".
5. WHILE the Dashboard is open, THE Greeting_Widget SHALL re-evaluate the current local hour every 60 seconds and, IF the time-of-day period has changed since the last evaluation, THEN update the greeting text to match the applicable rule from criteria 1–4.

---

### Requirement 3: Custom User Name in Greeting

**User Story:** As a user, I want to set my name so that the greeting addresses me personally.

#### Acceptance Criteria

1. WHEN the Dashboard loads and a User_Name is stored in Local_Storage, THE Greeting_Widget SHALL append the stored User_Name to the greeting using a comma-space separator (e.g., "Good Morning, Alex").
2. WHEN the Dashboard loads and no User_Name is stored in Local_Storage, THE Greeting_Widget SHALL display the greeting without a name suffix.
3. WHEN the user submits a non-empty name via the name input field, THE Dashboard SHALL trim leading and trailing whitespace from the input, store the trimmed User_Name in Local_Storage, and update the greeting display within 1 second.
4. IF the user submits an empty or whitespace-only string as a name, THEN THE Dashboard SHALL remove the User_Name from Local_Storage and display the greeting without a name suffix.
5. IF the user submits a name exceeding 100 characters, THEN THE Dashboard SHALL reject the submission and display an inline error message indicating the name is too long.

---

### Requirement 4: Focus Timer (Pomodoro)

**User Story:** As a user, I want a 25-minute countdown timer with basic controls, so that I can use the Pomodoro technique to stay focused.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Focus_Timer SHALL display a countdown initialized to 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the Start control and the Focus_Timer is not already running (whether at initial state or paused), THE Focus_Timer SHALL begin counting down by one second per real-world second.
3. WHILE the Focus_Timer is running and the user activates the Stop control, THE Focus_Timer SHALL pause the countdown at the current remaining time.
4. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop any active countdown and reset the display to 25:00.
5. WHEN the Focus_Timer countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and notify the user via a browser alert.
6. WHILE the Focus_Timer is running, THE Focus_Timer SHALL disable the Start control and the Stop control shall be enabled; WHEN the Focus_Timer is reset or has completed, THE Focus_Timer SHALL disable the Stop control.
7. WHILE the Focus_Timer is paused or reset or has completed at 00:00, THE Focus_Timer SHALL enable the Start control.

---

### Requirement 5: To-Do List — Add Tasks

**User Story:** As a user, I want to add tasks to my to-do list, so that I can track what I need to accomplish.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task string via the task input, THE Todo_List SHALL create a new Task and append it to the task list.
2. WHEN a new Task is created, THE Todo_List SHALL persist all current tasks to Local_Storage.
3. WHEN the Dashboard loads, THE Todo_List SHALL retrieve and render all Tasks previously saved in Local_Storage.
4. IF the user submits a task string that, after trimming whitespace, matches the text of an existing Task (case-insensitive), THEN THE Todo_List SHALL reject the submission and display an inline error message indicating the task already exists.
5. IF the user submits an empty or whitespace-only task string, THEN THE Todo_List SHALL reject the submission without creating a Task.

---

### Requirement 6: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit an existing task's text, so that I can correct or update it without deleting and re-adding it.

#### Acceptance Criteria

1. WHEN the user activates the edit control on a Task, THE Todo_List SHALL replace the task's text display with an editable input field pre-populated with the current task text.
2. WHEN the user confirms an edit with non-empty text, THE Todo_List SHALL update the Task text, exit edit mode, and persist the updated task list to Local_Storage.
3. IF the user confirms an edit with an empty or whitespace-only string, THEN THE Todo_List SHALL retain the original Task text and exit edit mode without saving changes.
4. IF the user confirms an edit with a string that matches an existing different Task's text (case-insensitive), THEN THE Todo_List SHALL reject the edit, display an inline error message, and retain the original Task text.

---

### Requirement 7: To-Do List — Complete and Delete Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks, so that I can manage my list as I work through it.

#### Acceptance Criteria

1. WHEN the user activates the complete control on an incomplete Task, THE Todo_List SHALL mark the Task as completed and apply a visual "done" style (e.g., strikethrough text).
2. WHEN the user activates the complete control on a completed Task, THE Todo_List SHALL remove the "done" state and restore the default task style (toggle behavior).
3. WHEN the completion state of a Task changes, THE Todo_List SHALL persist the updated task list to Local_Storage.
4. WHEN the user activates the delete control on a Task, THE Todo_List SHALL permanently remove that Task from the list and persist the updated task list to Local_Storage.

---

### Requirement 8: Quick Links — Add and Display

**User Story:** As a user, I want to save shortcut buttons to my favorite websites, so that I can access them quickly from the Dashboard.

#### Acceptance Criteria

1. WHEN the user submits a valid label and URL via the quick links form, THE Quick_Links SHALL create a new Link and display it as a clickable button.
2. WHEN a new Link is created, THE Quick_Links SHALL persist all current links to Local_Storage.
3. WHEN the Dashboard loads, THE Quick_Links SHALL retrieve and render all Links previously saved in Local_Storage.
4. WHEN the user activates a Link button, THE Dashboard SHALL open the associated URL in a new browser tab.
5. IF the user submits the quick links form with an empty label or an empty URL field, THEN THE Quick_Links SHALL reject the submission without creating a Link.

---

### Requirement 9: Quick Links — Delete

**User Story:** As a user, I want to remove quick links I no longer need, so that the panel stays tidy.

#### Acceptance Criteria

1. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL permanently remove that Link from the panel and persist the updated link list to Local_Storage.

---

### Requirement 10: Light / Dark Mode Toggle

**User Story:** As a user, I want to switch between a light and dark color theme, so that the Dashboard is comfortable to use in different lighting conditions.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Dashboard SHALL apply the Theme stored in Local_Storage.
2. WHEN the Dashboard loads and no Theme is stored in Local_Storage, THE Dashboard SHALL default to the "light" Theme.
3. WHEN the user activates the theme toggle control, THE Dashboard SHALL switch the active Theme to the opposite mode and update all visual styles accordingly.
4. WHEN the Theme changes, THE Dashboard SHALL persist the new Theme value to Local_Storage.

---

### Requirement 11: Data Persistence via Local Storage

**User Story:** As a developer, I want all user data persisted in Local Storage, so that the application requires no backend and user data survives page refreshes.

#### Acceptance Criteria

1. THE Dashboard SHALL store all Task data, Link data, User_Name, and Theme preference exclusively using the browser Local_Storage API.
2. WHEN the Dashboard loads, THE Dashboard SHALL restore all previously saved state (tasks, links, name, theme) from Local_Storage before rendering any widget.
3. IF Local_Storage is unavailable or read fails, THEN THE Dashboard SHALL render all widgets in their default empty state without throwing an unhandled error.

---

### Requirement 12: Responsive and Accessible UI

**User Story:** As a user, I want the Dashboard to be readable and usable on both desktop and mobile screens, so that I can access it from any device.

#### Acceptance Criteria

1. THE Dashboard SHALL render without horizontal scrollbar on viewport widths between 320px and 1920px.
2. THE Dashboard SHALL use a base font size of at least 16px for body text to maintain readability.
3. THE Dashboard SHALL provide visible focus indicators on all interactive elements (buttons, inputs, links) to support keyboard navigation.
4. WHERE the viewport width is 768px or below, THE Dashboard SHALL stack all widgets in a single-column layout.
