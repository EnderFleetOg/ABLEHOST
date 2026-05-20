
import React, { useState } from 'react';
import { useAbility } from '../context/AbilityContext';
import { Task, TaskPriority } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const TaskBoard: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, searchQuery } = useAbility();
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: TaskPriority.Medium,
    category: 'General'
  });

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTask = () => {
    if (!newTask.title) return;
    addTask({
      ...newTask,
      completed: false
    });
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: TaskPriority.Medium,
      category: 'General'
    });
    setIsAdding(false);
  };

  const priorityColors = {
    [TaskPriority.Low]: 'bg-ableSky',
    [TaskPriority.Medium]: 'bg-emerald-500',
    [TaskPriority.High]: 'bg-orange-500',
    [TaskPriority.Urgent]: 'bg-ableRed'
  };

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl md:text-6xl font-black text-ableTeal italic uppercase tracking-tighter">Tasks.</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-ableTeal text-ableBlack px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest shadow-huge hover:scale-105 transition-all active:scale-95"
        >
          New Task
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 border-2 md:border-4 border-ableTeal rounded-3xl md:rounded-huge p-6 md:p-10 space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-1 md:space-y-2">
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40">Task Title</label>
                  <input 
                    type="text" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-black/40 border-2 md:border-4 border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-lg md:text-xl font-black text-white outline-none focus:border-ableTeal transition-all"
                    placeholder="What needs to be done?"
                  />
                </div>
                <div className="space-y-1 md:space-y-2">
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40">Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-black/40 border-2 md:border-4 border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-lg md:text-xl font-black text-white outline-none focus:border-ableTeal transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-1 md:space-y-2">
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40">Priority</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.values(TaskPriority).map(priority => (
                    <button
                      key={priority}
                      onClick={() => setNewTask({ ...newTask, priority })}
                      className={`py-2 md:py-3 rounded-lg md:rounded-xl border-2 font-black uppercase text-[8px] md:text-[10px] transition-all ${newTask.priority === priority ? 'border-ableTeal bg-ableTeal/20 text-ableTeal' : 'border-white/10 text-white/40'}`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button 
                  onClick={handleAddTask}
                  className="flex-1 py-4 md:py-6 bg-ableTeal text-ableBlack rounded-2xl md:rounded-3xl font-black text-lg md:text-xl uppercase tracking-widest shadow-huge active:scale-95 transition-all"
                >
                  Create Task
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-6 md:px-10 py-4 md:py-6 border-2 md:border-4 border-white/10 text-white/40 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-12 md:py-20 text-center border-2 md:border-4 border-dashed border-white/10 rounded-3xl md:rounded-huge">
            <p className="text-xl md:text-2xl font-black text-white/20 uppercase tracking-widest">No tasks found</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <motion.div 
              layout
              key={task.id}
              className={`bg-white/5 border-2 md:border-4 rounded-3xl md:rounded-huge p-6 md:p-8 space-y-4 md:space-y-6 transition-all ${task.completed ? 'border-white/5 opacity-50' : 'border-white/10'}`}
            >
              <div className="flex justify-between items-start">
                <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white ${priorityColors[task.priority]}`}>
                  {task.priority}
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="text-white/20 hover:text-ableRed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>

              <div className="space-y-1 md:space-y-2">
                <h4 className={`text-xl md:text-2xl font-black tracking-tighter uppercase italic ${task.completed ? 'line-through' : 'text-white'}`}>{task.title}</h4>
                <p className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Due: {task.dueDate || 'No date'}</p>
              </div>

              <button 
                onClick={() => updateTask(task.id, { completed: !task.completed })}
                className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${task.completed ? 'bg-white/10 text-white/40' : 'bg-white text-ableBlack hover:bg-ableTeal'}`}
              >
                {task.completed ? 'Completed' : 'Mark Done'}
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
