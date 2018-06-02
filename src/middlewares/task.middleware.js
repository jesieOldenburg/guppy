import {
  RUN_TASK,
  ABORT_TASK,
  abortTask,
  receiveDataFromTaskExecution,
} from '../actions';
import { getTaskByProjectIdAndTaskName } from '../reducers/tasks.reducer';

const childProcess = window.require('child_process');
const os = window.require('os');

// When the app first loads, we need to get an index of existing projects.
// The default path for projects is `~/guppy-projects`.
// TODO: Configurable!
const parentPath = `${os.homedir()}/guppy-projects`;

const processes = {};

export default store => next => action => {
  switch (action.type) {
    case RUN_TASK: {
      const { projectId, taskName } = action.task;

      // TODO: So this is the same format as task IDs.
      // it's a bit weird that I'm re-creating this here, but it's also weird
      // to import the taskId generator function from the reducer...
      // Whatever this is fine for now.
      const processId = `${projectId}-${taskName}`;

      // TODO: cancel any existing child with this name.

      const task = getTaskByProjectIdAndTaskName(
        projectId,
        taskName,
        store.getState()
      );

      if (!task) {
        throw new Error('Could not find task when attempting to run task');
      }

      const child = childProcess.spawn('PORT=4545 npm', ['run', taskName], {
        cwd: `${parentPath}/${projectId}`,
        shell: true,
      });

      child.stdout.on('data', data => {
        console.log('LOG THING', data.toString());
        next(receiveDataFromTaskExecution(task, data.toString()));
      });

      child.stderr.on('data', data => {
        next(receiveDataFromTaskExecution(task, data.toString()));
      });

      child.on('exit', code => {
        console.log('EXITED', code);
      });

      window.setTimeout(() => {
        store.dispatch(abortTask(task, new Date()));
      }, 4000);

      processes[processId] = child;

      break;
    }

    case ABORT_TASK: {
      console.log('ABORTING TASK!!', action, processes);
      const { projectId, taskName } = action.task;

      const processId = `${projectId}-${taskName}`;

      const child = processes[processId];

      if (child) {
        console.log('killing', child);
        child.kill();
      }

      break;
    }
  }

  // Pass all actions through
  return next(action);
};