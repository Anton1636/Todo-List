import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import TodoList from './TodoList'
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from './config'

class App extends Component {
	componentWillMount() {
		this.loadBlockchainData()
	}

	async loadBlockchainData() {
		const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545')
		const accounts = await web3.eth.getAccounts()
		this.setState({ account: accounts[0] })
		const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS)
		this.setState({ todoList })
		const taskCount = await todoList.methods.taskCount().call()
		this.setState({ taskCount })

		for (var i = 1; i <= taskCount; i++) {
			const task = await todoList.methods.tasks(i).call()

			this.setState({
				task: [...this.state.task, task],
			})
		}

		this.setState({ loading: false })
	}

	constructor(props) {
		super(props)
		this.state = { account: '', taskCount: 0, tasks: [], loading: true }
		this.createTask = this.createTask.bind(this)
		this.toggleCompleted = this.toggleCompleted.bind(this)
	}

	createTask(content) {
		this.setState({ loading: true })
		this.state.todoList.methods
			.createTask(content)
			.send({ from: this.state.account })
			.once('receipt', receipt => {
				this.setState({ loading: false })
			})
	}

	toggleCompleted(taskId) {
		this.setState({ loading: true })
		this.state.todoList.methods
			.toggleCompleted(taskId)
			.send({ from: this.state.account })
			.once('receipt', receipt => {
				this.setState({ loading: false })
			})
	}

	render() {
		return (
			<div>
				<nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
					<p>Todo List</p>
					<ul className='navbar-nav px-3'>
						<li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
							<small>
								<p>
									<span id='account'></span>
								</p>
							</small>
						</li>
					</ul>
				</nav>
				<div className='container-fluid'>
					<div className='row'>
						<main
							role='main'
							className='col-lg-12 d-flex justify-content-center'
						>
							{this.state.loading ? (
								<div id='loader' className='text-center'>
									<p className='text-center'>Loading...</p>
								</div>
							) : (
								<TodoList
									tasks={this.state.tasks}
									createTask={this.createTask}
									toggleCompleted={this.toggleCompleted}
								/>
							)}
						</main>
					</div>
				</div>
			</div>
		)
	}
}

export default App
