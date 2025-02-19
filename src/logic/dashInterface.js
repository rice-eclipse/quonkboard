
/**
 * Dash Interface Class
 * Creates a WebSocket Client to manage the communication between the Dashboard 
 * computer and Quonkboard
 * @class
 * @param {function} updateDisplay- The callback function to update the Displa whenever a new message is recevied
   
 }}
 * @return {dashInterface} The dashInterface object
 */

/**
 * Connection should be created as soon as quonkboard initializes
 *  - useEffect in App.js that creates an instance of dashInterface
 */
class dashInterface{
    /**
     * @constructor
     * @property {Socket} dashClient - The websocket client
     * @property {Object} driverCommands - The commands to actuate/2deactuate each valve and the ignition system
     * @property {Object} driverStates - The states of each valve taken from Interface
     */
    
        constructor (Interface, DataManager) {
            //the commands sent by the user
            this.driverCommands = {};
            //the current valve states
            this.DataManager = DataManager;
            this.Interface = Interface;
            

            
            this.client = new WebSocket('ws://127.0.0.1:8000');
            this.client.onopen = () =>{
                console.log("connected to the dashboard");
                
            };
    
            this.client.onmessage = (event) => {
                if (event.data == null){
                    return;
                }
    
                else{
                    const data = JSON.parse(event.data);
                    console.log(data);
                    // Stores the commands in the driver commands object.
                    this.driverCommands =  data;
                    
                    //checks for a change in switch states
                    for  (valve in this.driverCommands){
                        if (this.driverCommands[valve].update_state == 1){
                            //checks the actual valve state and changes it 
                            new_state = !this.DataManager.driverStates[valve]

                            //sends the command to update the driverstate
                            this.Interface.sendDriverUpdate(valve, new_state);
                        }
                    }
                }
    
            };
        }
    
        closeConnection(){
            this.client.close();
        }
    
    }
    export default dashInterface;