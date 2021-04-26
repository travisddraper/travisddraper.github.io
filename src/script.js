const checkStatus = (response) => {
    //building this for fetch requests later
    if(response.ok) {
        // .ok returns true if response status is 200-299
        return response
    }
    throw new Error('Request was either a 404 or 500');
}

const json = (response) => response.json();

class Task extends React.Component {
    render() {
        const { task, onDelete, onComplete } = this.props
        const { id, content, completed } = task

        return (
            <div className="row mb-1">
                <p className="col mt-3">{content}</p>
                <button
                    onClick={() => onDelete(id)}
                >Delete</button>
                <input
                    className="d-inline-block mt-3 mx-3"
                    type="checkbox"
                    onChange={() => onComplete(id, completed)}
                    checked={completed}
                />
            </div>
        )
    }

}

class ToDoList extends  React.Component {
    constructor(props) {
        super(props);
        this.state = {
            new_task: '',
            tasks: [],
            filter: 'all' //add this
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fetchTasks = this.fetchTasks.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.toggleComplete = this.toggleComplete.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
    }

    componentDidMount() {
        this.fetchTasks(); //get tasks on mount
        //abstracted
    }

    fetchTasks() {
        // move the get tasks code into its own method so we can use it in other places
        fetch("https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=72")
        .then(checkStatus)
        .then(json)
        .then((response) => {
            console.log(response);
            this.setState({ tasks: response.tasks })
            //We update the component state tasks property with response data.
        })
        .catch(error => {
            console.log(error.message);
        })
    }


    deleteTask(id) {
        if(!id) {
            return; //if no id supplied, early return
        }

        fetch(`https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}?api_key=72`, {
            //notice the template literal above for injecting the id
            method: "DELETE",
            mode: "cors",
        }).then(checkStatus).then(json).then((data) => {
        this.fetchTasks(); //fetch tasks after delete
        })
        .catch((error) => {
        this.setState({ error: error.message })
        console.log(error);
        })        
    }

    toggleComplete(id, completed) {

        if(!id) {
            return; //early return if no id
        }

        const newState = completed ? 'active' : 'complete';
        //the completed state of a task is either true or false. If it's true, we will mark the task as active; if it is false, we will mark it as complete.

        fetch(`https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}/mark_${newState}?api_key=72`, {
            //We then inject that newState into the fetch at specified ID
            method: "PUT",
            mode: "cors",
        }).then(checkStatus)
        .then(json)
        .then((data) => {
            this.fetchTasks();
        })
        .catch((error) => {
            this.setState({ error: error.message });
            console.log(error);
        })
    }

    toggleFilter(e) {
        console.log(e.target.name)
        this.setState({
            filter: e.target.name
        })
    }
    
    handleChange(event) {
        this.setState({ new_task: event.target.value })
    }

    handleSubmit(event) {
        event.preventDefault();
        
        let { new_task } = this.state;
        new_task = new_task.trim();
        if(!new_task) {
            return;
            //checks for an empty string submission
            //if so, early return
        }

        fetch("https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=72", {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify({
                task: {
                    content: new_task
                }
            }),
        }).then(checkStatus).then(json)
        .then((data) => {
            //if the response is ok, we clear the input state
            this.setState({ new_task: ''});

            //we then make a request to get all the tasks again for freshest data from server. This will include the new POST'd task.
            this.fetchTasks();
        })
        .catch((error) => {
            this.setState ({ error: error.message })
            console.log(error);
        })
    }

    render() {
        const { new_task, tasks, filter } = this.state

        return (
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h2 className="mb-3">To Do List</h2>
                        {tasks.length > 0 ? tasks.filter(task => {
                            if(filter === 'all') {
                                return true;
                            } else if (filter === 'active') {
                                return !task.completed
                            } else {
                                return task.completed
                            }
                        }).map((task) => {
                            return <Task 
                                key={task.id}
                                task={task}
                                onDelete={this.deleteTask}
                                onComplete = {this.toggleComplete}
                            /> 
                        }) : <p>no tasks here</p>}
                        <div className="mt-3">
                            <label>
                                <input type="checkbox" name="all" checked={filter === "all"} onChange={this.toggleFilter} /> All
                            </label>
                            <label>
                                <input type="checkbox" name="active" checked={filter === "active"} onChange={this.toggleFilter} /> Active
                            </label>
                            <label>
                                <input type="checkbox" name="completed" checked={filter === "completed"} onChange={this.toggleFilter} /> Completed
                            </label>
                        </div>
                        <form onSubmit={this.handleSubmit} className="form-inline my-4">
                            <input
                                type="text"
                                className="form-control mr-sm-2 mb-2"
                                placeholder="new task"
                                value={new_task}
                                onChange={this.handleChange}
                            />
                            <button type="submit" className="btn btn-primary mb-2">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <ToDoList />,
    document.getElementById('root')
);