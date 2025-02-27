import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Award,
  Book,
  Briefcase,
  CheckCircle,
  Clock,
  Dumbbell,
  GraduationCap,
  Users,
  Plus,
} from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";

const RealLifeRPG = () => {
  // State variables with localStorage persistence
  const [level, setLevel] = useLocalStorage("rpg_level", 1);
  const [experience, setExperience] = useLocalStorage("rpg_experience", 0);
  const [job, setJob] = useLocalStorage("rpg_job", "Novice");
  const [tasks, setTasks] = useLocalStorage("rpg_tasks", [
    {
      id: 1,
      name: "Complete project report",
      difficulty: "Medium",
      completed: false,
      xp: 50,
    },
    {
      id: 2,
      name: "Exercise for 30 minutes",
      difficulty: "Easy",
      completed: false,
      xp: 30,
    },
    {
      id: 3,
      name: "Study React hooks",
      difficulty: "Hard",
      completed: false,
      xp: 100,
    },
  ]);

  // Form state for adding new tasks
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState("Medium");

  // Timer state
  const [timer, setTimer] = useState(25 * 60); // 25 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Experience needed for next level
  const experienceNeededForNextLevel = level * 100;

  // Available jobs based on level - memoized to prevent recreating on every render
  const jobs = useMemo(
    () => [
      { title: "Novice", minLevel: 1, icon: <Users size={24} /> },
      { title: "Student", minLevel: 3, icon: <Book size={24} /> },
      { title: "Apprentice", minLevel: 5, icon: <GraduationCap size={24} /> },
      { title: "Professional", minLevel: 10, icon: <Briefcase size={24} /> },
      { title: "Expert", minLevel: 15, icon: <Award size={24} /> },
    ],
    []
  );

  // Format timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Add experience and handle level up - wrapped in useCallback to prevent infinite loops
  const addExperience = useCallback(
    (xp) => {
      const newExperience = experience + xp;
      const newLevel =
        Math.floor(newExperience / experienceNeededForNextLevel) + 1;

      setExperience(newExperience);

      if (newLevel > level) {
        setLevel(newLevel);
        alert(`🎉 Congratulations! You leveled up to Level ${newLevel}!`);

        // Check for job advancement
        const newJob = jobs
          .filter((job) => job.minLevel <= newLevel)
          .pop().title;
        if (newJob !== job) {
          setJob(newJob);
          alert(`🌟 You've advanced to a new job: ${newJob}!`);
        }
      }
    },
    [
      experience,
      experienceNeededForNextLevel,
      level,
      job,
      jobs,
      setExperience,
      setLevel,
      setJob,
    ]
  );

  // Handle task completion
  const completeTask = useCallback(
    (taskId) => {
      setTasks((tasks) =>
        tasks.map((task) => {
          if (task.id === taskId && !task.completed) {
            addExperience(task.xp);
            return { ...task, completed: true };
          }
          return task;
        })
      );
    },
    [addExperience, setTasks]
  );

  // Add a new task
  const handleAddTask = (e) => {
    e.preventDefault();

    if (!newTaskName.trim()) return;

    // XP based on difficulty
    const xpValues = {
      Easy: 30,
      Medium: 50,
      Hard: 100,
    };

    const newTask = {
      id: Date.now(),
      name: newTaskName,
      difficulty: newTaskDifficulty,
      completed: false,
      xp: xpValues[newTaskDifficulty],
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskName("");
    setShowTaskForm(false);
  };

  // Timer logic
  useEffect(() => {
    let interval;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      // Grant XP for completing a focus session
      addExperience(25);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timer, addExperience]);

  // Toggle timer
  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  // Reset timer
  const resetTimer = () => {
    setIsTimerActive(false);
    setTimer(25 * 60);
  };

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">Real-Life RPG</h1>
          <p className="text-gray-600">Level up your productivity!</p>
        </div>

        {/* Character Status */}
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center mb-2">
                {jobs.find((j) => j.title === job)?.icon}
                <h2 className="text-xl font-bold ml-2">{job}</h2>
              </div>
              <p className="text-gray-600">Level {level}</p>
            </div>

            {/* XP Progress Bar */}
            <div className="w-1/2">
              <div className="flex justify-between text-xs mb-1">
                <span>{experience} XP</span>
                <span>{experienceNeededForNextLevel} XP</span>
              </div>
              <div className="h-4 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${
                      ((experience % experienceNeededForNextLevel) /
                        experienceNeededForNextLevel) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {experienceNeededForNextLevel -
                  (experience % experienceNeededForNextLevel)}{" "}
                XP to Level {level + 1}
              </div>
            </div>
          </div>
        </div>

        {/* Focus Timer */}
        <div className="bg-amber-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center">
            <Clock size={20} className="mr-2" />
            Focus Timer
          </h2>
          <div className="text-center">
            <div className="text-4xl font-bold mb-4">{formatTime(timer)}</div>
            <div className="flex justify-center gap-4">
              <button
                className={`px-4 py-2 rounded-lg ${
                  isTimerActive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
                onClick={toggleTimer}
              >
                {isTimerActive ? "Pause" : "Start"}
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                onClick={resetTimer}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Quest List with Add Task Button */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold flex items-center">
              <Dumbbell size={20} className="mr-2" />
              Quest Log
            </h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-full flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add Quest
            </button>
          </div>

          {/* New Task Form */}
          {showTaskForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <form onSubmit={handleAddTask}>
                <div className="mb-3">
                  <label
                    htmlFor="taskName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quest Name
                  </label>
                  <input
                    type="text"
                    id="taskName"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter quest name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="taskDifficulty"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Difficulty
                  </label>
                  <select
                    id="taskDifficulty"
                    value={newTaskDifficulty}
                    onChange={(e) => setNewTaskDifficulty(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Easy">Easy (30 XP)</option>
                    <option value="Medium">Medium (50 XP)</option>
                    <option value="Hard">Hard (100 XP)</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md"
                  >
                    Add Quest
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`border p-3 rounded-lg flex justify-between items-center ${
                  task.completed ? "bg-gray-100 opacity-75" : "bg-white"
                }`}
              >
                <div>
                  <h3
                    className={`font-medium ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full mr-2 
                        ${
                          task.difficulty === "Easy"
                            ? "bg-green-100 text-green-800"
                            : task.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                    >
                      {task.difficulty}
                    </span>
                    <span className="text-xs text-gray-600">{task.xp} XP</span>
                  </div>
                </div>
                {!task.completed && (
                  <button
                    onClick={() => completeTask(task.id)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <CheckCircle size={24} />
                  </button>
                )}
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No quests available. Add a new quest to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealLifeRPG;
