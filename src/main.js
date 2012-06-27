/**
 * PUSH Notification server V 0.2
 * (c) Telefonica Digital, 2012 - All rights reserver
 * Fernando Rodríguez Sela <frsela@tid.es>
 * Guillermo Lopez Leal <gll@tid.es>
 */

// Import logger
var log = require("./common/logger.js").getLogger;

function main() {
}

main.prototype = {
  start: function() {
    // Look for what server type we are running
    var server = process.argv[2];
    //And start what is needed
    switch(server) {
      case "NS_UA_WS":
        log.init("/tmp/push-NS_UA_WS.log", "NS_UA_WS", 1);
        log.info("Starting as NS_UA_WS server");
        var sel = require('./ns_ua/ws_main.js');
        this.server = new sel.NS_UA_WS_main();
        this.server.start();
        break;
      case "NS_UA_SMS":
        log.init("/tmp/push-NS_UA_SMS.log", "NS_UA_SMS", 1);
        log.info("Starting NS_UA_SMS server");
        log.fatal("PENDING - TBD");
        break;
      case "NS_UA_UDP":
        log.init("/tmp/push-NS_UA_UDP.log", "NS_UA_UDP", 1);
        log.info("Starting NS_UA_UDP server");
        log.fatal("PENDING - TBD");
        break;
      case "NS_AS":
        log.init("/tmp/push-NS_AS.log", "NS_AS", 1);
        log.info("Starting NS_AS server");
        var sel = require('./ns_as/as_main.js');
        this.server = new sel.NS_AS_main();
        this.server.start();
        break;
      case "NS_MSG_monitor":
        log.init("/tmp/push-NS_MSG_monitor.log", "NS_MSG_monitor", 1);
        log.info("Starting NS_MSG_monitor server");
        log.fatal("PENDING - TBD");
        break;
      default:
        log.init("/tmp/push.log", "PUSH", 1);
        log.error("No server provided");
        printInfo();
    }
  },

  stop: function() {
    log.info("Closing server");
    this.server.stop();
  }
};

function printInfo() {
  console.log("No server selected, please start with node main.js [TYPE]. RTFD.");
}

/////////////////////////
// Run the server
/////////////////////////
var m = new main();
m.start();

/////////////////////////
// On close application
function onClose() {
    log.error('Received interruption signal');
    m.stop();
    process.exit();  
}
process.on('SIGHUP',  onClose);    // 1
process.on('SIGINT',  onClose);    // 2
process.on('SIGKILL', onClose);    // 9
process.on('SIGPIPE', onClose);    // 13
process.on('SIGPOLL', onClose);
process.on('SIGPROF', onClose);
process.on('SIGALRM', onClose);    // 14
process.on('SIGTERM', onClose);    // 15
