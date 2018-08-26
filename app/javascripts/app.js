// Import jquery
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

// Import bootstrap
import 'bootstrap';

// Import the scss for full app (webpack will package it)
import "../stylesheets/app.scss";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

import todo_artifacts from '../../build/contracts/TodoList.json'


var TodoContract = contract(todo_artifacts);


// const ipfsAPI = require('ipfs-api');
// const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'})
// const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'});
const IPFS = require('ipfs')
var ipfs;


var tasks;

window.App = {

    init: function() {
        $("#loading-spinner").hide()
        tasks = [];

        ipfs = new IPFS({ repo: String(Math.random() + Date.now()) })
        ipfs.once('ready', () => {
            console.log('IPFS node is ready')
            ipfs.id((err, res) => {
                if (err) {
                    throw err
                }
                console.log("Connected to IPFS node!", res.id, res.agentVersion, res.protocolVersion);
                // this.loadTasks();
                this.initWeb3();
            })
        })
    },
    initWeb3: function() {
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        var self = this;
        if (typeof web3 !== 'undefined') {
            console.warn("Using web3 detected from external source.");
            // Use Mist/MetaMask's provider
            window.web3 = new Web3(web3.currentProvider);
            $('#add-button').click(function() {
                self.handleAddTodoItem();
            });
        } else {
            console.warn("No web3 detected. ");
        }
        return this.initContract();
    },
    initContract: function() {
        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }
            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }
            console.log('account: '+accs[0]);
            document.getElementById('eth-address').innerHTML = accs[0];
            // $('#eth-address').innerHTML = accs[0];
            // $('#aaaa').innerText = accs[0];
            // set the provider for the User abstraction
            TodoContract.setProvider(web3.currentProvider);

            var instanceUsed;
            TodoContract.deployed().then(function(instance) {
                instanceUsed = instance;

                return instanceUsed.getTasksCount.call()
            }).then(function(taskCount) {
                var count = taskCount.toNumber();
                console.log('taskCount ', count);

                for(var i = 0; i < count; i++) {
                    App.getATask(instanceUsed, i);
                }

            }).catch(function(err) {
                console.log(err.message);
            });

            TodoContract.deployed().then(function(instance) {
                var todoListInstance = instance;

                return todoListInstance.getUserCount.call()
            }).then(function(userCount) {

                var count = userCount.toNumber();

                console.log('user count', count);

            }).catch(function(err) {
                console.log(err.message);
            });

        });
    },

    getATask: function(instance, i) {
        var instanceUsed = instance;
        return instanceUsed.getTaskByIndex.call(i).then(function(task) {
            var ipfsHash = web3.toAscii(task);
            console.log('ipfs hash: '+ipfsHash);
            ipfs.files.cat(ipfsHash, (err, data) => {
                if (err) { throw err }
                let jsonObj = JSON.parse(data);
                console.log('json = ', jsonObj);
                tasks.push(jsonObj);
                App.loadTasks();
            })

        }).catch(function(e) {

            // There was an error! Handle it.
            console.log('error getting task #', i, ':', e);

        });

    },


    handleAddTodoItem: function() {
        var self = this;
        let target = document.getElementById('addTask');
        self.addTask(target.value);
        target.value = ""
    },

    addTask: function(task) {
        let newTask = {
            text:task,
            isComplete: false,
        };
        // let parentDiv = document.getElementById('addTask').parentElement;
        if(task === '') {
            // parentDiv.classList.add('has-error');
            alert('task can\'t be null')
        } else {
            // parentDiv.classList.remove('has-error');
            $('#add-button').buttonLoader('start');


            ipfs.files.add([Buffer.from(JSON.stringify(newTask))], function(err, res) {
                if (err) throw err
                var ipfsHash = '';
                ipfsHash = res[0].hash
                // tasks.push(newTask);

                console.log('ipfsHash = ', ipfsHash);
                $('#add-button').buttonLoader('stop');
                ipfs.files.cat(ipfsHash, (err, data) => {
                    if (err) { throw err }
                    console.log('data = ', data);
                    let jsonObj = JSON.parse(data);
                    console.log('json = ', jsonObj);
                })

                TodoContract.deployed().then(function(instance) {
                    var todoListInstance = instance;

                    return todoListInstance.addTask(ipfsHash, {gas: 200000, from: web3.eth.accounts[0]})
                }).then(function(result) {
                    console.log('result = ', result);
                    tasks.push(newTask);
                    App.loadTasks();



                }).catch(function(err) {
                    console.log(err.message);
                });
            });
        }
    },


    loadTasks: function() {
        console.log('loadtasks');
        console.log(tasks);
        if (tasks){
          let tasksHtml = tasks.reduce((html, task, index) => html += this.generateTaskHtml(task, index), '');
          document.getElementById('taskList').innerHTML = tasksHtml;
        }
    },
    toggleTaskStatus: function(index) {
        tasks[index].isComplete = !tasks[index].isComplete;
        this.loadTasks();
    },

    deleteTask: function(event, taskIndex) {
        event.preventDefault();
        TodoContract.deployed().then(function(instance) {
            var todoListInstance = instance;

            return todoListInstance.deleteTaskByIndex(taskIndex, {gas: 200000, from: web3.eth.accounts[0]})
        }).then(function(result) {
            console.log('result = ', result);
            tasks.splice(taskIndex, 1);
            App.loadTasks();
        }).catch(function(err) {
            console.log(err.message);
        });

    },

    generateTaskHtml(task, index) {
        return `
        <li class="list-group-item checkbox">
          <div class="row">
            <div class="col-md-1 col-xs-1 col-lg-1 col-sm-1 checkbox">
              <label><input id="toggleTaskStatus" type="checkbox" onchange="App.toggleTaskStatus(${index})" value="" class="" ${task.isComplete?'checked':''}></label>
            </div>
            <div class="col-md-10 col-xs-10 col-lg-10 col-sm-10 task-text ${task.isComplete?'complete':''}">
              ${task.text}
            </div>
            <div class="col-md-1 col-xs-1 col-lg-1 col-sm-1 delete-icon-area">
              <a class="" href="/" onClick="App.deleteTask(event, ${index})">
              <!--&#x2717-->
              <i id="deleteTask" data-id="${index}" class="delete-icon glyphicon glyphicon-trash"></i>
              </a>
            </div>
          </div>
        </li>
      `;
    }

};

window.addEventListener('load', function() {


    App.init();

});
